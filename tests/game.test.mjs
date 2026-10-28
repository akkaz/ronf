import { test } from 'node:test';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const __dirname=new URL('.',import.meta.url).pathname;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../gioca.html'),'utf8');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
function between(a, b) { return source.slice(source.indexOf(a), source.indexOf(b, source.indexOf(a))); }
function make(saved = {}) {
  const values = Object.fromEntries(Object.entries({'ronf:v1:class':'Gruppo A','ronf:v1:settings':{classes:['Gruppo A','Gruppo B']},...saved}).map(([k,v]) => [k, JSON.stringify(v)]));
  const context = vm.createContext({
    RonfGame: require('../game-data.js'),RonfClock:require('../lesson-clock.js'),
    localStorage: { getItem: k => values[k] || null, setItem: (k,v) => { values[k] = v; } },
    document: { body: {dataset: {}}, querySelector: () => null }, performance: { now: () => 10000 }, console, Date,
    hideNota() {}, notify() {}, celebrate() {}, play() {}, renderNota() {},
  });
  vm.runInContext(`const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    ${between('  // ---------- costanti di gioco', '  // ---------- audio')}
    ${between('  let power = null', '  function startAlert')}
    ${between('  function perkList()', '  // Pittogrammi UI incorporati')}
    ${between('  function startAlert', '  // ---------- scala degli avvisi')}
    const calmNeed=()=>Math.round(settings.calmSec*CALM_MULT[G.phase-1]);
    let holdUntil=0; function openNota(){G.notaOpen=true;G.phase=1;G.esc=0;G.calm=0;}
    function setPhase(p){G.phase=p;}
    function closeNota(){G.notaOpen=false;}
    ${between('  function updateNota(', '  function renderNota()')}
    ${between('  function updateGame(', '  function moodNow(')}
    ${between('  function recordHistory(', '  function drawLessonChart()')}
    mode='mic';resetSession();`, context);
  return { run: code => vm.runInContext(code, context), values };
}

test('i premi PC si escludono senza cancellare i nomi personalizzati', () => {
  const c=make(); c.run('Object.assign(settings,cleanProfile(REWARD_PRESETS.lab));settings.hasPC=false');
  assert.equal(c.run('perkList().find(p=>p.id==="r1").name'),'');
  assert.equal(c.run('settings.rewards[1]'),'Pausa col PC');
  c.run('settings.hasPC=true'); assert.equal(c.run('perkList().find(p=>p.id==="r1").name'),'Pausa col PC');
});

test('profili indipendenti, nomi vuoti e mascotte non valide', () => {
  const c=make(); c.run('settings.classProfiles["Gruppo A"]=cleanProfile({rewards:["A","","C","D"],mascot:"fox"});settings.classProfiles["Gruppo B"]=cleanProfile({mascot:"cat"})');
  assert.equal(c.run('settings.classProfiles["Gruppo A"].rewards[1]'),'');
  assert.equal(c.run('settings.classProfiles["Gruppo B"].mascot'),'cat');
  assert.equal(c.run('cleanProfile({mascot:"unknown"}).mascot'),'marmot');
});

test('premi a 83, limite a 100 e isteresi preservati', () => {
  const c=make(); c.run('G.balance=83;updatePerks(true)');
  assert.equal(c.run('Object.keys(G.active).sort().join(",")'),'r0,r1,r2');
  c.run('G.balance=99.8;updatePerks(true)'); assert.equal(c.run('!!G.active.r3'),false);
  c.run('addBalance(5);updatePerks(true)'); assert.equal(c.run('G.balance'),100); assert.equal(c.run('!!G.active.r3'),true);
  c.run('G.balance=97;updatePerks(true)'); assert.equal(c.run('!!G.active.r3'),true);
  c.run('G.balance=96.9;updatePerks(true)'); assert.equal(c.run('!!G.active.r3'),false);
});

test('la rotta parte dal centro e mantiene visibili entrambi i lati', () => {
  const c=make(); const state=c.run('journeyState(0)');
  assert.equal(state.cursor,.5);assert.equal(state.rewards.length,4);assert.equal(state.punishments.length,0);
  assert.equal(state.nR,0);assert.equal(state.nP,0);assert.equal(state.nextR.id,'r0');
  assert.equal(c.run('journeyState(-100).cursor'),0);assert.equal(c.run('journeyState(100).cursor'),1);
});

test('la rotta evidenzia il prossimo premio oppure la conseguenza da recuperare', () => {
  const c=make();c.run('settings.punishments=["Ripartiamo","Pausa calma","Riflessione","Confronto"];G.balance=83;updatePerks(true)');
  assert.equal(c.run('journeyState(G.balance).nR'),3);assert.equal(c.run('journeyState(G.balance).nextR.id'),'r3');
  c.run('G.balance=-83;updatePerks(true)');
  assert.equal(c.run('journeyState(G.balance).nP'),3);assert.equal(c.run('journeyState(G.balance).activeP.id'),'p2');
  assert.equal(c.run('journeyState(G.balance).rewards.length'),4);
});

test('il tabellone mostra la rotta senza sezioni richiudibili e uno stemma di livello', () => {
  assert.ok(html.includes('id="journey-map"'));assert.ok(html.includes('id="rank-number"'));
  assert.ok(!html.includes('<details class="consequences"'));assert.ok(!html.includes('id="consequences-summary"'));
});

test('solo il verde alimenta la combo; il giallo la conserva; il rosso la azzera', () => {
  const c=make(); c.run('level=50;G.streak=59.9;updateGame(.2,10000)');
  assert.equal(c.run('G.combo'),2);
  const streak=c.run('G.streak'),points=c.run('league[current].points');
  c.run('level=settings.warn+1;updateGame(1,10000)');
  assert.equal(c.run('G.streak'),streak); assert.equal(c.run('league[current].points'),points); assert.equal(c.run('G.combo'),2);
  c.run('level=settings.alert+1;updateGame(.7,10000)'); assert.equal(c.run('G.combo'),1); assert.equal(c.run('G.streak'),0);
});

test('la combo moltiplica gli XP, non la ricarica dell’energia', () => {
  const c=make(); c.run('G.streak=181;G.combo=3;level=50;updateGame(1,10000)');
  assert.equal(c.run('league[current].points'),3);
  assert.equal(c.run('G.balance'),100/(25*60));
});

test('lo storico mantiene tutta l’ora, i picchi e le pause', () => {
  const c=make(); c.run('level=50;for(let i=0;i<3600;i++)recordHistory(1)');
  assert.ok(c.run('G.history.length')>=1800); assert.equal(c.run('G.history[0].t'),0); assert.equal(c.run('G.elapsed'),3600);
  c.run('level=95;recordHistory(.1)');assert.equal(c.run('G.history.at(-1).hi'),95);
  c.run('paused=true;recordHistory(1)');assert.equal(c.run('G.history.at(-1).db'),null);
});

test('le lezioni di classi diverse restano recuperabili separatamente', () => {
  const c=make(); c.run('G.balance=83;level=50;recordHistory(1);saveLesson();current="Gruppo B";resetSession();G.balance=25;saveLesson();current="Gruppo A";resetSession();restoreLesson()');
  assert.equal(c.run('G.balance'),83); assert.equal(c.run('G.history.length'),1);
  assert.equal(Object.keys(JSON.parse(c.values['ronf:v1:lesson']).classes).length,2);
});

test('recupera la lezione legacy e la demo non sovrascrive le lezioni vere', () => {
  const c=make({'ronf:v1:lesson':{cls:'Gruppo A',balance:83,session:100,savedAt:Date.now()}});
  assert.equal(c.run('restoreLesson()'),true);assert.equal(c.run('G.balance'),83);
  const old=c.values['ronf:v1:lesson'];c.run('mode="demo";G.balance=-50;saveLesson()');assert.equal(c.values['ronf:v1:lesson'],old);
});

test('tutti i livelli dei richiami si annullano con la calma, mai con zero dB assoluti', () => {
  const c=make(); for(let p=1;p<=4;p++){
    c.run(`G.notaOpen=true;G.phase=${p};G.calm=0;level=55;for(let i=0;i<40 && G.notaOpen;i++)updateNota(.5,10000,'ok')`);
    assert.equal(c.run('G.notaOpen'),false);
  }
});

test('pausa ferma XP, energia e avanzamento dei richiami',()=>{
  const c=make();c.run('G.notaOpen=true;paused=true;level=95;updateGame(1,10000)');
  assert.equal(c.run('G.esc'),0);assert.equal(c.run('G.balance'),0);assert.equal(c.run('league[current].points'),0);
});

test('selettori dello script e ID HTML coerenti', () => {
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const m of source.matchAll(/\$\('#([\w-]+)'\)/g))assert.ok(ids.includes(m[1]),'ID mancante: '+m[1]);
  assert.ok(!html.includes('Firma e registra'));
});

test('una lezione fermata in attesa di rete non riparte automaticamente come nuova ora',()=>{
 const c=make();c.run('G.hourStopped=true;G.session=100;saveLesson();resetSession()');
 assert.equal(c.run('restoreLesson()'),false);
});

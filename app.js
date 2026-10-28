import * as RonfGame from './game-data.js';
import * as RonfClock from './lesson-clock.js';
import { createBackup, parseBackup, backupValues } from './backup.js';

(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------- costanti di gioco ----------
  const MIN_DB = 30, MAX_DB = 100;
  const TICK_MS = 100;          // 10 misure al secondo
  const TAU = 0.5;              // media esponenziale (s): smorza i colpi secchi
  const HIST_N = 1200;          // 2 minuti di storico
  const ALERT_DELAY = 0.6;      // s sopra la soglia rossa prima di SILENZIO!
  const ALERT_RELEASE = 2;      // s sotto la soglia rossa per spegnere l'avviso
  const PATIENCE_GRACE = 1.5;   // pause brevi che non ricaricano la pazienza
  const GRUMPY_MS = 3000;
  const COMBOS = [{ at: 0, x: 1 }, { at: 60, x: 2 }, { at: 180, x: 3 }, { at: 300, x: 4 }, { at: 600, x: 5 }];
  const mascotLevel = RonfGame.level;
  const PHRASES = {
    sleep: ['Zzz… la marmotta dorme', 'Ronf… ronf…', 'Sogna prati pieni di fiori', 'Letargo in corso. Shhh.', 'Sta sognando l’estate in Valle', 'Zzz… che bel silenzio'],
    stir: ['Mmh? Chi parla?', 'Un occhio aperto…', 'Si sta svegliando…', 'Abbassate la voce, per favore', 'Le orecchie si muovono…'],
    alert: ['Chi ha svegliato la marmotta?!', 'Ehi! Qui si dorme!', 'Troppo rumore!', 'Abbassiamo un po’ la voce!', 'Ma cos’è questo baccano?!'],
    grumpy: ['Grrr… riprovo a dormire', 'Va bene, ci riprovo. Piano.', 'Sto tornando a dormire…', 'Ancora un po’ di calma e dormo'],
  };
  const ZONE_NAMES = { ok: 'Calma', warn: 'Attenzione', bad: 'Troppo rumore' };
  const INSTITUTE_CLASSES = ['La mia classe'];
  const CLASS_LABELS = {};
  const CLASS_CATALOG_VERSION = 1;
  const MASCOTS = RonfGame.MASCOT_CATALOG;
  const REWARD_PRESETS = {
    classroom: { rewards: ['Pausa', 'Sfida a squadre', 'Pausa relax', 'No compiti'], rewardPC: [false,false,false,false], hasPC: false },
    lab: { rewards: ['Pausa', 'Pausa col PC', 'Pausa relax', 'No compiti'], rewardPC: [false,true,false,false], hasPC: true },
  };
  const cleanFour = (v, defaults) => (Array.isArray(v) && v.length === 4 ? v : defaults).map((x) => String(x ?? '').trim().slice(0,40));
  function cleanProfile(p = {}, fallback = {}) {
    const rewards = cleanFour(p.rewards, fallback.rewards || REWARD_PRESETS.classroom.rewards).map(n => /^pausa (col|con( il)?) telefono$/i.test(n) ? 'Pausa relax' : n);
    return {
      rewards, punishments: cleanFour(p.punishments, fallback.punishments || ['','','','']),
      rewardPC: Array.isArray(p.rewardPC) && p.rewardPC.length === 4 ? p.rewardPC.map(Boolean) : rewards.map(n => /\b(pc|computer)\b/i.test(n)),
      hasPC: p.hasPC === true || (p.hasPC === undefined && rewards.some(n => /\b(pc|computer)\b/i.test(n))),
      mascot: Object.hasOwn(MASCOTS,p.mascot) ? p.mascot : 'marmot',
      mascotVersion: p.mascotVersion === RonfGame.MASCOT_VERSION ? RonfGame.MASCOT_VERSION : 1,
      rewardMin: clamp(Math.round(+p.rewardMin) || +fallback.rewardMin || 25,5,60),
    };
  }
  const DEFAULTS = {
    warn: 70, alert: 80, notaSec: 10, stepSec: 8, calmSec: 5, cal: 0, sound: true, deviceId: '', bells: RonfClock.DEFAULT_BELLS, autoEnd: false, classes: INSTITUTE_CLASSES,
    rewards: REWARD_PRESETS.classroom.rewards,
    punishments: ['', '', '', ''],
    rewardMin: 25, hasPC: false, mascot: 'marmot', rewardPC: [false,false,false,false],
  };
  const PERK_STEPS = [25, 50, 75, 100];
  const PERK_HYST = 3; // un premio conquistato si perde solo 3 punti sotto la sua soglia, così non lampeggia
  const CALM_MULT = [1, 1.2, 1.6, 2]; // più si sale nella scala degli avvisi, più silenzio serve
  const PHASES = [
    { title: 'Ritroviamo la calma', next: 'preavviso' },
    { title: 'Serve una pausa dal rumore', next: 'ultimo avviso' },
    { title: 'Ultimo avviso alla classe', next: 'intervento del docente' },
    { title: 'Adesso decide il docente', next: '' },
  ];
  const KEYS = { settings: 'ronf:v1:settings', league: 'ronf:v1:league', current: 'ronf:v1:class', lesson: 'ronf:v1:lesson' };

  // ---------- salvataggio nel browser ----------
  function readJSON(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage non disponibile */ } }
  function cleanClasses(v) {
    const list = (Array.isArray(v) ? v : String(v || '').split(',')).map((c) => String(c).trim().slice(0, 24)).filter(c=>c && !['__proto__','constructor','prototype'].includes(c));
    const unique = [...new Set(list)].slice(0, 120);
    return unique.length ? unique : null;
  }
  function loadSettings() {
    const s = Object.assign({}, DEFAULTS, readJSON(KEYS.settings) || {});
    s.warn = clamp(Math.round(+s.warn) || DEFAULTS.warn, 35, 93);
    s.alert = clamp(Math.round(+s.alert) || DEFAULTS.alert, s.warn + 2, 95);
    s.notaSec = clamp(Math.round(+s.notaSec) || DEFAULTS.notaSec, 3, 60);
    s.stepSec = clamp(Math.round(+s.stepSec) || DEFAULTS.stepSec, 4, 30);
    s.calmSec = clamp(Math.round(+s.calmSec) || DEFAULTS.calmSec, 2, 15);
    s.cal = clamp(Math.round(+s.cal) || 0, -40, 40);
    const four = (v, d) => (Array.isArray(v) && v.length === 4 ? v : d).map((x) => String(x == null ? '' : x).trim().slice(0, 28));
    s.rewards = four(s.rewards, DEFAULTS.rewards).map((name) => /^pausa (col|con( il)?) telefono$/i.test(name) ? 'Pausa relax' : name);
    s.punishments = four(s.punishments, DEFAULTS.punishments);
    s.rewardMin = clamp(Math.round(+s.rewardMin) || DEFAULTS.rewardMin, 5, 60);
    s.sound = s.sound !== false;
    s.autoEnd = s.autoEnd === true;
    s.bells = RonfClock.cleanBells(s.bells);
    s.deviceId = typeof s.deviceId === 'string' ? s.deviceId : '';
    s.classes = cleanClasses(s.classes) || DEFAULTS.classes.slice();
    const raw = readJSON(KEYS.settings) || {};
    s.classProfiles = Object.create(null);
    if (raw.classProfiles && typeof raw.classProfiles === 'object') {
      for (const [c,p] of Object.entries(raw.classProfiles).slice(0,120)) if (p && typeof p === 'object') s.classProfiles[c] = cleanProfile(p);
    } else if (Array.isArray(raw.rewards)) {
      // Le vecchie impostazioni globali restano alle classi che già le usavano.
      for (const c of cleanClasses(raw.classes) || ['La mia classe']) s.classProfiles[c] = cleanProfile(raw);
    }
    s.classCatalogVersion = CLASS_CATALOG_VERSION;
    return s;
  }
  function loadLeague() {
    const raw = readJSON(KEYS.league) || {};
    const out = {};
    for (const [k, v] of Object.entries(raw)) out[k] = { points: Math.max(0, +(v && v.points) || 0), record: Math.max(0, +(v && v.record) || 0) };
    return out;
  }

  let mode = 'idle'; // idle | mic | demo
  const settings = loadSettings();
  let league = loadLeague();
  let current = readJSON(KEYS.current);
  if (!settings.classes.includes(current)) {
    const previousFirst = cleanClasses(readJSON(KEYS.settings)?.classes)?.[0];
    current = settings.classes.includes(previousFirst) ? previousFirst : settings.classes[0];
  }
  const ensureLeague = () => { for (const c of settings.classes) if (!league[c]) league[c] = { points: 0, record: 0 }; };
  ensureLeague();
  function rememberProfile() {
    settings.classProfiles[current] = cleanProfile(settings);
  }
  function applyProfile() {
    const profile=cleanProfile(settings.classProfiles[current] || {});
    profile.mascot=RonfGame.resolveMascot(profile,current);profile.mascotVersion=RonfGame.MASCOT_VERSION;
    Object.assign(settings,profile);settings.classProfiles[current]=profile;
    document.body.dataset.mascot = settings.mascot;
    $('#stage').dataset.mascot = settings.mascot;
    $('#stage').style.cssText=RonfGame.mascotStyle(settings.mascot);
    $('#stage').setAttribute('aria-label', MASCOTS[settings.mascot].name + ' e andamento della lezione');
    phraseMood = ''; phraseAt = 0;
  }
  const saveSettings = () => { rememberProfile(); writeJSON(KEYS.settings, settings); };
  const saveLeague = () => { if (mode === 'mic') { writeJSON(KEYS.league, league); saveLesson(); } };
  // la lezione in corso sopravvive a una ricarica della pagina (stessa classe, entro 20 minuti)
  function lessonArchive() {
    const old = readJSON(KEYS.lesson);
    if (old?.version === 2 && old.classes && typeof old.classes === 'object') return old;
    return {version:2, classes:old?.cls ? {[old.cls]:old} : {}};
  }
  function saveLesson() {
    if (mode !== 'mic' || !G.lessonStart) return;
    const archive = lessonArchive();
    archive.classes[current] = {cls:current,balance:G.balance,active:G.active,notaCount:G.notaCount,signCount:G.signCount,session:G.session,elapsed:G.elapsed,history:G.history,greenSec:G.greenSec,measuredSec:G.measuredSec,savedAt:Date.now(),bestRecord:G.bestRecord,hourStopped:G.hourStopped,startPoints:G.startPoints,startRank:G.startRank,scheduledEndAt:G.scheduledEndAt,streak:G.streak,combo:G.combo};
    writeJSON(KEYS.lesson,archive);
  }
  function restoreLesson() {
    const l = lessonArchive().classes[current];
    if (!l || l.hourStopped || l.cls !== current || !(Date.now()-l.savedAt < 20*60*1000)) return false;
    G.startPoints=Number.isFinite(l.startPoints)?l.startPoints:Math.max(0,(league[current]?.points||0)-(+l.session||0));G.startRank=l.startRank||null;
    G.balance=clamp(+l.balance || 0,-100,100);
    G.active=l.active && typeof l.active==='object' ? {...l.active} : {};
    G.notaCount=l.notaCount|0; G.signCount=l.signCount|0; G.session=Math.max(0,+l.session||0);
    G.elapsed=Math.max(0,+l.elapsed||0); G.greenSec=Math.max(0,+l.greenSec||0); G.measuredSec=Math.max(0,+l.measuredSec||0);
    G.bestRecord=Math.max(0,+l.bestRecord||0);G.scheduledEndAt=settings.autoEnd?(+l.scheduledEndAt||RonfClock.nextBell(Date.now(),settings.bells)):0;G.streak=Math.max(0,+l.streak||0);G.combo=comboFor(G.streak);
    G.history=Array.isArray(l.history) ? l.history.filter(p=>p && Number.isFinite(p.t) && p.t>=0 && p.t<=G.elapsed && (p.db===null || Number.isFinite(p.db))).slice(-14400).map(p=>({t:p.t,db:p.db,lo:Number.isFinite(p.lo)?p.lo:p.db,hi:Number.isFinite(p.hi)?p.hi:p.db,n:Math.max(1,+p.n||1)})) : [];
    return true;
  }

  // ---------- formattazione ----------
  const fmtInt = (n) => Math.floor(Math.max(0, n)).toLocaleString('it-IT');
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }
  const pct = (db) => ((clamp(db, MIN_DB, MAX_DB) - MIN_DB) / (MAX_DB - MIN_DB)) * 100;
  const levelIndex = p => mascotLevel(p).number-1;
  const comboFor = (streak) => { let x = 1; for (const c of COMBOS) if (streak >= c.at) x = c.x; return x; };

  // ---------- audio ----------
  let audioCtx = null, analyser = null, stream = null, buf = null;
  function ensureCtx() {
    if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function stopStream() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null; analyser = null;
  }
  function micErrorText(err) {
    const name = err && err.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') return 'Il browser ha bloccato il microfono. Clicca sull’icona a sinistra dell’indirizzo, consenti il microfono e premi di nuovo «Accendi il microfono».';
    if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Non trovo nessun microfono. Collegalo e riprova.';
    if (name === 'NotReadableError') return 'Il microfono è occupato da un’altra applicazione (Teams, Meet, un registratore). Chiudila e riprova.';
    return `Non riesco ad accendere il microfono (${name || 'errore sconosciuto'}). Riprova o apri la pagina con Chrome, Edge o Firefox.`;
  }
  async function startMic() {
    showError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError('Questo browser non permette di usare il microfono da qui. Apri la pagina con Chrome, Edge o Firefox aggiornati.');
      return false;
    }
    const ctx = ensureCtx();
    const base = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    let s = null, lastErr = null;
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: settings.deviceId ? { ...base, deviceId: { exact: settings.deviceId } } : base });
    } catch (err) {
      lastErr = err;
      if (settings.deviceId && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError')) {
        try { s = await navigator.mediaDevices.getUserMedia({ audio: base }); settings.deviceId = ''; saveSettings(); } catch (err2) { lastErr = err2; }
      }
    }
    if (!s) { showError(micErrorText(lastErr)); if (mode === 'idle') showStart(); return false; }
    const wasMic = mode === 'mic';
    stopStream();
    stream = s;
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    buf = new Float32Array(analyser.fftSize);
    src.connect(analyser);
    const track = stream.getAudioTracks()[0];
    if (track) track.addEventListener('ended', () => {
      if (stream !== s) return;
      saveLeague(); stopStream(); mode = 'idle';
      showError('Il microfono si è scollegato. Ricollegalo e premi «Accendi il microfono».');
      showStart();
    });
    if (!wasMic) {
      league = loadLeague(); ensureLeague(); mode = 'mic'; resetRun();
      if (restoreLesson()) setTimeout(() => notify(`Lezione della ${current} ripresa`, `Energia ${Math.trunc(G.balance)} su 100: i premi della lezione sono quelli di prima.`, 'good', false), 300);
    }
    refreshDevices();
    onStarted();
    return true;
  }
  function readMicDb() {
    analyser.getFloatTimeDomainData(buf);
    let mean = 0;
    for (let i = 0; i < buf.length; i++) mean += buf[i];
    mean /= buf.length;
    let sum = 0;
    for (let i = 0; i < buf.length; i++) { const v = buf[i] - mean; sum += v * v; }
    const rms = Math.sqrt(sum / buf.length);
    return 20 * Math.log10(Math.max(rms, 1e-7)) + 100 + settings.cal;
  }

  // demo: una lezione simulata con calma, chiacchiere e un momento di caos
  // i livelli seguono le soglie impostate, così la demo funziona con qualsiasi taratura
  const DEMO_SCRIPT = [{ d: 14, k: 'calm' }, { d: 7, k: 'chat' }, { d: 9, k: 'calm' }, { d: 34, k: 'chaos' }, { d: 24, k: 'calm' }, { d: 6, k: 'chat' }, { d: 12, k: 'calm' }];
  const demoDb = (k) => (k === 'chaos' ? settings.alert + 8 : k === 'chat' ? (settings.warn + settings.alert) / 2 : settings.warn - 14);
  let demo = { i: 0, t: 0, cur: 44 };
  function readDemoDb(dt) {
    demo.t += dt;
    if (demo.t >= DEMO_SCRIPT[demo.i].d) { demo.t = 0; demo.i = (demo.i + 1) % DEMO_SCRIPT.length; }
    demo.cur += (demoDb(DEMO_SCRIPT[demo.i].k) - demo.cur) * Math.min(1, dt * 1.5);
    let v = demo.cur + (Math.random() - 0.5) * 6;
    if (Math.random() < 0.02) v += 8 + Math.random() * 8; // una sedia, un colpo di tosse
    return v;
  }
  async function startDemo() {
    ensureCtx();
    saveLeague();
    stopStream();
    league = loadLeague(); ensureLeague(); // copia di prova: in demo non si salva niente
    mode = 'demo';
    demo = { i: 0, t: 0, cur: demoDb('calm') };
    resetRun();
    onStarted();
  }

  // suoni sintetizzati: niente file da scaricare
  let holdUntil = 0;
  function play(kind) {
    if (!settings.sound) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.02;
    const tone = (freq, start, len, type, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + len);
      o.connect(g); g.connect(ctx.destination);
      o.start(start); o.stop(start + len + 0.05);
    };
    let dur = 0.6;
    if (kind === 'alert') {
      tone(784, t0, 0.22, 'square', 0.1); tone(523, t0 + 0.24, 0.34, 'square', 0.1);
    } else if (kind === 'whistle') {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 2700; lfo.frequency.value = 28; lg.gain.value = 170;
      lfo.connect(lg); lg.connect(o.frequency); o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.03); g.gain.setValueAtTime(0.22, t0 + 0.24); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      g.gain.setValueAtTime(0.0001, t0 + 0.4);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.43); g.gain.setValueAtTime(0.22, t0 + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
      o.start(t0); lfo.start(t0); o.stop(t0 + 1.25); lfo.stop(t0 + 1.25);
      dur = 1.25;
    } else if (kind === 'bonk') {
      tone(330, t0, 0.18, 'square', 0.1); tone(247, t0 + 0.2, 0.32, 'square', 0.1);
    } else if (kind === 'ding') {
      tone(1320, t0, 0.25, 'triangle', 0.12); tone(1760, t0 + 0.12, 0.35, 'triangle', 0.1);
    } else if (kind === 'alarm') {
      [0, 0.25, 0.5].forEach((d) => tone(880, t0 + d, 0.18, 'square', 0.1));
      dur = 0.8;
    } else if (kind === 'chime') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, t0 + i * 0.09, 0.35, 'sine', 0.12));
      dur = 0.7;
    }
    holdUntil = performance.now() + dur * 1000 + 350;
  }

  // ---------- stato di gioco ----------
  let power = null, level = null, lastTick = performance.now(), lastNumAt = 0, lastSlowAt = 0;
  let paused = false, measuring = false, measureSamples = [], measureLeft = 0;
  const hist = [], peaks = [];
  const G = {};
  function resetSession() {
    Object.assign(G, {
      zone: 'ok', overRed: 0, underRed: 0, alert: false, used: 0, grace: 0, streak: 0, session: 0,
      notaCount: 0, notaOpen: false, phase: 1, esc: 0, calm: 0, notaPeak: 0, noteText: '', signCount: 0,
      grumpyUntil: 0, combo: 1, lastAlertSound: -1e9, balance: 0, active: {}, lessonStart: Date.now(),
      hourStopped:false,startPoints:Math.max(0,+(league[current]?.points)||0),
      elapsed: 0, history: [], greenSec: 0, measuredSec: 0, bestRecord:0, scheduledEndAt:settings.autoEnd?RonfClock.nextBell(Date.now(),settings.bells):0,
      recordToBeat: league[current] ? league[current].record : 0, recordCelebrated: false,
    });
    hideNota();
  }
  function resetRun() { power = null; level = null; hist.length = 0; peaks.length = 0; resetSession(); }
  const zoneOf = (db) => (db >= settings.alert ? 'bad' : db >= settings.warn ? 'warn' : 'ok');

  function startAlert(now) {
    G.alert = true; G.combo = 1; G.streak = 0;
    addBalance(-2);
    if (now - G.lastAlertSound > 8000) { play('alert'); G.lastAlertSound = now; }
  }
  function endAlert(now) {
    G.alert = false; G.grumpyUntil = now + GRUMPY_MS;
    G.recordToBeat = league[current].record; G.recordCelebrated = false;
  }
  // ---------- scala degli avvisi: preavviso, registro, scrittura, firma ----------
  const calmNeed = () => Math.round(settings.calmSec * CALM_MULT[G.phase - 1]);
  function openNota() {
    G.notaOpen = true; G.notaCount++; G.used = settings.notaSec; G.grace = 0;
    G.alert = true; G.combo = 1; G.streak = 0;
    G.phase = 1; G.esc = 0; G.calm = 0; G.notaPeak = level; G.noteText = '';
    addBalance(-10);
    $('#relief').hidden = true;
    $('#nota').hidden = false; $('#stage').dataset.warning = 'true';
    renderNota();
    focusBeforeWarning = document.activeElement;
    $('#nota-close').focus();
    play('whistle');
  }
  function setPhase(p) {
    G.phase = p;

    if (p === 4) G.signCount++;
    addBalance(p === 4 ? -10 : -5);
    play(['whistle', 'bonk', 'ding', 'alarm'][p - 1]);
    renderNota();
  }
  function closeNota(byTeacher) {
    if (!G.notaOpen) return;
    G.notaOpen = false; G.alert = false; G.overRed = 0; G.underRed = 0; G.used = 0;
    G.grumpyUntil = performance.now() + GRUMPY_MS;
    G.recordToBeat = league[current].record; G.recordCelebrated = false;
    hideNota();
    if (focusBeforeWarning?.isConnected && !focusBeforeWarning.closest('#nota')) focusBeforeWarning.focus();
    else $('#btn-pause').focus();
    if (!byTeacher) showRelief();
  }
  function hideNota() { const n = $('#nota'); if (n) n.hidden = true; $('#stage').dataset.warning = 'false'; }
  let reliefTimer = 0, focusBeforeWarning = null;
  function showRelief() {
    const r = $('#relief');
    r.hidden = false;
    play('chime');
    clearTimeout(reliefTimer);
    reliefTimer = setTimeout(() => { r.hidden = true; }, 3200);
  }
  function updateNota(dt, now, zone) {
    G.notaPeak = Math.max(G.notaPeak, level);
    if (now < holdUntil) return; // mentre suonano gli effetti il microfono non conta
    // il silenzio riempie la barra verde; il rumore la fa scendere piano, non la azzera
    if (zone === 'ok') G.calm += dt;
    else if (zone === 'warn') G.calm += dt * 0.5;
    else G.calm = Math.max(0, G.calm - dt * 1.5);
    if (G.calm >= calmNeed()) { closeNota(false); return; }
    // solo il rumore sopra la soglia rossa fa salire la scala
    if (zone === 'bad' && G.phase < 4) {
      G.esc = Math.min(3 * settings.stepSec, G.esc + dt);
      const p = Math.min(4, 1 + Math.floor(G.esc / settings.stepSec));
      if (p > G.phase) setPhase(p);
    }
  }
  function renderNota() {
    const p=G.phase, N=$('#nota'), need=calmNeed(), left=Math.max(0,need-G.calm);
    N.dataset.phase=String(p);
    setText($('#nota-kicker'),`Richiamo ${p} di 4 · ${current}`);
    setText($('#nota-title'),PHASES[p-1].title);
    setText($('#nota-text'),p===1 ? 'La pazienza è finita. Abbassate la voce per far rientrare il richiamo.' : p===2 ? 'Il rumore continua. Qualche secondo di calma può ancora fermare tutto.' : p===3 ? 'Fermatevi e riprendete il controllo del rumore insieme.' : 'La classe non ha recuperato la calma. Il docente sceglie come procedere.');
    [...$('#ladder').children].forEach((li,i)=>{li.classList.toggle('done',i+1<p);li.classList.toggle('now',i+1===p); if(i+1===p)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    const z=G.zone, prog=clamp((G.esc-(p-1)*settings.stepSec)/settings.stepSec,0,1);
    setText($('#live-db'),String(Math.round(clamp(level||0,0,140))));
    setText($('#live-status'),paused ? 'Gioco in pausa: richiami e conto alla rovescia sono fermi.' : z==='ok' ? `State recuperando: ancora ${Math.ceil(left)} secondi in verde.` : z==='warn' ? `Il brusio rallenta il recupero: circa ${Math.ceil(left*2)} secondi.` : 'Troppo rumore: la barra di recupero scende.');
    setText($('#calm-label'),`Per annullare: sotto ${settings.alert} dB`);
    setText($('#calm-text'),`${Math.floor(G.calm)} / ${need} s`);
    $('#calm-fill').style.width=Math.min(100,G.calm/need*100)+'%';
    $('#warning-escalation').hidden=p===4;
    setText($('#esc-label'),`Se continua il rosso: ${PHASES[p-1].next}`);
    setText($('#esc-text'),p===4 ? 'Decisione del docente' : `${Math.ceil((1-prog)*settings.stepSec)} s di rosso al prossimo avviso`);
    $('#esc-fill').style.width=prog*100+'%';
  }

  function updateGame(dt, now) {
    const zone = zoneOf(level);
    G.zone = zone;
    if (paused || measuring) return;
    const rate = 100 / (settings.rewardMin * 60);
    if (zone === 'bad') addBalance(-3 * rate * dt);
    else if (zone === 'ok' && !G.alert && !G.notaOpen) addBalance(rate * dt);
    updatePerks(false);
    if (G.notaOpen) { updateNota(dt, now, zone); return; }
    if (zone === 'bad') { G.overRed += dt; G.underRed = 0; } else { G.underRed += dt; G.overRed = 0; }
    if (!G.alert && G.overRed >= ALERT_DELAY) startAlert(now);
    else if (G.alert && G.underRed >= ALERT_RELEASE) endAlert(now);

    if (zone === 'bad') { G.used += dt; G.grace = 0; }
    else { G.grace += dt; if (G.grace >= PATIENCE_GRACE) G.used = Math.max(0, G.used - dt); }
    if (G.used >= settings.notaSec) { openNota(); return; }

    if (G.alert) return;
    const entry = league[current];
    if (zone === 'ok') G.streak += dt;
    G.bestRecord=Math.max(G.bestRecord||0,G.streak);
    if (G.streak > entry.record) {
      entry.record = G.streak;
      if (!G.recordCelebrated && G.recordToBeat >= 30) {
        G.recordCelebrated = true;
        celebrate(`Nuovo record ${current}!`, `Letargo oltre ${fmtTime(G.recordToBeat)}`, true);
      }
    }
    const c = comboFor(G.streak);
    if (c > G.combo) { G.combo = c; celebrate(`Combo x${c}!`, `Ogni secondo in verde ora vale ${c} XP`, false); }
    if (zone === 'ok') {
      const before = levelIndex(entry.points);
      entry.points += dt * G.combo;
      G.session += dt * G.combo;
      const after = levelIndex(entry.points);
      if (after > before) celebrate(`Livello ${after + 1}!`, `${current}: ${mascotLevel(entry.points).name.replace('Marmotta',MASCOTS[settings.mascot].name)}`, true);
    }
  }

  function moodNow(now) {
    if (mode === 'idle' || paused || measuring) return 'sleep';
    if (G.notaOpen || G.alert) return 'alert';
    if (now < G.grumpyUntil) return 'grumpy';
    if (G.zone !== 'ok') return 'stir';
    return 'sleep';
  }

  // ---------- ciclo principale ----------
  function tick() {
    const now = performance.now();
    const dt = clamp((now - lastTick) / 1000, 0, 1);
    lastTick = now;
    if (mode === 'idle' || G.hourStopped) return;
    let raw = null;
    if (mode === 'mic' && analyser) raw = readMicDb();
    else if (mode === 'demo') raw = readDemoDb(dt);
    if (raw !== null && now >= holdUntil) {
      const p = Math.pow(10, raw / 10);
      power = power === null ? p : power + (1 - Math.exp(-dt / TAU)) * (p - power);
    }
    if (power === null) return;
    level = 10 * Math.log10(power);
    const steps = Math.max(1, Math.round(dt * 10)); // con la scheda in background i tick rallentano
    for (let i = 0; i < steps; i++) hist.push(level);
    if (hist.length > HIST_N) hist.splice(0, hist.length - HIST_N);
    peaks.push(level);
    if (peaks.length > 30) peaks.shift();
    if (measuring) measureSamples.push(level);
    recordHistory(dt);
    updateGame(dt, now);
    render(now);
  }

  // ---------- disegno ----------
  const stage = $('#stage');
  let phraseMood = '', phraseAt = 0, lastPhrase = '';
  function pickPhrase(mood) {
    const who=MASCOTS[settings.mascot].subject;
    const list = settings.mascot==='marmot' ? PHRASES[mood] : mood==='sleep' ? [`${who} dorme. Shhh…`, 'Zzz… che bel silenzio', 'Un pisolino da campioni'] : mood==='stir' ? ['Mmh? Chi parla?', 'Un occhio aperto…', 'Abbassate la voce, per favore'] : mood==='alert' ? ['Ehi! Qui si dorme!', 'Troppo rumore!', 'Chi mi ha svegliato?'] : ['Sto tornando a dormire…', 'Ancora un po’ di calma'];
    let p = list[Math.floor(Math.random() * list.length)];
    if (p === lastPhrase && list.length > 1) p = list[(list.indexOf(p) + 1) % list.length];
    lastPhrase = p;
    return p;
  }
  function setText(el, t) { if (el.textContent !== t) el.textContent = t; }
  const secsLeft = () => Math.ceil(clamp(settings.notaSec - (G.used || 0), 0, settings.notaSec) - 1e-9);

  function renderBubble(mood, now) {
    const title=mode==='idle'?'Pronti?':measuring?`Misura ${measureLeft}`:paused?'Pausa':{sleep:'Zzz…',stir:'Piano…',grumpy:'Ci siamo…',alert:'Silenzio!'}[mood];
    setText($('#bubble-title'),title);
    setText($('#bubble-sub'),paused?'Gioco in pausa':mood==='sleep'?`La mascotte dorme. Un secondo in verde vale ${G.combo||1} XP.`:mood==='stir'?'Il giallo ferma la combo e l’energia.':'Abbassate il rumore per recuperare la calma.');
  }

  function render(now) {
    const zone = mode === 'idle' || level === null ? 'ok' : G.zone;
    if (document.body.dataset.zone !== zone) document.body.dataset.zone = zone;
    const mood = moodNow(now);
    if (stage.dataset.mood !== mood) stage.dataset.mood = mood;
    renderBubble(mood, now);
    $('#stage-chip').hidden = !(paused || measuring);
    setText($('#stage-chip'), measuring ? 'Misura' : 'In pausa');
    setText($('#banner-sub'), G.notaOpen ? 'richiamo!' : `richiamo tra ${secsLeft()} s`);

    if (level !== null) {
      if (now - lastNumAt > 250) {
        lastNumAt = now;
        setText($('#db-value'), String(Math.round(clamp(level, 0, 140))));
        setText($('#db-peak'), String(Math.round(clamp(Math.max(...peaks), 0, 140))));
        setText($('#set-now'), String(Math.round(clamp(level, 0, 140))));
        setText($('#set-now-zone'), ZONE_NAMES[zone]);
      }
      $('#meter-cover').style.width = (100 - pct(level)) + '%';
      $('#meter-peak').style.left = pct(Math.max(...peaks)) + '%';
    }
    setText($('#zone-pill'), mode === 'idle' ? 'In attesa' : paused ? 'In pausa' : ZONE_NAMES[zone]);
    renderPatience();
    renderRewards();
    if (G.notaOpen) renderNota();
    if (now - lastSlowAt > 1000) { lastSlowAt = now; renderStats(); drawLessonChart(); if (dlg.open) renderFloor(); }
    if (dlg.open) drawChart();
  }

  function renderPatience() {
    const P = $('#patience');
    const left = clamp(settings.notaSec - (G.used || 0), 0, settings.notaSec);
    let state, pill;
    if (mode === 'idle') { state = 'idle'; pill = 'In attesa'; }
    else if (paused || measuring) { state = 'idle'; pill = 'In pausa'; }
    else if (G.notaOpen) { state = 'empty'; pill = `Finita: avviso ${G.phase} di 4`; }
    else if (G.used <= 0) { state = 'full'; pill = 'Piena'; }
    else if (G.zone === 'bad') { state = 'drain'; pill = 'Si sta consumando!'; }
    else { state = 'recharge'; pill = 'Si ricarica'; }
    if (P.dataset.state !== state) P.dataset.state = state;
    setText($('#pat-pill'), pill);
    setText($('#pat-secs'), String(secsLeft()));
    $('#pat-fill').style.width = ((left / settings.notaSec) * 100).toFixed(1) + '%';
    setText($('#nota-count'),String(G.notaCount||0));
  }

  // ---------- premi e punizioni ----------
  function perkList() {
    // da sinistra a destra: punizioni dalla più grave, poi premi dal più facile
    const out = [];
    for (let i = 3; i >= 0; i--) out.push({ id: 'p' + i, kind: 'punish', name: settings.punishments[i], at: -PERK_STEPS[i] });
    for (let i = 0; i < 4; i++) out.push({ id: 'r' + i, kind: 'reward', name: settings.rewardPC[i] && !settings.hasPC ? '' : settings.rewards[i], at: PERK_STEPS[i] });
    return out;
  }
  function addBalance(d) { if (mode !== 'idle') G.balance = clamp((G.balance || 0) + d, -100, 100); }
  function updatePerks(silent) {
    for (const p of perkList()) {
      const was = !!G.active[p.id];
      let on = false;
      if (p.name) on = p.kind === 'reward'
        ? (was ? G.balance >= p.at - PERK_HYST : G.balance >= p.at)
        : (was ? G.balance <= p.at + PERK_HYST : G.balance <= p.at);
      if (on === was) continue;
      if (on) G.active[p.id] = true; else delete G.active[p.id];
      if (silent || !p.name) continue;
      const li = document.querySelector(`.rewards [data-id="${p.id}"]`);
      if (li) { li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash'); }
      if (p.kind === 'reward') notify(on ? 'Premio conquistato!' : 'Premio perso', on ? `${p.name}: continuate così` : `${p.name} non c’è più. Il silenzio può riportarlo.`, on ? 'good' : 'bad', on);
      else notify(on ? 'Punizione!' : 'Punizione tolta', on ? `${p.name}. Il silenzio può toglierla.` : `${p.name} non c’è più: bravi.`, on ? 'bad' : 'good', false);
    }
  }
  function journeyState(b,active=G.active) {
    const all=perkList().filter(p=>p.name), rewards=all.filter(p=>p.kind==='reward');
    const punishments=all.filter(p=>p.kind==='punish').sort((a,b)=>b.at-a.at);
    const nextR=rewards.find(p=>!active[p.id]);
    const activeP=punishments.filter(p=>active[p.id]).sort((a,b)=>a.at-b.at)[0];
    const nextP=punishments.find(p=>!active[p.id]);
    return {all,rewards,punishments,nextR,activeP,nextP,cursor:clamp((b+100)/200,0,1),nR:rewards.filter(p=>active[p.id]).length,nP:punishments.filter(p=>active[p.id]).length};
  }
  // Pittogrammi UI incorporati: funzionano anche offline, senza font di icone.
  const ICONS = {
    cup: '<path d="M18 8h1a3 3 0 0 1 0 6h-1M3 8h15v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2m4-2v2m4-2v2M2 22h20"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    relax: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/><path d="m17 3 .6 1.4L19 5l-1.4.6L17 7l-.6-1.4L15 5l1.4-.6Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="m9 10 2 2 4-4"/>',
    team: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M16 3a4 4 0 0 1 0 8M22 21v-2a7 7 0 0 0-4-6"/>',
    cupoff: '<path d="M18 8h1a3 3 0 0 1 0 6M3 8h15v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM2 22h20M3 2l19 19"/>',
    bookplus: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3m4 1v6m-3-3h6"/>',
    gameoff: '<path d="M7 7h10a4 4 0 0 1 4 3l2 8a2 2 0 0 1-3 2l-4-3H8l-4 3a2 2 0 0 1-3-2l2-8a4 4 0 0 1 4-3ZM6 10v4m-2-2h4m8-1h.01M3 2l19 20"/>',
    exam: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3m-3 5 2 2 5-5"/>',
    flag: '<path d="M5 22V3m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H7.5A2.5 2.5 0 1 1 10 5.5Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5Z"/>',
    alert: '<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('perk-icon');
    svg.innerHTML = ICONS[name] || ICONS.gift; // solo pittogrammi costanti; nessun testo configurabile
    return svg;
  }
  function rewardIcon(p) {
    if (p.kind === 'punish') {
      if (/pausa/i.test(p.name))return 'cupoff';
      if (/compit/i.test(p.name))return 'bookplus';
      if (/verific/i.test(p.name))return 'exam';
      if (/attivit|divert/i.test(p.name))return 'gameoff';
      return 'alert';
    }
    if (/squadre|grupp|insieme/i.test(p.name))return 'team';
    if (/pc|computer/i.test(p.name)) return 'monitor';
    if (/relax/i.test(p.name)) return 'relax';
    if (/no compiti|niente compiti/i.test(p.name)) return 'book';
    if (/pausa/i.test(p.name)) return 'cup';
    return 'gift';
  }
  function buildPerks() {
    const list=$('#perks'); list.textContent='';
    for(const p of perkList()) {
      if(!p.name)continue;
      const li=document.createElement('li');li.className=`perk ${p.kind}`;li.dataset.id=p.id;li.dataset.at=String(p.at);
      const col=(p.at+100)/25+1;li.style.setProperty('--stop-column',col);li.style.setProperty('--phone-column',p.at<0?col:col-5);li.style.setProperty('--phone-row',p.at<0?1:3);
      const medal=document.createElement('span');medal.className='perk-medal';medal.append(icon(rewardIcon(p)));
      const indicator=document.createElement('span');indicator.className='perk-indicator';indicator.setAttribute('aria-hidden','true');medal.append(indicator);
      const name=document.createElement('span');name.className='perk-name';name.textContent=p.name;
      const at=document.createElement('span');at.className='perk-at';at.textContent=(p.at<0?'−':'+')+Math.abs(p.at);
      const state=document.createElement('span');state.className='perk-state sr-only';
      li.append(medal,name,at,state);list.append(li);
    }
    const zero=document.createElement('li');zero.className='journey-home';zero.setAttribute('aria-label','Partenza: zero di energia');
    const medal=document.createElement('span');medal.className='home-medal';medal.append(icon('flag'));
    const label=document.createElement('strong');label.textContent='Partenza';const at=document.createElement('span');at.textContent='0';zero.append(medal,label,at);list.append(zero);
  }
  function renderRewards() {
    const b=G.balance||0,shown=Math.trunc(b),state=journeyState(b),bal=$('#bal');
    setText(bal,(shown<0?'−':shown>0?'+':'')+Math.abs(shown));
    bal.classList.toggle('pos',shown>0);bal.classList.toggle('neg',shown<0);
    $('#energy-meter').setAttribute('aria-valuenow',b.toFixed(1));
    $('#energy-meter').setAttribute('aria-valuetext',`${shown} di energia, conseguenze a sinistra, premi a destra`);
    $('#tug-pos').style.width=Math.max(0,b)/2+'%';$('#tug-neg').style.width=Math.max(0,-b)/2+'%';
    $('#journey-map').style.setProperty('--cursor-x',(100/18+state.cursor*800/9)+'%');
    $('#journey-map').dataset.side=b<0?'negative':b>0?'positive':'neutral';
    const next=state.activeP || (b<0?state.nextP:state.nextR);
    document.querySelectorAll('#perks .perk').forEach(li=>{
      const p=state.all.find(p=>p.id===li.dataset.id);if(!p)return;
      const on=!!G.active[p.id],isNext=!!next && next.id===p.id && !on;
      li.classList.toggle('on',on);li.classList.toggle('next',isNext);
      const status=on?(p.kind==='reward'?'Premio conquistato':'Conseguenza attiva'):isNext?'Prossima soglia':p.kind==='reward'?'Da conquistare':'Non attiva';
      setText(li.querySelector('.perk-state'),status);li.setAttribute('aria-label',`${p.name}: ${p.at} di energia. ${status}.`);
      const indicator=li.querySelector('.perk-indicator'),symbol=on?(p.kind==='reward'?'check':'alert'):isNext?'flag':'lock';
      if(indicator.dataset.symbol!==symbol){indicator.replaceChildren(icon(symbol));indicator.dataset.symbol=symbol;}
    });
    setText($('#reward-count'),`${state.nR}/${state.rewards.length} premi`);
    setText($('#consequence-count'),state.nP?`${state.nP} attiv${state.nP===1?'a':'e'}`:'0 attive');
    $('#consequence-count').classList.toggle('has-consequences',state.nP>0);
    let text;
    if(state.activeP)text=`${state.activeP.name} · attiva`;
    else if(b<0 && state.nextP)text=`Attenzione: ${state.nextP.name} a ${state.nextP.at}`;
    else if(state.nextR)text=`${state.nextR.name} · mancano ${Math.max(1,Math.ceil(state.nextR.at-b))}`;
    else text=state.rewards.length?'Tutti i premi!':'Scegli i premi nelle impostazioni';
    setText($('#rewards-sum'),text);
    const goal=state.activeP||(b<0?state.nextP:state.nextR),goalSymbol=goal?rewardIcon(goal):'check';
    if($('#goal-icon').dataset.symbol!==goalSymbol){$('#goal-icon').replaceChildren(icon(goalSymbol));$('#goal-icon').dataset.symbol=goalSymbol;}
    $('#goal-icon').dataset.kind=goal?.kind||'reward';
    $('#bal-plus').disabled=mode==='idle'||b>=100;$('#bal-minus').disabled=mode==='idle'||b<=-100;
  }
  function adjustBalance(d) {
    if (mode === 'idle') return;
    addBalance(d);
    updatePerks(false);
    render(performance.now());
  }

  function renderStats() {
    const entry = league[current];
    setText($('#streak'), fmtTime(G.streak || 0));
    setText($('#record'), fmtTime(entry.record));
    setText($('#record-author'),entry.recordAuthor?(entry.legacy?'Archivio precedente':`Con ${entry.recordAuthor}`):'');
    setText($('#record-class'), current);
    setText($('#points-class'), current);
    setText($('#combo'), '×' + (G.combo || 1));
    setText($('#combo-rate'), `1 s = ${G.combo || 1} XP`);
    $('#combo-box').classList.toggle('hot', G.combo > 1 && !G.alert);
    const next = COMBOS.find((c) => c.x === (G.combo || 1) + 1);
    const comboStart = COMBOS.find((c) => c.x === (G.combo || 1)).at;
    const comboProgress=next?clamp((G.streak-comboStart)/(next.at-comboStart)*100,0,100):100;
    $('#combo-fill').style.width=comboProgress+'%';
    $('#combo-ring-fill').style.strokeDashoffset=String(100-comboProgress);
    setText($('#combo-next'), G.alert ? 'Riparti da ×1' : next ? `×${next.x} tra ${fmtTime(next.at - (G.streak || 0))}` : 'Combo MAX');
    setText($('#points'), fmtInt(entry.points));
    const lv=mascotLevel(entry.points),li=lv.number-1,nx={at:lv.next};
    setText($('#level-name'), `Liv. ${li + 1} · ${lv.name.replace('Marmotta',MASCOTS[settings.mascot].name)}`);
    $('#level-fill').style.width = nx ? (((entry.points - lv.at) / (nx.at - lv.at)) * 100).toFixed(1) + '%' : '100%';
    setText($('#level-next'), nx ? `${fmtInt(Math.ceil(nx.at - entry.points))} XP al livello ${li + 2}` : 'Livello massimo raggiunto');
    setText($('#session-points'),`+${fmtInt(G.session||0)} oggi`);
    const name=lv.name.replace('Marmotta',MASCOTS[settings.mascot].name),progress=nx?clamp((entry.points-lv.at)/(nx.at-lv.at)*100,0,100):100;
    setText($('#rank-number'),String(li+1));setText($('#rank-name'),name);
    setText($('#rank-next'),nx?`${fmtInt(Math.ceil(nx.at-entry.points))} XP al prossimo`:'Livello MAX');
    $('#rank-fill').style.width=progress+'%';$('#rank-progress').setAttribute('aria-valuenow',progress.toFixed(1));
    $('#rank-progress').setAttribute('aria-valuetext',nx?`${Math.round(progress)} per cento verso il livello ${li+2}`:'Livello massimo raggiunto');
    $('#mascot-rank').dataset.tier=li>=7?'legend':li>=4?'gold':li>=2?'silver':'bronze';
    $('#mascot-rank').setAttribute('aria-label',`Livello ${li+1}: ${name}`);
  }

  function classOptions(select) {
    select.textContent='';
    settings.classes.forEach(c=>{const option=document.createElement('option');option.value=c;option.textContent=Object.hasOwn(CLASS_LABELS,c)?CLASS_LABELS[c]:c;select.append(option);});
    select.value=current;
  }
  function renderChips() {
    document.querySelectorAll('[data-chips]').forEach((box,i)=>{
      box.textContent='';const select=document.createElement('select');select.className='class-picker';select.setAttribute('aria-label',i===0?'Classe attiva':'Classe da avviare');
      classOptions(select);select.addEventListener('change',e=>switchClass(e.target.value));box.append(select);
    });
  }

  function renderThresholds() {
    const meter = $('#meter');
    meter.style.setProperty('--w', pct(settings.warn) + '%');
    meter.style.setProperty('--a', pct(settings.alert) + '%');
    setText($('#mark-warn'), `attenzione ${settings.warn}`);
    setText($('#mark-alert'), `silenzio ${settings.alert}`);
    setText($('#pat-thr'), `${settings.alert} dB`);
    // una tacca per secondo; con tempi lunghi una ogni 5 s
    const every = settings.notaSec <= 20 ? 1 : 5;
    $('#patience').style.setProperty('--step', ((100 * every) / settings.notaSec) + '%');
    setText($('#start-thresholds'), `Soglie: attenzione ${settings.warn} dB, silenzio ${settings.alert} dB, preavviso dopo ${settings.notaSec} s.`);
  }

  function recordHistory(dt) {
    G.elapsed+=dt;
    const quiet=zoneOf(level)==='ok', stopped=paused || measuring;
    if(!stopped){G.measuredSec+=dt;if(quiet)G.greenSec+=dt;}
    const t=Math.floor(G.elapsed/2)*2;
    let point=G.history[G.history.length-1];
    if(!point || point.t!==t || (point.db===null)!==stopped) {
      point={t,db:stopped?null:Math.round(level*10)/10,lo:level,hi:level,n:0};G.history.push(point);
      if(G.history.length>14400)G.history.shift();
    }
    if(!stopped){const energy=point.n?Math.pow(10,point.db/10)*point.n:0;point.n++;point.db=10*Math.log10((energy+Math.pow(10,level/10))/point.n);point.lo=Math.min(point.lo,level);point.hi=Math.max(point.hi,level);}
  }
  function drawLessonChart() {
    const canvas=$('#lesson-chart'),cx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;
    if(!w || !h)return;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,w,h);
    const L=26,R=10,T=5,B=17,pw=w-L-R,ph=h-T-B,span=Math.max(60,G.elapsed);
    const X=t=>L+t/span*pw,Y=db=>T+(1-(clamp(db,30,100)-30)/70)*ph;
    cx.font='12px "Atkinson Hyperlegible", sans-serif';cx.fillStyle='#d4e5dd';cx.textAlign='right';
    for(const db of [40,70,100]){cx.fillText(db,L-5,Y(db)+3);cx.strokeStyle='#38574c';cx.lineWidth=1;cx.beginPath();cx.moveTo(L,Y(db));cx.lineTo(w-R,Y(db));cx.stroke();}
    cx.textAlign='left';cx.fillText('0:00',L,h-2);cx.textAlign='right';cx.fillText(fmtTime(span),w-R,h-2);
    cx.setLineDash([4,4]);for(const [db,color]of [[settings.warn,'#edbc4b'],[settings.alert,'#ff8c7c']]){cx.strokeStyle=color;cx.beginPath();cx.moveTo(L,Y(db));cx.lineTo(w-R,Y(db));cx.stroke();}cx.setLineDash([]);
    let prev=null;
    for(const point of G.history){
      if(point.db===null){prev=null;continue;}
      const col=point.hi>=settings.alert?'#ff8c7c':point.hi>=settings.warn?'#edbc4b':'#87d9a4';
      cx.strokeStyle=col;cx.lineWidth=1;cx.globalAlpha=.4;cx.beginPath();cx.moveTo(X(point.t),Y(point.lo));cx.lineTo(X(point.t),Y(point.hi));cx.stroke();cx.globalAlpha=1;
      cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();if(prev)cx.moveTo(X(prev.t),Y(prev.db));else cx.moveTo(X(point.t),Y(point.db));cx.lineTo(X(point.t),Y(point.db));cx.stroke();prev=point;
    }
    $('#history-empty').hidden=G.history.some(p=>p.db!==null);
    const green=G.measuredSec?Math.round(G.greenSec/G.measuredSec*100):0;
    setText($('#history-summary'),G.history.length?`${fmtTime(G.elapsed)} · ${green}% verde`:'In attesa del microfono');
    canvas.setAttribute('aria-label',`Rumore dall’inizio della lezione: ${fmtTime(G.elapsed)}, ${green}% del tempo misurato in verde. Giallo da ${settings.warn} dB, rosso da ${settings.alert} dB. Le pause sono vuoti nel grafico.`);
  }

  const chart = $('#chart');
  const cx = chart.getContext('2d');
  function drawChart() {
    const dpr = window.devicePixelRatio || 1;
    const w = chart.clientWidth, h = chart.clientHeight;
    if (!w || !h) return;
    if (chart.width !== Math.round(w * dpr) || chart.height !== Math.round(h * dpr)) { chart.width = Math.round(w * dpr); chart.height = Math.round(h * dpr); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, w, h);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fs = Math.round(rem * 0.75);
    const L = Math.round(fs * 2.8), R = 8, T = Math.round(fs * 0.7), B = Math.round(fs * 1.7), pw = w - L - R, ph = h - T - B;
    const Y = (db) => T + (1 - (clamp(db, MIN_DB, MAX_DB) - MIN_DB) / (MAX_DB - MIN_DB)) * ph;
    const X = (i) => L + (i / (HIST_N - 1)) * pw;
    cx.font = `700 ${fs}px "Atkinson Hyperlegible", Arial, sans-serif`;
    cx.lineWidth = 1;
    for (let d = 40; d <= MAX_DB; d += 20) {
      const y = Math.round(Y(d)) + 0.5;
      cx.strokeStyle = 'rgba(29,42,44,.09)'; cx.beginPath(); cx.moveTo(L, y); cx.lineTo(w - R, y); cx.stroke();
      cx.fillStyle = '#56656a'; cx.textAlign = 'right'; cx.textBaseline = 'middle'; cx.fillText(String(d), L - fs * 0.6, y);
    }
    cx.textBaseline = 'alphabetic';
    cx.textAlign = 'left'; cx.fillText('2 min fa', L, h - 4);
    cx.textAlign = 'center'; cx.fillText('1 min fa', L + pw / 2, h - 4);
    cx.textAlign = 'right'; cx.fillText('ora', w - R, h - 4);
    if (hist.length > 1) {
      const off = HIST_N - hist.length;
      const area = new Path2D();
      area.moveTo(X(off), Y(MIN_DB));
      for (let i = 0; i < hist.length; i++) area.lineTo(X(off + i), Y(hist[i]));
      area.lineTo(X(HIST_N - 1), Y(MIN_DB));
      area.closePath();
      const bands = [[MIN_DB, settings.warn, 'rgba(46,139,87,.32)'], [settings.warn, settings.alert, 'rgba(227,160,8,.45)'], [settings.alert, MAX_DB, 'rgba(214,58,44,.5)']];
      for (const [lo, hi, col] of bands) {
        cx.save(); cx.beginPath(); cx.rect(L, Y(hi), pw, Y(lo) - Y(hi)); cx.clip();
        cx.fillStyle = col; cx.fill(area); cx.restore();
      }
      const line = new Path2D();
      for (let i = 0; i < hist.length; i++) { const x = X(off + i), y = Y(hist[i]); if (i) line.lineTo(x, y); else line.moveTo(x, y); }
      cx.strokeStyle = '#1d2a2c'; cx.lineWidth = 2; cx.lineJoin = 'round'; cx.stroke(line);
      const lx = X(HIST_N - 1), ly = Y(hist[hist.length - 1]);
      cx.beginPath(); cx.arc(lx, ly, 5, 0, Math.PI * 2);
      cx.fillStyle = { ok: '#2e8b57', warn: '#e3a008', bad: '#d63a2c' }[zoneOf(hist[hist.length - 1])];
      cx.fill(); cx.lineWidth = 2; cx.strokeStyle = '#fff'; cx.stroke();
    }
    cx.setLineDash([6, 5]); cx.lineWidth = 2;
    for (const [db, col] of [[settings.warn, '#c48a00'], [settings.alert, '#d63a2c']]) {
      const y = Math.round(Y(db)) + 0.5;
      cx.strokeStyle = col; cx.beginPath(); cx.moveTo(L, y); cx.lineTo(w - R, y); cx.stroke();
    }
    cx.setLineDash([]);
  }

  // ---------- festeggiamenti ----------
  let toastTimer = 0,reactionTimer=0;
  function notify(title, sub, tone, big) {
    const t = $('#toast');
    setText($('#toast-title'), title); setText($('#toast-sub'), sub);
    t.classList.toggle('bad', tone === 'bad');
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
    play(tone === 'bad' ? 'bonk' : 'chime');
    if(tone==='good'&&mode!=='idle'){stage.dataset.reaction=big?'milestone':'reward';clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>{delete stage.dataset.reaction;},750);}
    if (big) confetti();
  }
  const celebrate = (title, sub, big) => notify(title, sub, 'good', big);
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = $('#confetti');
    const colors = ['#2e8b57', '#e3a008', '#d63a2c', '#6d4aa3', '#3d7fd0', '#f08bb4'];
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.setProperty('--dx', ((Math.random() * 2 - 1) * 140).toFixed(0) + 'px');
      s.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      s.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
      s.style.animationDuration = (1.8 + Math.random() * 1.4).toFixed(2) + 's';
      layer.append(s);
    }
    setTimeout(() => { layer.textContent = ''; }, 3800);
  }

  // ---------- comandi ----------
  function showError(msg) { const e = $('#start-error'); e.textContent = msg; e.hidden = !msg; }
  function showStart() { $('#start').hidden = false; document.body.dataset.mode = 'idle'; render(performance.now()); }
  function onStarted() {
    $('#start').hidden = true;
    $('#demo-chip').hidden = mode !== 'demo';
    document.body.dataset.mode = mode;
    keepAwake();
    renderAll();
  }
  async function switchClass(c) {
    if (c === current || !settings.classes.includes(c)) return;
    saveLeague(); rememberProfile();
    current = c;
    writeJSON(KEYS.current, current);
    applyProfile(); resetSession();
    if (mode === 'mic') {restoreLesson();}
    buildPerks(); updatePerks(true); renderChips(); renderAll(); if (dlg.open) fillSettings();
  }
  function togglePause() {
    if (mode === 'idle') return;
    paused = !paused;
    if (paused) { G.alert = false; G.overRed = 0; G.used = 0; G.grace = 0; }
    $('#btn-pause').setAttribute('aria-pressed', String(paused));
    setText($('#pause-label'), paused ? 'Riprendi' : 'Pausa');
    render(performance.now());
  }
  const fullscreenDocument=document;
  async function toggleFull() {
    try {
      if (fullscreenDocument.fullscreenElement) await fullscreenDocument.exitFullscreen();
      else await fullscreenDocument.documentElement.requestFullscreen();
    } catch (e) { /* schermo intero non disponibile */ }
  }
  const updateFullscreenLabel=()=>setText($('#full-label'),fullscreenDocument.fullscreenElement?'Esci da schermo intero':'Schermo intero');
  fullscreenDocument.addEventListener('fullscreenchange',updateFullscreenLabel);
  window.addEventListener('pagehide',()=>fullscreenDocument.removeEventListener('fullscreenchange',updateFullscreenLabel));

  let wakeLock = null;
  async function keepAwake() {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible' && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { wakeLock = null; }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && mode !== 'idle') keepAwake();
    else saveLeague();
  });
  window.addEventListener('pagehide', saveLeague);
  setInterval(saveLeague, 5000);

  // ---------- impostazioni ----------
  const dlg = $('#settings');
  function fillSettings() {
    $('#set-warn').value = settings.warn; $('#out-warn').value = settings.warn + ' dB';
    $('#set-alert').value = settings.alert; $('#out-alert').value = settings.alert + ' dB';
    $('#set-nota').value = settings.notaSec; $('#out-nota').value = settings.notaSec + ' s';
    $('#set-step').value = settings.stepSec; $('#out-step').value = settings.stepSec + ' s';
    $('#set-calm').value = settings.calmSec; $('#out-calm').value = settings.calmSec + ' s';
    $('#set-rmin').value = settings.rewardMin; $('#out-rmin').value = settings.rewardMin + ' min';
    for (let i = 0; i < 4; i++) { $('#set-r' + i).value = settings.rewards[i]; $('#set-p' + i).value = settings.punishments[i]; }
    $('#set-cal').value = settings.cal; $('#out-cal').value = (settings.cal >= 0 ? '+' : '') + settings.cal + ' dB';
    $('#set-sound').checked = settings.sound;
    $('#set-classes').value = settings.classes.join(', ');
    $('#set-bells').value=settings.bells.join(', ');
    $('#set-has-pc').checked=settings.hasPC;$('#set-mascot').value=settings.mascot;
    for(let i=0;i<4;i++)$('#set-rpc'+i).checked=settings.rewardPC[i];
    setText($('#profile-class'),current);setText($('#rewards-class'),current);classOptions($('#set-class'));$('#set-class').disabled=false;$('#set-classes').closest('.field').hidden=false;$('#set-auto-end').checked=settings.autoEnd;$('#set-bells').disabled=!settings.autoEnd;
    $('#mascot-preview').dataset.mascot=settings.mascot;
    $('#mascot-preview').style.cssText=RonfGame.mascotStyle(settings.mascot);
    const excluded=settings.rewards.filter((n,i)=>n && settings.rewardPC[i] && !settings.hasPC).length;
    setText($('#pc-rewards-help'),excluded?`${excluded} premi con PC esclusi dal sentiero. Puoi cambiarli o applicare «Aula senza PC».`:'Ogni premio può essere modificato. Le voci vuote vengono escluse.');
  }
  function openSettings() {
    if (dlg.open) return;
    fillSettings();
    refreshDevices();
    $('#measure-status').textContent = '';
    $('#align-status').textContent = '';
    $('#data-status').textContent = '';
    dlg.showModal();
    renderFloor(); drawChart();
  }
  // rumore di fondo: il livello più basso degli ultimi 2 minuti (10° percentile, per ignorare i buchi)
  function renderFloor() {
    const el = $('#set-floor');
    if (hist.length < 50) { setText(el, 'Il rumore di fondo compare dopo qualche secondo di misura.'); el.classList.remove('warn'); return; }
    const sorted = hist.slice().sort((a, b) => a - b);
    const floor = Math.round(sorted[Math.floor(sorted.length * 0.1)]);
    const close = floor >= settings.warn - 3;
    setText(el, `Rumore di fondo degli ultimi 2 minuti: circa ${floor} dB.` + (close ? ` È quasi alla soglia di attenzione (${settings.warn}): alzala almeno a ${floor + 8}, oppure usa «Misura il silenzio».` : ''));
    el.classList.toggle('warn', close);
  }
  async function refreshDevices() {
    const sel = $('#set-mic');
    sel.disabled = mode !== 'mic';
    setText($('#mic-help'), mode === 'mic'
      ? 'Puoi scegliere un microfono USB o quello della webcam e metterlo verso i banchi: sentirà meno la tua voce. Il detector spegne i filtri automatici del browser per misurare meglio.'
      : 'Accendi il microfono per scegliere quale usare.');
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    let list = [];
    try { list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput'); } catch (e) { return; }
    sel.textContent = '';
    sel.add(new Option('Microfono predefinito di sistema', ''));
    list.forEach((d, i) => { if (d.deviceId && d.deviceId !== 'default') sel.add(new Option(d.label || `Microfono ${i + 1}`, d.deviceId)); });
    sel.value = settings.deviceId;
    if (sel.value !== settings.deviceId) sel.value = '';
  }
  if (navigator.mediaDevices && 'ondevicechange' in navigator.mediaDevices) navigator.mediaDevices.addEventListener('devicechange', refreshDevices);

  $('#set-warn').addEventListener('input', (e) => {
    settings.warn = +e.target.value;
    if (settings.alert < settings.warn + 2) settings.alert = settings.warn + 2;
    afterThresholdChange();
  });
  $('#set-alert').addEventListener('input', (e) => {
    settings.alert = +e.target.value;
    if (settings.warn > settings.alert - 2) settings.warn = settings.alert - 2;
    afterThresholdChange();
  });
  function afterThresholdChange() { fillSettings(); saveSettings(); renderThresholds(); }
  $('#set-nota').addEventListener('input', (e) => { settings.notaSec = +e.target.value; fillSettings(); saveSettings(); renderThresholds(); });
  $('#set-rmin').addEventListener('input', (e) => { settings.rewardMin = +e.target.value; fillSettings(); saveSettings(); });
  for (let i = 0; i < 4; i++) {
    for (const [kind, key] of [['r', 'rewards'], ['p', 'punishments']]) {
      $(`#set-${kind}${i}`).addEventListener('change', (e) => {
        settings[key][i] = e.target.value.trim().slice(0, 40);
        saveSettings(); buildPerks(); updatePerks(true); renderRewards(); fillSettings();
      });
    }
  }
  function refreshClassGame(){saveSettings();buildPerks();updatePerks(true);fillSettings();renderAll();}
  $('#set-class').addEventListener('change',e=>switchClass(e.target.value));
  $('#set-has-pc').addEventListener('change',e=>{settings.hasPC=e.target.checked;refreshClassGame();});
  $('#set-mascot').addEventListener('change',e=>{settings.mascot=e.target.value;settings.mascotVersion=RonfGame.MASCOT_VERSION;rememberProfile();applyProfile();refreshClassGame();});
  for(let i=0;i<4;i++)$('#set-rpc'+i).addEventListener('change',e=>{settings.rewardPC[i]=e.target.checked;refreshClassGame();});
  for(const [id,key]of [['preset-classroom','classroom'],['preset-lab','lab']])$('#'+id).addEventListener('click',()=>{const preset=REWARD_PRESETS[key];settings.rewards=[...preset.rewards];settings.rewardPC=[...preset.rewardPC];settings.hasPC=preset.hasPC;refreshClassGame();});
  $('#combo-help').addEventListener('click',()=>$('#combo-guide').showModal());
  $('#edit-rewards').addEventListener('click',()=>{openSettings();$('#set-has-pc').focus();});

  $('#set-step').addEventListener('input', (e) => { settings.stepSec = +e.target.value; fillSettings(); saveSettings(); });
  $('#set-calm').addEventListener('input', (e) => { settings.calmSec = +e.target.value; fillSettings(); saveSettings(); });
  $('#set-cal').addEventListener('input', (e) => { settings.cal = +e.target.value; fillSettings(); saveSettings(); });
  function alignTo(ref) {
    const status = $('#align-status');
    if (mode !== 'mic') { status.textContent = 'Accendi prima il microfono: in demo non c’è niente da allineare.'; return; }
    if (!Number.isFinite(ref) || ref < 20 || ref > 130) { status.textContent = 'Scrivi il valore in dB mostrato dall’app, per esempio 62.'; return; }
    if (!peaks.length) { status.textContent = 'Aspetta un paio di secondi che il microfono misuri, poi riprova.'; return; }
    // media energetica degli ultimi 3 s, come fa un fonometro con la media Leq
    const avg = 10 * Math.log10(peaks.reduce((a, l) => a + Math.pow(10, l / 10), 0) / peaks.length);
    const wanted = settings.cal + Math.round(ref - avg);
    const cal = clamp(wanted, -40, 40);
    const delta = cal - settings.cal;
    settings.cal = cal;
    if (power !== null) power *= Math.pow(10, delta / 10);
    fillSettings(); saveSettings();
    status.textContent = cal !== wanted
      ? `Taratura al limite (${cal > 0 ? '+' : ''}${cal} dB). Alza o abbassa il volume del microfono nelle impostazioni audio del computer e riprova.`
      : `Fatto: il detector segnava ${Math.round(avg)} dB, ora segna come il telefono. Taratura ${cal > 0 ? '+' : ''}${cal} dB.`;
  }
  $('#align').addEventListener('click', () => alignTo(Math.round(+$('#set-ref').value)));
  $('#set-ref').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); alignTo(Math.round(+e.target.value)); } });
  $('#set-sound').addEventListener('change', (e) => { settings.sound = e.target.checked; saveSettings(); });
  $('#set-mic').addEventListener('change', (e) => { settings.deviceId = e.target.value; saveSettings(); if (mode === 'mic') startMic(); });
  function updateClasses() {
    const list = cleanClasses($('#set-classes').value);
    if (!list) { $('#data-status').textContent='Scrivi almeno un nome di classe, separando i nomi con una virgola.'; return; }
    saveLeague();rememberProfile();settings.classes = list; saveSettings();
    ensureLeague();
    if (!list.includes(current)) { saveLeague(); current = list[0]; writeJSON(KEYS.current, current); applyProfile();resetSession();buildPerks(); }
    saveSettings();writeJSON(KEYS.current,current);fillSettings(); renderChips(); renderAll();
    $('#data-status').textContent='Classi salvate su questo browser.';
  }
  $('#save-classes').addEventListener('click', updateClasses);
  function measureSilence() {
    const status = $('#measure-status');
    if (mode === 'idle') { status.textContent = 'Accendi prima il microfono.'; return; }
    if (measuring) return;
    measuring = true; measureSamples = []; measureLeft = 5;
    const btn = $('#measure'); btn.disabled = true;
    status.textContent = `Silenzio, sto ascoltando… ${measureLeft}`;
    const timer = setInterval(() => {
      measureLeft--;
      if (measureLeft > 0) { status.textContent = `Silenzio, sto ascoltando… ${measureLeft}`; return; }
      clearInterval(timer);
      measuring = false; btn.disabled = false;
      if (!measureSamples.length) { status.textContent = 'Non ho sentito niente: controlla il microfono e riprova.'; return; }
      const sorted = measureSamples.slice().sort((a, b) => a - b);
      const base = sorted[Math.floor(sorted.length / 2)];
      settings.warn = clamp(Math.round(base + 10), 35, 93);
      settings.alert = clamp(Math.round(base + 20), settings.warn + 2, 95);
      afterThresholdChange();
      const msg = `Silenzio dell’aula: ${Math.round(base)} dB. Nuove soglie: attenzione ${settings.warn} dB, SILENZIO! ${settings.alert} dB.`;
      status.textContent = msg;
      if (!dlg.open) notify('Soglie regolate', msg, 'good', false);
    }, 1000);
  }
  $('#measure').addEventListener('click', measureSilence);
  $('#new-lesson').addEventListener('click', async () => {
    saveLeague(); resetSession(); saveLesson(); renderAll();
    $('#data-status').textContent = `Nuova lezione per la ${current}: letargo, combo e preavvisi ripartono da zero.`;
  });
  let resetArmed = false, resetTimer = 0;
  const resetBtn = $('#reset-league');
  function disarm() { resetArmed = false; resetBtn.classList.remove('armed'); resetBtn.textContent = 'Azzera XP e record'; }
  resetBtn.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true; resetBtn.classList.add('armed'); resetBtn.textContent = 'Clicca di nuovo per azzerare tutto';
      resetTimer = setTimeout(disarm, 5000);
      return;
    }
    clearTimeout(resetTimer); disarm();
    for (const c of settings.classes) league[c] = { points: 0, record: 0 };
    if (mode === 'mic') writeJSON(KEYS.league, league);
    else writeJSON(KEYS.league, {});
    resetSession(); renderAll();
    $('#data-status').textContent = 'XP e record azzerati per tutte le classi.';
  });

  // ---------- eventi ----------
  $('#start-mic').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = 'Attendo il permesso…';
    await startMic();
    btn.disabled = false; btn.textContent = 'Accendi il microfono';
  });
  $('#start-demo').addEventListener('click', startDemo);
  $('#start-measure').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    if (await startMic()) measureSilence();
    btn.disabled = false;
  });
  $('#bal-plus').addEventListener('click', () => adjustBalance(5));
  $('#bal-minus').addEventListener('click', () => adjustBalance(-5));
  $('#start-settings').addEventListener('click', openSettings);
  $('#demo-chip').addEventListener('click', startMic);
  $('#btn-pause').addEventListener('click', togglePause);
  $('#btn-full').addEventListener('click', toggleFull);
  $('#btn-settings').addEventListener('click', openSettings);
  $('#nota-close').addEventListener('click', () => closeNota(true));
  $('#relief').addEventListener('click', () => { $('#relief').hidden = true; });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (e.key === 'Escape' && G.notaOpen) { closeNota(true); return; }
    if (e.key === ' ' && tag !== 'button') { e.preventDefault(); togglePause(); }
    else if (e.key === 'f' || e.key === 'F') toggleFull();
    else if (e.key === 's' || e.key === 'S') openSettings();
    else if (e.key === '+' || e.key === '=') adjustBalance(5);
    else if (e.key === '-' || e.key === '−') adjustBalance(-5);
  });
  window.addEventListener('resize', () => {drawChart();drawLessonChart();});

  function renderAll() { renderThresholds(); renderStats(); render(performance.now()); drawLessonChart(); }
  $('#set-mascot').innerHTML=Object.entries(MASCOTS).map(([id,m])=>`<option value="${id}">${m.name}</option>`).join('');
  applyProfile();
  buildPerks();

  resetSession();
  renderChips();
  renderAll();
  setInterval(tick, TICK_MS);
  async function finishLesson() {
    saveLeague();
    const wasDemo = mode === 'demo';
    const summary = mode === 'idle' ? null : {xp:G.session, record:G.bestRecord, rewards:perkList().filter(p=>p.kind==='reward'&&G.active[p.id]).map(p=>p.name)};
    stopStream(); mode='idle'; paused=false;
    const archive=lessonArchive(); archive.classes[current]=null; writeJSON(KEYS.lesson,archive);
    $('#hour-prompt').hidden=true;
    resetSession(); renderAll(); showStart();
    const message=$('#lesson-summary');message.hidden=!summary;
    if(summary)message.textContent=wasDemo ? 'Simulazione conclusa. Nessun punto salvato.' : `${current} · +${fmtInt(summary.xp)} XP · miglior letargo ${fmtTime(summary.record)}`+(summary.rewards.length?' · '+summary.rewards.join(', '):'');
    $('#btn-end').disabled=false;$('#start-mic').focus();
  }
  function continueHour(){G.scheduledEndAt=RonfClock.nextBell(Date.now(),settings.bells);$('#hour-prompt').hidden=true;saveLesson();}
  $('#btn-end').addEventListener('click',finishLesson);
  $('#back-to-class').addEventListener('click',()=>{if(mode!=='idle')finishLesson();else showStart();});
  $('#set-auto-end').addEventListener('change',e=>{settings.autoEnd=e.target.checked;saveSettings();G.scheduledEndAt=settings.autoEnd?RonfClock.nextBell(Date.now(),settings.bells):0;fillSettings();});
  $('#set-bells').addEventListener('change',e=>{
    const raw=e.target.value.split(/[\s,;]+/).filter(Boolean);
    if(!raw.length||raw.length>24||raw.some(t=>!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t))){$('#data-status').textContent='Usa orari come 09:00, 10:00, 11:00.';fillSettings();return;}
    settings.bells=RonfClock.cleanBells(raw);saveSettings();if(settings.autoEnd)continueHour();
  });
  $('#hour-continue').addEventListener('click',continueHour);$('#hour-finish').addEventListener('click',finishLesson);
  setInterval(()=>{
    if(mode!=='mic'||!settings.autoEnd)return;
    const state=RonfClock.hourState(G.scheduledEndAt);
    $('#hour-prompt').hidden=!state.pending;$('#hour-countdown').textContent=state.remaining;
    if(state.expired)finishLesson();
  },1000);
  $('#btn-about').addEventListener('click',()=>$('#about').showModal());
  $('#welcome-about').addEventListener('click',()=>$('#about').showModal());
  let pendingBackup=null;
  const importPanel=$('#import-preview'),dataStatus=$('#data-status');
  $('#export-backup').addEventListener('click',()=>{
    saveLeague();saveSettings();
    const data=createBackup({settings:JSON.parse(JSON.stringify(settings)),league:readJSON(KEYS.league)||{},current});
    const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    link.href=url;link.download=`ronf-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    dataStatus.textContent='Backup esportato: conservalo per ritrovare classi, impostazioni, XP e record.';
  });
  $('#import-backup').addEventListener('click',()=>{pendingBackup=null;importPanel.hidden=true;$('#backup-file').value='';$('#backup-file').click();});
  $('#backup-file').addEventListener('change',async e=>{
    pendingBackup=null;importPanel.hidden=true;
    try{
      const file=e.target.files[0];if(!file)return;if(file.size>2_000_000)throw Error('Il file è troppo grande. Usa un backup di Ronf (massimo 2 MB).');
      pendingBackup=parseBackup(await file.text());
      $('#import-summary').textContent=`Backup del ${new Date(pendingBackup.exportedAt).toLocaleDateString('it-IT')}: ${pendingBackup.settings.classes.length} classi. Sostituirà classi, preferenze, XP e record attuali.`;
      importPanel.hidden=false;dataStatus.textContent='Controlla il riepilogo prima di confermare.';
    }catch(error){dataStatus.textContent=error.message;}
  });
  $('#cancel-import').addEventListener('click',()=>{pendingBackup=null;importPanel.hidden=true;dataStatus.textContent='Importazione annullata: i dati attuali sono conservati.';});
  $('#confirm-import').addEventListener('click',()=>{
    if(!pendingBackup)return;
    const values=backupValues(pendingBackup);let previous={};
    try{
      previous=Object.fromEntries(Object.keys(values).map(key=>[key,localStorage.getItem(key)]));
      for(const [key,value]of Object.entries(values))localStorage.setItem(key,JSON.stringify(value));
    }catch(error){
      for(const [key,value]of Object.entries(previous)){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}}
      dataStatus.textContent='Spazio o salvataggio non disponibile. Importazione non completata; riprova dopo aver liberato spazio.';return;
    }
    stopStream();location.reload();
  });
  try{const key='ronf:storage-check';localStorage.setItem(key,'1');localStorage.removeItem(key);}catch{
    const note=document.createElement('p');note.className='error';note.textContent='Questo browser non permette i salvataggi: puoi giocare, ma i progressi andranno persi quando chiudi la pagina.';$('#start-error').after(note);
  }
})();

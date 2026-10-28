import { MASCOT_CATALOG, mascotStyle } from './game-data.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const landing = document.querySelector('.wrap');
const character = document.querySelector('#hero-character');
const name = document.querySelector('#mascot-name');
const pause = document.querySelector('#mascot-pause');
const mascots = Object.entries(MASCOT_CATALOG);
const loadedSheets = new Map();
const poses = ['sleep','stir','grumpy','alert'];
const poseLabels = ['riposo','un occhio aperto','risveglio','allarme'];
let mascotIndex = 0, poseIndex = 0, paused = false, swapping = false, shell = null, frame = null, readyTimer;

async function animate(element, frames, options) {
  if (reducedMotion.matches) return;
  try { await element.animate(frames, options).finished; } catch { /* navigazione interrotta */ }
}
function preload(sheet) {
  if (!sheet) return Promise.resolve();
  if (!loadedSheets.has(sheet)) {
    const image = new Image(); image.src = './assets/' + sheet;
    loadedSheets.set(sheet, image.decode().catch(() => { loadedSheets.delete(sheet); throw Error('Immagine non disponibile'); }));
  }
  return loadedSheets.get(sheet);
}
async function advanceMascot() {
  if (swapping || shell || document.hidden || paused || reducedMotion.matches || character.matches(':hover,:focus-within')) return;
  swapping = true;
  const nextPose = (poseIndex + 1) % poses.length;
  const nextIndex = nextPose === 0 ? (mascotIndex + 1) % mascots.length : mascotIndex;
  const [id, mascot] = mascots[nextIndex];
  try {
    await preload(mascot.sheet);
    if (nextIndex !== mascotIndex) {
      await Promise.all([
        animate(character, [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}], {duration:140,easing:'ease-out'}),
        animate(name, [{opacity:1},{opacity:0}], {duration:140,easing:'ease-out'}),
      ]);
    }
    character.dataset.mascot = id;
    character.dataset.pose = poses[nextPose];
    character.style.cssText = mascotStyle(id,nextPose);
    character.setAttribute('aria-label', mascot.subject + ' del gioco: ' + poseLabels[nextPose]);
    name.textContent = mascot.subject;
    if (nextIndex !== mascotIndex) {
      await Promise.all([
        animate(character, [{opacity:0,transform:'translateY(8px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}], {duration:300,easing:'cubic-bezier(.16,1.1,.3,1)'}),
        animate(name, [{opacity:0},{opacity:1}], {duration:220,easing:'ease-out'}),
      ]);
    }
    mascotIndex = nextIndex; poseIndex = nextPose;
  } catch { /* La mascotte corrente resta visibile se una risorsa non si carica. */ }
  finally { swapping = false; }
}
character.dataset.pose = 'sleep';
pause.addEventListener('click', () => {
  paused = !paused;
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Riprendi le animazioni delle mascotte' : 'Ferma le animazioni delle mascotte';
});
setInterval(advanceMascot,1000);

// Il documento della landing resta aperto. Il gioco conserva il proprio ambiente
// e i propri stili, con una sola istanza e senza ricariche fra i passi del wizard.
history.replaceState({ ...history.state, ronfLanding: true }, '', location.href);
function openGame(push = true) {
  if (shell) return;
  shell = document.createElement('section'); shell.className = 'entry-shell';
  shell.setAttribute('aria-label', 'Ronf · preparazione e gioco'); shell.setAttribute('aria-busy','true');
  const loading = document.createElement('div'); loading.className = 'entry-loading'; loading.setAttribute('role','status');
  const icon = document.createElement('img'); icon.src = './assets/ronf-mark.svg'; icon.alt = '';
  const label = document.createElement('p'); label.textContent = 'Prepariamo il pisolino…';
  loading.append(icon, label);
  frame = document.createElement('iframe'); frame.title = 'Ronf, prepara e avvia la lezione';
  frame.allow = 'microphone; fullscreen'; frame.allowFullscreen = true;
  frame.src = './gioca.html?embedded=1';
  shell.append(loading, frame); document.body.append(shell);
  landing.inert = true; document.body.classList.add('game-open');
  if (push) history.pushState({ ronfGame: true }, '', './gioca.html');
  animate(shell, [{opacity:0,clipPath:'inset(5% 6% round 28px)'},{opacity:1,clipPath:'inset(0% 0% round 0px)'}], {duration:460,easing:'cubic-bezier(.16,1,.3,1)'});
  readyTimer = setTimeout(() => {
    if (!shell || shell.dataset.ready === 'true') return;
    label.textContent = 'Ronf ci sta mettendo un po’. Puoi aprirlo direttamente.';
    const fallback = document.createElement('a'); fallback.href = './gioca.html'; fallback.textContent = 'Apri Ronf'; loading.append(fallback);
  }, 9000);
}
async function closeGame() {
  if (!shell) return;
  clearTimeout(readyTimer);
  const closing = shell, closingFrame = frame;
  shell = null; frame = null;
  closingFrame.contentWindow?.postMessage({type:'ronf:stop'},location.origin);
  closing.getAnimations().forEach(animation => animation.cancel());
  await animate(closing, [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(16px)'}],{duration:260,easing:'ease-out'});
  closing.remove();
  if (!shell) {
    landing.inert = false; document.body.classList.remove('game-open');
    document.querySelector('#inizia').focus({preventScroll:true});
  }
}
document.querySelector('#inizia').addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); openGame();
});
window.addEventListener('popstate', event => { if (event.state?.ronfGame) openGame(false); else closeGame(); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame?.contentWindow) return;
  if (event.data?.type === 'ronf:home') { history.back(); return; }
  if (event.data?.type !== 'ronf:ready') return;
  clearTimeout(readyTimer); shell.dataset.ready = 'true'; shell.setAttribute('aria-busy','false');
  animate(frame, [{opacity:0},{opacity:1}],{duration:240,easing:'ease-out'});
  frame.focus();
});

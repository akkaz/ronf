// La preparazione resta separata dal gioco: nessun punto finché non si parte.
export function silenceThresholds(samples) {
  const values = samples.filter(Number.isFinite).sort((a, b) => a - b);
  if (values.length < 10) throw new Error('Non ho sentito abbastanza audio. Controlla il microfono e riprova.');
  const base = Math.round(values[Math.floor(values.length / 2)]);
  const warn = Math.min(93, Math.max(35, base + 10));
  return { base, warn, alert: Math.min(95, Math.max(warn + 2, base + 20)) };
}

export function createSetupFlow({ remembered = false, connect, measure, play, demo, stop, remember, onChange }) {
  let generation = 0;
  let state = { step: remembered ? 'quick' : 'microphone', busy: false, connected: false, result: null, error: '' };
  const update = (patch) => { state = { ...state, ...patch }; onChange({ ...state }); };
  async function run(action, success) {
    if (state.busy) return;
    const ticket = ++generation;
    update({ busy: true, error: '' });
    try {
      const result = await action();
      if (ticket !== generation) return;
      if (result === false || result === null) { update({ busy: false }); return; }
      update({ busy: false, ...success(result) });
    } catch (error) {
      if (ticket === generation) update({ busy: false, error: error.message || 'Riprova, oppure usa la simulazione.' });
    }
  }
  const flow = {
    get state() { return { ...state }; },
    show() { onChange({ ...state }); },
    async connect() {
      if (state.connected) { update({ step: 'quiet' }); return; }
      await run(() => connect(true), () => ({ connected: true, step: 'quiet' }));
    },
    async measure() {
      if (!state.connected) return;
      await run(measure, (result) => ({ result, step: 'class' }));
    },
    skip() { if (state.connected && !state.busy) update({ step: 'class', error: '' }); },
    back() {
      if (state.busy) return;
      update({ step: state.step === 'class' ? 'quiet' : 'microphone', error: '' });
    },
    guide() { if (!state.busy) update({ step: 'microphone', error: '' }); },
    launch() {
      if (!state.connected || state.busy) return;
      remember(); play();
    },
    async quick() {
      await run(() => connect(false), () => { remember(); return { connected: true }; });
    },
    demo() { ++generation; stop(); update({ busy: false, error: '' }); demo(); },
    reset() {
      ++generation;
      update({ step: remembered ? 'quick' : 'microphone', busy: false, connected: false, result: null, error: '' });
    },
    completed() { remembered = true; },
    disconnected() { ++generation; update({ step: 'microphone', connected: false, busy: false, result: null }); },
  };
  return flow;
}

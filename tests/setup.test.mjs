import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSetupFlow, silenceThresholds } from '../setup-flow.js';

function fixture(overrides = {}) {
  const calls = [];
  const flow = createSetupFlow({
    connect: async () => true, measure: async () => ({ base: 40, warn: 50, alert: 60 }),
    play: () => calls.push('play'), demo: () => calls.push('demo'), stop: () => calls.push('stop'),
    remember: () => calls.push('remember'), onChange: () => {}, ...overrides,
  });
  return { flow, calls };
}
test('la preparazione richiede il microfono e parte solo dopo conferma della classe', async () => {
  const { flow, calls } = fixture();
  flow.skip(); flow.launch(); assert.equal(flow.state.step, 'microphone'); assert.deepEqual(calls, []);
  await flow.connect(); assert.equal(flow.state.step, 'quiet');
  await flow.measure(); assert.equal(flow.state.step, 'class'); assert.deepEqual(calls, []);
  flow.launch(); assert.deepEqual(calls, ['remember', 'play']);
});
test('permesso rifiutato e riprova non saltano la preparazione', async () => {
  let attempts = 0;
  const { flow } = fixture({ connect: async () => { if (!attempts++) throw Error('Permesso negato'); return true; } });
  await flow.connect(); assert.equal(flow.state.step, 'microphone'); assert.equal(flow.state.error, 'Permesso negato');
  await flow.connect(); assert.equal(flow.state.step, 'quiet'); assert.equal(flow.state.error, '');
  flow.skip(); assert.equal(flow.state.step, 'class'); assert.equal(flow.state.result, null);
});
test('misura annullata e click ripetuti non fanno avanzare una nuova sessione', async () => {
  let finish, requests = 0;
  const { flow } = fixture({ measure: () => { requests++; return new Promise(resolve => { finish = resolve; }); } });
  await flow.connect(); const pending = flow.measure(); await flow.measure(); assert.equal(requests, 1);
  flow.back(); assert.equal(flow.state.step, 'quiet');
  flow.reset(); finish({ base: 40 }); await pending;
  assert.equal(flow.state.step, 'microphone'); assert.equal(flow.state.result, null);
});
test('simulazione e avvio rapido hanno percorsi distinti', async () => {
  const { flow, calls } = fixture({ remembered: true });
  assert.equal(flow.state.step, 'quick'); flow.guide(); assert.equal(flow.state.step, 'microphone');
  flow.demo(); assert.deepEqual(calls, ['stop', 'demo']);
  await flow.quick(); assert.deepEqual(calls, ['stop', 'demo', 'remember']);
});
test('taratura robusta ai picchi, campioni invalidi e limiti delle soglie', () => {
  assert.deepEqual(silenceThresholds([...Array(40).fill(42), 99, NaN]), { base: 42, warn: 52, alert: 62 });
  assert.deepEqual(silenceThresholds(Array(10).fill(99)), { base: 99, warn: 93, alert: 95 });
  assert.deepEqual(silenceThresholds(Array(10).fill(0)), { base: 0, warn: 35, alert: 37 });
  assert.throws(() => silenceThresholds([NaN, 40]), /abbastanza audio/);
});

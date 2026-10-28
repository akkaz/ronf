import { MASCOTS } from './game-data.js';

const reserved = new Set(['__proto__', 'prototype', 'constructor']);
const number = (v, min, max, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const four = (v, fallback) => Array.isArray(v) && v.length === 4 ? v.map(x => typeof x === 'string' ? x.trim().slice(0, 40) : '') : fallback.slice();
const defaults = ['Pausa', 'Sfida a squadre', 'Pausa relax', 'No compiti'];

function profile(value = {}) {
  const p = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    rewards: four(p.rewards, defaults), punishments: four(p.punishments, ['', '', '', '']),
    rewardPC: Array.isArray(p.rewardPC) && p.rewardPC.length === 4 ? p.rewardPC.map(v => v === true) : [false, false, false, false],
    hasPC: p.hasPC === true, mascot: Object.hasOwn(MASCOTS, p.mascot) ? p.mascot : 'marmot',
    mascotVersion: 2, rewardMin: number(p.rewardMin, 5, 60, 25),
  };
}

function normalize(data) {
  const raw = data?.settings;
  if (!raw || !Array.isArray(raw.classes) || !raw.classes.length || raw.classes.length > 120) throw Error('Il backup non contiene un elenco di classi valido.');
  const classes = raw.classes.map(c => {
    if (typeof c !== 'string' || !c.trim() || c.trim().length > 24 || reserved.has(c.trim())) throw Error('Il backup contiene un nome di classe non valido.');
    return c.trim();
  });
  if (new Set(classes).size !== classes.length) throw Error('Il backup contiene classi duplicate.');
  const classProfiles = Object.create(null), league = Object.create(null);
  for (const c of classes) {
    classProfiles[c] = profile(raw.classProfiles?.[c]);
    const entry = data.league?.[c];
    league[c] = { points: number(entry?.points, 0, 1e12, 0), record: number(entry?.record, 0, 1e8, 0) };
  }
  const warn = number(raw.warn, 35, 93, 70);
  return {
    settings: {
      warn, alert: number(raw.alert, warn + 2, 95, Math.max(80, warn + 2)),
      notaSec: number(raw.notaSec, 3, 60, 10), stepSec: number(raw.stepSec, 4, 30, 8), calmSec: number(raw.calmSec, 2, 15, 5),
      cal: number(raw.cal, -40, 40, 0), sound: raw.sound !== false, autoEnd: raw.autoEnd === true,
      bells: Array.isArray(raw.bells) ? raw.bells.filter(t => typeof t === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)).slice(0, 24) : [],
      classes, classProfiles, classCatalogVersion: 1, deviceId: '',
    },
    league, current: classes.includes(data.current) ? data.current : classes[0],
  };
}

export function createBackup(data) {
  return { app: 'ronf', version: 1, exportedAt: new Date().toISOString(), ...normalize(data) };
}

export function parseBackup(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw Error('Il file non è un JSON valido. Scegli un backup esportato da Ronf.'); }
  if (raw?.app !== 'ronf' || raw.version !== 1) throw Error('Questo file non è un backup di Ronf compatibile.');
  if (typeof raw.exportedAt !== 'string' || !Number.isFinite(Date.parse(raw.exportedAt))) throw Error('La data del backup non è valida.');
  return { app: 'ronf', version: 1, exportedAt: raw.exportedAt, ...normalize(raw) };
}

export function backupValues(backup) {
  return {
    'ronf:v1:settings': backup.settings, 'ronf:v1:league': backup.league,
    'ronf:v1:class': backup.current, 'ronf:v1:lesson': { version: 2, classes: {} },
  };
}

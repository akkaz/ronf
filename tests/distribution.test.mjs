import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('la distribuzione non dipende da servizi scolastici o caricamenti esterni',async()=>{
  const names=['index.html','gioca.html','app.js','game-data.js','lesson-clock.js','backup.js','board.css','lesson-board.css','ronf.css'];
  for(const name of names){
    const source=await readFile(new URL('../'+name,import.meta.url),'utf8');
    assert.doesNotMatch(source,/fadzanardelli|GOOGLE_CLIENT_ID|MONGODB_URI|fetch\(|XMLHttpRequest|sendBeacon|MediaRecorder|fonts\.googleapis|__VIEWER__|__CLASS__/i,name);
  }
});
test('tutte le risorse HTML e CSS sono presenti e usano percorsi relativi',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    const path=match[1];if(/^(?:https:|data:)/.test(path))continue;
    assert.ok(path.startsWith('./'),path);if(path!=='./')await readFile(new URL('../'+path,import.meta.url));
  }
  const css=await readFile(new URL('../ronf.css',import.meta.url),'utf8');
  for(const match of css.matchAll(/url\('([^']+)'\)/g))await readFile(new URL('../'+match[1],import.meta.url));
});

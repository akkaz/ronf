import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBackup, parseBackup, backupValues } from '../backup.js';

const sample = () => ({settings:{classes:['La mia classe','Gruppo B'],warn:65,alert:78,classProfiles:{'La mia classe':{mascot:'fox',rewards:['Pausa','','Gioco','Musica'],punishments:['','','',''],hasPC:true,rewardPC:[false,false,true,false]}}},league:{'La mia classe':{points:1234,record:92},'Gruppo B':{points:500,record:30}},current:'Gruppo B'});
test('il trasferimento conserva classi, premi vuoti, mascotte e progressi distinti',()=>{
  const data=parseBackup(JSON.stringify(createBackup(sample())));
  assert.deepEqual(data.settings.classes,['La mia classe','Gruppo B']);
  assert.equal(data.settings.classProfiles['La mia classe'].mascot,'fox');
  assert.equal(data.settings.classProfiles['La mia classe'].rewards[1],'');
  assert.equal(data.league['La mia classe'].points,1234);assert.equal(data.league['Gruppo B'].record,30);
  assert.equal(data.current,'Gruppo B');
  assert.deepEqual(backupValues(data)['ronf:v1:lesson'],{version:2,classes:{}});
});
test('un file estraneo o incompleto viene rifiutato senza produrre valori da salvare',()=>{
  for(const text of ['not json','{}','null',JSON.stringify({app:'ronf',version:2}),JSON.stringify({app:'ronf',version:1,exportedAt:'x',settings:{classes:['A']}})])assert.throws(()=>parseBackup(text));
});
test('nomi riservati, duplicati e liste eccessive sono rifiutati',()=>{
  for(const classes of [['__proto__'],['constructor'],['A','A'],[''],Array(121).fill('A')]){
    const data={...createBackup(sample()),settings:{classes}};assert.throws(()=>parseBackup(JSON.stringify(data)));
  }
});
test('i campi importati sono limitati e non trasferiscono identificativi del microfono',()=>{
  const raw=sample();raw.settings.deviceId='private-device';raw.settings.warn=200;raw.settings.alert=-1;
  raw.settings.sessionToken='unexpected';raw.league['Gruppo B'].points=Infinity;
  const data=createBackup(raw);assert.equal(data.settings.deviceId,'');assert.equal(data.settings.warn,93);assert.equal(data.settings.alert,95);
  assert.equal(data.league['Gruppo B'].points,0);assert.equal(data.settings.sessionToken,undefined);
});

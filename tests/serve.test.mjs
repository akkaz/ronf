import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
test('Il server locale serve la home e le risorse del clone', {timeout:15000}, async t=>{
  const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  const exited=once(server,'exit');
  t.after(async()=>{if(server.exitCode===null)server.kill();await exited;});
  const address=await new Promise((resolve,reject)=>{
    let output='',errors='';
    const timer=setTimeout(()=>reject(new Error('Il server non ha comunicato la porta. '+errors)),5000);
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.stderr.on('data',chunk=>{errors+=chunk;});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error('Server terminato: '+code+' '+errors));});
    server.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/Ronf: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  });
  const home=await fetch(address+'/');assert.equal(home.status,200);assert.match(home.headers.get('content-type'),/text\/html/);assert.match(await home.text(),/landing\.css/);
  for(const path of ['/landing.css','/entry.js','/gioca.html','/assets/ronf-mark.svg']){const response=await fetch(address+path);assert.equal(response.status,200,path);assert.ok((await response.text()).length>0,path);}
  for(const path of ['/.git/config','/non-esiste.html','/%2e%2e%2fpackage.json']){const response=await fetch(address+path);assert.equal(response.status,404,path);}
});

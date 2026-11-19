// Native local click effects only. All HTTPS requests are intercepted fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const executable=process.argv[2];assert.ok(executable&&fs.existsSync(executable));
const destination=fs.readFileSync(path.join(root,'shared/destination.js'),'utf8');
const injector=fs.readFileSync(path.join(root,'chatgpt/content.js'),'utf8');
const collectionContext=vm.createContext({URL,TextEncoder,Date});vm.runInContext(fs.readFileSync(path.join(root,'shared/collection.js'),'utf8'),collectionContext);
const collectionPayload=collectionContext.YT2GPTCollection.build([1,2,3].map(n=>({videoId:'fixture'+n,title:'Collection source '+n,url:'https://www.youtube.com/watch?v=fixture'+n,channel:'Fixture',transcript:{text:'[0:00] Source '+n,segments:[{start:0,text:'Source '+n}],track:{name:'English'}}})));
const html=`<!doctype html><style>body{margin:30px}form{width:600px;padding:20px}#prompt-textarea{min-height:100px;white-space:pre-wrap}button{min-width:90px;min-height:35px}textarea{min-height:40px}</style><form data-chatgpt-composer><div data-composer-body><div data-composer-input><div id="prompt-textarea" data-composer-markdown role="textbox" aria-multiline="true" contenteditable="true"><p><br></p></div></div><div data-composer-attachments hidden></div></div><button type="button" aria-label="Select ChatGPT model">Pro</button><button id="send" data-testid="send-button" disabled>Send</button></form><textarea id="unrelated">Keep unrelated draft</textarea>`;
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'yt-bridge-explicit-send-'));
const browser=spawn(executable,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws,sequence=0;const pending=new Map(),errors=[],closingSessions=new Set();
try{
 const endpoint=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No browser endpoint')),15000);let output='';browser.once('error',reject);browser.stderr.on('data',d=>{output+=d;const m=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
 ws=new WebSocket(endpoint);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 function call(method,params={},sessionId){const id=++sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Fetch.requestPaused')call('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from(html).toString('base64')},m.sessionId).catch(e=>{if(!closingSessions.has(m.sessionId))errors.push(String(e));});});
 let cases=0;
 async function run(name,o={}){
  const {targetId}=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
  await call('Page.enable',{},sessionId);await call('Runtime.enable',{},sessionId);await call('Fetch.enable',{patterns:[{urlPattern:'https://chatgpt.com/*',requestStage:'Request'}]},sessionId);
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Page.navigate',{url:o.actual||o.expected||'https://chatgpt.com/'},sessionId);
  await evaluate(`new Promise(resolve=>{const check=()=>document.getElementById('send')?resolve(true):setTimeout(check,10);check();})`);
  await evaluate(`(()=>{
   const o=${JSON.stringify(o)},expected=${JSON.stringify(o.expected||'https://chatgpt.com/')},payload=o.payload||'Harmless fixture sample.\\n\\nSource: synthetic only.';
   let editor=document.getElementById('prompt-textarea'),send=document.getElementById('send');const form=editor.closest('form');
   window.fixture={clicks:0,submits:0,claims:0,authorizations:0,enters:0,edits:0};let available=true;
   if(o.textarea){const area=document.createElement('textarea');area.id='prompt-textarea';editor.replaceWith(area);editor=area;}
   if(o.draft)editor.textContent=o.draft;
   if(o.readonly)editor.setAttribute('aria-readonly','true');
   if(o.inert)form.setAttribute('inert','');
   if(o.ancestorReadonly)form.setAttribute('aria-readonly','true');
   if(o.disabledFieldset){const field=document.createElement('fieldset');field.disabled=true;send.before(field);field.append(send);}
   if(o.busy)form.setAttribute('aria-busy','true');
   if(o.rich){const n=document.createElement('span');n.contentEditable='false';editor.append(n);}
   if(o.attachment){const n=document.createElement('div');n.dataset.testid='upload-preview';n.hidden=true;form.append(n);}
   if(o.unknown)send.removeAttribute('data-testid');
   if(o.unmarkedSendLabel){send.removeAttribute('data-testid');send.setAttribute('aria-label','Send');}
   if(o.duplicateSend){const n=send.cloneNode(true);n.id='duplicate-send';form.append(n);}
   if(o.activityOnInput)editor.addEventListener('input',()=>form.setAttribute('aria-busy','true'));
   if(o.unsupportedOnInput)editor.addEventListener('input',()=>{const n=document.createElement('span');while(editor.firstChild)n.append(editor.firstChild);editor.append(n);});
   if(o.otherSend){const n=document.createElement('button');n.setAttribute('aria-label','Send prompt');n.textContent='Other';form.append(n);}
   if(o.duplicateEditor){const n=editor.cloneNode(true);n.id='other-editor';form.append(n);}
   if(o.dialog){const n=document.createElement('div');n.setAttribute('role','dialog');n.style='width:100px;height:60px';document.body.append(n);}
   if(o.focusDraft)editor.addEventListener('focus',()=>{editor.textContent='Restored private draft';});
   editor.addEventListener('input',()=>{if(!o.disabled)form.querySelectorAll('button').forEach(b=>b.disabled=false);if(o.reject)setTimeout(()=>{editor.textContent='';},0);if(o.routeOnInput)history.replaceState(null,'',o.routeOnInput);});
   document.addEventListener('click',e=>{if(e.target.closest('button'))fixture.clicks++;});document.addEventListener('submit',e=>{fixture.submits++;e.preventDefault();});document.addEventListener('keydown',e=>{if(e.key==='Enter')fixture.enters++;});
   const native=document.execCommand.bind(document);document.execCommand=(...args)=>{fixture.edits++;if(o.partial){editor.textContent='Partial';return false;}return native(...args);};
   window.chrome={runtime:{async sendMessage(m){
    const response={ok:true,payload,destinationUrl:expected,...(!o.manual?{explicitSendKey:'explicit_send_'+'a'.repeat(64)}:{})};
    if(m.type==='GET_PENDING_PAYLOAD')return {...response,payload:available?payload:null};
    if(m.type==='CLEAR_PENDING_PAYLOAD'){available=false;return {ok:true};}
    if(m.type==='CLAIM_PENDING_PAYLOAD'){fixture.claims++;available=false;if(o.claimDraft)editor.textContent='Restored during claim';return response;}
    if(m.type==='AUTHORIZE_CHATGPT_SEND_ONCE'){fixture.authorizations++;if(o.changeControl){const n=send.cloneNode(true);send.replaceWith(n);send=n;}if(o.disableOnAuth)send.disabled=true;if(o.changeText)editor.textContent+=' Changed';if(o.routeOnAuth)history.replaceState(null,'',o.routeOnAuth);return {ok:!o.deny,...(o.denyReason?{reason:o.denyReason}:{})};}
    return {ok:false};
   }}};
   let tick=0;Date.now=()=>{tick+=100;return tick;};const timeout=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timeout(fn,ms===100||ms===500?0:ms,...args);
  })()`);
  await evaluate(destination);await evaluate(injector);if(o.duplicateScript)await evaluate(injector);
  await evaluate(`new Promise((resolve,reject)=>{let count=0;const check=()=>document.getElementById('yt2gpt-toast')?resolve(true):++count>400?reject(Error('No result')):setTimeout(check,10);check();})`);
  const r=await evaluate(`({...fixture,notice:document.getElementById('yt2gpt-toast').textContent,unrelated:document.getElementById('unrelated').value,html:document.getElementById('prompt-textarea').innerHTML,text:document.getElementById('prompt-textarea').value??document.getElementById('prompt-textarea').innerText})`);
  assert.equal(r.clicks,o.send?1:0,name+': click boundary '+JSON.stringify(r));assert.equal(r.submits,o.send?1:0,name+': native submit effects');assert.equal(r.enters,0);assert.equal(r.unrelated,'Keep unrelated draft');
  if(o.send){assert.match(r.notice,/Send was requested once/);assert.equal(r.authorizations,1);}
  else if(o.notice)assert.match(r.notice,new RegExp(o.notice),name+': useful manual status');
  if(o.code) {assert.ok(r.notice.includes('['+o.code+']'),name+': specific reason '+r.notice);assert.ok(!r.notice.includes(o.payload||'Harmless fixture sample.'),'diagnostic never includes payload');}
  if(o.edits!==undefined)assert.equal(r.edits,o.edits,name+': editing bound');
  if(o.text!==undefined)assert.equal(r.text,o.text,name+': preserve draft/partial content');
  if(o.auth!==undefined)assert.equal(r.authorizations,o.auth);
  closingSessions.add(sessionId);await call('Target.closeTarget',{targetId});cases++;
 }
 await run('explicit native Send',{send:true});
 await run('textarea native Send',{send:true,textarea:true});
 await run('exact conversation',{send:true,expected:'https://chatgpt.com/c/fixture?view=exact#saved'});
 await run('exact Project',{send:true,expected:'https://chatgpt.com/g/g-p-fixture/project'});
 await run('duplicate injector',{send:true,duplicateScript:true});
 await run('literal indentation and extra paragraph breaks',{send:true,payload:'Unicode café\n\n\n\n  Indented text\nFinal line.'});
 await run('ordinary Open',{manual:true,auth:0,notice:'Review it, then press Send'});
 await run('actual Collection payload stays manual',{manual:true,payload:collectionPayload,auth:0,notice:'Review it, then press Send'});
 await run('existing draft',{draft:'Keep my draft',text:'Keep my draft',edits:0,auth:0});
 await run('whitespace draft',{draft:'   ',edits:0,auth:0});
 await run('rich draft',{rich:true,edits:0,auth:0});
 await run('hidden upload',{attachment:true,edits:0,auth:0});
 await run('busy',{busy:true,edits:0,auth:0});
 await run('readonly',{readonly:true,edits:0,auth:0});
 await run('inert',{inert:true,edits:0,auth:0});
 await run('ambiguous editor',{duplicateEditor:true,edits:0,auth:0});
 await run('dialog',{dialog:true,edits:0,auth:0});
 await run('restored focus draft',{focusDraft:true,text:'Restored private draft',edits:0,auth:0});
 await run('restored claim draft',{claimDraft:true,text:'Restored during claim',edits:0,auth:0});
 await run('wrong saved destination',{actual:'https://chatgpt.com/c/other',edits:0,auth:0});
 await run('Project redirect remains manual',{expected:'https://chatgpt.com/g/g-p-fixture/project',actual:'https://chatgpt.com/g/g-p-fixture/c/fixture',notice:'withheld',auth:0});
 await run('unknown Send',{unknown:true,notice:'withheld',code:'SEND_MISSING',auth:0});
 await run('Send label alone stays manual',{unmarkedSendLabel:true,notice:'withheld',code:'SEND_UNKNOWN',auth:0});
 await run('two Send controls',{duplicateSend:true,notice:'withheld',code:'SEND_AMBIGUOUS',auth:0});
 await run('other unmarked Send-labelled control',{otherSend:true,notice:'withheld',code:'SEND_AMBIGUOUS',auth:0});
 await run('disabled Send',{disabled:true,notice:'withheld',code:'SEND_DISABLED',auth:0});
 await run('disabled fieldset Send',{disabledFieldset:true,notice:'withheld',auth:0});
 await run('readonly ancestor',{ancestorReadonly:true,edits:0,auth:0});
 await run('changed Send after authorization',{changeControl:true,notice:'withheld',code:'SEND_CONTROL_CHANGED',auth:1});
 await run('disabled after authorization',{disableOnAuth:true,notice:'withheld',code:'SEND_DISABLED',auth:1});
 await run('changed draft after authorization',{changeText:true,notice:'withheld',code:'PAYLOAD_MISMATCH',auth:1});
 await run('changed route after authorization',{routeOnAuth:'/c/other',notice:'withheld',code:'DESTINATION',auth:1});
 await run('authorization denied',{deny:true,notice:'withheld',code:'AUTH_UNAVAILABLE',auth:1});
 await run('framework rejects insertion',{reject:true,notice:'withheld',auth:0});
 await run('partial edit',{partial:true,text:'Partial',edits:1,auth:0,notice:'could not be confirmed'});
 await run('route changes after insertion',{routeOnInput:'/c/other',notice:'withheld',auth:0});
 await run('reported generic refusal now distinguishes activity',{activityOnInput:true,notice:'withheld',code:'UPLOAD_OR_ACTIVITY',auth:0});
 await run('unsupported serialized markup remains manual',{unsupportedOnInput:true,notice:'withheld',code:'PAYLOAD_MISMATCH',auth:0});
 for(const reason of ['AUTH_CONTEXT','AUTH_RECORD','AUTH_DESTINATION','AUTH_EXPIRED','AUTH_DISABLED','AUTH_STORAGE'])await run('closed authorization reason '+reason,{deny:true,denyReason:reason,notice:'withheld',code:reason,auth:1});
 await run('untrusted authorization error is never echoed',{deny:true,denyReason:'Private draft secret',notice:'withheld',code:'AUTH_UNAVAILABLE',auth:1});
 assert.equal(errors.length,0,JSON.stringify(errors));console.log(`PASS: ${cases} explicit Send native-DOM cases; successful one-click effects and guarded no-send failures. Synthetic only.`);
}finally{if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({id:++sequence,method:'Browser.close'}));await new Promise(resolve=>{const t=setTimeout(resolve,2000);browser.once('exit',()=>{clearTimeout(t);resolve();});});}ws?.close();browser.kill();browser.stderr.destroy();browser.unref();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Closed'));}}

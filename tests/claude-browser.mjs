// Actual injector + native editing in an intercepted, synthetic Claude DOM.
// No AI messages, personal sessions, installed dependencies or remote requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executable = process.argv[2] || process.env.CHROMIUM_EXECUTABLE;
assert.ok(executable && fs.existsSync(executable), 'Pass an existing Chromium/Chrome/Edge executable. Nothing is downloaded.');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('tests/fixtures/claude-composer.html');
const destinationSource = read('shared/destination.js');
const injector = read('claude/content.js');
const payload = 'Fixture prompt — café\n\n[0:00] Full source transcript.\nSecond paragraph.';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-intake-claude-browser-'));
const browser = spawn(executable, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio:['ignore','ignore','pipe'] });
let ws;
let sequence = 0;
const pending = new Map();
const errors = [];
try {
  const endpoint = await new Promise((resolve,reject) => {
    const timer = setTimeout(() => reject(new Error('Isolated browser endpoint unavailable.')),15000);
    browser.once('error',(error) => { clearTimeout(timer); reject(error); });
    browser.once('exit',(code) => { clearTimeout(timer); reject(new Error(`Browser exited: ${code}`)); });
    let output='';
    browser.stderr.on('data',(data) => { output+=data; const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if(match){clearTimeout(timer);resolve(match[1]);} });
  });
  ws = new WebSocket(endpoint);
  await new Promise((resolve,reject) => { ws.addEventListener('open',resolve,{once:true}); ws.addEventListener('error',reject,{once:true}); });
  ws.addEventListener('message',(event) => {
    const message=JSON.parse(event.data);
    if(message.id){ const task=pending.get(message.id); if(task){ pending.delete(message.id); clearTimeout(task.timer); message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result); } }
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if(message.method==='Fetch.requestPaused') {
      call('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from(html).toString('base64')},message.sessionId).catch(error=>errors.push(String(error)));
    }
  });
  function call(method,params={},sessionId){
    const id=++sequence;
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`Timed out: ${method}`));},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
  }
  let cases=0;
  async function run(name,options={}) {
    const {targetId}=await call('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
    await call('Page.enable',{},sessionId);
    await call('Runtime.enable',{},sessionId);
    await call('Fetch.enable',{patterns:[{urlPattern:'https://claude.ai/*',requestStage:'Request'}]},sessionId);
    const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
    const url=options.actual || options.expected || 'https://claude.ai/new';
    const expected=options.expected || url;
    await call('Page.navigate',{url},sessionId);
    await evaluate(`new Promise((resolve,reject)=>{let attempts=0;const check=()=>{if(document.getElementById('editor'))resolve(true);else if(++attempts>100)reject(Error('Fixture missing'));else setTimeout(check,10);};check();})`);
    await evaluate(`(() => {
      const options=${JSON.stringify(options)};
      const expected=${JSON.stringify(expected)};
      const payload=${JSON.stringify(payload)};
      let editor=document.getElementById('editor');
      const scope=document.getElementById('composer');
      let send=document.getElementById('send');
      globalThis.fixture={claims:0,clears:0,sendClicks:0,sendControlClicks:0,submits:0,enters:0,execCalls:0,clipboardCopies:0};
      Object.defineProperty(navigator,'clipboard',{value:{async writeText(text){if(options.copyFails)throw Error('Denied');fixture.clipboardCopies++;fixture.copiedDetails=text;}},configurable:true});
      let available=true;
      globalThis.chrome={runtime:{async sendMessage(message){
        if(message.type==='GET_PENDING_PAYLOAD')return {ok:true,payload:available?payload:null,destinationUrl:expected};
        if(message.type==='CLAIM_PENDING_PAYLOAD'){
          fixture.claims++;
          if(options.routeOnClaim)history.replaceState(null,'',options.routeOnClaim);
          if(options.draftOnClaim)editor.textContent='Restored during claim';
          if(options.rejectClaim)return {ok:false};
          available=false;return {ok:true,payload,destinationUrl:expected};
        }
        if(message.type==='CLEAR_PENDING_PAYLOAD'){fixture.clears++;available=false;return {ok:true};}
      }}};
      if(options.textarea){const area=document.createElement('textarea');area.id='editor';area.setAttribute('aria-label','Write your prompt to Claude');editor.replaceWith(area);editor=area;}
      if(options.wrapper){editor.removeAttribute('data-testid');const wrapper=document.createElement('div');wrapper.dataset.testid='chat-input';editor.before(wrapper);wrapper.append(editor);}
      if(options.unmarked)editor.removeAttribute('data-testid');
      // Candidate DOM reconstruction of the label/classes observed through
      // live accessibility; raw DOM attributes/Send identity are not verified.
      if(options.labelled){editor.removeAttribute('data-testid');editor.classList.add('tiptap');editor.setAttribute('aria-label',options.wrongLabel?'Different editor':'Write your prompt to Claude');}
      if(options.noTiptap)editor.classList.remove('tiptap');
      if(options.noProseMirror)editor.classList.remove('ProseMirror');
      if(options.noSendMarker)send.removeAttribute('data-testid');
      if(options.privateAttributes){editor.setAttribute('aria-label','PRIVATE ACCOUNT NAME');editor.setAttribute('placeholder','PRIVATE QUESTION');editor.dataset.testid='private-project-id';editor.classList.add('private-title','tiptap');send.setAttribute('aria-label','PRIVATE CONVERSATION TITLE');send.setAttribute('title','PRIVATE URL https://claude.ai/chat/private');const privateWrapper=document.createElement('private-account-name');editor.before(privateWrapper);privateWrapper.append(editor);}
      if(options.readonly)editor.setAttribute('aria-readonly','true');
      if(options.draft){if(options.textarea)editor.value=options.draft;else editor.textContent=options.draft;}
      if(options.attachment){const node=document.createElement('div');node.dataset.testid='attachment-preview';node.textContent='Private attachment';node.hidden=true;scope.append(node);}
      if(options.busy)scope.setAttribute('aria-busy','true');
      if(options.inert)scope.setAttribute('inert','');
      if(options.richDraft){const node=document.createElement('span');node.contentEditable='false';editor.append(node);}
      if(options.duplicate){const copy=scope.cloneNode(true);copy.removeAttribute('id');document.body.append(copy);}
      if(options.dialog){const dialog=document.createElement('div');dialog.setAttribute('role','dialog');dialog.style='width:200px;height:100px';document.body.append(dialog);}
      if(options.focusDraft)editor.addEventListener('focus',()=>{editor.textContent='Restored on focus';});
      fixture.initialText=editor.value ?? editor.innerText;
      editor.addEventListener('input',()=>{
        if(options.routeOnInput)history.replaceState(null,'',options.routeOnInput);
        if(options.rejectEdit)setTimeout(()=>{editor.textContent='';},0);
        if(options.replaceSend){const replacement=send.cloneNode(true);send.replaceWith(replacement);send=replacement;}
        if(!options.keepDisabled)send.disabled=false;
      });
      document.addEventListener('click',event=>{if(event.target.closest('button'))fixture.sendClicks++;if(event.target.closest('button')===send)fixture.sendControlClicks++;});
      document.addEventListener('submit',event=>{fixture.submits++;event.preventDefault();});
      document.addEventListener('keydown',event=>{if(event.key==='Enter')fixture.enters++;});
      const nativeExec=document.execCommand.bind(document);
      document.execCommand=(...args)=>{fixture.execCalls++;if(options.partial){editor.textContent='Partial';return false;}return nativeExec(...args);};
      // Accelerate only the injector's polling/settling timers. Native editing
      // and input listeners still execute in a real Chromium DOM.
      let tick=0;Date.now=()=>{tick+=500;return tick;};
      const timeout=window.setTimeout.bind(window);
      window.setTimeout=(callback,ms,...args)=>timeout(callback,ms===100||ms===500?0:ms,...args);
    })()`);
    await evaluate(destinationSource);
    await evaluate(injector);
    if(options.duplicateScript)await evaluate(injector);
    await evaluate(`new Promise((resolve,reject)=>{let attempts=0;const check=()=>{if(document.getElementById('yt2gpt-claude-toast'))resolve(true);else if(++attempts>200)reject(Error('No injector result'));else setTimeout(check,10);};check();})`);
    const result=await evaluate(`({ ...fixture, text:document.getElementById('editor').value ?? document.getElementById('editor').innerText, unrelated:document.getElementById('unrelated').innerText, notice:document.getElementById('yt2gpt-claude-toast').textContent })`);
    assert.equal(result.sendClicks,0,`${name}: never click a button`);
    assert.equal(result.submits,0,`${name}: never submit`);
    assert.equal(result.enters,0,`${name}: never synthesize Enter`);
    assert.equal(result.unrelated,'Keep this unrelated draft.',`${name}: unrelated editor untouched`);
    if(options.error){
      assert.match(result.notice,new RegExp(options.error),`${name}: useful clipboard fallback`);
      assert.match(result.notice,/complete prompt is on your clipboard/);
      if(options.expectedText!==undefined)assert.equal(result.text.replace(/\s+/g,' ').trim(),options.expectedText.replace(/\s+/g,' ').trim(),`${name}: preserve the expected partial/restored content`);
      else assert.equal(result.text,result.initialText,`${name}: original draft/empty content remains exactly unchanged`);
      assert.equal(result.claims,options.claims ?? 0,`${name}: claim count`);
    }else{
      assert.equal(result.text.replace(/\s+/g,' ').trim(),payload.replace(/\s+/g,' ').trim(),`${name}: complete insertion`);
      assert.match(result.notice,/Prompt inserted in Claude/);
      assert.equal(result.claims,1,`${name}: consume once`);
    }
    if(options.maxEdits!==undefined)assert.equal(result.execCalls,options.maxEdits,`${name}: bounded edits`);
    assert.equal(await evaluate('fixture.clipboardCopies'),0,`${name}: failure never replaces clipboard automatically`);
    if(options.diagnostics){
      assert.equal(await evaluate('Boolean(document.querySelector("#yt2gpt-claude-toast button"))'),true);
      const point=await evaluate('(() => { const r=document.querySelector("#yt2gpt-claude-toast button").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
      await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point},sessionId);
      await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point},sessionId);
      await evaluate('new Promise(resolve=>setTimeout(resolve,20))');
      const diagnostic=await evaluate('({...fixture,notice:document.getElementById("yt2gpt-claude-toast").textContent,text:document.getElementById("editor").value ?? document.getElementById("editor").innerText})');
      assert.equal(diagnostic.sendControlClicks,0,'diagnostic never clicks Claude Send');
      assert.equal(diagnostic.execCalls,0,'diagnostic never edits');
      assert.equal(diagnostic.text,result.initialText,'diagnostic leaves draft unchanged');
      assert.equal(diagnostic.claims,0,'unrecognized composer never claims');
      if(options.copyFails){assert.equal(diagnostic.clipboardCopies,0);assert.match(diagnostic.notice,/Could not copy details/);}
      else{
        assert.equal(diagnostic.clipboardCopies,1,'copy only on explicit native click');
        const details=JSON.parse(diagnostic.copiedDetails);
        assert.equal(details.kind,'youtube-intake-claude-composer-v1');
        assert.equal(details.editors[0].proseMirror,true);
        assert.equal(details.editors[0].chatInput,!options.unmarked&&!options.privateAttributes&&!options.labelled);
        if(options.labelled){assert.equal(details.recognizedEditorCount,1);assert.equal(details.editors[0].tiptap,true);assert.equal(details.editors[0].label,'Write your prompt to Claude');}
        assert.ok(details.editors[0].ancestors.length>0);
        assert.doesNotMatch(diagnostic.copiedDetails,/PRIVATE|private-|https:|Fixture prompt|Full source transcript|Keep this unrelated draft/,'no content, URLs, names, unknown labels/attributes or prompt');
        assert.match(diagnostic.notice,/Details copied/);
      }
    }
    await call('Target.closeTarget',{targetId});
    cases++;
  }
  await run('new chat');
  await run('marked wrapper',{wrapper:true});
  await run('legacy named textarea',{textarea:true,maxEdits:0});
  await run('exact conversation',{expected:'https://claude.ai/chat/fixture?view=saved#notes'});
  await run('exact Project',{expected:'https://claude.ai/project/fixture'});
  await run('replacement Send node',{replaceSend:true});
  await run('duplicate script',{duplicateScript:true,maxEdits:1});
  await run('existing draft',{draft:'Keep this draft',error:'draft or attachment',maxEdits:0});
  await run('whitespace draft',{draft:'   ',error:'draft or attachment',maxEdits:0});
  await run('empty rich draft node',{richDraft:true,error:'draft or attachment',maxEdits:0});
  await run('busy composer',{busy:true,error:'draft or attachment',maxEdits:0});
  await run('inert composer',{inert:true,error:'not recognized',maxEdits:0});
  await run('hidden attachment',{attachment:true,error:'draft or attachment',maxEdits:0});
  await run('unmarked editor',{unmarked:true,error:'not recognized',maxEdits:0});
  await run('unknown Send marker',{noSendMarker:true,error:'not recognized',maxEdits:0});
  await run('duplicate composers',{duplicate:true,error:'not recognized',maxEdits:0});
  await run('read-only editor',{readonly:true,error:'not recognized',maxEdits:0});
  await run('visible dialog',{dialog:true,error:'dialog or sign-in',maxEdits:0});
  await run('wrong Project',{expected:'https://claude.ai/project/fixture',actual:'https://claude.ai/project/other',error:'does not match',maxEdits:0});
  await run('unproven Project redirect',{expected:'https://claude.ai/project/fixture',actual:'https://claude.ai/chat/fixture',error:'does not match',maxEdits:0});
  await run('route changes during claim',{routeOnClaim:'/chat/other',error:'page or draft changed',claims:1,maxEdits:0});
  await run('draft restored during claim',{draftOnClaim:true,error:'page or draft changed',expectedText:'Restored during claim',claims:1,maxEdits:0});
  await run('draft restored on focus',{focusDraft:true,error:'changed on focus',expectedText:'Restored on focus',claims:1,maxEdits:0});
  await run('claim rejected',{rejectClaim:true,error:'could not be claimed',maxEdits:0,claims:1});
  await run('partial edit',{partial:true,error:'could not be confirmed',expectedText:'Partial',claims:1,maxEdits:1});
  await run('route changes after edit',{routeOnInput:'/chat/other',error:'could not be confirmed',expectedText:payload,claims:1,maxEdits:1});
  await run('framework rejects edit',{rejectEdit:true,error:'could not be confirmed',expectedText:'',claims:1,maxEdits:1});
  await run('framework readiness unconfirmed',{keepDisabled:true,error:'could not be confirmed',expectedText:payload,claims:1,maxEdits:1});
  await run('unrecognized editor diagnostics',{unmarked:true,error:'not recognized',maxEdits:0,diagnostics:true});
  await run('missing Send diagnostics',{noSendMarker:true,error:'not recognized',maxEdits:0,diagnostics:true});
  await run('private draft and attributes redacted',{privateAttributes:true,draft:'PRIVATE DRAFT CONTENT',error:'not recognized',maxEdits:0,diagnostics:true});
  await run('diagnostic copy denied',{unmarked:true,error:'not recognized',maxEdits:0,diagnostics:true,copyFails:true});
  await run('exactly labelled tiptap editor',{labelled:true});
  await run('labelled exact Project',{labelled:true,expected:'https://claude.ai/project/fixture'});
  await run('labelled exact conversation',{labelled:true,expected:'https://claude.ai/chat/fixture?view=saved#notes'});
  await run('labelled draft protected',{labelled:true,draft:'Keep this labelled draft',error:'draft or attachment',maxEdits:0});
  await run('labelled editor still needs Send marker',{labelled:true,noSendMarker:true,error:'not recognized',maxEdits:0,diagnostics:true});
  await run('different label rejected',{labelled:true,wrongLabel:true,error:'not recognized',maxEdits:0});
  await run('missing tiptap class rejected',{labelled:true,noTiptap:true,error:'not recognized',maxEdits:0});
  await run('missing ProseMirror class rejected',{labelled:true,noProseMirror:true,error:'not recognized',maxEdits:0});
  await run('duplicate labelled editors rejected',{labelled:true,duplicate:true,error:'not recognized',maxEdits:0});
  await run('labelled focus-restored draft',{labelled:true,focusDraft:true,error:'changed on focus',expectedText:'Restored on focus',claims:1,maxEdits:0});
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log(`PASS: ${cases} Claude native-DOM cases: complete insertion, exact routes, draft/attachment guards, framework readiness, opt-in redacted diagnostics, no retries and zero automatic sends. Synthetic fixture; the reported live recognition failure remains unresolved.`);
} finally {
  if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({id:++sequence,method:'Browser.close'}));await new Promise(resolve=>{const timer=setTimeout(resolve,2000);browser.once('exit',()=>{clearTimeout(timer);resolve();});});}
  ws?.close();browser.kill();browser.stderr.destroy();browser.unref();
  for(const task of pending.values()){clearTimeout(task.timer);task.reject(new Error('Browser test closed'));}
}

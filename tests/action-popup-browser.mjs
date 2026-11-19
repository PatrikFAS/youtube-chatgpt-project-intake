// Actual unpacked action surface, not a tab-sized popup document. HTTPS is
// intercepted synthetic content; real Chrome APIs/storage and action sizing.
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const [executable,prior19,prior20,candidate]=process.argv.slice(2);
assert.ok(executable&&prior19&&prior20&&candidate,'Pass Chromium and extracted exact v0.1.19/v0.1.20/candidate directories');
const candidateVersion=JSON.parse(fs.readFileSync(path.join(candidate,'manifest.json'),'utf8')).version;
const work=fs.mkdtempSync(path.join(os.tmpdir(),'yt-bridge-action-native-'));
function install(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){assert.ok(!entry.name.startsWith('.'),'Use extracted release assets');const src=path.join(from,entry.name),dst=path.join(to,entry.name);if(entry.isDirectory())install(src,dst);else fs.copyFileSync(src,dst);}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const report={surface:'chrome.action.openPopup; real extension popup view; no Emulation commands',work,rows:[],errors:[]};
async function exercise(label,start,mode,group=label){
 const installed=path.join(work,group,'unpacked'),profile=path.join(work,group,'profile');install(start,installed);
 const browser=spawn(executable,['--headless=new','--disable-gpu','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--window-size=1000,850',`--user-data-dir=${profile}`,`--disable-extensions-except=${installed}`,`--load-extension=${installed}`,'about:blank'],{stdio:['ignore','ignore','pipe'],windowsHide:true});
 let ws,seq=0,controlSession,extensionId;const pending=new Map(),errors=[];
 try{
  const endpoint=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('No CDP endpoint')),12000);browser.once('error',reject);browser.stderr.on('data',d=>{out+=d;const m=out.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  ws=new WebSocket(endpoint);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  function call(method,params={},sessionId){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out on '+(sessionId||'browser')));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
  const player={videoDetails:{videoId:'fixture01',title:'Synthetic source for actual popup sizing',author:'Fixture only',lengthSeconds:'30'},captions:{playerCaptionsTracklistRenderer:{captionTracks:[{baseUrl:'https://www.youtube.com/api/timedtext?v=fixture01',languageCode:'en',name:{simpleText:'English'}}]}}};
  const sourceHtml=`<!doctype html><title>Synthetic source - YouTube</title><div id="movie_player"></div><script>window.ytInitialPlayerResponse=${JSON.stringify(player)};document.getElementById('movie_player').getPlayerResponse=()=>window.ytInitialPlayerResponse;document.getElementById('movie_player').getVideoData=()=>({video_id:'fixture01',title:'Synthetic source for actual popup sizing'});</script>`;
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);if(m.method==='Fetch.requestPaused'){
   const url=m.params.request.url;
   const body=url.includes('/api/timedtext')?'<?xml version="1.0"?><transcript><text start="0">Synthetic captions only.</text></transcript>':url.includes('youtube.com')?sourceHtml:'<!doctype html><title>Synthetic provider page - no account</title><p>Local intercepted fixture only.</p>';
   call('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:url.includes('/api/timedtext')?'text/xml':'text/html'}],body:Buffer.from(body).toString('base64')},m.sessionId).catch(e=>errors.push(e.message));
  }});
  async function evaluate(expression,sessionId=controlSession){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  async function wait(fn,name){for(let i=0;i<150;i++){const result=await fn();if(result)return result;await delay(80);}throw Error('Wait failed: '+name);}
  // Use the extension's own options page as the control context. This avoids
  // attaching a debugger to the worker during cold startup; APIs stay native.
  const info=await wait(async()=> (await call('Target.getTargets')).targetInfos.find(t=>t.type==='service_worker'&&t.url.endsWith('/background.js')),'stock extension registration');
  extensionId=new URL(info.url).hostname;
  const control=await call('Target.createTarget',{url:'about:blank'}),controlAttach=await call('Target.attachToTarget',{targetId:control.targetId,flatten:true});
  controlSession=controlAttach.sessionId;await call('Page.enable',{},controlSession);await call('Runtime.enable',{},controlSession);
  await call('Page.navigate',{url:`chrome-extension://${extensionId}/options/options.html`},controlSession);
  await wait(()=>evaluate(`document.readyState==='complete'&&Boolean(chrome.runtime?.id)`),'native extension control page');
  assert.equal(await evaluate('chrome.runtime.getManifest().name'),'YouTube AI Bridge');
  async function popup(state,expectSmall=false){
   await evaluate('chrome.action.openPopup().then(()=>true)');
   const target=await wait(async()=>(await call('Target.getTargets')).targetInfos.find(t=>t.url===`chrome-extension://${extensionId}/popup/popup.html`),'real action popup');
   const s=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});await call('Runtime.enable',{},s.sessionId);await call('Log.enable',{},s.sessionId);
   await wait(()=>evaluate(`document.readyState==='complete' && document.getElementById('loadingView')?.classList.contains('hidden')`,s.sessionId),'popup startup');await delay(300);
   const metrics=await evaluate(`(async()=>{const root=document.documentElement.getBoundingClientRect(),shell=document.querySelector('.shell').getBoundingClientRect(),button=document.getElementById('sendButton'),b=button.getBoundingClientRect(),f=document.getElementById('handoffFooter')?.getBoundingClientRect(),c=document.getElementById('contentScroll')?.getBoundingClientRect();return {version:chrome.runtime.getManifest().version,innerWidth,innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,currentTab:(await chrome.tabs.getCurrent())||null,popupViews:chrome.extension.getViews({type:'popup'}).length,root:{width:root.width,height:root.height},shell:{width:shell.width,height:shell.height},views:['youtubeView','chatgptView','otherView'].filter(id=>!document.getElementById(id).classList.contains('hidden')),label:button.textContent,primaryVisible:Boolean(document.getElementById('handoffFooter')&&!document.getElementById('handoffFooter').classList.contains('hidden')),primary:{top:b.top,bottom:b.bottom,left:b.left,right:b.right},footerTop:f?.top,bodyBottom:c?.bottom};})()`,s.sessionId);
   assert.equal(metrics.currentTab,null,'real action is not a normal extension tab');assert.equal(metrics.popupViews,1);
   if(expectSmall){assert.equal(metrics.innerWidth,25);assert.equal(metrics.innerHeight,25);}else{assert.ok(metrics.innerWidth>=390&&metrics.innerWidth<=450,state+': intrinsic width '+JSON.stringify(metrics));assert.ok(metrics.innerHeight>=250&&metrics.innerHeight<=600,state+': intrinsic height '+JSON.stringify(metrics));}
   if(!expectSmall&&metrics.version===candidateVersion){assert.ok(metrics.documentWidth<=metrics.innerWidth&&metrics.documentHeight<=metrics.innerHeight,state+': no outer document scrollbar '+JSON.stringify(metrics));}
   if(metrics.primaryVisible&&!expectSmall){assert.ok(metrics.primary.top>=0&&metrics.primary.bottom<=metrics.innerHeight,state+': footer fits actual granted height');assert.ok(metrics.primary.left>=0&&metrics.primary.right<=metrics.innerWidth);assert.ok(metrics.bodyBottom<=metrics.footerTop+1);}
   report.rows.push({profile:label,state,...metrics});
   return {targetId:target.targetId,sessionId:s.sessionId,metrics,async eval(code){return evaluate(code,s.sessionId);},async close(){await evaluate('window.close(); true',s.sessionId).catch(()=>{});await wait(async()=>!(await call('Target.getTargets')).targetInfos.some(t=>t.targetId===target.targetId),'action popup closed');await delay(100);}};
  }
  async function tab(url){const {targetId}=await call('Target.createTarget',{url:'about:blank'}),s=await call('Target.attachToTarget',{targetId,flatten:true});await call('Page.enable',{},s.sessionId);await call('Runtime.enable',{},s.sessionId);await call('Fetch.enable',{patterns:[{urlPattern:'https://*/*',requestStage:'Request'},{urlPattern:'http://*/*',requestStage:'Request'}]},s.sessionId);await call('Page.navigate',{url},s.sessionId);await call('Target.activateTarget',{targetId});await wait(()=>evaluate(`document.readyState==='complete'`,s.sessionId),'synthetic page');return {targetId,sessionId:s.sessionId};}
  const pref={destinations:[{id:'qa-claude',name:'Saved synthetic project',url:'https://claude.ai/project/fixture?view=saved#notes'},{id:'qa-gpt',name:'Saved synthetic ChatGPT',url:'https://chatgpt.com/g/g-p-fixture/project?view=saved#notes'}],lastMode:'summarize',lastPresetMode:'summarize',lastDestinationId:'qa-claude',lastProvider:'claude',lastDestinationByProvider:{claude:'qa-claude',chatgpt:'qa-gpt'},preferredTranscriptLanguage:'en',customInstructions:'Saved synthetic reusable instruction',chatgptExplicitSendEnabled:true};
  let p=await popup('unsupported page, normal intrinsic sizing',mode==='regression');await p.close();
  if(mode==='baseline'){await evaluate('chrome.storage.local.set('+JSON.stringify(pref)+')');console.log('PASS baseline action '+label);return;}
  if(group===label)await evaluate('chrome.storage.local.set('+JSON.stringify(pref)+')');
  const stored=await evaluate('chrome.storage.local.get(null)');for(const [key,value]of Object.entries(pref))if(key!=='destinations')assert.deepEqual(stored[key],value,'retained '+key);for(const d of pref.destinations)assert.ok(stored.destinations.some(s=>s.id===d.id&&s.url===d.url&&s.name===d.name));
  if(mode==='regression'){console.log('PASS reproduced action '+label+'; retained preferences verified');return;}
  p=await popup('candidate unsupported page after preferences');await p.close();
  const youtube=await tab('https://www.youtube.com/watch?v=fixture01');
  const youtubeId=await evaluate('chrome.tabs.query({active:true,currentWindow:true}).then(t=>t[0].id)');
  await wait(()=>evaluate(`chrome.tabs.sendMessage(${youtubeId},{type:'YT2GPT_GET_CONTEXT'}).then(r=>r?.ok).catch(()=>false)`),'actual caption content script');
  p=await popup('YouTube, collapsed disclosures and retained Claude destination');assert.deepEqual(p.metrics.views,['youtubeView']);assert.equal(p.metrics.label,'Open in Claude');assert.equal(await p.eval('document.getElementById("videoTitle").textContent'),'Synthetic source for actual popup sizing');
  assert.equal(await p.eval('document.getElementById("destinationSelect").value'),'qa-claude');assert.equal(await p.eval('document.getElementById("collectionPanel").open'),false);assert.equal(await p.eval('document.getElementById("handoffAlternatives").open'),false);
  await p.eval('document.getElementById("addToCollection").click()');await wait(()=>p.eval('document.getElementById("collectionCount").textContent.includes("1/3")'),'real API caption Add');
  const captured=await evaluate('chrome.storage.session.get("collection_v1").then(s=>s.collection_v1.items[0])');assert.equal(captured.videoId,'fixture01');assert.ok(captured.transcript.text.includes('Synthetic captions only.'));
  const shot=await call('Page.captureScreenshot',{format:'png'},p.sessionId);fs.writeFileSync(path.join(work,label+'-actual-action.png'),Buffer.from(shot.data,'base64'));
  await p.close();
  const items=[1,2,3].map(n=>({videoId:'fixture'+n,title:'Synthetic source '+n+' '+('long title '.repeat(40)),url:'https://www.youtube.com/watch?v=fixture'+n,channel:'Fixture',publishDate:'',capturedAt:1,transcript:{text:'x'.repeat(26000),segments:[],track:{name:'English',languageCode:'en',isAutoGenerated:false}}}));
  await evaluate('chrome.storage.session.set('+JSON.stringify({collection_v1:{version:1,revision:0,generation:0,items}})+')');
  p=await popup('ready large basket before choosing Collection');await p.eval('document.getElementById("useCollection").click()');assert.equal(await p.eval('document.getElementById("sendButton").textContent'),'Download .txt');assert.equal(await p.eval('document.getElementById("explicitSendPanel").classList.contains("hidden")'),true);await p.eval('document.getElementById("collectionPanel").open=true; document.getElementById("handoffAlternatives").open=true; document.getElementById("contentScroll").scrollTop=100000');
  const b=await p.eval('(()=>{const r=document.getElementById("sendButton").getBoundingClientRect();return {top:r.top,bottom:r.bottom,h:innerHeight};})()');assert.ok(b.top>=0&&b.bottom<=b.h);await p.close();
  await evaluate('chrome.storage.local.set({lastProvider:"chatgpt",lastDestinationId:"qa-gpt"})');
  p=await popup('retained ChatGPT opt-in, no automatic action on open');assert.equal(p.metrics.label,'Send to ChatGPT');await p.close();
  const target=await tab('https://chatgpt.com/g/g-p-fixture/project?view=saved#notes');p=await popup('saved destination page');assert.deepEqual(p.metrics.views,['chatgptView']);await p.close();
  const pendingKeys=await evaluate('chrome.storage.session.get(null).then(s=>Object.keys(s).filter(k=>k.startsWith("pending_")||k.startsWith("explicit_send_")))');assert.deepEqual(pendingKeys,[],'QA never requests insertion or Send');
  assert.deepEqual(errors,[],'no startup/runtime errors in stock assets');report.errors.push(...errors);
  console.log('PASS real action '+label+': '+report.rows.filter(r=>r.profile===label).map(r=>`${r.version} ${r.state}=${r.innerWidth}x${r.innerHeight}`).join('; '));
 }finally{if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({id:++seq,method:'Browser.close'}));await new Promise(r=>{const t=setTimeout(r,1500);browser.once('exit',()=>{clearTimeout(t);r();});});}ws?.close();browser.kill();browser.stderr.destroy();browser.unref();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Closed'));}}
}
await exercise('baseline-019',prior19,'baseline','same-folder-update');
await exercise('regression-020',prior20,'regression','same-folder-update');
await exercise('updated-candidate',candidate,'candidate','same-folder-update');
await exercise('fresh-candidate',candidate,'candidate');
fs.writeFileSync(path.join(work,'report.json'),JSON.stringify(report,null,2));console.log('Actual action report '+path.join(work,'report.json'));

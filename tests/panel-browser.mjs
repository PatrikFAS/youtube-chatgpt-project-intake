// Actual unpacked action surface, not a tab-sized popup document. HTTPS is
// intercepted synthetic content; real Chrome APIs/storage and action sizing.
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const [executable,candidate,baseline]=process.argv.slice(2); const prior19=candidate,prior20=candidate;
assert.ok(executable&&prior19&&prior20&&candidate,'Pass Chromium and extracted exact v0.1.19/v0.1.20/candidate directories');
const candidateVersion=JSON.parse(fs.readFileSync(path.join(candidate,'manifest.json'),'utf8')).version;
const work=fs.mkdtempSync(path.join(os.tmpdir(),'yt-bridge-action-native-'));
function install(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){assert.ok(!entry.name.startsWith('.'),'Use extracted release assets');const src=path.join(from,entry.name),dst=path.join(to,entry.name);if(entry.isDirectory())install(src,dst);else fs.copyFileSync(src,dst);}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const report={surface:'native chrome.sidePanel; real extension APIs; intercepted synthetic HTTPS; no AI sends',work,rows:[],errors:[]};
async function exercise(label,start,mode,group=label){
 const installed=path.join(work,group,'unpacked'),profile=path.join(work,group,'profile');install(start,installed);
 const browser=spawn(executable,['--headless=new','--enable-unsafe-extension-debugging','--disable-gpu','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--window-size=1000,850',`--user-data-dir=${profile}`,`--disable-extensions-except=${installed}`,`--load-extension=${installed}`,'about:blank'],{stdio:['ignore','ignore','pipe'],windowsHide:true});
 let ws,seq=0,controlSession,extensionId,extensionBase;const pending=new Map(),errors=[];
 try{
  const endpoint=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('No CDP endpoint')),25000);browser.once('error',reject);browser.stderr.on('data',d=>{out+=d;const m=out.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  ws=new WebSocket(endpoint);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  function call(method,params={},sessionId){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out on '+(sessionId||'browser')));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
  function sourceHtmlFor(url){const id=new URL(url).searchParams.get('v')||'fixture01';
  const player={videoDetails:{videoId:id,title:'Synthetic source '+id,author:'Fixture only',lengthSeconds:'30'},captions:{playerCaptionsTracklistRenderer:{captionTracks:[{baseUrl:'https://www.youtube.com/api/timedtext?v='+id,languageCode:'en',name:{simpleText:'English'}}]}}};
  const sourceHtml=`<!doctype html><title>Synthetic source - YouTube</title><div id="movie_player"></div><script>window.ytInitialPlayerResponse=${JSON.stringify(player)};document.getElementById('movie_player').getPlayerResponse=()=>window.ytInitialPlayerResponse;document.getElementById('movie_player').getVideoData=()=>({video_id:window.ytInitialPlayerResponse.videoDetails.videoId,title:window.ytInitialPlayerResponse.videoDetails.title});</script>`;return sourceHtml;}
  let holdCaptions=false;const held=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);if(m.method==='Fetch.requestPaused'){
   const url=m.params.request.url;
   const body=url.includes('/api/timedtext')?'<?xml version="1.0"?><transcript><text start="0">Captions for '+new URL(url).searchParams.get('v')+'. Synthetic only.</text></transcript>':url.includes('youtube.com')?sourceHtmlFor(url):'<!doctype html><title>Synthetic provider page - no account</title><p>Local intercepted fixture only.</p>';
   const fulfill=()=>call('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:url.includes('/api/timedtext')?'text/xml':'text/html'}],body:Buffer.from(body).toString('base64')},m.sessionId).catch(e=>errors.push(e.message));
   if(holdCaptions&&url.includes('/api/timedtext'))held.push(fulfill);else fulfill();
  }});
  async function evaluate(expression,sessionId=controlSession){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  async function wait(fn,name){for(let i=0;i<150;i++){const result=await fn();if(result)return result;await delay(80);}throw Error('Wait failed: '+name);}
  // Use the extension's own options page as the control context. This avoids
  // attaching a debugger to the worker during cold startup; APIs stay native.
  const extensionList=await call('Extensions.getExtensions');
  const entries=extensionList.extensions||extensionList.extensionInfos||[];
  const bridge=entries.find(e=>e.name==='YouTube AI Bridge');
  if(!bridge)throw Error('Disposable browser did not register Bridge: '+JSON.stringify(extensionList));
  const info=await wait(async()=> (await call('Target.getTargets')).targetInfos.find(t=>t.type==='service_worker'&&t.url.includes('://'+bridge.id+'/')&&t.url.endsWith('/background.js')),'Bridge extension registration');
  extensionId=new URL(info.url).hostname;extensionBase=new URL(info.url).protocol+'//'+extensionId;
  let control=await call('Target.createTarget',{url:'about:blank'}),controlAttach=await call('Target.attachToTarget',{targetId:control.targetId,flatten:true});
  controlSession=controlAttach.sessionId;await call('Page.enable',{},controlSession);await call('Runtime.enable',{},controlSession);
  await call('Page.navigate',{url:`${extensionBase}/options/options.html`},controlSession);
  await wait(()=>evaluate(`document.readyState==='complete'&&Boolean(chrome.runtime?.id)`),'native extension control page');
  if(mode!=='seed'&&group!==label){
    // Reload only this disposable unpacked path; the real installation is untouched.
    const reloaded=await call('Extensions.loadUnpacked',{path:installed});assert.equal(reloaded.id,extensionId);
    await delay(300);control=await call('Target.createTarget',{url:'about:blank'});const a=await call('Target.attachToTarget',{targetId:control.targetId,flatten:true});controlSession=a.sessionId;
    await call('Runtime.enable',{},controlSession);await call('Page.enable',{},controlSession);await call('Page.navigate',{url:`${extensionBase}/options/options.html`},controlSession);
    await wait(()=>evaluate('document.readyState==="complete"&&Boolean(chrome.runtime?.id)'),'reloaded extension control');
    report.update='same folder/profile plus CDP Extensions.loadUnpacked reload; extension-entry UI not clicked';
  }
  const settings={lastMode:'summarize',lastPresetMode:'summarize',lastProvider:'claude',lastDestinationId:'qa-claude',lastDestinationByProvider:{claude:'qa-claude',chatgpt:'general'},customInstructions:'Keep my saved task',chatgptExplicitSendEnabled:false,destinations:[{id:'qa-claude',name:'Synthetic saved project',url:'https://claude.ai/project/fixture?view=saved#notes'}]};
  await wait(()=>evaluate('chrome.storage.local.get("lastMode").then(s=>typeof s.lastMode==="string")'),'installation defaults complete');
  if(mode==='seed'){await evaluate('chrome.storage.local.set('+JSON.stringify(settings)+')');console.log('PASS v0.1.21 native-profile settings seed');return;}
  if(group===label)await evaluate('chrome.storage.local.set('+JSON.stringify(settings)+')');
  const prefs=await evaluate('chrome.storage.local.get(null)');for(const [key,value]of Object.entries(settings))if(key!=='destinations')assert.deepEqual(prefs[key],value,'retained '+key);
  assert.ok(prefs.destinations.some(d=>d.id==='qa-claude'&&d.url===settings.destinations[0].url));
  const entryState=await evaluate(`(async()=>({version:chrome.runtime.getManifest().version,granted:await chrome.permissions.contains({permissions:['sidePanel']}),popup:await chrome.action.getPopup({}),side:typeof chrome.sidePanel?.open,behavior:await chrome.sidePanel.getPanelBehavior().catch(e=>({error:e.message}))}))()`);
  console.log('Native entry state '+label+' '+JSON.stringify(entryState));
  await wait(()=>evaluate('chrome.action.getPopup({}).then(p=>p==="")'),'normal panel action');
  assert.equal((await evaluate('chrome.sidePanel.getPanelBehavior()')).openPanelOnActionClick,true);
  const windowId=await evaluate('chrome.windows.getCurrent().then(w=>w.id)');
  // CDP's extension-action command invokes the actual browser toolbar action.
  const toolbarTabs=(await call('Target.getTargets',{filter:[{type:'tab',exclude:false}]})).targetInfos;
  const toolbarTab=toolbarTabs.find(t=>t.type==='tab'&&t.url.includes('/options/options.html'));
  if(toolbarTab){await call('Extensions.triggerAction',{id:extensionId,targetId:toolbarTab.targetId});report.entry='Extensions.triggerAction native toolbar';}
  else {await call('Runtime.evaluate',{expression:'chrome.sidePanel.open({windowId:'+windowId+'})',userGesture:true,awaitPromise:true},controlSession);report.entry='native sidePanel.open via CDP userGesture; toolbar configuration checked, click unavailable';}
  const target=await wait(async()=>(await call('Target.getTargets')).targetInfos.find(t=>t.url===`${extensionBase}/popup/popup.html?surface=panel`),'native toolbar-opened panel');
  const attached=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});const sid=attached.sessionId;
  await call('Runtime.enable',{},sid);await call('Page.enable',{},sid);await call('Log.enable',{},sid);
  const pe=expression=>evaluate(expression,sid),pw=(expression,name=expression)=>wait(()=>pe(expression),name);
  await pw('typeof panel!=="undefined"&&panel.ready','panel initial source');
  const metric=await pe('({width:innerWidth,height:innerHeight,rootWidth:document.documentElement.scrollWidth,rootHeight:document.documentElement.scrollHeight,popupViews:chrome.extension.getViews({type:"popup"}).length,panel:document.documentElement.dataset.surface})');
  assert.ok(metric.width>=300&&metric.height>500,JSON.stringify(metric));assert.equal(metric.panel,'panel');assert.equal(metric.popupViews,0);report.rows.push({profile:label,...metric});
  assert.equal(await pe('collectionActive'),false);
  await pe('els.useCollection.click()');assert.equal(await pe('collectionActive'),true);assert.equal(await pe('els.sendButton.disabled'),true);assert.match(await pe('els.collectionStatus.textContent'),/No videos/);
  async function tab(url,newWindow=false){const created=await call('Target.createTarget',{url:'about:blank',newWindow});const a=await call('Target.attachToTarget',{targetId:created.targetId,flatten:true});await call('Page.enable',{},a.sessionId);await call('Runtime.enable',{},a.sessionId);await call('Fetch.enable',{patterns:[{urlPattern:'https://*/*',requestStage:'Request'},{urlPattern:'http://*/*',requestStage:'Request'}]},a.sessionId);await call('Page.navigate',{url},a.sessionId);await call('Target.activateTarget',{targetId:created.targetId});await wait(()=>evaluate('document.readyState==="complete"',a.sessionId),'synthetic source loaded');return {...created,sessionId:a.sessionId};}
  async function source(id){const t=await tab('https://www.youtube.com/watch?v='+id);await pw('panel.ready&&videoContext?.videoId==='+JSON.stringify(id),'source '+id);return t;}
  async function geometry(label){const m=await pe(`(()=>{const b=els.sendButton.getBoundingClientRect(),a=els.addToCollection.getBoundingClientRect(),body=document.getElementById('contentScroll').getBoundingClientRect(),footer=els.handoffFooter.getBoundingClientRect();return {width:innerWidth,height:innerHeight,rootW:document.documentElement.scrollWidth,rootH:document.documentElement.scrollHeight,action:b.top>=0&&b.bottom<=innerHeight&&document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===els.sendButton,add:a.top>=0&&a.bottom<=innerHeight&&document.elementFromPoint(a.x+a.width/2,a.y+a.height/2)===els.addToCollection,body:body.bottom<=footer.top+1};})()`);assert.ok(m.action&&m.add&&m.body&&m.rootW<=m.width&&m.rootH<=m.height,label+JSON.stringify(m));report.rows.push({profile:label,...m});const shot=await call('Page.captureScreenshot',{format:'png'},sid);fs.writeFileSync(path.join(work,label.replaceAll(' ','-')+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));}
  let first=await source('fixture01');await geometry('first video top');
  assert.equal(await pe('collectionActive'),true,'tab switch preserves workspace');await pe('els.workspaceVideo.click();els.addToCollection.click()');
  await pw('!busy&&!sending&&collectionState?.items.length===1','first Add');assert.equal(await pe('collectionActive'),false,'Add keeps Video active');await pe('els.useCollection.click()');assert.equal(await pe('els.sendButton.disabled'),true,'one source teaches another Add');
  await source('fixture02');await pe('els.addToCollection.click()');await pw('!busy&&!sending&&collectionState?.items.length===2','second Add');assert.equal(await pe('collectionActive'),true,'Add keeps Collection active');
  assert.equal(await pe('els.sendButton.textContent'),'Open 2 videos in Claude');assert.equal(await pe('els.collectionItems.children.length'),2);assert.equal(await pe('els.explicitSendPanel.classList.contains("hidden")'),true);
  await source('fixture03');await pe('els.addToCollection.click()');await pw('!busy&&!sending&&collectionState?.items.length===3','third Add');assert.equal(await pe('els.addToCollection.disabled'),true);assert.match(await pe('els.sourceHint.textContent'),/full/);await geometry('full collection');
  const nonvideo=await tab('https://example.invalid/');await pw('panel.ready&&!videoContext','nonvideo source');assert.equal(await pe('collectionState.items.length'),3);assert.match(await pe('els.sourceHint.textContent'),/Switch to/);assert.equal(await pe('els.sendButton.textContent'),'Copy 3 videos prompt');assert.equal(await pe('els.sendButton.disabled'),false);await geometry('nonvideo collection');
  const other=await tab('https://www.youtube.com/watch?v=otherwindow',true);await delay(200);assert.equal(await pe('panel.windowId'),windowId);assert.equal(await pe('videoContext'),null,'another window never supplies this panel source');
  await call('Target.closeTarget',{targetId:other.targetId});await call('Target.activateTarget',{targetId:first.targetId});await pw('panel.ready&&videoContext?.videoId==="fixture01"');
  await pe('els.clearCollection.click()');await pw('!busy&&!sending&&collectionState.items.length===0');await pe('els.workspaceVideo.click()');
  // Change the selected tab while an actual caption request is in flight.
  holdCaptions=true;await pe('els.previewPrompt.click()');await wait(()=>held.length>0,'held caption request');
  const fresh=await tab('https://www.youtube.com/watch?v=freshsource');await pw('panel.ready===false','source invalidated during job');assert.equal(await pe('els.sendButton.disabled'),true);holdCaptions=false;for(const f of held.splice(0))await f();
  await pw('!busy&&!sending&&panel.ready&&videoContext?.videoId==="freshsource"','fresh source after cancellation');assert.equal(await pe('els.promptPreview.textContent'),'','old async prompt never rendered');
  await pe('els.previewPrompt.click()');await pw('!busy&&!sending&&els.promptPreview.textContent.includes("Captions for freshsource")');assert.ok(!(await pe('els.promptPreview.textContent')).includes('Captions for fixture01'));
  // Only this clipboard sink is replaced; tab/source APIs and worker stay native.
  await pe(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{async writeText(text){globalThis.qaCopied=text;}}});globalThis.qaCopied='Unchanged synthetic clipboard';`);
  for(const [action,id]of [['copyPrompt','aftercopy'],['addToCollection','afteradd'],['sendButton','afteropen']]){
    await pe('transcriptCache.clear()');holdCaptions=true;await pe('els.'+action+'.click()');await wait(()=>held.length>0,'held '+action);
    await tab('https://www.youtube.com/watch?v='+id);await pw('!panel.ready','invalidated '+action);holdCaptions=false;for(const f of held.splice(0))await f();
    await pw('!busy&&!sending&&panel.ready&&videoContext?.videoId==='+JSON.stringify(id),'cancelled '+action);
    assert.equal(await pe('qaCopied'),'Unchanged synthetic clipboard','stale '+action+' never copies');assert.equal(await pe('collectionState.items.length'),0,'stale Add never mutates');
    assert.deepEqual(await evaluate('chrome.storage.session.get(null).then(s=>Object.keys(s).filter(k=>k.startsWith("pending_")||k.startsWith("explicit_send_")))'),[],'stale Open never schedules handoff');
  }
  await pe('els.copyPrompt.click()');await pw('!busy&&!sending&&qaCopied.includes("Captions for afteropen")');assert.ok(!(await pe('qaCopied')).includes('Captions for fixture01'),'fresh selected source is the copied prompt');
  await call('Target.activateTarget',{targetId:fresh.targetId});await pw('panel.ready&&videoContext?.videoId==="freshsource"');
  // URL/player disagreement during SPA navigation must not reuse old metadata.
  await evaluate(`history.pushState({},'', '/watch?v=spaupdate')`,fresh.sessionId);
  await pw('panel.ready&&!videoContext','SPA mismatch refused');assert.equal(await pe('els.sendButton.disabled'),true);
  await evaluate(`window.ytInitialPlayerResponse.videoDetails.videoId='spaupdate';window.ytInitialPlayerResponse.videoDetails.title='Synthetic SPA update';`,fresh.sessionId);
  await pe('els.retryButton.click()');await pw('panel.ready&&videoContext?.videoId==="spaupdate"','SPA recovered');
  await pe(`videoContext.title='Long synthetic title '+('long title '.repeat(80));renderVideoContext();document.getElementById('contentScroll').scrollTop=100000`);await geometry('long title scrolled');
  const bw=await call('Browser.getWindowForTarget',{targetId:fresh.targetId});await call('Browser.setWindowBounds',{windowId:bw.windowId,bounds:{width:850,height:620}});await delay(150);await geometry('lower browser height');
  await pe('els.openOptionsTop.focus()');let keyboard=false;for(let i=0;i<70;i++){await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sid);await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sid);if(await pe('document.activeElement.id==="sendButton"')){keyboard=true;break;}}assert.ok(keyboard,'keyboard reaches primary action');
  const pendingKeys=await evaluate('chrome.storage.session.get(null).then(s=>Object.keys(s).filter(k=>k.startsWith("pending_")||k.startsWith("explicit_send_")))');assert.deepEqual(pendingKeys,[],'native panel QA never requested provider insertion or Send');
  const shot=await call('Page.captureScreenshot',{format:'png'},sid);fs.writeFileSync(path.join(work,label+'-native-panel.png'),Buffer.from(shot.data,'base64'));
  assert.deepEqual(errors,[],'no runtime errors');console.log('PASS '+label+': native panel '+metric.width+'x'+metric.height+'; window-bound tab/SPA/async cancellation, 0/1/2/3 Collection, no Add switch, nonvideo retention, footer, keyboard and unchanged preferences.');
 }finally{if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({id:++seq,method:'Browser.close'}));await new Promise(r=>{const t=setTimeout(r,4000);browser.once('exit',()=>{clearTimeout(t);r();});});}ws?.close();browser.kill();browser.stderr.destroy();browser.unref();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Closed'));}}
}
if(baseline){await exercise('v021-settings',baseline,'seed','in-place');await exercise('updated-panel',candidate,'candidate','in-place');}
await exercise('fresh-panel',candidate,'candidate');
fs.writeFileSync(path.join(work,'report.json'),JSON.stringify(report,null,2));console.log('Native panel report '+path.join(work,'report.json'));

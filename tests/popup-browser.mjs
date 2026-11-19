// Optional real-DOM regression: node tests/popup-browser.mjs /path/to/chromium
// Uses an isolated profile, native mouse clicks, actual popup assets and mocked
// Chrome APIs. It does not access personal accounts or prove authenticated AI.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.env.POPUP_FIXTURE_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hasProviderSwitch = fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8').includes('providerChatGPT');
const hasPromptReview = fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8').includes('copyPrompt');
const hasCustomInstructions = fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8').includes('customInstructions');
const executable = process.argv[2] || process.env.CHROMIUM_EXECUTABLE;
assert.ok(executable && fs.existsSync(executable), 'Pass an existing Chromium/Chrome/Edge executable. No browser is downloaded.');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-intake-popup-browser-'));
const browser = spawn(executable, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let ws;
let sequence = 0;
const pending = new Map();
const errors = [];
try {
  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Browser did not expose its isolated debugging endpoint.')), 15000);
    browser.on('error', (error) => { clearTimeout(timer); reject(error); });
    browser.on('exit', (code) => { clearTimeout(timer); reject(new Error(`Browser exited: ${code}`)); });
    let output = '';
    browser.stderr.on('data', (data) => {
      output += data;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  ws = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const call = pending.get(message.id);
      if (call) { pending.delete(message.id); clearTimeout(call.timer); message.error ? call.reject(new Error(JSON.stringify(message.error))) : call.resolve(message.result); }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  async function call(method, params = {}, sessionId) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
      pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const version = await call('Browser.getVersion');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const destinations = [
    { id: 'general', name: 'General ChatGPT', url: 'https://chatgpt.com/', builtIn: true },
    { id: 'claude-general', name: 'General Claude', url: 'https://claude.ai/new', builtIn: true },
    { id: 'gpt-project', name: 'Research', url: 'https://chatgpt.com/g/g-p-fixture/project' },
    { id: 'gpt-chat', name: 'Discussion', url: 'https://chatgpt.com/c/fixture' },
    { id: 'claude-project', name: 'Research', url: 'https://claude.ai/project/fixture' },
    { id: 'claude-chat', name: 'Discussion', url: 'https://claude.ai/chat/fixture' }
  ];
  const modeChecks = {
    apply: ['Analyze this YouTube video as incoming research', 'Critically analyze the following YouTube video', 'Give me a concise but sufficiently complete summary'],
    analyze: ['Critically analyze the following YouTube video', 'Analyze this YouTube video as incoming research', 'Give me a concise but sufficiently complete summary'],
    summarize: ['Give me a concise but sufficiently complete summary', 'Critically analyze the following YouTube video', 'Analyze this YouTube video as incoming research']
  };
  const labels = { apply: 'Apply to Project', analyze: 'Analyze', summarize: 'Summarize', custom: 'Custom instructions' };
  modeChecks.custom = ['Perform this user-defined task', ...Object.values(modeChecks).map((checks) => checks[0])];
  async function page(storedDestination = 'general') {
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    await call('Page.enable', {}, sessionId);
    await call('Runtime.enable', {}, sessionId);
    await call('Emulation.setDeviceMetricsOverride', { width: 400, height: 760, deviceScaleFactor: 1, mobile: false }, sessionId);
    const source = `(() => {
      const data = window.name ? JSON.parse(window.name) : ${JSON.stringify({ destinations, lastMode: 'analyze', lastDestinationId: storedDestination, preferredTranscriptLanguage: 'en' })};
      globalThis.fixture = { data, copied: '', messages: [], closed: false };
      data.__session ||= {};
      const persist=()=>{window.name=JSON.stringify(data);};
      let collectionListener;
      const scripts=${JSON.stringify(Object.fromEntries(['shared/destination.js','shared/collection.js','background.js'].map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')])))};
      const currentVideo=()=>({videoId:data.__video?'fixture'+(data.__video+1):'fixture',title:data.__video?'Fixture video '+(data.__video+1)+(data.__video===1?' <img src=x>':''):'A clearer way to think - with Dr. Rowan Vale',channel:'Fixture channel',url:'https://www.youtube.com/watch?v='+(data.__video?'fixture'+(data.__video+1):'fixture'),tracks:[{name:'English',languageCode:'en'}]});
      const workerChrome={runtime:{getURL:p=>'chrome-extension://fixture/'+p,onInstalled:{addListener(){}},onMessage:{addListener(fn){collectionListener=fn;}}},tabs:{async get(id){return {id,windowId:1,index:0,url:currentVideo().url};}},storage:{session:{async get(key){return {[key]:structuredClone(data.__session[key])};},async set(values){if(fixture.failCollectionWrite)throw Error('Fixture write denied');Object.assign(data.__session,structuredClone(values));persist();}},local:{async get(key){return {[key]:data[key]};},async set(values){Object.assign(data,values);persist();}}}};
      new Function('chrome','importScripts',scripts['background.js'])(workerChrome,name=>new Function(scripts[name])());
      fixture.collectionRequest=message=>new Promise(resolve=>collectionListener(message,{url:'chrome-extension://fixture/popup/popup.html'},resolve));
      window.close = () => { fixture.closed = true; };
      Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text) { fixture.copied = text; } }, configurable: true });
      globalThis.chrome = {
        runtime: { getManifest() { return ${JSON.stringify(manifest)}; }, async sendMessage(message) { if(message.type.startsWith('COLLECTION_'))return fixture.collectionRequest(message); fixture.messages.push(message); return { ok: true }; }, openOptionsPage() {} },
        storage: { local: { async get(keys) { return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).filter(key => key in data).map(key => [key, structuredClone(data[key])])); }, async set(values) { await new Promise(resolve => setTimeout(resolve, 10)); Object.assign(data, structuredClone(values)); window.name = JSON.stringify(data); } } },
        tabs: { async query() { return [{ id: 41, url: currentVideo().url }]; }, async sendMessage(id, message) {
          if (message.type === 'YT2GPT_GET_CONTEXT') return { ok: true, data: currentVideo() };
          if(fixture.holdCapture){fixture.awaitingCapture=true;await new Promise(resolve=>{fixture.releaseCapture=resolve;});}
          await new Promise(resolve => setTimeout(resolve, 20));
          if(fixture.missingCaptions)return {ok:false,error:'Fixture captions unavailable'};
          const start=data.__video===1?3665:0,content=fixture.largeCaptions?'x'.repeat(251000):'A synthetic transcript for native popup testing.';
          return { ok: true, data: { text: '['+(start?'1:01:05':'0:00')+'] '+content, characterCount: content.length+8, segments:[{start,text:content}], track: { name: 'English' } } };
        } }
      };
    })();`;
    await call('Page.addScriptToEvaluateOnNewDocument', { source }, sessionId);
    const evaluate = async (expression) => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const waitFor = async (expression) => evaluate(`new Promise((resolve, reject) => { let tries = 0; const check = () => { if (${expression}) resolve(true); else if (++tries > 200) reject(new Error('Popup wait failed')); else setTimeout(check, 10); }; check(); })`);
    const click = async (selector) => {
      const closed=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),d=el?.closest('details:not([open])');return d&&!d.querySelector('summary')?.contains(el)?d.id:null;})()`);
      if(closed)await click('#'+closed+' > summary');
      const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.scrollIntoView({block:'nearest'}); const r = element.getBoundingClientRect(); return { x:r.x + r.width/2, y:r.y + r.height/2 }; })()`);
      await call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point }, sessionId);
      await call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point }, sessionId);
    };
    await call('Page.navigate', { url: pathToFileURL(path.join(root, 'popup/popup.html')).href }, sessionId);
    await waitFor(`document.getElementById('youtubeView') && !document.getElementById('youtubeView').classList.contains('hidden')`);
    return { sessionId, evaluate, waitFor, click, async close() { await call('Target.closeTarget', { targetId }); } };
  }
  async function chooseCollectionIntent(ui,mode){
    const index=await ui.evaluate(`Array.from(document.getElementById('collectionModeSelect').options).findIndex(o=>o.value===${JSON.stringify(mode)})`);
    assert.ok(index>=0);await ui.click('#collectionModeSelect');
    for(const key of ['Home',...Array(index).fill('ArrowDown'),'Enter']){
      await call('Input.dispatchKeyEvent',{type:'keyDown',key},ui.sessionId);
      await call('Input.dispatchKeyEvent',{type:'keyUp',key},ui.sessionId);
    }
    await ui.waitFor(`document.getElementById('collectionModeSelect').value===${JSON.stringify(mode)}`);
  }
  let cases = 0;
  for (const destination of destinations) {
    for (const mode of ['summarize', 'analyze', 'apply', ...(hasCustomInstructions ? ['custom'] : [])]) {
      const ui = await page(destination.id);
      // Click the visible label area, not the hidden radio or buildPrompt.
      await ui.click(`label.mode-card:has(input[value="${mode}"]) strong`);
      if (mode === 'custom') {
        await ui.click('#customInstructions');
        await call('Input.insertText', {text:'Create five discussion questions with source timestamps.'}, ui.sessionId);
      }
      assert.equal(await ui.evaluate('document.querySelector("input[name=mode]:checked").value'), mode);
      if (hasProviderSwitch) assert.ok((await ui.evaluate('document.getElementById("actionSummary").textContent')).startsWith(labels[mode]));
      let reviewedPrompt;
      if (hasPromptReview) {
        await ui.click('#previewPrompt');
        await ui.waitFor(`!document.getElementById('promptPanel').classList.contains('hidden')`);
        reviewedPrompt = await ui.evaluate('document.getElementById("promptPreview").textContent');
        assert.equal(await ui.evaluate('fixture.copied'), '', 'preview leaves clipboard unchanged');
        assert.equal(await ui.evaluate('fixture.messages.length'), 0, 'preview opens no tab');
        await ui.click('#copyPrompt');
        await ui.waitFor(`!document.getElementById('copyPrompt').disabled`);
        assert.equal(await ui.evaluate('fixture.copied'), reviewedPrompt, 'native copy matches the full preview');
        assert.equal(await ui.evaluate('fixture.messages.length'), 0, 'copy opens no tab');
        assert.equal(await ui.evaluate('fixture.closed'), false, 'copy leaves popup usable');
      }
      await ui.click('#sendButton');
      await ui.waitFor('fixture.closed');
      const result = await ui.evaluate('fixture');
      assert.ok(result.copied.includes(modeChecks[mode][0]), `${destination.id}: ${mode} must match the copied task`);
      for (const unwanted of modeChecks[mode].slice(1)) assert.ok(!result.copied.includes(unwanted), `${destination.id}: ${mode} must not contain another mode's instruction`);
      if (hasProviderSwitch) assert.ok(result.copied.includes(`SELECTED MODE: ${labels[mode]}`));
      assert.equal(result.messages[0].payload, result.copied);
      if (mode === 'custom') {
        assert.ok(result.copied.includes('After the source header, follow USER INSTRUCTIONS for the task and answer structure'));
        assert.ok(!result.copied.includes('its TL;DR follows the header'), 'Custom must not impose a conflicting summary');
      } else assert.ok(result.copied.includes('After the header, perform the selected mode below; its TL;DR follows the header'), 'preset structure is preserved');
      if (hasPromptReview) assert.equal(result.messages[0].payload, reviewedPrompt, 'Open matches the exact preview/copy payload');
      assert.equal(result.messages[0].destinationUrl, destination.url);
      const persistedMode = mode === 'custom' ? 'analyze' : mode;
      assert.equal(result.data.lastMode, persistedMode);
      assert.equal(result.data.lastDestinationId, destination.id);
      await call('Page.reload', {}, ui.sessionId);
      await ui.waitFor(`document.getElementById('youtubeView') && !document.getElementById('youtubeView').classList.contains('hidden')`);
      assert.equal(await ui.evaluate('document.querySelector("input[name=mode]:checked").value'), persistedMode, 'presets survive reload; one-off Custom returns to the last preset');
      if (mode === 'custom') assert.equal(await ui.evaluate('document.getElementById("customInstructions").value'), '', 'one-off instruction text never persists');
      assert.equal(await ui.evaluate('document.getElementById("destinationSelect").value'), destination.id, 'destination survives reload');
      cases++;
      await ui.close();
    }
  }
  if (hasProviderSwitch) {
  const ui = await page('gpt-project');
  await ui.click('label.mode-card:has(input[value="summarize"]) strong');
  await ui.click('label.provider-choice:has(#providerClaude) span');
  assert.equal(await ui.evaluate('document.querySelector("input[name=mode]:checked").value'), 'summarize', 'provider switching preserves the chosen task');
  assert.equal(await ui.evaluate('document.getElementById("destinationSelect").value'), 'claude-general');
  await ui.evaluate(`(() => { const select = document.getElementById('destinationSelect'); select.value = 'claude-project'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await ui.click('label.provider-choice:has(#providerChatGPT) span');
  assert.equal(await ui.evaluate('document.getElementById("destinationSelect").value'), 'gpt-project');
  await ui.click('label.provider-choice:has(#providerClaude) span');
  assert.equal(await ui.evaluate('document.getElementById("destinationSelect").value'), 'claude-project');
  assert.equal(await ui.evaluate('document.documentElement.scrollWidth <= 400'), true, 'popup has no horizontal overflow');
  assert.equal(await ui.evaluate('document.getElementById("sendButton").getBoundingClientRect().bottom <= 600'), true, 'primary action stays visible in a 600px popup for the standard fixture');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, ui.sessionId);
  // Let theme/selection transitions paint before capturing the synthetic UI.
  await ui.evaluate('new Promise(resolve => setTimeout(resolve, 150))');
  const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, ui.sessionId);
  fs.writeFileSync(path.join(profile, 'popup-claude.png'), Buffer.from(screenshot.data, 'base64'));
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] }, ui.sessionId);
  await ui.evaluate('new Promise(resolve => setTimeout(resolve, 150))');
  const dark = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, ui.sessionId);
  fs.writeFileSync(path.join(profile, 'popup-claude-dark.png'), Buffer.from(dark.data, 'base64'));
  if (hasPromptReview) {
    await ui.click('#previewPrompt');
    await ui.waitFor(`!document.getElementById('promptPanel').classList.contains('hidden')`);
    await ui.evaluate(`(() => { const question = document.getElementById('optionalQuestion'); question.value = '<img src=x onerror="window.fixtureUnsafe=true">'; question.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    assert.equal(await ui.evaluate('document.getElementById("promptPanel").classList.contains("hidden")'), true, 'editing the question invalidates the preview');
    await ui.click('#previewPrompt');
    await ui.waitFor(`!document.getElementById('promptPanel').classList.contains('hidden')`);
    assert.ok((await ui.evaluate('document.getElementById("promptPreview").textContent')).includes('<img src=x'));
    assert.equal(await ui.evaluate('document.getElementById("promptPreview").querySelectorAll("img").length'), 0, 'source/question markup renders as plain text');
    assert.equal(await ui.evaluate('Boolean(window.fixtureUnsafe)'), false);
    const previewImage = await call('Page.captureScreenshot', { format:'png', captureBeyondViewport:true }, ui.sessionId);
    fs.writeFileSync(path.join(profile, 'popup-prompt-preview.png'), Buffer.from(previewImage.data,'base64'));
    await ui.click('label.mode-card:has(input[value="analyze"]) strong');
    assert.equal(await ui.evaluate('document.getElementById("promptPreview").textContent'), '', 'changing mode clears stale content');
    await ui.click('#previewPrompt');
    await ui.waitFor(`!document.getElementById('promptPanel').classList.contains('hidden')`);
    await ui.click('label.provider-choice:has(#providerChatGPT) span');
    assert.equal(await ui.evaluate('document.getElementById("promptPanel").classList.contains("hidden")'), true, 'switching provider hides stale preview');
  }
  await ui.close();
  }
  if (hasCustomInstructions) {
    const ui = await page();
    await ui.click('label.mode-card:has(input[value="custom"]) strong');
    await ui.click('#customInstructions');
    const instruction = 'Turn this video into a practical reading-group agenda.';
    await call('Input.insertText', {text:instruction}, ui.sessionId);
    await ui.click('#saveCustomInstructions');
    await ui.waitFor(`fixture.data.customInstructions === ${JSON.stringify(instruction)} && !document.getElementById('saveCustomInstructions').disabled`);
    await call('Page.reload', {}, ui.sessionId);
    await ui.waitFor(`document.getElementById('youtubeView') && !document.getElementById('youtubeView').classList.contains('hidden')`);
    assert.equal(await ui.evaluate('document.querySelector("input[name=mode]:checked").value'), 'custom');
    assert.equal(await ui.evaluate('document.getElementById("customInstructions").value'), instruction, 'explicit local save survives actual reload');
    await ui.evaluate(`(() => { const input=document.getElementById('customInstructions'); input.value='One-off edit';input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    assert.equal(await ui.evaluate('fixture.data.customInstructions'), instruction, 'editing never silently overwrites saved text');
    await ui.click('#previewPrompt');
    await ui.waitFor(`!document.getElementById('promptPanel').classList.contains('hidden')`);
    await ui.evaluate('new Promise(resolve=>setTimeout(resolve,150))');
    const customImage=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true},ui.sessionId);
    fs.writeFileSync(path.join(profile,'popup-custom.png'),Buffer.from(customImage.data,'base64'));
    await ui.click('#forgetCustomInstructions');
    await ui.waitFor(`fixture.data.customInstructions === '' && !document.getElementById('forgetCustomInstructions').disabled`);
    await call('Page.reload', {}, ui.sessionId);
    await ui.waitFor(`document.getElementById('youtubeView') && !document.getElementById('youtubeView').classList.contains('hidden')`);
    assert.equal(await ui.evaluate('document.querySelector("input[name=mode]:checked").value'), 'analyze');
    assert.equal(await ui.evaluate('document.getElementById("customInstructions").value'), '');
    await ui.close();
  }
  if (process.argv.includes('--inspect-claude')) {
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    await call('Page.enable', {}, sessionId);
    await call('Page.navigate', { url: 'https://claude.ai/new' }, sessionId);
    const observed = await call('Runtime.evaluate', { expression: `new Promise(resolve => setTimeout(() => resolve({ url: location.href, title: document.title, text: document.body?.innerText?.slice(0,350) || '', editors: document.querySelectorAll('[contenteditable="true"], textarea').length }), 3000))`, awaitPromise: true, returnByValue: true }, sessionId);
    console.log('Isolated Claude public-page inspection (no personal session): ' + JSON.stringify(observed.result.value));
    await call('Target.closeTarget', { targetId });
  }
  const quick=await page('general');
  assert.equal(await quick.evaluate('document.getElementById("explicitSendOptIn").checked'),false);

  await quick.click('#explicitSendOptIn');
  await quick.waitFor('fixture.data.chatgptExplicitSendEnabled === true');
  await quick.evaluate('location.reload()');
  await quick.waitFor('document.getElementById("explicitSendOptIn")?.checked');

  assert.match(await quick.evaluate('document.getElementById("explicitSendDestination").textContent'),/https:\/\/chatgpt.com/);
  await quick.click('#previewPrompt');
  await quick.waitFor('document.getElementById("promptPreview").textContent.length > 0');
  await quick.click('#copyPrompt');
  await quick.waitFor('fixture.copied.length > 0');
  assert.equal(await quick.evaluate('fixture.messages.length'),0);
  await quick.click('#sendButton');
  await quick.waitFor('fixture.messages.length === 1');
  assert.equal(await quick.evaluate('fixture.messages[0].type'),'OPEN_CHATGPT_WITH_EXPLICIT_SEND');
  await quick.close();
  console.log('PASS: native remembered opt-in, visible Send destination and explicit per-video action; Preview/Copy remain manual.');
  const basket=await page('general');
  const state=()=>basket.evaluate('fixture.data.__session.collection_v1');
  async function visit(index){await basket.evaluate(`fixture.data.__video=${index};window.name=JSON.stringify(fixture.data);location.reload()`);await basket.waitFor(`document.getElementById('youtubeView')&&!document.getElementById('youtubeView').classList.contains('hidden')`);await basket.click('#collectionPanel summary');}
  await basket.click('#collectionPanel summary');
  await basket.evaluate('fixture.missingCaptions=true');await basket.click('#addToCollection');
  await basket.waitFor('document.getElementById("error").textContent.includes("unavailable")');
  assert.equal((await state())?.items?.length||0,0);
  await basket.evaluate('fixture.missingCaptions=false;fixture.failCollectionWrite=true');await basket.click('#addToCollection');
  await basket.waitFor('document.getElementById("error").textContent.length>0&&!document.getElementById("addToCollection").disabled');
  assert.equal((await state())?.items?.length||0,0,'failed write never acknowledges Add');
  await basket.evaluate('fixture.failCollectionWrite=false;fixture.largeCaptions=true');await basket.click('#addToCollection');
  await basket.waitFor('document.getElementById("error").textContent.includes("250,000")');
  assert.equal((await state())?.items?.length||0,0);
  await basket.evaluate('fixture.largeCaptions=false');await basket.click('#addToCollection');
  await basket.waitFor('document.getElementById("collectionCount").textContent.includes("1/3")');
  await basket.click('#addToCollection');await basket.waitFor('document.getElementById("error").textContent.includes("Already added")');
  assert.equal((await state()).items.length,1);
  await visit(1);await basket.click('#addToCollection');await basket.waitFor('document.getElementById("collectionCount").textContent.includes("2/3")');
  await visit(2);await basket.click('#addToCollection');await basket.waitFor('document.getElementById("collectionCount").textContent.includes("3/3")');
  assert.equal(await basket.evaluate('document.querySelectorAll(".collection-item img").length'),0,'source titles render as text');
  await visit(3);assert.equal(await basket.evaluate('document.getElementById("addToCollection").disabled'),true,'full basket offers review/removal rather than another Add');assert.equal((await state()).items.length,3);
  await basket.click('.collection-item:nth-child(2) button:first-child');
  await basket.waitFor('fixture.data.__session.collection_v1.items[0].videoId === "fixture2"');
  await basket.click('#useCollection');await basket.click('#collectionQuestion');await call('Input.insertText',{text:'What do these sources disagree about?'},basket.sessionId);
  assert.equal(await basket.evaluate('document.getElementById("explicitSendPanel").classList.contains("hidden")'),true,'Collection has no explicit Send');
  await basket.click('#previewPrompt');await basket.waitFor('document.getElementById("promptPreview").textContent.startsWith("COLLECTION TASK")');
  let comparison=await basket.evaluate('document.getElementById("promptPreview").textContent');
  assert.ok(comparison.includes('1:01:05'));assert.ok(comparison.includes('watch?v=fixture2&t=3665s'));assert.ok(comparison.includes('What do these sources disagree about?'));
  await basket.click('#copyPrompt');await basket.waitFor('fixture.copied.startsWith("COLLECTION TASK")');assert.equal(await basket.evaluate('fixture.copied'),comparison);
  assert.equal(await basket.evaluate('fixture.messages.length'),0,'Add/review/Preview/Copy never open a tab');
  await basket.click('#collectionQuestion');await call('Input.insertText',{text:' Keep it compact.'},basket.sessionId);
  assert.equal(await basket.evaluate('document.getElementById("promptPreview").textContent'),'','changed Collection question invalidates preview');
  await basket.click('#previewPrompt');await basket.waitFor('document.getElementById("promptPreview").textContent.startsWith("COLLECTION TASK")');comparison=await basket.evaluate('document.getElementById("promptPreview").textContent');
  await basket.click('#copyPrompt');await basket.waitFor('fixture.copied.includes("Keep it compact.")');assert.equal(await basket.evaluate('fixture.copied'),comparison);
  const collectionShot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true},basket.sessionId);fs.writeFileSync(path.join(profile,'collection-review.png'),Buffer.from(collectionShot.data,'base64'));
  await basket.click('#sendButton');await basket.waitFor('fixture.messages.length === 1');
  assert.equal(await basket.evaluate('fixture.messages[0].payload'),comparison);assert.equal(await basket.evaluate('fixture.messages[0].type'),'OPEN_DESTINATION_WITH_PAYLOAD');assert.equal(await basket.evaluate('fixture.messages[0].collection'),true);
  // Reopen the popup in the synthetic session, choose Claude and preserve the basket.
  await visit(2);assert.equal((await state()).items.length,3);await basket.click('#useCollection');await basket.click('label.provider-choice:has(#providerClaude) span');
  await basket.click('#previewPrompt');await basket.waitFor('document.getElementById("promptPreview").textContent.startsWith("COLLECTION TASK")');
  const claudeCollection=await basket.evaluate('document.getElementById("promptPreview").textContent');await basket.click('#sendButton');await basket.waitFor('fixture.messages.length===1');
  assert.equal(await basket.evaluate('fixture.messages[0].payload'),claudeCollection);assert.equal(await basket.evaluate('fixture.messages[0].type'),'OPEN_DESTINATION_WITH_PAYLOAD');assert.equal(await basket.evaluate('fixture.messages[0].destinationUrl'),'https://claude.ai/new');
  await visit(2);await basket.click('.collection-item:first-child button:last-child');await basket.waitFor('fixture.data.__session.collection_v1.items.length===2');
  await basket.click('#clearCollection');await basket.waitFor('fixture.data.__session.collection_v1.items.length===0');
  // A late capture cannot resurrect a basket cleared by another popup/worker action.
  await basket.evaluate('fixture.holdCapture=true');await basket.click('#addToCollection');await basket.waitFor('fixture.awaitingCapture===true');
  await basket.evaluate(`fixture.collectionRequest({type:'COLLECTION_CLEAR',revision:fixture.data.__session.collection_v1.revision,generation:fixture.data.__session.collection_v1.generation})`);
  await basket.evaluate('fixture.releaseCapture()');await basket.waitFor('document.getElementById("error").textContent.includes("collection changed")');
  assert.equal((await state()).items.length,0);
  // Four distinct collection tasks restore single-video Custom unchanged.
  await basket.evaluate(`fixture.data.__session.collection_v1={version:1,revision:0,generation:0,items:[1,2].map(n=>({videoId:'fixture'+n,title:'Large fixture '+n+' \\u2014 caf\\u00e9 \\ud83d\\ude00',url:'https://www.youtube.com/watch?v=fixture'+n,channel:'Fixture',publishDate:'',capturedAt:0,transcript:{text:'source '+n,segments:[],track:{name:'English'}}}))};fixture.data.lastMode='custom';fixture.data.customInstructions='Keep my saved task';window.name=JSON.stringify(fixture.data);location.reload()`);
  await basket.waitFor('document.getElementById("customInstructions")?.value === "Keep my saved task"');
  await basket.click('#collectionPanel summary');await basket.click('#useCollection');
  assert.equal(await basket.evaluate(`document.getElementById('collectionModeSelect').value`),'compare','Collection defaults to Compare & synthesize');
  for(const [mode,marker] of [['compare','Compare and synthesize the included sources'],['summarize','Synthesize the included sources'],['analyze','Compare the evidence and reasoning'],['apply','Apply the included sources']]){
    await chooseCollectionIntent(basket,mode);
    await basket.click('#previewPrompt');await basket.waitFor('document.getElementById("promptPreview").textContent.length>0');
    const prompt=await basket.evaluate('document.getElementById("promptPreview").textContent');assert.ok(prompt.includes(marker));
    await basket.click('#copyPrompt');assert.equal(await basket.evaluate('fixture.copied'),prompt);
    assert.equal(await basket.evaluate('fixture.data.lastMode'),'custom');
    if(mode==='analyze'){await basket.click('#transcriptTools summary');await basket.click('#retryButton');await basket.waitFor(`!document.getElementById('youtubeView').classList.contains('hidden')`);assert.equal(await basket.evaluate(`document.getElementById('collectionModeSelect').value`),'analyze','Retry keeps Collection task');}
  }
  await basket.click('#useCollection');assert.equal(await basket.evaluate(`document.querySelector('input[name="mode"]:checked').value`),'custom');
  // Construct exactly the reported complete prompt size; real content stays private.
  await basket.evaluate(`(()=>{const items=fixture.data.__session.collection_v1.items;const base=YT2GPTCollection.build(items,'',false,'compare').length;items[0].transcript.text+='x'.repeat(78817-base);window.name=JSON.stringify(fixture.data);location.reload();})()`);
  await basket.waitFor('document.getElementById("customInstructions")?.value === "Keep my saved task"');
  await basket.click('#collectionPanel summary');await basket.click('#useCollection');
  await basket.click('#previewPrompt');await basket.waitFor('document.getElementById("promptPreview").textContent.length===78817');
  const longPrompt=await basket.evaluate('document.getElementById("promptPreview").textContent');
  assert.match(await basket.evaluate('document.getElementById("handoffHelp").textContent'),/without autofill/);
  await basket.click('#copyPrompt');assert.equal(await basket.evaluate('fixture.copied'),longPrompt);
  await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:profile});
  await basket.evaluate(`fixture.copied='Keep clipboard unchanged during export'`);
  assert.equal(await basket.evaluate('document.getElementById("sendButton").textContent'),'Download .txt');
  await basket.click('#sendButton');
  const downloaded=path.join(profile,'youtube-ai-bridge-collection.txt');
  for(let attempt=0;attempt<100&&!fs.existsSync(downloaded);attempt++)await new Promise(r=>setTimeout(r,30));
  assert.ok(fs.existsSync(downloaded),'native .txt download completes');assert.equal(fs.readFileSync(downloaded,'utf8'),longPrompt,'download equals complete Preview/Copy');
  assert.equal(await basket.evaluate('fixture.copied'),'Keep clipboard unchanged during export','file saving does not copy');
  assert.equal(await basket.evaluate('fixture.messages.length'),0,'download opens no assistant and never sends');
  await basket.click('#openManually');await basket.waitFor('fixture.messages.length===1');
  assert.equal(await basket.evaluate('fixture.messages[0].payload'),longPrompt);assert.equal(await basket.evaluate('fixture.messages[0].manualOnly'),true);assert.equal(await basket.evaluate('fixture.messages[0].type'),'OPEN_DESTINATION_WITH_PAYLOAD');
  console.log('PASS: four native Collection task selections/restoration and exact 78,817-character Preview/Copy/.txt/Open-only export.');
  await basket.close();
  console.log('PASS: native three-video Collection Add/reopen/reorder/remove/clear, missing/oversized/duplicate/write/late-capture failures, source timestamps and manual provider handoffs; Preview = Copy = Open.');
  // Geometry/accessibility uses only synthetic settings, titles and sources.
  const compact=await page('gpt-project');
  await compact.evaluate(`fixture.data.chatgptExplicitSendEnabled=true;fixture.data.lastMode='summarize';fixture.data.lastDestinationId='gpt-project';fixture.data.customInstructions='Saved instruction from previous beta';fixture.data.destinations.find(d=>d.id==='gpt-project').name='Existing saved project '+('long name '.repeat(18));window.name=JSON.stringify(fixture.data);location.reload()`);
  await compact.waitFor('document.getElementById("explicitSendOptIn")?.checked');
  assert.equal(await compact.evaluate('document.getElementById("sendButton").textContent'),'Send to ChatGPT','remembered opt-in is visible and labelled after update');
  assert.equal(await compact.evaluate('fixture.data.customInstructions'),'Saved instruction from previous beta');
  assert.equal(await compact.evaluate('fixture.data.lastMode'),'summarize');
  assert.equal(await compact.evaluate('fixture.data.lastDestinationId'),'gpt-project');
  async function footerVisible(ui,label){
    const r=await ui.evaluate(`(()=>{const b=document.getElementById('sendButton'),r=b.getBoundingClientRect(),f=document.getElementById('handoffFooter').getBoundingClientRect(),c=document.getElementById('contentScroll').getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {w:innerWidth,h:innerHeight,docW:document.documentElement.scrollWidth,docH:document.documentElement.scrollHeight,bodyH:document.body.scrollHeight,windowY:scrollY,top:r.top,bottom:r.bottom,right:r.right,left:r.left,footerTop:f.top,contentBottom:c.bottom,hit:hit===b||b.contains(hit)};})()`);
    assert.ok(r.top>=0&&r.bottom<=r.h&&r.left>=0&&r.right<=r.w,label+': action in viewport '+JSON.stringify(r));
    assert.ok(r.contentBottom<=r.footerTop+1,label+': body cannot overlap footer');
    assert.ok(r.docW<=r.w&&r.docH<=r.h&&r.bodyH<=r.h&&r.windowY===0,label+': only body region scrolls '+JSON.stringify(r));
    assert.equal(r.hit,true,label+': native action hit target');
    return r;
  }
  for(const [width,height] of [[400,600],[360,480]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},compact.sessionId);
    await compact.evaluate(`videoContext.title='A full source title '+('long title '.repeat(70));renderVideoContext();document.getElementById('contentScroll').scrollTop=0`);
    await footerVisible(compact,'inherited Send '+width+'x'+height);
    assert.equal(await compact.evaluate(`(()=>{const b=document.getElementById('addToCollection'),r=b.getBoundingClientRect(),c=document.getElementById('contentScroll').getBoundingClientRect();return r.top>=c.top&&r.bottom<=c.bottom&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b;})()`),true,'first-use Add is immediately visible with long title');
    await compact.evaluate(`document.getElementById('contentScroll').scrollTop=100000`);await footerVisible(compact,'scrolled body '+width+'x'+height);
  }
  await compact.evaluate(`fixture.data.__session.collection_v1={version:1,revision:0,generation:0,items:[1,2,3].map(n=>({videoId:'layout'+n,title:'Long source '+n+' '+('source title '.repeat(80)),url:'https://www.youtube.com/watch?v=layout'+n,channel:'Fixture',publishDate:'',capturedAt:0,transcript:{text:'x'.repeat(26000),segments:[],track:{name:'English'}}}))}`);
  await compact.evaluate('refreshCollection()');await compact.click('#useCollection');
  assert.equal(await compact.evaluate('document.getElementById("sendButton").textContent'),'Download .txt');
  assert.equal(await compact.evaluate('document.getElementById("explicitSendPanel").classList.contains("hidden")'),true,'remembered opt-in never enables Collection Send');
  await compact.click('#collectionPanel summary');
  await footerVisible(compact,'long expanded three-source basket');
  await chooseCollectionIntent(compact,'analyze');assert.equal(await compact.evaluate('getSelectedMode()'),'analyze','Analyze remains explicitly available with no migration');
  await compact.click('#handoffAlternatives summary');await footerVisible(compact,'expanded alternatives');
  await compact.evaluate(`document.getElementById('openOptionsTop').focus()`);
  let keyboardReached=false;
  for(let i=0;i<80;i++){
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},compact.sessionId);
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},compact.sessionId);
    if(await compact.evaluate('document.activeElement.id === "sendButton"')){keyboardReached=true;break;}
  }
  assert.ok(keyboardReached,'primary action is keyboard reachable without a pointer');await footerVisible(compact,'keyboard focused primary action');
  const layoutShot=await call('Page.captureScreenshot',{format:'png'},compact.sessionId);fs.writeFileSync(path.join(profile,'compact-footer-keyboard.png'),Buffer.from(layoutShot.data,'base64'));
  assert.equal(await compact.evaluate('fixture.messages.length'),0,'layout/keyboard QA never hands off or sends');
  await compact.close();
  console.log('PASS: inherited settings and 400x600/360x480 footer visibility, long titles/basket, native hit targets, body-only scrolling, keyboard intent/primary access and no Collection Send.');
  assert.equal(errors.length, 0, `No runtime exceptions: ${JSON.stringify(errors)}`);
  console.log(`PASS: ${cases} native popup task/destination cases${hasPromptReview ? ' with preview = copy = Open, no extra tabs, safe text and stale-preview checks' : ''}, reload retention${hasProviderSwitch ? ' and provider switching' : ' (baseline popup)'}${hasCustomInstructions ? ', explicit local Custom save/forget and one-off clearing' : ''} on ${version.product}.`);
  if (hasProviderSwitch) console.log(`Synthetic UI screenshots: ${profile}`);
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: ++sequence, method: 'Browser.close' }));
    await new Promise((resolve) => { const timer = setTimeout(resolve, 2000); browser.once('exit', () => { clearTimeout(timer); resolve(); }); });
  }
  ws?.close();
  browser.kill();
  browser.stderr.destroy();
  browser.unref();
  for (const call of pending.values()) { clearTimeout(call.timer); call.reject(new Error('Browser test closed')); }
}

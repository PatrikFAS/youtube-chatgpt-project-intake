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
      window.close = () => { fixture.closed = true; };
      Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text) { fixture.copied = text; } }, configurable: true });
      globalThis.chrome = {
        runtime: { getManifest() { return ${JSON.stringify(manifest)}; }, async sendMessage(message) { fixture.messages.push(message); return { ok: true }; }, openOptionsPage() {} },
        storage: { local: { async get(keys) { return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).filter(key => key in data).map(key => [key, structuredClone(data[key])])); }, async set(values) { await new Promise(resolve => setTimeout(resolve, 10)); Object.assign(data, structuredClone(values)); window.name = JSON.stringify(data); } } },
        tabs: { async query() { return [{ id: 41, url: 'https://www.youtube.com/watch?v=fixture' }]; }, async sendMessage(id, message) {
          if (message.type === 'YT2GPT_GET_CONTEXT') return { ok: true, data: { videoId: 'fixture', title: 'A clearer way to think — with Dr. Rowan Vale', channel: 'Fixture channel', url: 'https://www.youtube.com/watch?v=fixture', tracks: [{ name: 'English', languageCode: 'en' }] } };
          await new Promise(resolve => setTimeout(resolve, 20));
          return { ok: true, data: { text: '[0:00] A synthetic transcript for native popup testing.', characterCount: 55, track: { name: 'English' } } };
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
      const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.scrollIntoView({block:'nearest'}); const r = element.getBoundingClientRect(); return { x:r.x + r.width/2, y:r.y + r.height/2 }; })()`);
      await call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point }, sessionId);
      await call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point }, sessionId);
    };
    await call('Page.navigate', { url: pathToFileURL(path.join(root, 'popup/popup.html')).href }, sessionId);
    await waitFor(`document.getElementById('youtubeView') && !document.getElementById('youtubeView').classList.contains('hidden')`);
    return { sessionId, evaluate, waitFor, click, async close() { await call('Target.closeTarget', { targetId }); } };
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

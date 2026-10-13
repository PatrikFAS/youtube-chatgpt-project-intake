import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const destinationSource = fs.readFileSync(path.join(root, 'shared/destination.js'), 'utf8');
const popupSource = fs.readFileSync(path.join(root, 'popup/popup.js'), 'utf8');
const optionsSource = fs.readFileSync(path.join(root, 'options/options.js'), 'utf8');
const popupHtml = fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8');
const optionsHtml = fs.readFileSync(path.join(root, 'options/options.html'), 'utf8');

assert.ok(popupHtml.indexOf('../shared/destination.js') < popupHtml.indexOf('popup.js'), 'popup loads shared destination validation first');
assert.ok(optionsHtml.indexOf('../shared/destination.js') < optionsHtml.indexOf('options.js'), 'options loads shared destination validation first');

function makeElement(id) {
  const listeners = {};
  const classes = new Set(['hidden']);
  return {
    id, value: '', textContent: '', innerHTML: '', disabled: false, checked: false,
    style: {}, dataset: {}, options: [], selectedOptions: [], children: [], listeners,
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
      toggle(name, force) { if (force ?? !classes.has(name)) classes.add(name); else classes.delete(name); }
    },
    addEventListener(type, fn) { listeners[type] = fn; },
    appendChild(child) { this.children.push(child); this.options = this.children; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    focus() {}, select() {}, remove() {}
  };
}

async function makePopup({ runtimeOk = false } = {}) {
  const ids = [
    'loadingView','youtubeView','chatgptView','otherView','videoTitle','videoMeta','transcriptStatus',
    'trackSelect','destinationSelect','optionalQuestion','warning','error','sendButton','viewTranscript',
    'copyTranscript','retryButton','transcriptPanel','transcriptPreview','transcriptCount','destinationName',
    'currentUrl','chatgptSaveStatus','saveDestination','manageDestinations','manageDestinationsChatgpt',
    'openOptionsTop','openOptionsOther'
  ];
  const els = Object.fromEntries(ids.map((id) => [id, makeElement(id)]));
  const radios = ['apply','analyze','summarize'].map((value) => Object.assign(makeElement(`mode-${value}`), { value, checked: value === 'analyze' }));
  const events = [];
  const storageData = {
    destinations: [{ id: 'general', name: 'General ChatGPT', url: 'https://chatgpt.com/', builtIn: true }],
    lastMode: 'analyze', lastDestinationId: 'general', preferredTranscriptLanguage: 'en'
  };
  let activeId = 41;
  let queriedTabs = 0;
  let closed = false;
  const docListeners = {};
  const document = {
    getElementById(id) { return els[id] || (els[id] = makeElement(id)); },
    querySelectorAll(selector) { return selector === 'input[name="mode"]' ? radios : []; },
    querySelector(selector) {
      const match = selector.match(/input\[name="mode"\]\[value="([^"]+)"\]/);
      if (match) return radios.find((radio) => radio.value === match[1]);
      if (selector === 'input[name="mode"]:checked') return radios.find((radio) => radio.checked);
      return null;
    },
    createElement(tag) { return makeElement(tag); },
    addEventListener(type, fn) { docListeners[type] = fn; },
    body: { appendChild(el) { events.push('fallback-copy'); el.select(); }, removeChild() {} },
    execCommand() { return true; }
  };
  Object.defineProperty(els.destinationSelect, 'selectedOptions', {
    get() { return [this.options.find((option) => option.value === this.value) || this.options[0]].filter(Boolean); }
  });
  els.trackSelect.value = '0';
  els.optionalQuestion.value = 'Could this help our workflow?';

  const chrome = {
    tabs: {
      async query() { queriedTabs++; return [{ id: activeId, url: 'https://www.youtube.com/watch?v=abc' }]; },
      async sendMessage(tabId, message) {
        events.push(`tab:${tabId}:${message.type}`);
        if (message.type === 'YT2GPT_GET_CONTEXT') return { ok: true, data: {
          videoId: 'abc', title: 'Example video', channel: 'Example channel', url: 'https://www.youtube.com/watch?v=abc',
          tracks: [{ languageCode: 'en', name: 'English' }]
        } };
        activeId = 99; // The active browser tab changes while transcript retrieval is in flight.
        return { ok: true, data: { text: 'Transcript contents.', characterCount: 22, track: { name: 'English' } } };
      }
    },
    storage: { local: {
      async get(key) {
        if (Array.isArray(key)) return Object.fromEntries(key.filter((name) => name in storageData).map((name) => [name, storageData[name]]));
        return { [key]: storageData[key] };
      },
      async set(value) { Object.assign(storageData, value); }
    } },
    runtime: {
      async sendMessage(message) { events.push('open'); events.message = message; return { ok: runtimeOk, error: 'Simulated opening failure.' }; },
      openOptionsPage() {}
    }
  };
  const windowListeners = {};
  const window = { addEventListener(type, fn) { windowListeners[type] = fn; }, confirm() { return true; }, close() { closed = true; } };
  const context = vm.createContext({
    window, document, chrome, URL, console,
    setTimeout, clearTimeout, Math, Date, RegExp, Object, Array, String, Number, Boolean, JSON,
    navigator: { language: 'en-US', clipboard: { async writeText(text) { events.push('clipboard'); events.clipboard = text; } } }
  });
  vm.runInContext(destinationSource, context, { filename: 'shared/destination.js' });
  vm.runInContext(popupSource, context, { filename: 'popup/popup.js' });
  await windowListeners.DOMContentLoaded();
  return { context, els, radios, events, storageData, queriedTabs: () => queriedTabs, closed: () => closed };
}

const popup = await makePopup();
assert.equal(popup.queriedTabs(), 1, 'active tab is captured once during popup initialization');
await vm.runInContext('sendToChatGPT()', popup.context);
assert.ok(popup.events.indexOf('clipboard') < popup.events.indexOf('open'), 'complete prompt is copied before opening ChatGPT');
assert.equal(popup.events.message.sourceTabId, 41, 'open message carries the tab captured at popup initialization');
assert.equal(popup.queriedTabs(), 1, 'popup does not requery the active tab after transcript retrieval');
assert.match(popup.events.clipboard, /Critically analyze the following YouTube video/);
assert.match(popup.events.clipboard, /SPECIFIC QUESTION[\s\S]*Could this help our workflow\?/);
assert.match(popup.events.clipboard, /Transcript contents\./);
assert.match(popup.els.error.textContent, /Simulated opening failure\..*complete prompt is already on your clipboard/);
assert.equal(popup.closed(), false, 'failed open leaves the popup available');

const modePrompt = vm.runInContext(`(() => {
  videoContext = { title:'T', url:'https://youtube.com/watch?v=x' };
  return ['apply','analyze','summarize'].map((mode) => buildPrompt({ mode, question:'Keep my question', transcript:{ text:'Body' } }));
})()`, popup.context);
assert.match(modePrompt[0], /Analyze this YouTube video as incoming research/);
assert.match(modePrompt[1], /Critically analyze the following YouTube video/);
assert.match(modePrompt[2], /Give me a concise but sufficiently complete summary/);
for (const prompt of modePrompt) assert.match(prompt, /Keep my question/);

async function makeOptions(promptAnswers = []) {
  const els = Object.fromEntries(['destinationList','emptyState','newName','newUrl','addButton','message'].map((id) => [id, makeElement(id)]));
  const storedDestinations = [{ id: 'general', name: 'General ChatGPT', url: 'https://chatgpt.com/', builtIn: true }, {
    id: 'saved', name: 'Keep me', url: 'https://chatgpt.com/g/project', builtIn: false
  }];
  const storedPreferences = { destinations: storedDestinations, lastMode: 'summarize', lastDestinationId: 'saved', preferredTranscriptLanguage: 'fr' };
  const document = { getElementById(id) { return els[id]; }, createElement() { return makeElement('row'); } };
  const windowListeners = {};
  const window = { addEventListener(type, fn) { windowListeners[type] = fn; } };
  const chrome = { storage: { local: {
    async get(key) { return { [key]: storedPreferences[key] }; },
    async set(value) { Object.assign(storedPreferences, value); }
  } } };
  const context = vm.createContext({ window, document, chrome, URL, prompt() { return promptAnswers.shift() ?? null; }, confirm() { return true; }, Date, Math, Object, Array, String });
  vm.runInContext(destinationSource, context);
  vm.runInContext(optionsSource, context);
  els.newName.value = 'Codex route';
  els.newUrl.value = 'https://chatgpt.com/codex';
  return { context, els, storedPreferences, storedDestinations };
}

const options = await makeOptions();
await vm.runInContext('addDestination()', options.context);
assert.match(options.els.message.textContent, /select ChatGPT rather than Codex/);
assert.equal(options.storedPreferences.destinations, options.storedDestinations, 'rejected add preserves the existing destination array');
assert.equal(options.storedPreferences.lastMode, 'summarize');
assert.equal(options.storedPreferences.lastDestinationId, 'saved');
assert.equal(options.storedPreferences.preferredTranscriptLanguage, 'fr');

const editOptions = await makeOptions(['Renamed', 'https://chatgpt.com/codex']);
await vm.runInContext(`editDestination({ id:'saved', name:'Keep me', url:'https://chatgpt.com/g/project', builtIn:false })`, editOptions.context);
assert.match(editOptions.els.message.textContent, /select ChatGPT rather than Codex/);
assert.equal(editOptions.storedPreferences.destinations[1].name, 'Keep me', 'rejected edit preserves the saved name');
assert.equal(editOptions.storedPreferences.destinations[1].url, 'https://chatgpt.com/g/project', 'rejected edit preserves the saved URL');

const popupSave = await makePopup();
vm.runInContext(`activeTab = { id: 9, url: 'https://chatgpt.com/codex' }; els.destinationName.value = 'Codex'; saveCurrentDestination()`, popupSave.context);
assert.match(popupSave.els.chatgptSaveStatus.textContent, /select ChatGPT rather than Codex/);
assert.equal(popupSave.storageData.destinations.length, 1, 'rejected popup save leaves stored destinations unchanged');

console.log('PASS: popup preserves prompt fallback and source tab; popup/options reject unsafe destination routes without losing settings.');

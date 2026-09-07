import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '..', 'youtube', 'content.js'), 'utf8');
let messageListener = null;
let panelOpen = false;
let descriptionExpanded = false;

const rows = [
  makeRow('0:01', 'Transcript panel fallback works.'),
  makeRow('0:04', 'It opened the panel automatically.')
];
function makeRow(ts, text) {
  return {
    querySelector(selector) {
      if (selector.includes('timestamp')) return { textContent: ts };
      if (selector.includes('segment-text') || selector === 'yt-formatted-string') return { textContent: text };
      return null;
    }
  };
}
function makeTextarea() {
  let value = '';
  return { set innerHTML(v) { value = String(v ?? ''); }, get value() { return value; } };
}
const expandButton = { click() { descriptionExpanded = true; } };
const transcriptButton = { click() { panelOpen = true; } };
const document = {
  documentElement: { dataset: {} },
  head: { appendChild() {} },
  title: 'Test - YouTube',
  createElement(tag) {
    if (tag === 'textarea') return makeTextarea();
    return { addEventListener() {}, remove() {}, set src(v) { this._src = v; } };
  },
  querySelector(selector) {
    if (selector === 'ytd-text-inline-expander #expand') return expandButton;
    if (selector === 'ytd-video-description-transcript-section-renderer button') return descriptionExpanded ? transcriptButton : null;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === 'ytd-transcript-segment-renderer') return panelOpen ? rows : [];
    return [];
  }
};
const windowObj = { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };
const chrome = {
  runtime: {
    getURL(p) { return `chrome-extension://test/${p}`; },
    onMessage: { addListener(fn) { messageListener = fn; } }
  }
};
const context = vm.createContext({
  window: windowObj,
  document,
  chrome,
  performance: { now: () => Date.now(), getEntriesByType: () => [] },
  fetch: async () => ({ ok: true, status: 200, async text() { return ''; } }),
  navigator: { language: 'en-US' },
  location: { href: 'https://www.youtube.com/watch?v=test123' },
  URL,
  CustomEvent: class CustomEvent {},
  DOMParser: class DOMParser {},
  setTimeout,
  clearTimeout,
  console,
  Math,
  Date,
  RegExp,
  Object,
  Array,
  String,
  Number,
  Boolean,
  JSON,
  encodeURIComponent
});
vm.runInContext(source, context, { filename: 'youtube/content.js' });
if (typeof messageListener !== 'function') throw new Error('Message listener missing.');

const result = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('DOM fallback test timed out.')), 7000);
  messageListener({ type: 'YT2GPT_GET_TRANSCRIPT', track: null }, {}, (response) => {
    clearTimeout(timeout);
    resolve(response);
  });
});

if (!descriptionExpanded) throw new Error('Description was not expanded.');
if (!panelOpen) throw new Error('Transcript panel was not opened.');
if (!result?.ok || result.fallback !== 'dom') throw new Error(`DOM fallback failed: ${JSON.stringify(result)}`);
if (!result.data?.text?.includes('opened the panel automatically')) throw new Error(`Unexpected transcript: ${result.data?.text}`);
console.log('PASS: transcript panel is opened and scraped automatically when caption download fails.');

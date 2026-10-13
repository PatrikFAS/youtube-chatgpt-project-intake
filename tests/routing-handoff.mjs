import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, '..', name), 'utf8');
const destinationSource = read('shared/destination.js');
const backgroundSource = read('background.js');
const injectorSource = read('chatgpt/content.js');

function loadDestination() {
  const context = vm.createContext({ URL });
  vm.runInContext(destinationSource, context, { filename: 'shared/destination.js' });
  return context.YT2GPTDestination;
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function createBackground({ source = { id: 11, windowId: 4, index: 2 }, nextTabId = 90, failGet = false, failCreate = false, failStorageSet = false, initialPending = {} } = {}) {
  let listener;
  const pending = new Map(Object.entries(initialPending));
  const creates = [];
  const gets = [];
  let queried = false;
  let storageGetGate = null;
  const chrome = {
    runtime: { onInstalled: { addListener() {} }, onMessage: { addListener(fn) { listener = fn; } } },
    tabs: {
      async get(id) { gets.push(id); if (failGet) throw new Error('closed'); return { ...source, id }; },
      async create(options) { creates.push(options); if (failCreate) throw new Error('create failed'); return { id: nextTabId }; },
      async query() { queried = true; return [{ id: 999, windowId: 99, index: 0 }]; }
    },
    storage: { session: {
      async set(values) {
        if (failStorageSet) throw new Error('storage unavailable');
        for (const [key, value] of Object.entries(values)) pending.set(key, value);
      },
      async get(key) { if (storageGetGate) await storageGetGate.promise; return { [key]: pending.get(key) }; },
      async remove(key) { pending.delete(key); }
    }, local: { async get() { return {}; }, async set() {} } }
  };
  const context = vm.createContext({
    chrome, URL, Date, String, Error, Number, Array, Set, Object,
    importScripts(name) { assert.equal(name, 'shared/destination.js'); vm.runInContext(destinationSource, context); }
  });
  vm.runInContext(backgroundSource, context, { filename: 'background.js' });
  async function message(message, sender = {}) {
    return await new Promise((resolve) => {
      const keepOpen = listener(message, sender, resolve);
      if (keepOpen !== true) resolve(undefined);
    });
  }
  return {
    message, pending, creates, gets,
    get queried() { return queried; },
    setStorageGetGate(gate) { storageGetGate = gate; }
  };
}

async function testBackground() {
  const destination = loadDestination();
  const urls = [
    'https://chatgpt.com/',
    'https://chatgpt.com/c/conversation-123',
    'https://chatgpt.com/g/workspace-123/project',
    'https://chatgpt.com/g/workspace-codex-workflow/project?topic=codex#notes'
  ];
  for (const url of urls) assert.equal(destination.normalize(url), url, `must preserve ${url}`);
  for (const url of ['https://chatgpt.com/codex', 'https://chatgpt.com/?mode=codex', 'https://chatgpt.com/future-route', 'https://evil.example/c/123']) {
    assert.equal(destination.normalize(url), null, `must reject ${url}`);
  }

  const savedProject = 'https://chatgpt.com/g/g-p-fixture-project/project';
  const projectConversation = 'https://chatgpt.com/g/g-p-fixture-project/c/c-fixture-conversation';
  assert.equal(destination.matches(savedProject, savedProject), true, 'saved Project route must still match exactly');
  assert.equal(destination.matches(savedProject, projectConversation), true, 'saved Project may resolve to a conversation in that same Project');
  assert.equal(destination.matches(savedProject, 'https://chatgpt.com/g/g-p-fixture-other/c/c-fixture-conversation'), false, 'a conversation in another Project must not match');
  assert.equal(destination.matches(savedProject, 'https://chatgpt.com/g/g-p-fixture-project/c/c-fixture-other'), true, 'the Project identity is preserved across its conversation route');
  assert.equal(destination.matches(savedProject, 'https://chatgpt.com/g/g-p-fixture-project/project?source=fixture'), false, 'query changes must remain rejected');
  assert.equal(destination.matches(savedProject, `${projectConversation}?source=fixture`), false, 'query changes on a resolved Project conversation must remain rejected');
  assert.equal(destination.matches(savedProject, `${projectConversation}#fixture`), false, 'fragment changes must remain rejected');
  assert.equal(destination.matches(savedProject, 'https://chatgpt.com/g/g-p-fixture-project/project?mode=codex'), false, 'Codex selector query must remain rejected');
  assert.equal(destination.matches(savedProject, 'https://chatgpt.com/g/g-p-fixture-project/c/c-fixture-conversation?mode=codex'), false, 'Codex selector query on a resolved conversation must remain rejected');
  assert.equal(destination.matches(projectConversation, savedProject), false, 'saved conversation must not broaden to its Project landing');
  assert.equal(destination.matches(projectConversation, 'https://chatgpt.com/g/g-p-fixture-project/c/c-fixture-other'), false, 'saved conversation must not broaden to another conversation');
  assert.equal(destination.matches(projectConversation, 'https://chatgpt.com/'), false, 'saved Project conversation must not broaden to general chat');

  const movingSource = { id: 11, windowId: 7, index: 4 };
  const background = createBackground({ source: movingSource });
  for (const [index, url] of urls.entries()) {
    const opened = await background.message({
      type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: url, sourceTabId: 11
    });
    assert.equal(opened.ok, true);
    assert.equal(opened.tabId, 90);
    assert.equal(background.creates[index].url, url, 'root, conversation, and Project paths must be preserved on actual open');
  }
  movingSource.windowId = 2;
  movingSource.index = 0;
  const moved = await background.message({
    type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: urls[0], sourceTabId: 11
  });
  assert.equal(moved.ok, true);
  assert.equal(JSON.stringify(background.creates[4]), JSON.stringify({
    url: urls[0], active: true, windowId: 2, index: 1, openerTabId: 11, pinned: false
  }), 'a later request must use the source tab latest window and index');
  assert.equal(background.queried, false, 'routing must not query whichever tab is currently active');
  assert.deepEqual(background.gets, [11, 11, 11, 11, 11], 'source position must be freshly resolved for each send');

  for (const invalidUrl of ['https://chatgpt.com/codex', 'https://chatgpt.com/?mode=codex']) {
    const badDestination = await background.message({
      type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: invalidUrl, sourceTabId: 11
    });
    assert.equal(badDestination.ok, false);
  }
  assert.equal(background.creates.length, 5, 'invalid route must not open a fallback destination');

  const closed = createBackground({ failGet: true });
  const closedResult = await closed.message({
    type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: urls[0], sourceTabId: 11
  });
  assert.equal(closedResult.ok, false);
  assert.equal(closed.creates.length, 0, 'closed source must not redirect to an unrelated active tab');
  assert.equal(closed.queried, false);

  const createFailure = createBackground({ failCreate: true });
  const createResult = await createFailure.message({
    type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: urls[0], sourceTabId: 11
  });
  assert.equal(createResult.ok, false);
  assert.equal(createFailure.creates.length, 1);
  assert.equal(createFailure.queried, false);

  const storageFailure = createBackground({ failStorageSet: true });
  const storageResult = await storageFailure.message({
    type: 'OPEN_CHATGPT_WITH_PAYLOAD', payload: 'fixture payload', destinationUrl: urls[0], sourceTabId: 11
  });
  assert.equal(storageResult.ok, false);
  assert.equal(storageFailure.creates.length, 1);
  assert.equal(storageFailure.queried, false);

  const stored = { payload: 'one prompt', createdAt: Date.now(), destinationUrl: urls[1] };
  const pending = createBackground({ initialPending: { pending_44: stored } });
  const sender = { tab: { id: 44 }, frameId: 0, url: urls[1] };
  const got = await pending.message({ type: 'GET_PENDING_PAYLOAD' }, sender);
  assert.equal(got.payload, stored.payload);
  assert.equal(got.destinationUrl, urls[1]);

  const expired = createBackground({ initialPending: { pending_44: { ...stored, createdAt: Date.now() - 11 * 60 * 1000 } } });
  assert.equal((await expired.message({ type: 'GET_PENDING_PAYLOAD' }, sender)).payload, null);
  assert.equal(expired.pending.has('pending_44'), false, 'expired payload should be removed');
  assert.equal((await pending.message({ type: 'GET_PENDING_PAYLOAD' }, { ...sender, frameId: 2 })).payload, null);

  const wrongRoute = createBackground({ initialPending: { pending_44: stored } });
  const refused = await wrongRoute.message({ type: 'CLAIM_PENDING_PAYLOAD' }, { ...sender, url: 'https://chatgpt.com/' });
  assert.equal(refused.ok, false, 'redirected route must not claim');
  assert.equal(wrongRoute.pending.has('pending_44'), true, 'wrong route must leave payload for safe recovery');

  const projectPending = createBackground({ initialPending: {
    pending_44: { ...stored, destinationUrl: savedProject }
  } });
  const projectClaim = await projectPending.message({ type: 'CLAIM_PENDING_PAYLOAD' }, {
    ...sender,
    url: projectConversation
  });
  assert.equal(projectClaim.ok, true, 'real background claim must accept a conversation under the saved Project');
  assert.equal(projectClaim.payload, stored.payload);
  assert.equal(projectPending.pending.has('pending_44'), false, 'accepted same-Project claim consumes the pending payload');

  const otherProjectPending = createBackground({ initialPending: {
    pending_44: { ...stored, destinationUrl: savedProject }
  } });
  const otherProjectClaim = await otherProjectPending.message({ type: 'CLAIM_PENDING_PAYLOAD' }, {
    ...sender,
    url: 'https://chatgpt.com/g/g-p-fixture-other/c/c-fixture-conversation'
  });
  assert.equal(otherProjectClaim.ok, false, 'real background claim must reject another Project');
  assert.equal(otherProjectPending.pending.has('pending_44'), true, 'rejected other-Project claim must preserve pending payload');

  const gate = deferred();
  const concurrent = createBackground({ initialPending: { pending_44: stored } });
  concurrent.setStorageGetGate(gate);
  const first = concurrent.message({ type: 'CLAIM_PENDING_PAYLOAD' }, sender);
  const second = concurrent.message({ type: 'CLAIM_PENDING_PAYLOAD' }, sender);
  gate.resolve();
  const claims = await Promise.all([first, second]);
  assert.equal(claims.filter((claim) => claim.payload === stored.payload).length, 1, 'only one concurrent claimant can consume payload');
  assert.equal(claims.filter((claim) => claim.ok && !claim.payload).length, 1);
  assert.equal(concurrent.pending.has('pending_44'), false);
}

class FakeDate extends Date {
  static tick = 0;
  static now() { FakeDate.tick += 500; return FakeDate.tick; }
}

class FakeElement {
  constructor({ tagName = 'DIV', text = '', attrs = {}, editable = false, value = '', visible = true } = {}) {
    this.tagName = tagName;
    this.textContent = text;
    this.innerText = text;
    this.attrs = { ...attrs };
    this.style = {};
    this.isContentEditable = editable;
    this.disabled = false;
    this.readOnly = false;
    this.value = value;
    this.visible = visible;
    this.events = [];
    this.children = [];
    this.clicks = 0;
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  matches(selector) { return selector === 'textarea' && this.tagName === 'TEXTAREA'; }
  getBoundingClientRect() { return this.visible ? { width: 400, height: 64 } : { width: 0, height: 0 }; }
  closest(selector) { return selector === 'form' ? this.form : null; }
  querySelector(selector) { return this.selectors?.[selector] || (this.mediaOrAttachment && selector.includes('data-testid') ? this.mediaOrAttachment : null); }
  querySelectorAll(selector) { return this.selectorLists?.[selector] || []; }
  contains(node) { return this === node || (node?.parent === this); }
  focus() { this.focused = true; this.onFocus?.(); }
  replaceChildren(node) { this.children = [node]; this.innerText = node.textContent; this.textContent = node.textContent; this.replaceCount = (this.replaceCount || 0) + 1; }
  dispatchEvent(event) { this.events.push(event.type); return true; }
  setAttribute(name, value) { this.attrs[name] = value; }
  remove() { this.removed = true; }
}

function makePage({
  url = 'https://chatgpt.com/g/workspace-123/project', expectedDestination = url, mode = 'ChatGPT', composerText = '', payload = 'sample prompt',
  composerCount = 1, genericEditor = false, dialog = false, login = false, partialInsert = false,
  onClaim = null, claimResult = null, noComposer = false, attachment = false, focusText = '', readOnly = false, ariaReadOnly = false,
  backgroundBridge = null
} = {}) {
  FakeDate.tick = 0;
  const composer = new FakeElement({ attrs: { 'data-testid': 'composer-input', contenteditable: 'true', ...(ariaReadOnly ? { 'aria-readonly': 'true' } : {}) }, editable: true, text: composerText });
  composer.readOnly = readOnly;
  if (attachment) composer.mediaOrAttachment = {};
  if (focusText) composer.onFocus = () => { composer.innerText = focusText; composer.textContent = focusText; };
  const model = new FakeElement({ text: mode, attrs: { 'data-testid': 'model-switcher-dropdown-button' } });
  const send = new FakeElement({ attrs: { 'data-testid': 'send-button' } });
  send.click = () => { send.clicks += 1; };
  const background = new FakeElement();
  const form = new FakeElement({ tagName: 'FORM' });
  composer.form = form;
  composer.parent = background;
  form.selectors = { '#composer-background': background };
  background.contains = (node) => node === composer;
  form.selectorLists = { '[data-testid="send-button"], [data-testid="composer-send-button"]': [send] };
  let candidates = noComposer ? [] : Array.from({ length: composerCount }, (_, i) => i === 0 ? composer : new FakeElement({ attrs: { 'data-testid': 'composer-input', contenteditable: 'true' }, editable: true }));
  let controls = [model];
  let dialogs = dialog ? [new FakeElement({ attrs: { role: 'dialog' } })] : [];
  if (login) dialogs.push(new FakeElement({ tagName: 'INPUT', attrs: { type: 'password' } }));
  const generic = new FakeElement({ attrs: { contenteditable: 'true' }, editable: true });
  let execCalls = 0;
  const toasts = [];
  const messages = [];
  let pending = { ok: true, payload, destinationUrl: expectedDestination };
  let claimCount = 0;
  let clearCount = 0;
  function applyClaimChange() {
    if (onClaim) onClaim(composer, {
      setMode(value) { model.textContent = value; model.innerText = value; },
      setUrl(value) { page.location.href = value; }
    });
  }
  const runtime = {
    async sendMessage(message) {
      messages.push(message.type);
      if (backgroundBridge) {
        if (message.type === 'CLAIM_PENDING_PAYLOAD') applyClaimChange();
        return backgroundBridge(message, { tab: { id: 90 }, frameId: 0, url: page.location.href });
      }
      if (message.type === 'GET_PENDING_PAYLOAD') return pending;
      if (message.type === 'CLAIM_PENDING_PAYLOAD') {
        claimCount += 1;
        applyClaimChange();
        if (claimResult) return claimResult;
        pending = { ...pending, payload: null };
        return { ok: true, payload, destinationUrl: expectedDestination };
      }
      if (message.type === 'CLEAR_PENDING_PAYLOAD') { clearCount += 1; pending = { ...pending, payload: null }; return { ok: true }; }
      throw new Error(`Unexpected message ${message.type}`);
    }
  };
  const page = {
    location: { href: url },
    composer, model, send, generic,
    get execCalls() { return execCalls; },
    get toasts() { return toasts.map((toast) => toast.textContent); },
    get claimCount() { return claimCount; },
    get clearCount() { return clearCount; },
    get messages() { return messages; },
    get pending() { return pending; },
    setCandidates(value) { candidates = value; }
  };
  const document = {
    querySelectorAll(selector) {
      if (selector === '[data-testid="model-switcher-dropdown-button"]') return controls;
      if (selector.includes('[data-testid="model-switcher-dropdown-button"]') && selector.includes('form button')) return controls;
      if (selector === '#prompt-textarea, [data-testid="composer-input"]') return candidates;
      if (selector === 'form div[contenteditable="true"]' && genericEditor) return [generic];
      if (selector === '[role="dialog"], input[type="password"], form[action*="login"]') return dialogs;
      if (selector.includes('[aria-pressed="true"]') || selector.includes('header button')) return [];
      return [];
    },
    createRange() { return { selectNodeContents() {} }; },
    createTextNode(text) { return { textContent: text }; },
    execCommand(command, _ui, text) {
      execCalls += 1;
      if (partialInsert) { composer.innerText = text.slice(0, 8); composer.textContent = composer.innerText; return true; }
      return false;
    },
    getElementById(id) { return id === 'yt2gpt-toast' ? toasts.at(-1) : null; },
    createElement() { const element = new FakeElement(); toasts.push(element); return element; },
    documentElement: { appendChild() {} }
  };
  const selection = { removeAllRanges() {}, addRange() {} };
  const window = { __YT2GPT_CHATGPT_INSTALLED__: false, getSelection() { return selection; } };
  const context = vm.createContext({
    window, document, chrome: { runtime }, location: page.location,
    URL, Date: FakeDate, String, Error, Number, Array, Object, Set, RegExp, Promise,
    HTMLTextAreaElement: class {}, HTMLInputElement: class {},
    InputEvent: class { constructor(type) { this.type = type; } },
    Event: class { constructor(type) { this.type = type; } },
    getComputedStyle: () => ({ display: 'block', visibility: 'visible' }),
    setTimeout(fn, ms) { if (ms === 500) fn(); return 1; }, clearTimeout() {}, console: { warn() {} }
  });
  vm.runInContext(destinationSource, context, { filename: 'shared/destination.js' });
  vm.runInContext(injectorSource, context, { filename: 'chatgpt/content.js' });
  return { page, context, document, composer, model, send, generic, form, background };
}

async function settle() { await new Promise((resolve) => setImmediate(resolve)); }

async function testInjector() {
  const valid = makePage({ genericEditor: true });
  await settle();
  assert.equal(valid.composer.innerText, 'sample prompt');
  assert.equal(valid.composer.replaceCount, 1);
  assert.equal(valid.page.claimCount, 1);
  assert.equal(valid.page.send.clicks, 0, 'injector must never submit the prompt');
  assert.match(valid.page.toasts.join(' '), /press Send/);
  assert.equal(valid.generic.innerText, '', 'unrelated editable must remain untouched');

  const route = 'https://chatgpt.com/g/g-p-fixture-project/project';
  const conversation = 'https://chatgpt.com/g/g-p-fixture-project/c/c-fixture-conversation';
  const handoff = createBackground({ initialPending: {
    pending_90: { payload: 'sample prompt', createdAt: Date.now(), destinationUrl: route }
  } });
  const backgroundCalls = [];
  const bridge = async (message, sender) => {
    backgroundCalls.push(message.type);
    return handoff.message(message, sender);
  };
  const connected = makePage({ url: conversation, expectedDestination: route, backgroundBridge: bridge });
  await settle();
  assert.equal(connected.composer.innerText, 'sample prompt');
  assert.equal(connected.composer.replaceCount, 1);
  assert.equal(handoff.pending.has('pending_90'), false, 'actual claim must consume the pending payload');
  assert.equal(backgroundCalls.filter((type) => type === 'CLAIM_PENDING_PAYLOAD').length, 1);

  const exactHandoff = createBackground({ initialPending: {
    pending_90: { payload: 'sample prompt', createdAt: Date.now(), destinationUrl: route }
  } });
  const exactConnected = makePage({
    url: route,
    expectedDestination: route,
    backgroundBridge: (message, sender) => exactHandoff.message(message, sender)
  });
  await settle();
  assert.equal(exactConnected.composer.innerText, 'sample prompt', 'exact saved Project route must retain the existing happy path');
  assert.equal(exactHandoff.pending.has('pending_90'), false);

  const reload = makePage({ url: conversation, expectedDestination: route, backgroundBridge: bridge });
  // A new document uses the real listener again after the first claim consumed session state.
  await settle();
  assert.equal(reload.composer.innerText, '');
  assert.equal(reload.page.claimCount, 0);
  assert.equal(backgroundCalls.filter((type) => type === 'CLAIM_PENDING_PAYLOAD').length, 1, 'reload must not claim or insert again');

  const routeChangeHandoff = createBackground({ initialPending: {
    pending_90: { payload: 'sample prompt', createdAt: Date.now(), destinationUrl: route }
  } });
  let changedRouteDuringClaim;
  const routeChangeBridge = async (message, sender) => {
    const response = await routeChangeHandoff.message(message, sender);
    if (message.type === 'CLAIM_PENDING_PAYLOAD' && response?.ok && response.payload) {
      changedRouteDuringClaim.page.location.href = 'https://chatgpt.com/';
    }
    return response;
  };
  changedRouteDuringClaim = makePage({
    url: conversation,
    expectedDestination: route,
    backgroundBridge: routeChangeBridge
  });
  await settle();
  assert.equal(changedRouteDuringClaim.composer.replaceCount || 0, 0, 'route change during claim must block insertion');
  assert.equal(changedRouteDuringClaim.page.send.clicks, 0, 'route change during claim must never submit');
  assert.match(changedRouteDuringClaim.page.toasts.join(' '), /clipboard|paste/i, 'route change during claim must show clipboard fallback');
  assert.equal(routeChangeHandoff.pending.has('pending_90'), false, 'successful real claim consumes payload before the post-claim route check');

  const projectDraft = makePage({
    url: conversation,
    expectedDestination: route,
    composerText: 'existing draft'
  });
  await settle();
  assert.equal(projectDraft.composer.innerText, 'existing draft', 'same-Project conversation transition must leave an existing draft untouched');
  assert.equal(projectDraft.page.claimCount, 0, 'existing draft must prevent claiming on a same-Project transition');

  const projectCodex = makePage({
    url: conversation,
    expectedDestination: route,
    mode: 'Codex'
  });
  await settle();
  assert.equal(projectCodex.composer.replaceCount || 0, 0, 'same-Project transition must not bypass the Codex guard');
  assert.match(projectCodex.page.toasts.join(' '), /Codex/i);

  for (const scenario of [
    { name: 'Codex selected at same Project conversation', options: { url: conversation, expectedDestination: route, mode: 'Codex' } },
    { name: 'Project redirect to general root', options: { url: 'https://chatgpt.com/', expectedDestination: 'https://chatgpt.com/g/g-p-fixture-project/project' } },
    { name: 'sign-in dialog', options: { login: true } },
    { name: 'blocking dialog', options: { dialog: true } },
    { name: 'generic editor only', options: { noComposer: true, genericEditor: true } },
    { name: 'ambiguous composer candidates', options: { composerCount: 2 } }
  ]) {
    const fixture = makePage(scenario.options);
    await settle();
    assert.equal(fixture.composer.replaceCount || 0, 0, `${scenario.name}: must not insert`);
    assert.equal(fixture.generic.innerText, '', `${scenario.name}: unrelated editor must remain untouched`);
    assert.equal(fixture.page.send.clicks, 0, `${scenario.name}: must not send`);
    assert.ok(fixture.page.toasts.length > 0, `${scenario.name}: must show visible fallback`);
    assert.match(fixture.page.toasts.join(' '), /clipboard|paste|destination|Codex|dialog|verified/i, `${scenario.name}: fallback explains next action`);
  }

  const draft = makePage({ composerText: 'my existing draft' });
  await settle();
  assert.equal(draft.composer.innerText, 'my existing draft');
  assert.equal(draft.page.claimCount, 0, 'draft should be checked before consuming a handoff');
  assert.match(draft.page.toasts.join(' '), /existing draft was left untouched/);

  const attachmentDraft = makePage({ attachment: true });
  await settle();
  assert.equal(attachmentDraft.composer.replaceCount || 0, 0, 'existing attachment must count as a draft');
  assert.match(attachmentDraft.page.toasts.join(' '), /existing draft was left untouched/);

  const readonly = makePage({ readOnly: true });
  await settle();
  assert.equal(readonly.composer.replaceCount || 0, 0, 'read-only composer must not be used');
  assert.ok(readonly.page.toasts.length > 0);

  const ariaReadonly = makePage({ ariaReadOnly: true });
  await settle();
  assert.equal(ariaReadonly.composer.replaceCount || 0, 0, 'aria-readonly composer must not be used');

  const focusRestore = makePage({ focusText: 'draft restored on focus' });
  await settle();
  assert.equal(focusRestore.composer.innerText, 'draft restored on focus');
  assert.equal(focusRestore.composer.replaceCount || 0, 0, 'draft restored by focus must survive');
  assert.match(focusRestore.page.toasts.join(' '), /could not be confirmed|clipboard/i);

  const changedDraft = makePage({ onClaim(composer) { composer.innerText = 'draft restored during claim'; composer.textContent = composer.innerText; } });
  await settle();
  assert.equal(changedDraft.composer.innerText, 'draft restored during claim');
  assert.equal(changedDraft.composer.replaceCount || 0, 0);
  assert.match(changedDraft.page.toasts.join(' '), /draft changed/);
  assert.equal(changedDraft.page.send.clicks, 0);

  const partial = makePage({ partialInsert: true });
  await settle();
  assert.equal(partial.composer.innerText, 'sample p', 'partial framework insert should remain visible for review');
  assert.equal(partial.composer.replaceCount || 0, 0, 'do not overwrite a partial insert with a second attempt');
  assert.equal(partial.page.claimCount, 1);
  assert.equal(partial.page.send.clicks, 0);
  assert.match(partial.page.toasts.join(' '), /could not be confirmed.*clipboard/i);

  const changedMode = makePage({ onClaim(_composer, controls) { controls.setMode('Codex'); } });
  await settle();
  assert.equal(changedMode.composer.replaceCount || 0, 0, 'recheck product mode after asynchronous claim');
  assert.match(changedMode.page.toasts.join(' '), /page or draft changed/);
}

await testBackground();
await testInjector();
console.log('PASS: routing, source-tab placement, pending claims, destination checks, and safe composer insertion.');

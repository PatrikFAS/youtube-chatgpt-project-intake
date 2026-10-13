'use strict';

importScripts('shared/destination.js');

const CHATGPT_ORIGIN = 'https://chatgpt.com';
const PENDING_PREFIX = 'pending_';
const PENDING_TTL_MS = 10 * 60 * 1000;
const claimingTabs = new Set();

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(['destinations', 'lastMode', 'lastDestinationId']);
  const destinations = Array.isArray(current.destinations) ? current.destinations : [];

  if (!destinations.some((d) => d.id === 'general')) {
    destinations.unshift({
      id: 'general',
      name: 'General ChatGPT',
      url: `${CHATGPT_ORIGIN}/`,
      builtIn: true
    });
  }

  await chrome.storage.local.set({
    destinations,
    lastMode: current.lastMode || 'apply',
    lastDestinationId: current.lastDestinationId || 'general'
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'OPEN_CHATGPT_WITH_PAYLOAD') {
    handleOpenChatGPT(message)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message.type === 'GET_PENDING_PAYLOAD') {
    getPendingForSender(sender)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message.type === 'CLAIM_PENDING_PAYLOAD') {
    claimPendingForSender(sender)
      .then(sendResponse)
      .catch(() => sendResponse({ ok: false, error: 'Could not claim the handoff. Use the clipboard fallback.' }));
    return true;
  }

  if (message.type === 'CLEAR_PENDING_PAYLOAD') {
    clearPendingForSender(sender)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }
});

async function handleOpenChatGPT(message) {
  const payload = typeof message.payload === 'string' ? message.payload : '';
  const destinationUrl = normalizeChatGPTUrl(message.destinationUrl);

  if (!payload) throw new Error('Prompt payload is empty.');
  if (!destinationUrl) throw new Error(YT2GPTDestination.REPAIR);

  if (!Number.isInteger(message.sourceTabId) || message.sourceTabId < 0) {
    throw new Error('The originating YouTube tab is unavailable. Return to that video and try again.');
  }

  let source;
  try {
    source = await chrome.tabs.get(message.sourceTabId);
  } catch {
    throw new Error('The originating YouTube tab was closed. Open the intended ChatGPT destination and paste the copied prompt.');
  }
  if (source?.id !== message.sourceTabId || !Number.isInteger(source.windowId) || !Number.isInteger(source.index)) {
    throw new Error('Could not locate the originating YouTube tab. The prompt can be pasted into the intended ChatGPT destination.');
  }

  let tab;
  try {
    // Resolve the captured source now, after caption extraction. Another active
    // tab/window must never become the opener by accident.
    tab = await chrome.tabs.create({
      url: destinationUrl,
      active: true,
      windowId: source.windowId,
      index: source.index + 1,
      openerTabId: source.id,
      pinned: false
    });
  } catch {
    throw new Error('Could not open ChatGPT beside the YouTube tab. Open the intended destination and paste the copied prompt.');
  }
  if (!Number.isInteger(tab?.id) || tab.id < 0) throw new Error('Could not open ChatGPT tab. Paste the copied prompt into the intended destination.');

  const key = `${PENDING_PREFIX}${tab.id}`;
  try {
    await chrome.storage.session.set({
      [key]: { payload, createdAt: Date.now(), destinationUrl }
    });
  } catch {
    throw new Error('ChatGPT opened, but automatic insertion could not be prepared. Paste the copied prompt into the intended destination.');
  }

  return { ok: true, tabId: tab.id };
}

function normalizeChatGPTUrl(value) {
  return YT2GPTDestination.normalize(value);
}

async function getPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!Number.isInteger(tabId) || tabId < 0 || (sender.frameId ?? 0) !== 0) return { ok: true, payload: null };

  const key = `${PENDING_PREFIX}${tabId}`;
  const result = await chrome.storage.session.get(key);
  const pending = result[key];

  if (!pending) return { ok: true, payload: null };

  if (!pending.createdAt || Date.now() - pending.createdAt > PENDING_TTL_MS) {
    await chrome.storage.session.remove(key);
    return { ok: true, payload: null };
  }

  return { ok: true, payload: pending.payload, createdAt: pending.createdAt, destinationUrl: pending.destinationUrl };
}

async function claimPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (claimingTabs.has(tabId)) return { ok: true, payload: null };
  claimingTabs.add(tabId);
  try {
    const pending = await getPendingForSender(sender);
    if (!pending.payload) return pending;
    if (!YT2GPTDestination.matches(pending.destinationUrl, sender.url)) {
      return { ok: false, error: YT2GPTDestination.REPAIR };
    }
    // Consume before editing so a reload or second document cannot insert twice.
    await clearPendingForSender(sender);
    return pending;
  } finally {
    claimingTabs.delete(tabId);
  }
}

async function clearPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!Number.isInteger(tabId) || tabId < 0 || (sender.frameId ?? 0) !== 0) return;
  await chrome.storage.session.remove(`${PENDING_PREFIX}${tabId}`);
}

'use strict';

const CHATGPT_ORIGIN = 'https://chatgpt.com';
const PENDING_PREFIX = 'pending_';
const PENDING_TTL_MS = 10 * 60 * 1000;

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
  if (!destinationUrl) throw new Error('Destination must be a chatgpt.com URL.');

  const tab = await chrome.tabs.create({ url: destinationUrl, active: true });
  if (!tab?.id) throw new Error('Could not open ChatGPT tab.');

  const key = `${PENDING_PREFIX}${tab.id}`;
  await chrome.storage.session.set({
    [key]: {
      payload,
      createdAt: Date.now(),
      destinationUrl
    }
  });

  return { ok: true, tabId: tab.id };
}

function normalizeChatGPTUrl(value) {
  try {
    const url = new URL(String(value || ''));
    if (url.origin !== CHATGPT_ORIGIN) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function getPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return { ok: true, payload: null };

  const key = `${PENDING_PREFIX}${tabId}`;
  const result = await chrome.storage.session.get(key);
  const pending = result[key];

  if (!pending) return { ok: true, payload: null };

  if (!pending.createdAt || Date.now() - pending.createdAt > PENDING_TTL_MS) {
    await chrome.storage.session.remove(key);
    return { ok: true, payload: null };
  }

  return { ok: true, payload: pending.payload, createdAt: pending.createdAt };
}

async function clearPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return;
  await chrome.storage.session.remove(`${PENDING_PREFIX}${tabId}`);
}

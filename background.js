'use strict';

importScripts('shared/destination.js');
importScripts('shared/collection.js');
let collectionQueue = Promise.resolve();

const PENDING_PREFIX = 'pending_';
const PENDING_TTL_MS = 10 * 60 * 1000;
const claimingTabs = new Set();
let explicitSendQueue = Promise.resolve();
function serializeExplicitSend(work) {
  const result = explicitSendQueue.then(work);
  explicitSendQueue = result.catch(() => {});
  return result;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(['destinations', 'lastMode', 'lastDestinationId']);
  const destinations = YT2GPTDestination.withBuiltIns(current.destinations);

  await chrome.storage.local.set({
    destinations,
    lastMode: current.lastMode || 'apply',
    lastDestinationId: current.lastDestinationId || 'general'
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;
  if (['COLLECTION_GET','COLLECTION_ADD','COLLECTION_REMOVE','COLLECTION_CLEAR','COLLECTION_MOVE'].includes(message.type)) {
    const task = collectionQueue.then(() => handleCollection(message,sender));
    collectionQueue = task.catch(() => {});
    task.then(sendResponse).catch(error=>sendResponse({ok:false,error:String(error.message||error)}));
    return true;
  }

  if (message.type === 'OPEN_CHATGPT_WITH_EXPLICIT_SEND') {
    serializeExplicitSend(() => prepareExplicitSend(message, sender))
      .then(sendResponse).catch(error => sendResponse({ ok: false, error: String(error.message || error) }));
    return true;
  }
  if (message.type === 'AUTHORIZE_CHATGPT_SEND_ONCE') {
    serializeExplicitSend(() => authorizeExplicitSend(message, sender))
      .then(sendResponse).catch(() => sendResponse({ ok: false, reason:'AUTH_STORAGE' }));
    return true;
  }

  if (message.type === 'OPEN_DESTINATION_WITH_PAYLOAD' || message.type === 'OPEN_CHATGPT_WITH_PAYLOAD') {
    handleOpenDestination({ ...message, explicitSendKey: null })
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

async function handleOpenDestination(message) {
  const payload = typeof message.payload === 'string' ? message.payload : '';
  const destinationUrl = YT2GPTDestination.normalize(message.destinationUrl);

  if (!payload) throw new Error('Prompt payload is empty.');
  if (!destinationUrl) throw new Error(YT2GPTDestination.REPAIR);

  if (!Number.isInteger(message.sourceTabId) || message.sourceTabId < 0) {
    throw new Error('The originating YouTube tab is unavailable. Return to that video and try again.');
  }

  let source;
  try {
    source = await chrome.tabs.get(message.sourceTabId);
  } catch {
    throw new Error('The originating YouTube tab was closed. Open the intended destination and paste the copied prompt.');
  }
  if (source?.id !== message.sourceTabId || !Number.isInteger(source.windowId) || !Number.isInteger(source.index)) {
    throw new Error('Could not locate the originating YouTube tab. The prompt can be pasted into the intended destination.');
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
    throw new Error('Could not open the destination beside the YouTube tab. Open the intended destination and paste the copied prompt.');
  }
  if (!Number.isInteger(tab?.id) || tab.id < 0) throw new Error('Could not open the destination tab. Paste the copied prompt into the intended destination.');

  // Oversized Collection exports open only; never prepare insertion/Send.
  if (message.manualOnly === true || (message.collection === true && payload.length > YT2GPTCollection.MAX_INSERT)) return {ok:true,tabId:tab.id,manualOnly:true};

  const key = `${PENDING_PREFIX}${tab.id}`;
  try {
    await chrome.storage.session.set({
      [key]: { payload, createdAt: Date.now(), destinationUrl,
        ...(message.explicitSendKey ? { explicitSendKey: message.explicitSendKey } : {}) }
    });
  } catch {
    throw new Error('The destination opened, but automatic insertion could not be prepared. Paste the copied prompt into the intended destination.');
  }

  return { ok: true, tabId: tab.id };
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

  return { ok: true, payload: pending.payload, createdAt: pending.createdAt, destinationUrl: pending.destinationUrl,
    ...(pending.explicitSendKey ? { explicitSendKey: pending.explicitSendKey } : {}) };
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
    if (pending.explicitSendKey) {
      const result = await serializeExplicitSend(async () => {
        const key = pending.explicitSendKey;
        const record = (await chrome.storage.session.get(key))[key];
        if (!sender.documentId || sender.frameId !== 0 || !record || record.state !== 'prepared' || record.tabId !== tabId ||
            YT2GPTDestination.normalize(sender.url) !== record.destinationUrl) return false;
        await chrome.storage.session.set({ [key]: { ...record, state: 'claimed', documentId: sender.documentId } });
        return true;
      });
      if (!result) { delete pending.explicitSendKey; pending.sendSuppressed = true; }
    }
    return pending;
  } finally {
    claimingTabs.delete(tabId);
  }
}

async function prepareExplicitSend(message, sender) {
  if (sender.url !== chrome.runtime.getURL('popup/popup.html') || sender.tab || message.collection === true) {
    throw new Error('Send must be chosen explicitly in the YouTube popup. Use Open for manual review.');
  }
  const destinationUrl = YT2GPTDestination.normalize(message.destinationUrl);
  const enabled = (await chrome.storage.local.get('chatgptExplicitSendEnabled')).chatgptExplicitSendEnabled === true;
  if (!enabled || YT2GPTDestination.provider(destinationUrl) !== 'chatgpt') throw new Error('Explicit Send is enabled only for opted-in ChatGPT videos.');
  const source = await chrome.tabs.get(message.sourceTabId);
  const sourceUrl = new URL(source.url);
  if (sourceUrl.protocol !== 'https:' || !['www.youtube.com','youtube.com','m.youtube.com'].includes(sourceUrl.hostname) || sourceUrl.pathname !== '/watch' ||
      !message.videoId || sourceUrl.searchParams.get('v') !== message.videoId) throw new Error('The source video changed. Use Open for manual review.');
  if (typeof message.payload !== 'string' || !message.payload.trim()) throw new Error('Prompt payload is empty.');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([destinationUrl,message.videoId,message.payload])));
  const key = 'explicit_send_' + [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('');
  if ((await chrome.storage.session.get(key))[key]) throw new Error('This prompt already has a Send request in this browser session. Use Open and review manually; no automatic retry.');
  // Reserve before opening. Failures/uncertain attempts remain reserved until
  // session end; never silently retry a send or evict a deduplication record.
  const record = { state:'reserved', destinationUrl, createdAt:Date.now() };
  await chrome.storage.session.set({ [key]:record });
  const opened = await handleOpenDestination({ ...message, destinationUrl, explicitSendKey:key });
  await chrome.storage.session.set({ [key]: { ...record, state:'prepared', tabId:opened.tabId } });
  return opened;
}

async function handleCollection(message,sender) {
  if (sender.url !== chrome.runtime.getURL('popup/popup.html') || sender.tab) throw Error('Open Collection from the extension popup.');
  if (!chrome.storage.session) throw Error('Session storage is unavailable. Single-video handoff remains available.');
  const key=YT2GPTCollection.KEY, saved=(await chrome.storage.session.get(key))[key];
  const state=saved || YT2GPTCollection.empty();
  if(state.version!==1 || !Array.isArray(state.items) || !Number.isInteger(state.revision) || !Number.isInteger(state.generation)) throw Error('Collection data is not recognized. No existing data was changed.');
  if(state.items.length){state.items.forEach(item=>YT2GPTCollection.normalize(item));YT2GPTCollection.build(state.items,'',true);}
  if(message.type==='COLLECTION_GET')return {ok:true,state};
  if(message.type==='COLLECTION_ADD') {
    const source=await chrome.tabs.get(message.sourceTabId);
    if(YT2GPTCollection.videoId(source.url)!==message.item?.videoId) throw Error('The source video changed. Nothing was added.');
  }
  const next=YT2GPTCollection.mutate(state,message);
  await chrome.storage.session.set({[key]:next});
  return {ok:true,state:next};
}

async function authorizeExplicitSend(message, sender) {
  const key = message.explicitSendKey;
  if (typeof key !== 'string' || !/^explicit_send_[a-f0-9]{64}$/.test(key) || sender.frameId !== 0 || !sender.documentId) return {ok:false,reason:'AUTH_CONTEXT'};
  const record = (await chrome.storage.session.get(key))[key];
  if (!record || record.state !== 'claimed') return {ok:false,reason:'AUTH_RECORD'};
  if (record.tabId !== sender.tab?.id || record.documentId !== sender.documentId) return {ok:false,reason:'AUTH_CONTEXT'};
  if (YT2GPTDestination.provider(record.destinationUrl) !== 'chatgpt' || YT2GPTDestination.normalize(sender.url) !== record.destinationUrl) return {ok:false,reason:'AUTH_DESTINATION'};
  if (Date.now()-record.createdAt > PENDING_TTL_MS) return {ok:false,reason:'AUTH_EXPIRED'};
  if ((await chrome.storage.local.get('chatgptExplicitSendEnabled')).chatgptExplicitSendEnabled !== true) return {ok:false,reason:'AUTH_DISABLED'};
  // Persist the irreversible attempt boundary BEFORE granting the one click.
  // A crash/reload/changed control after this point always means manual review.
  await chrome.storage.session.set({[key]:{...record,state:'attempted'}});
  return {ok:true};
}

async function clearPendingForSender(sender) {
  const tabId = sender?.tab?.id;
  if (!Number.isInteger(tabId) || tabId < 0 || (sender.frameId ?? 0) !== 0) return;
  await chrome.storage.session.remove(`${PENDING_PREFIX}${tabId}`);
}

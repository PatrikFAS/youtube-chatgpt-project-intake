'use strict';

(() => {
  if (window.__YT2GPT_CHATGPT_INSTALLED__) return;
  window.__YT2GPT_CHATGPT_INSTALLED__ = true;

  const MAX_WAIT_MS = 30000;
  const POLL_MS = 500;

  attemptPendingInsert();

  async function attemptPendingInsert() {
    const started = Date.now();
    let pending = null;

    while (Date.now() - started < MAX_WAIT_MS) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_PAYLOAD' });
        if (response?.ok && response.payload) {
          pending = response.payload;
          break;
        }
      } catch {}
      await sleep(POLL_MS);
    }

    if (!pending) return;

    const insertStarted = Date.now();
    while (Date.now() - insertStarted < MAX_WAIT_MS) {
      const composer = findComposer();
      if (composer) {
        const ok = insertIntoComposer(composer, pending);
        if (ok) {
          showToast('YouTube → ChatGPT: prompt inserted. Review it, then press Send.');
          await clearPending();
          return;
        }
      }
      await sleep(POLL_MS);
    }

    showToast('YouTube → ChatGPT: automatic insertion failed. The prompt is already on your clipboard; press Ctrl+V.', true);
    await clearPending();
  }

  function findComposer() {
    const selectors = [
      '#prompt-textarea',
      '[data-testid="composer-input"]',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[contenteditable="true"].ProseMirror',
      'form div[contenteditable="true"]',
      'textarea[placeholder*="Message"]',
      'form textarea'
    ];

    for (const selector of selectors) {
      const nodes = [...document.querySelectorAll(selector)];
      const visible = nodes.find(isVisibleAndEditable);
      if (visible) return visible;
    }
    return null;
  }

  function isVisibleAndEditable(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (rect.width < 20 || rect.height < 10 || style.display === 'none' || style.visibility === 'hidden') return false;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    return el.matches('textarea,input') || el.getAttribute('contenteditable') === 'true' || el.isContentEditable;
  }

  function insertIntoComposer(el, text) {
    try {
      el.focus();

      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        setNativeValue(el, text);
        dispatchInput(el, text);
        return verifyInserted(el, text);
      }

      // Prefer browser-native editing because React/ProseMirror/Lexical are more
      // likely to observe real editing events than a bare textContent mutation.
      selectAllContents(el);
      let inserted = false;
      try {
        inserted = document.execCommand('insertText', false, text);
      } catch {}

      if (!inserted || !verifyInserted(el, text)) {
        // Fallback: replace DOM content, then emit input events. This is not as
        // robust as native editing but keeps the clipboard fallback available.
        el.replaceChildren(document.createTextNode(text));
        dispatchInput(el, text);
      }

      return verifyInserted(el, text);
    } catch (error) {
      console.warn('YT2GPT insertion failed', error);
      return false;
    }
  }

  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor?.set) descriptor.set.call(el, value);
    else el.value = value;
  }

  function dispatchInput(el, text) {
    try {
      el.dispatchEvent(new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
      }));
    } catch {}

    try {
      el.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: text
      }));
    } catch {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function selectAllContents(el) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function verifyInserted(el, text) {
    const actual = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement
      ? el.value
      : (el.innerText || el.textContent || '');

    const probe = text.replace(/\s+/g, ' ').trim().slice(0, 80);
    const normalizedActual = String(actual || '').replace(/\s+/g, ' ').trim();
    return probe.length > 0 && normalizedActual.includes(probe.slice(0, Math.min(50, probe.length)));
  }

  async function clearPending() {
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_PENDING_PAYLOAD' });
    } catch {}
  }

  function showToast(message, isError = false) {
    const existing = document.getElementById('yt2gpt-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'yt2gpt-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed',
      'right:18px',
      'bottom:18px',
      'z-index:2147483647',
      'max-width:420px',
      'padding:11px 14px',
      'border-radius:10px',
      `background:${isError ? '#5b2424' : '#202123'}`,
      'color:#fff',
      'font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif',
      'box-shadow:0 8px 28px rgba(0,0,0,.25)'
    ].join(';');

    document.documentElement.appendChild(toast);
    setTimeout(() => toast.remove(), isError ? 9000 : 5000);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();

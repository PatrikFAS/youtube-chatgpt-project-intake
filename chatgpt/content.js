'use strict';

(() => {
  if (window.__YT2GPT_CHATGPT_INSTALLED__) return;
  window.__YT2GPT_CHATGPT_INSTALLED__ = true;

  const MAX_WAIT_MS = 30000;
  const POLL_MS = 500;
  const COMPOSER_SELECTOR = '#prompt-textarea, [data-testid="composer-input"], form[data-chatgpt-composer] [data-composer-input] [data-composer-markdown][role="textbox"][aria-multiline="true"][contenteditable="true"]';

  attemptPendingInsert();

  async function attemptPendingInsert() {
    const started = Date.now();
    let pending = null;

    while (Date.now() - started < MAX_WAIT_MS) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_PAYLOAD' });
        if (response?.ok && response.payload) {
          pending = response;
          break;
        }
      } catch {}
      await sleep(POLL_MS);
    }

    if (!pending) return;

    const insertStarted = Date.now();
    while (Date.now() - insertStarted < MAX_WAIT_MS) {
      const problem = destinationProblem(pending.destinationUrl);
      if (problem) return failVisible(problem);
      const composer = findComposer();
      if (composer) {
        if (hasDraft(composer) || (pending.explicitSendKey && unsafeForSend(composer, true))) {
          return failVisible('Your existing draft was left untouched. Review it before pasting the copied prompt.', false);
        }
        let claimed;
        try {
          claimed = await chrome.runtime.sendMessage({ type: 'CLAIM_PENDING_PAYLOAD' });
        } catch {
          return failVisible('The handoff could not be claimed safely.');
        }
        if (!claimed?.ok) return failVisible('The destination changed or the handoff could not be claimed safely.');
        if (!claimed.payload) return; // Already consumed by another document.

        // Claiming involves asynchronous storage. Recheck mode, route, composer
        // identity and draft immediately before the single editing attempt.
        if (destinationProblem(claimed.destinationUrl) || findComposer() !== composer || hasDraft(composer)) {
          return failVisible('The page or draft changed while preparing the prompt. Nothing was inserted.', false);
        }
        const ok = insertIntoComposer(composer, claimed.payload, claimed.destinationUrl, Boolean(claimed.explicitSendKey));
        if (ok && claimed.explicitSendKey) await sendExplicitlyOnce(composer, claimed);
        else if (ok) showToast(`YouTube AI Bridge: prompt inserted in ChatGPT. ${claimed.sendSuppressed ? 'Explicit Send was withheld because the exact page or document could not be confirmed. ' : ''}Review it, then press Send.`);
        else showToast('YouTube AI Bridge: ChatGPT insertion could not be confirmed. Check the composer before pasting; the complete prompt remains on your clipboard.', true);
        return;
      }
      await sleep(POLL_MS);
    }

    await failVisible('This ChatGPT message box could not be recognized. Your saved destination was kept.', false);
  }

  function destinationProblem(expected) {
    if (!YT2GPTDestination.matches(expected, location.href)) {
      return 'The opened page does not match the saved ChatGPT destination.';
    }
    if (hasCodexMode()) return 'Codex is selected on this page.';
    if ([...document.querySelectorAll('[role="dialog"], input[type="password"], form[action*="login"]')].some(isVisible)) {
      return 'A dialog or sign-in screen needs your attention.';
    }
    return '';
  }

  function hasCodexMode() {
    // Inspect selected controls and composer/header product controls. A sidebar
    // link advertising Codex is not evidence that the active composer is Codex.
    const controls = document.querySelectorAll([
      '[aria-pressed="true"]', '[aria-selected="true"]', 'select',
      '[data-testid="model-switcher-dropdown-button"]',
      '[data-testid="product-switcher"]',
      'header button[aria-haspopup]', 'form button',
      'form [data-testid*="codex"]'
    ].join(','));
    return [...controls].some((el) => {
      if (!isVisible(el)) return false;
      const text = el.tagName === 'SELECT'
        ? [...el.selectedOptions].map((o) => o.textContent).join(' ')
        : `${el.textContent || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('data-testid') || ''}`;
      return /\bcodex\b/i.test(text);
    });
  }

  function findComposer() {
    // Positive ChatGPT evidence is required alongside the expected URL. Never
    // use generic textareas, ProseMirror/Lexical editors or placeholders alone.
    const candidates = [...document.querySelectorAll(COMPOSER_SELECTOR)].filter(isVisibleAndEditable);
    if (candidates.length !== 1) return null;
    const composer = candidates[0];
    const form = composer.closest('form');
    if (!form) return null;

    // Verified Project-page markup identifies the ChatGPT form and its editor
    // explicitly. Its model label can be "Pro", and an empty editor shows
    // "Start Voice" instead of Send. Neither label is used as editor identity.
    if (form.getAttribute('data-chatgpt-composer') !== null) {
      const body = form.querySelector('[data-composer-body]');
      const input = form.querySelector('[data-composer-input]');
      const modelControls = [...form.querySelectorAll('button[aria-label="Select ChatGPT model"]')].filter(isVisible);
      if (!body?.contains(composer) || !input?.contains(composer) || modelControls.length !== 1) return null;
      return composer;
    }

    const modelControls = [...document.querySelectorAll('[data-testid="model-switcher-dropdown-button"]')].filter(isVisible);
    if (modelControls.length !== 1 || !/^ChatGPT\b/i.test((modelControls[0].textContent || '').trim())) return null;
    const background = form?.querySelector('#composer-background');
    if (!background?.contains(composer)) return null;
    const sendControls = [...form.querySelectorAll('[data-testid="send-button"], [data-testid="composer-send-button"]')].filter(isVisible);
    if (sendControls.length !== 1) return null;
    return composer;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width >= 20 && rect.height >= 10 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function readComposer(el) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el.value || '';
    return el.innerText || el.textContent || '';
  }

  function hasDraft(el) {
    const form = el.closest('form');
    return Boolean(readComposer(el).trim() ||
      el.querySelector('img, video, audio, iframe, [data-type="mention"], [data-testid*="attachment"]') ||
      form?.querySelector('[data-testid="attachment"], [data-testid="attachment-preview"], [data-testid="file-preview"], img') ||
      [...(form?.querySelectorAll('[data-composer-attachments]') || [])].some((container) => container.childElementCount > 0));
  }

  async function failVisible(reason, needsRepair = true) {
    showToast(`YouTube AI Bridge: ${reason} ${needsRepair ? YT2GPTDestination.REPAIR + ' ' : ''}The complete prompt remains on your clipboard; paste it only after checking the destination.`, true);
    await clearPending();
  }

  function isVisibleAndEditable(el) {
    if (!isVisible(el)) return false;
    if (el.disabled || el.readOnly || el.getAttribute('aria-disabled') === 'true' || el.getAttribute('aria-readonly') === 'true') return false;
    return el.matches('textarea') || el.getAttribute('contenteditable') === 'true' || el.isContentEditable;
  }

  function insertIntoComposer(el, text, destinationUrl, strict = false) {
    try {
      if (hasDraft(el) || (strict && unsafeForSend(el, true))) return false;
      el.focus();
      // Focusing can synchronously trigger framework updates or a draft restore.
      if (hasDraft(el) || (strict && unsafeForSend(el, true)) || destinationProblem(destinationUrl) || findComposer() !== el) return false;

      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        setNativeValue(el, text);
        dispatchInput(el, text);
        return verifyInserted(el, text);
      }

      selectAllContents(el);
      let inserted = false;
      try { inserted = document.execCommand('insertText', false, text); } catch {}
      if (!strict && !inserted && !readComposer(el).trim()) {
        el.replaceChildren(document.createTextNode(text));
        dispatchInput(el, text);
      }
      return verifyInserted(el, text);
    } catch (error) {
      console.warn('YT2GPT insertion failed', error);
      return false;
    }
  }

  function unsafeForSend(el, requireEmpty = false) {
    const form = el.closest('form');
    return !isVisibleAndEditable(el) || !form || Boolean(el.closest('[inert], [aria-hidden="true"], [aria-disabled="true"], [aria-readonly="true"], fieldset[disabled]')) ||
      [...form.querySelectorAll('[contenteditable="true"], textarea, input[type="text"]')].filter(isVisibleAndEditable).length !== 1 ||
      (requireEmpty && Boolean(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement ? el.value : el.textContent)) || hasAttachmentsOrActivity(form) ||
      Boolean(el.querySelector('[contenteditable="false"], [data-node-view-wrapper]'));
  }
  function hasAttachmentsOrActivity(form) {
    return form.getAttribute('aria-busy') === 'true' ||
      Boolean(form.querySelector('img, video, audio, iframe, [data-type="mention"], [data-testid*="attachment"], [data-testid*="file-preview"], [data-testid*="upload"], [role="progressbar"], [aria-busy="true"], [data-testid*="stop"], button[aria-label^="Stop"], button[aria-label*="remove" i], button[aria-label*="delete" i]')) ||
      [...form.querySelectorAll('[data-composer-attachments]')].some(node=>node.childElementCount>0) ||
      [...form.querySelectorAll('input[type="file"]')].some(input=>input.files?.length);
  }
  // Closed reason vocabulary: no URLs, DOM text, draft or prompt fragments.
  const SEND_REASONS = Object.freeze({
    DESTINATION: 'The exact saved destination is no longer confirmed. Check the selected conversation or Project.',
    PAGE_BLOCKED: 'A dialog, sign-in screen or product mode needs attention.',
    COMPOSER_CHANGED: 'The recognized message box changed. Review the draft on this page.',
    COMPOSER_UNSAFE: 'The message box is read-only, ambiguous or contains an unsupported rich element.',
    UPLOAD_OR_ACTIVITY: 'An attachment, upload-shaped control or active response was detected. Review the composer; an idle control may also trigger this conservative guard.',
    PAYLOAD_MISMATCH: 'The complete inserted text could not be verified exactly. Compare the draft with the copied prompt.',
    SEND_MISSING: 'No recognized visible Send control was found. Use the website Send control manually after review.',
    SEND_AMBIGUOUS: 'More than one possible Send control was found. Choose the intended control yourself.',
    SEND_UNKNOWN: 'The Send control lacks a supported identity. Send manually after review.',
    SEND_DISABLED: 'The recognized Send control did not become enabled. Wait for the page and review manually.',
    SEND_CONTROL_CHANGED: 'The Send control changed during the final check. Review manually.',
    AUTH_CONTEXT: 'This page or document could not be authorized for the one-time Send.',
    AUTH_RECORD: 'The one-time Send request is missing or was already consumed. Check the conversation before any manual action.',
    AUTH_DESTINATION: 'The one-time request does not match this exact destination.',
    AUTH_EXPIRED: 'The one-time Send request expired. Review manually.',
    AUTH_DISABLED: 'Auto-send was turned off before sending. Review manually.',
    AUTH_STORAGE: 'The one-time Send record could not be safely updated. Check the conversation and review manually.',
    AUTH_UNAVAILABLE: 'One-time Send authorization could not be confirmed. Check the conversation and review manually.'
  });
  function checkSend(el, claimed) {
    if (location.origin !== 'https://chatgpt.com' || YT2GPTDestination.normalize(location.href) !== claimed.destinationUrl) return {code:'DESTINATION'};
    if (destinationProblem(claimed.destinationUrl)) return {code:'PAGE_BLOCKED'};
    if (findComposer() !== el) return {code:'COMPOSER_CHANGED'};
    if (hasAttachmentsOrActivity(el.closest('form'))) return {code:'UPLOAD_OR_ACTIVITY'};
    if (unsafeForSend(el)) return {code:'COMPOSER_UNSAFE'};
    if (exactComposerText(el) !== claimed.payload.replace(/\r\n/g,'\n')) return {code:'PAYLOAD_MISMATCH'};
    const buttons = [...el.closest('form').querySelectorAll('[data-testid="send-button"], [data-testid="composer-send-button"], button[aria-label="Send"], button[aria-label="Send prompt"], button[aria-label="Send message"]')].filter(isVisible);
    if (!buttons.length) return {code:'SEND_MISSING'};
    if (buttons.length !== 1) return {code:'SEND_AMBIGUOUS'};
    const button = buttons[0];
    if (!(button instanceof HTMLButtonElement) || !button.matches('[data-testid="send-button"], [data-testid="composer-send-button"]')) return {code:'SEND_UNKNOWN'};
    if (button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true' || button.getAttribute('aria-readonly') === 'true' || button.closest('[inert], [aria-hidden="true"], [aria-disabled="true"], [aria-readonly="true"]')) return {code:'SEND_DISABLED'};
    return {button};
  }
  function exactComposerText(el) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el.value.replace(/\r\n/g,'\n');
    // Native plaintext editing creates paragraphs. innerText adds layout gaps
    // around P nodes, so serialize only this bounded text/P/DIV/BR shape.
    // Preserve every literal space/newline; unknown rich markup stays manual.
    function inline(node) {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') return '\n';
      return null;
    }
    let result = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && ['P','DIV'].includes(node.tagName)) {
        if (result || node !== el.firstChild) result += '\n';
        if (node.childNodes.length === 1 && node.firstChild.nodeName === 'BR') continue;
        for (const child of node.childNodes) { const text=inline(child); if(text===null)return null; result+=text; }
      } else { const text=inline(node); if(text===null)return null; result+=text; }
    }
    return result.replace(/\r\n/g,'\n');
  }
  async function sendExplicitlyOnce(el, claimed) {
    const started = Date.now();
    let stable = null, reason = 'SEND_MISSING';
    while (Date.now()-started < 2500) {
      await sleep(100);
      const checked = checkSend(el, claimed), button = checked.button;
      if (!button) { reason = checked.code; stable = null; continue; }
      if (stable !== button) { stable = button; reason = 'SEND_CONTROL_CHANGED'; continue; }
      let authorization;
      try { authorization = await chrome.runtime.sendMessage({type:'AUTHORIZE_CHATGPT_SEND_ONCE',explicitSendKey:claimed.explicitSendKey}); } catch {}
      if (!authorization?.ok) { reason = Object.hasOwn(SEND_REASONS, authorization?.reason) ? authorization.reason : 'AUTH_UNAVAILABLE'; break; }
      const finalCheck = checkSend(el, claimed);
      if (finalCheck.button !== button) { reason = finalCheck.code || 'SEND_CONTROL_CHANGED'; break; }
      try {
        // One native activation only, with authorization consumed first.
        HTMLButtonElement.prototype.click.call(button);
        showToast('YouTube AI Bridge: Send was requested once in ChatGPT. Check the conversation for the result; it will not be retried.');
      } catch { showToast('YouTube AI Bridge: the Send attempt is uncertain [SEND_UNCERTAIN]. Check the conversation before doing anything else; no retry will occur.', true); }
      return;
    }
    showToast(`YouTube AI Bridge: automatic Send was withheld [${reason}]. ${SEND_REASONS[reason]} The complete prompt remains on your clipboard. Nothing will be retried; send manually only after checking the destination and full draft.`, true);
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
    const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    return normalize(text).length > 0 && normalize(readComposer(el)) === normalize(text);
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
    toast.setAttribute('role', isError ? 'alert' : 'status');
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
    if (!isError) setTimeout(() => toast.remove(), 5000);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();

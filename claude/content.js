'use strict';

(() => {
  if (window.__YT2GPT_CLAUDE_INSTALLED__) return;
  window.__YT2GPT_CLAUDE_INSTALLED__ = true;

  const MAX_WAIT_MS = 30000;
  // The final candidate uses the exact editor label/classes observed through
  // signed-in Edge accessibility. Its DOM attributes and nearby Send marker
  // remain to be verified live; never fall back to generic ProseMirror editors.
  const EDITOR_SELECTOR = '[data-testid="chat-input"][contenteditable="true"], [data-testid="chat-input"] .ProseMirror[contenteditable="true"], textarea[aria-label="Write your prompt to Claude"], .tiptap.ProseMirror[contenteditable="true"][aria-label="Write your prompt to Claude"]';
  const SEND_SELECTOR = 'button[data-testid="chat-input-send"]';
  const ATTACHMENT_SELECTOR = 'img, video, audio, iframe, [data-type="mention"], [data-testid*="attachment"], [data-testid*="file-preview"], [data-testid*="upload-preview"], button[aria-label*="remove" i], button[aria-label*="delete" i], [role="progressbar"], [aria-busy="true"]';

  attemptPendingInsert().catch(() => fail('The Claude handoff could not be completed safely.'));

  async function attemptPendingInsert() {
    const started = Date.now();
    let pending;
    while (Date.now() - started < MAX_WAIT_MS) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_PAYLOAD' });
        if (response?.ok && response.payload) { pending = response; break; }
      } catch {}
      await sleep(500);
    }
    if (!pending) return;

    const waiting = Date.now();
    while (Date.now() - waiting < MAX_WAIT_MS) {
      const problem = destinationProblem(pending.destinationUrl);
      if (problem) return fail(problem);
      const found = findComposer();
      if (found) {
        if (hasDraft(found)) return fail('Your draft or attachment was left untouched.');
        let claimed;
        try { claimed = await chrome.runtime.sendMessage({ type: 'CLAIM_PENDING_PAYLOAD' }); }
        catch { return fail('The handoff could not be claimed safely.'); }
        if (!claimed?.ok) return fail('The destination changed or the handoff could not be claimed safely.');
        if (!claimed.payload) return;
        if (!sameComposer(found, claimed.destinationUrl) || hasDraft(found)) return fail('The page or draft changed. Nothing was inserted.');

        found.editor.focus();
        // Focus can restore a draft or replace a framework-owned editor.
        if (!sameComposer(found, claimed.destinationUrl) || hasDraft(found)) return fail('The page or draft changed on focus. Nothing was inserted.');
        let inserted = false;
        try {
          if (found.editor instanceof HTMLTextAreaElement) {
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
            if (!setter) return fail('This message box could not be edited safely.');
            setter.call(found.editor, claimed.payload);
            found.editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: claimed.payload }));
            inserted = true;
          } else {
            // Use the editor's native editing path; never replace its DOM,
            // synthesize Enter, click Send or retry after a partial insertion.
            const selection = window.getSelection();
            if (!selection) return fail('The message-box selection could not be prepared.');
            const range = document.createRange();
            range.selectNodeContents(found.editor);
            selection.removeAllRanges();
            selection.addRange(range);
            inserted = document.execCommand('insertText', false, claimed.payload);
          }
        } catch {}

        if (inserted) {
          const settling = Date.now();
          // Confirm both text and the framework's readiness after it processes
          // native editing events. This loop never writes or presses controls.
          while (Date.now() - settling < 2500) {
            await sleep(100);
            if (!sameComposer(found, claimed.destinationUrl) || read(found.editor) !== normalize(claimed.payload)) break;
            const send = findComposer()?.send;
            if (send && !send.disabled && send.getAttribute('aria-disabled') !== 'true') {
              toast('Prompt inserted in Claude. Review it, then press Send yourself.');
              return;
            }
          }
        }
        return fail('Insertion could not be confirmed. Check the message box before pasting to avoid duplicates.');
      }
      await sleep(500);
    }
    return fail('This Claude message box was not recognized. Your saved destination was kept.', true);
  }

  function destinationProblem(expected) {
    if (location.origin !== 'https://claude.ai' || YT2GPTDestination.provider(expected) !== 'claude' || !YT2GPTDestination.matches(expected, location.href)) {
      return 'The opened page does not match the saved Claude destination.';
    }
    if ([...document.querySelectorAll('[role="dialog"], input[type="password"], form[action*="login"]')].some(visible)) {
      return 'A dialog or sign-in screen needs your attention.';
    }
    return '';
  }

  function findComposer() {
    const candidates = [...document.querySelectorAll(EDITOR_SELECTOR)].filter(editable);
    if (candidates.length !== 1) return null;
    const editor = candidates[0];
    // Require a specific editor identity AND the Claude Send marker in a
    // nearby scope. A generic ProseMirror or unrelated editor is insufficient.
    let scope = editor.parentElement;
    for (let depth = 0; scope && depth < 6 && scope !== document.body && scope !== document.documentElement; depth++, scope = scope.parentElement) {
      const sends = [...scope.querySelectorAll(SEND_SELECTOR)].filter(visible);
      if (sends.length !== 1) continue;
      const editors = [...scope.querySelectorAll('[contenteditable="true"], textarea')].filter(editable);
      if (editors.length !== 1 || editors[0] !== editor) return null;
      return { editor, scope, send: sends[0] };
    }
    return null;
  }

  function sameComposer(found, expected) {
    if (destinationProblem(expected)) return false;
    const current = findComposer();
    return current?.editor === found.editor && current.scope === found.scope;
  }

  function hasDraft({ editor, scope }) {
    const rawText = editor instanceof HTMLTextAreaElement ? editor.value : editor.textContent;
    return Boolean(rawText || editor.querySelector('[contenteditable="false"], [data-node-view-wrapper]') ||
      scope.getAttribute('aria-busy') === 'true' || scope.querySelector(ATTACHMENT_SELECTOR) ||
      [...scope.querySelectorAll('input[type="file"]')].some((input) => input.files?.length) ||
      [...scope.querySelectorAll('[data-testid*="stop"], button[aria-label^="Stop"]')].some(visible));
  }

  function visible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width >= 20 && rect.height >= 10 && style.display !== 'none' && style.visibility !== 'hidden';
  }
  function editable(el) {
    return visible(el) && !el.disabled && !el.readOnly && !el.closest('[inert], [aria-hidden="true"]') && el.getAttribute('aria-disabled') !== 'true' && el.getAttribute('aria-readonly') !== 'true' &&
      (el instanceof HTMLTextAreaElement || el.getAttribute('contenteditable') === 'true');
  }
  function normalize(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function read(el) { return normalize(el instanceof HTMLTextAreaElement ? el.value : el.innerText || el.textContent); }
  async function fail(reason, troubleshoot = false) {
    toast(`${reason} The complete prompt is on your clipboard. Paste only after checking the intended destination and any existing draft.`, true, troubleshoot);
    try { await chrome.runtime.sendMessage({ type: 'CLEAR_PENDING_PAYLOAD' }); } catch {}
  }
  function toast(message, error = false, troubleshoot = false) {
    document.getElementById('yt2gpt-claude-toast')?.remove();
    const el = document.createElement('div');
    el.id = 'yt2gpt-claude-toast';
    el.setAttribute('role', error ? 'alert' : 'status');
    el.textContent = `YouTube AI Bridge: ${message}`;
    el.style.cssText = `position:fixed;right:18px;bottom:18px;z-index:2147483647;max-width:420px;padding:12px 15px;border-radius:10px;background:${error ? '#5b2424' : '#253b30'};color:white;font:13px/1.45 system-ui;box-shadow:0 6px 24px #0004`;
    if (troubleshoot) addTroubleshooting(el);
    document.documentElement.appendChild(el);
    if (!error) setTimeout(() => el.remove(), 7000);
  }
  function addTroubleshooting(notice) {
    const help = document.createElement('p');
    help.textContent = 'To help fix recognition, copy troubleshooting details and share them with the extension developer. This replaces your clipboard prompt; Copy prompt in the YouTube popup restores it.';
    help.style.cssText = 'margin:10px 0 6px;font-size:12px';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Copy troubleshooting details';
    button.style.cssText = 'font:inherit;color:#252525;background:#fff;border:0;border-radius:6px;padding:7px 10px;cursor:pointer';
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.style.cssText = 'margin:6px 0 0;font-size:12px';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const report = JSON.stringify(composerDetails(), null, 2);
        await navigator.clipboard.writeText(report);
        status.textContent = 'Details copied. Paste them into your support conversation. No message text, prompt, URLs or account details are included.';
      } catch {
        status.textContent = 'Could not copy details. Your message box was left untouched. Use Copy prompt in the YouTube popup for the normal handoff.';
      } finally { button.disabled = false; }
    });
    notice.append(help, button, status);
  }
  function composerDetails() {
    // Read only bounded, allowlisted control shape. Never read text/value,
    // outerHTML, URLs, arbitrary attributes or account/conversation metadata.
    const knownTags = new Set(['div', 'span', 'p', 'textarea', 'button', 'form', 'section', 'main', 'article', 'fieldset']);
    const tag = (element) => knownTags.has(element.tagName.toLowerCase()) ? element.tagName.toLowerCase() : 'other';
    const knownRoles = new Set(['textbox', 'button', 'group', 'form']);
    const knownLabels = new Set(['Send message', 'Send Message', 'Send', 'Send prompt', 'Write your prompt to Claude', 'Reply to Claude', 'Message Claude', 'Stop response', 'Stop generating']);
    const marker = (element) => ({
      tag: tag(element),
      role: knownRoles.has(element.getAttribute('role')) ? element.getAttribute('role') : null,
      contenteditable: element.getAttribute('contenteditable') === 'true',
      proseMirror: element.classList.contains('ProseMirror'),
      tiptap: element.classList.contains('tiptap'),
      chatInput: element.getAttribute('data-testid') === 'chat-input',
      chatSend: element.getAttribute('data-testid') === 'chat-input-send',
      hasOtherTestId: Boolean(element.getAttribute('data-testid') && !['chat-input', 'chat-input-send'].includes(element.getAttribute('data-testid'))),
      label: knownLabels.has(element.getAttribute('aria-label')) ? element.getAttribute('aria-label') : null,
      hasOtherLabel: Boolean(element.getAttribute('aria-label') && !knownLabels.has(element.getAttribute('aria-label'))),
      disabled: Boolean(element.disabled || element.getAttribute('aria-disabled') === 'true'),
      readonly: Boolean(element.readOnly || element.getAttribute('aria-readonly') === 'true'),
      inert: Boolean(element.closest('[inert], [aria-hidden="true"]')),
      visible: visible(element)
    });
    const editors = [...document.querySelectorAll('[contenteditable="true"], textarea')].filter(visible);
    return {
      kind: 'youtube-intake-claude-composer-v1',
      extensionVersion: chrome.runtime.getManifest?.().version || 'unknown',
      recognizedEditorCount: [...document.querySelectorAll(EDITOR_SELECTOR)].filter(editable).length,
      editorCount: editors.length,
      editors: editors.slice(0, 5).map((editor) => {
        const ancestors = [];
        let scope = editor.parentElement;
        for (let depth = 0; scope && depth < 6 && scope !== document.body && scope !== document.documentElement; depth++, scope = scope.parentElement) {
          const controls = [...scope.querySelectorAll('button')].filter((control) => visible(control) && !control.closest('#yt2gpt-claude-toast'));
          ancestors.push({ tag: tag(scope), editorCount: [...scope.querySelectorAll('[contenteditable="true"], textarea')].filter(editable).length,
            buttonCount: controls.length, controls: controls.slice(0, 12).map(marker) });
        }
        return { ...marker(editor), ancestors };
      })
    };
  }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
})();

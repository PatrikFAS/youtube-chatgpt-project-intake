'use strict';

// Used by the worker, popup, options page and injector. Unknown destinations
// require an explicit repair; never replace a saved Project with general chat.
globalThis.YT2GPTDestination = (() => {
  const REPAIR = 'Open the intended ChatGPT or Claude conversation or Project, then edit/resave this destination in Manage destinations. For ChatGPT, select ChatGPT rather than Codex. Your saved destinations have been kept; paste the copied prompt only after checking the destination.';

  function parse(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.origin !== 'https://chatgpt.com' || url.username || url.password) return null;
      const path = url.pathname.replace(/\/$/, '') || '/';
      // URL patterns are deliberately bounded. An unfamiliar future route gets
      // the clipboard fallback until its meaning has been verified.
      if (!/^(?:\/|\/c\/[^/]+|\/g\/[^/]+(?:\/project|\/c\/[^/]+)?)$/.test(path)) return null;
      // A Project slug may legitimately contain the word "codex". Distinguish
      // route segments and explicit selector values from a Project's name.
      if (path.split('/').some((part) => /^codex$/i.test(decodeURIComponent(part)))) return null;
      if ([...url.searchParams].some(([key, value]) =>
        /^(?:mode|product|surface|app|view|model)$/i.test(key) && /^codex(?:$|[\s/:-])/i.test(value))) return null;
      if (/^#\/?codex(?:$|[/?&])/i.test(decodeURIComponent(url.hash))) return null;
      return { url, path };
    } catch { return null; }
  }

  function parseClaude(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.origin !== 'https://claude.ai' || url.username || url.password) return null;
      // Open user-saved web destinations only. Never construct Project IDs,
      // append prompt parameters, or infer a Project-to-chat relationship.
      const path = url.pathname.replace(/\/$/, '') || '/';
      if (!/^(?:\/|\/new|\/(?:chat|project)\/[^/]+)$/.test(path)) return null;
      return { url, path };
    } catch { return null; }
  }

  function normalize(value) {
    return (parse(value) || parseClaude(value))?.url.toString() || null;
  }

  function provider(value) {
    if (parse(value)) return 'chatgpt';
    if (parseClaude(value)) return 'claude';
    return null;
  }

  function withBuiltIns(value) {
    const destinations = Array.isArray(value) ? [...value] : [];
    if (!destinations.some((d) => d.id === 'general')) {
      destinations.unshift({ id: 'general', name: 'General ChatGPT', url: 'https://chatgpt.com/', builtIn: true });
    }
    if (!destinations.some((d) => d.id === 'claude-general')) {
      destinations.push({ id: 'claude-general', name: 'General Claude (paste manually)', url: 'https://claude.ai/new', builtIn: true });
    }
    return destinations;
  }

  function isNewChatEntry(value) {
    const entry = parse(value);
    // Only recognized landing pages without extra URL state qualify for naming.
    return Boolean(entry && !entry.url.search && !entry.url.hash &&
      (entry.path === '/' || /^\/g\/g-p-[^/]+\/project$/.test(entry.path)));
  }

  function matches(expected, actual) {
    const saved = parse(expected);
    const current = parse(actual);
    if (!saved || !current) return false;
    // Keep query and fragment meaning intact; do not guess at product overrides.
    if (saved.url.search !== current.url.search || saved.url.hash !== current.url.hash) return false;
    if (saved.path === current.path) return true;

    // A saved Project landing page can open a conversation inside that Project.
    // Only this directional transition is allowed: a saved conversation still
    // requires its exact path, and another Project or general chat is refused.
    const project = saved.path.match(/^\/g\/(g-p-[^/]+)\/project$/);
    const conversation = current.path.match(/^\/g\/(g-p-[^/]+)\/c\/[^/]+$/);
    return Boolean(project && conversation && project[1] === conversation[1]);
  }

  // matches/isNewChatEntry deliberately remain ChatGPT-only: Claude has no
  // verified injector or automatic naming behavior in this beta.
  return Object.freeze({ normalize, provider, withBuiltIns, matches, isNewChatEntry, REPAIR });
})();

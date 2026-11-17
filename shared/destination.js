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

  // Display grouping only, including saved routes that now need repair.
  // This must never authorize opening or automatic composer insertion.
  function displayProvider(value) {
    try {
      const origin = new URL(String(value || '').trim()).origin;
      if (origin === 'https://claude.ai') return 'claude';
      if (origin === 'https://chatgpt.com') return 'chatgpt';
    } catch {}
    return null;
  }

  function kind(value) {
    if (!normalize(value)) return 'unknown';
    const path = new URL(value).pathname.replace(/\/$/, '') || '/';
    if (path === '/' || (provider(value) === 'claude' && path === '/new')) return 'new';
    if (/^\/project\/[^/]+$/.test(path) || /^\/g\/[^/]+\/project$/.test(path)) return 'project';
    if (/^\/chat\/[^/]+$/.test(path) || /\/c\/[^/]+$/.test(path)) return 'conversation';
    return 'other';
  }

  function withBuiltIns(value) {
    const destinations = Array.isArray(value) ? [...value] : [];
    if (!destinations.some((d) => d.id === 'general')) {
      destinations.unshift({ id: 'general', name: 'General ChatGPT', url: 'https://chatgpt.com/', builtIn: true });
    }
    if (!destinations.some((d) => d.id === 'claude-general')) {
      destinations.push({ id: 'claude-general', name: 'General Claude', url: 'https://claude.ai/new', builtIn: true });
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
    const savedClaude = parseClaude(expected);
    const currentClaude = parseClaude(actual);
    if (savedClaude || currentClaude) {
      // A Claude Project-to-chat redirect does not prove Project membership.
      // Only the exact saved route and URL state may claim its handoff.
      return Boolean(savedClaude && currentClaude && savedClaude.path === currentClaude.path &&
        savedClaude.url.search === currentClaude.url.search && savedClaude.url.hash === currentClaude.url.hash);
    }
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

  // New-chat naming remains ChatGPT-only. Claude insertion uses exact routes.
  return Object.freeze({ normalize, provider, displayProvider, kind, withBuiltIns, matches, isNewChatEntry, REPAIR });
})();

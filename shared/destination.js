'use strict';

// Used by the worker, popup, options page and injector. Unknown destinations
// require an explicit repair; never replace a saved Project with general chat.
globalThis.YT2GPTDestination = (() => {
  const REPAIR = 'Open the intended ChatGPT conversation or Project, select ChatGPT rather than Codex, then edit/resave this destination in Manage destinations. Your saved destinations have been kept.';

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

  function normalize(value) {
    return parse(value)?.url.toString() || null;
  }

  function matches(expected, actual) {
    const saved = parse(expected);
    const current = parse(actual);
    if (!saved || !current) return false;
    // Keep query and fragment meaning intact; do not guess at product overrides.
    return saved.path === current.path && saved.url.search === current.url.search && saved.url.hash === current.url.hash;
  }

  return Object.freeze({ normalize, matches, REPAIR });
})();

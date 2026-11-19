'use strict';
// One UI document; only the browser-hosted surface/layout differs.
(() => {
  const panel = new URL(location.href).searchParams.get('surface') === 'panel';
  document.documentElement.dataset.surface = panel ? 'panel' : 'popup';
  globalThis.YT2GPTSurface = Object.freeze({panel});
})();

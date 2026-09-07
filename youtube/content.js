'use strict';

(() => {
  if (window.__YT2GPT_CONTENT_INSTALLED__) return;
  window.__YT2GPT_CONTENT_INSTALLED__ = true;

  const REQUEST_EVENT = 'YT2GPT_REQUEST_PLAYER_INFO';
  const RESPONSE_EVENT = 'YT2GPT_PLAYER_INFO';
  const VIDEO_ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

  injectBridge();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== 'object') return;
    if (message.type === 'YT2GPT_GET_CONTEXT') {
      getVideoContext().then(data => sendResponse({ ok: true, data }))
        .catch(error => sendResponse({ ok: false, error: friendlyError(error) }));
      return true;
    }
    if (message.type === 'YT2GPT_GET_TRANSCRIPT') {
      getTranscript(message.track).then(data => sendResponse({ ok: true, data }))
        .catch(async error => {
          try {
            const data = await getDomTranscriptFallback();
            if (data?.segments?.length) return sendResponse({ ok: true, data, fallback: 'dom' });
          } catch {}
          sendResponse({ ok: false, error: friendlyError(error) });
        });
      return true;
    }
  });

  function injectBridge() {
    if (document.documentElement.dataset.yt2gptBridgeInjected === '1') return;
    document.documentElement.dataset.yt2gptBridgeInjected = '1';
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('youtube/page-bridge.js');
    script.async = false;
    (document.head || document.documentElement).appendChild(script);
    script.addEventListener('load', () => script.remove(), { once: true });
    script.addEventListener('error', () => script.remove(), { once: true });
  }

  async function getVideoContext() {
    const url = new URL(location.href);
    const videoId = getVideoId(url);
    if (!videoId) throw new Error('Open a standard YouTube video first.');
    let bridge = {};
    try { bridge = await requestPlayerInfo(1200); } catch {}
    let player = bridge.playerResponse || null;
    const currentId = player?.videoDetails?.videoId || bridge?.videoData?.video_id || '';
    if ((currentId && currentId !== videoId) || !captionTracks(player).length) {
      try { player = await fetchPlayerResponse(url.toString()); } catch {}
    }
    const details = player?.videoDetails || {};
    const micro = player?.microformat?.playerMicroformatRenderer || {};
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      title: cleanText(details.title || bridge?.videoData?.title || document.querySelector('h1 yt-formatted-string')?.textContent || document.title.replace(/\s*-\s*YouTube\s*$/i, '')) || 'YouTube video',
      channel: cleanText(details.author || bridge?.videoData?.author || document.querySelector('ytd-watch-metadata ytd-channel-name a')?.textContent || ''),
      durationSeconds: Number(details.lengthSeconds || bridge?.videoData?.lengthSeconds || 0) || 0,
      publishDate: micro.publishDate || micro.uploadDate || '',
      tracks: normalizeTracks(captionTracks(player)),
      browserLanguage: navigator.language || 'en'
    };
  }

  function captionTracks(player) {
    return player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  }

  function requestPlayerInfo(timeoutMs) {
    injectBridge();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      let timer;
      const done = () => { clearTimeout(timer); window.removeEventListener(RESPONSE_EVENT, onResponse); };
      const onResponse = event => {
        if (event?.detail?.requestId !== requestId) return;
        done();
        try { resolve(event.detail.serialized ? JSON.parse(event.detail.serialized) : {}); }
        catch (error) { reject(error); }
      };
      window.addEventListener(RESPONSE_EVENT, onResponse);
      timer = setTimeout(() => { done(); reject(new Error('Could not read the live YouTube player.')); }, timeoutMs);
      window.dispatchEvent(new CustomEvent(REQUEST_EVENT, { detail: { requestId } }));
    });
  }

  async function fetchPlayerResponse(pageUrl) {
    const response = await fetch(pageUrl, { credentials: 'include', cache: 'no-store' });
    if (!response.ok) throw new Error(`YouTube page returned ${response.status}.`);
    const html = await response.text();
    for (const marker of ['var ytInitialPlayerResponse =', 'ytInitialPlayerResponse =', 'window["ytInitialPlayerResponse"] =']) {
      const start = html.indexOf(marker);
      if (start < 0) continue;
      const brace = html.indexOf('{', start + marker.length);
      const raw = balancedObject(html, brace);
      if (raw) try { return JSON.parse(raw); } catch {}
    }
    throw new Error('Could not find YouTube caption metadata.');
  }

  function balancedObject(text, start) {
    let depth = 0, quoted = false, escaped = false;
    for (let i = start; i >= 0 && i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') quoted = false;
      } else if (ch === '"') quoted = true;
      else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
    }
    return null;
  }

  function normalizeTracks(tracks) {
    return tracks.filter(t => t?.baseUrl).map((t, i) => ({
      id: `${t.languageCode || 'track'}-${t.vssId || i}-${t.kind || 'manual'}`,
      languageCode: t.languageCode || '',
      name: cleanText(textFromRuns(t.name)) || t.languageCode || `Track ${i + 1}`,
      kind: t.kind || '',
      isAutoGenerated: t.kind === 'asr' || /^a\./.test(t.vssId || ''),
      isTranslatable: Boolean(t.isTranslatable),
      baseUrl: t.baseUrl,
      vssId: t.vssId || ''
    }));
  }

  async function getTranscript(track) {
    if (!track?.baseUrl) throw new Error('No subtitle track was selected.');
    const errors = [];
    for (const [label, url, parser] of [
      ['JSON3', withFormat(track.baseUrl, 'json3'), parseJson3],
      ['XML', withoutFormat(track.baseUrl), parseXml]
    ]) {
      try { const out = parser(await fetchCaptionText(url)); if (out.length) return finalize(out, track); }
      catch (e) { errors.push(`${label}: ${friendlyError(e)}`); }
    }
    try {
      const pot = await harvestPoToken();
      if (pot) {
        const base = addParams(track.baseUrl, { pot, c: 'WEB' });
        for (const [label, url, parser] of [
          ['JSON3 + poToken', withFormat(base, 'json3'), parseJson3],
          ['XML + poToken', withoutFormat(base), parseXml]
        ]) {
          try { const out = parser(await fetchCaptionText(url)); if (out.length) return finalize(out, track); }
          catch (e) { errors.push(`${label}: ${friendlyError(e)}`); }
        }
      }
    } catch (e) { errors.push(`poToken fallback: ${friendlyError(e)}`); }
    throw new Error(`Could not retrieve this subtitle track. ${errors.join(' ')}`);
  }

  async function fetchCaptionText(url) {
    let response = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      response = await fetch(url, { credentials: 'include', cache: 'no-store' });
    }
    if (!response.ok) throw new Error(`Caption request returned ${response.status}.`);
    const text = await response.text();
    if (!text.trim()) throw new Error('Caption response was empty.');
    return text;
  }

  function findCcButton() {
    return document.querySelector('#movie_player .ytp-subtitles-button.ytp-button') || document.querySelector('.ytp-subtitles-button.ytp-button');
  }

  async function harvestPoToken() {
    const button = findCcButton();
    if (!button) return '';
    const wasActive = button.getAttribute('aria-pressed') === 'true' || button.classList.contains('ytp-button-active');
    const startedAt = performance.now();
    try {
      if (wasActive) { button.click(); await sleep(120); }
      button.click();
      for (let elapsed = 0; elapsed < 1800; elapsed += 75) {
        await sleep(75);
        const entries = performance.getEntriesByType('resource')
          .filter(e => e.name.includes('/api/timedtext?') && Number(e.startTime || 0) >= startedAt - 100)
          .sort((a, b) => Number(a.startTime || 0) - Number(b.startTime || 0));
        for (let i = entries.length - 1; i >= 0; i--) {
          try { const pot = new URL(entries[i].name).searchParams.get('pot') || ''; if (pot) return pot; } catch {}
        }
      }
      return '';
    } finally {
      const activeNow = button.getAttribute('aria-pressed') === 'true' || button.classList.contains('ytp-button-active');
      if (activeNow !== wasActive) button.click();
    }
  }

  function parseJson3(text) {
    const data = JSON.parse(text);
    const out = [];
    for (const event of data.events || []) {
      if (!Array.isArray(event.segs)) continue;
      const value = cleanCaption(event.segs.map(s => s?.utf8 || '').join(''));
      if (value && !isNoise(value)) out.push({ start: Number(event.tStartMs || 0) / 1000, duration: Number(event.dDurationMs || 0) / 1000, text: value });
    }
    return aggregate(dedupe(out));
  }

  function parseXml(text) {
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    if (xml.querySelector('parsererror')) throw new Error('YouTube returned invalid XML captions.');
    const out = [];
    for (const node of xml.querySelectorAll('text')) {
      const value = cleanCaption(node.textContent || '');
      if (value && !isNoise(value)) out.push({ start: Number(node.getAttribute('start') || 0), duration: Number(node.getAttribute('dur') || 0), text: value });
    }
    if (!out.length) for (const node of xml.querySelectorAll('p')) {
      const value = cleanCaption(node.textContent || '');
      if (value) out.push({ start: Number(node.getAttribute('t') || 0) / 1000, duration: Number(node.getAttribute('d') || 0) / 1000, text: value });
    }
    return aggregate(dedupe(out));
  }

  function dedupe(items) {
    const out = [];
    for (const item of items) {
      const previous = out[out.length - 1];
      if (previous && normalize(previous.text) === normalize(item.text)) continue;
      out.push(item);
    }
    return out;
  }

  function aggregate(items) {
    const out = [];
    let current = null;
    for (const item of items) {
      if (!current) { current = { ...item }; continue; }
      const candidate = `${current.text} ${item.text}`.replace(/\s+/g, ' ').trim();
      if (item.start - current.start > 60 || candidate.length > 500 || (candidate.length > 300 && /[.!?]["'”’)]?$/.test(current.text))) {
        out.push(current); current = { ...item };
      } else {
        current.text = joinText(current.text, item.text);
        current.duration = Math.max(current.duration || 0, item.start + (item.duration || 0) - current.start);
      }
    }
    if (current) out.push(current);
    return out;
  }

  function joinText(left, right) {
    const a = cleanCaption(left), b = cleanCaption(right);
    const aw = a.split(/\s+/), bw = b.split(/\s+/);
    let overlap = 0;
    for (let n = Math.min(12, aw.length, bw.length); n; n--) {
      if (aw.slice(-n).join(' ').toLowerCase() === bw.slice(0, n).join(' ').toLowerCase()) { overlap = n; break; }
    }
    return `${a} ${bw.slice(overlap).join(' ')}`.trim();
  }

  function finalize(segments, track) {
    const text = segments.map(s => `[${formatTimestamp(s.start)}] ${s.text}`).join('\n\n');
    return { track: { languageCode: track.languageCode || '', name: track.name || 'Subtitles', isAutoGenerated: Boolean(track.isAutoGenerated) }, segments, text, characterCount: text.length };
  }

  function scrapeDomTranscript() {
    const out = [];
    const oldRows = [...document.querySelectorAll('ytd-transcript-segment-renderer')];
    const newRows = oldRows.length ? [] : [...document.querySelectorAll('transcript-segment-view-model')];
    for (const node of [...oldRows, ...newRows]) {
      const ts = cleanText(
        node.querySelector('.segment-timestamp')?.textContent ||
        node.querySelector('.ytwTranscriptSegmentViewModelTimestamp')?.textContent ||
        node.querySelector('[class*="timestamp" i]')?.textContent || ''
      );
      const text = cleanCaption(
        node.querySelector('.segment-text')?.textContent ||
        node.querySelector('yt-formatted-string')?.textContent ||
        node.querySelector('span.ytAttributedStringHost')?.textContent ||
        node.querySelector('[class*="segment-text"]')?.textContent ||
        node.querySelector('[class*="Text"]')?.textContent || ''
      );
      if (ts && text) out.push({ start: parseTimestamp(ts), duration: 0, text });
    }
    if (!out.length) return null;
    return finalize(aggregate(dedupe(out)), { name: 'YouTube transcript panel' });
  }

  async function getDomTranscriptFallback() {
    let data = scrapeDomTranscript();
    if (data?.segments?.length) return data;
    const expand = document.querySelector('ytd-text-inline-expander #expand') || document.querySelector('#description #expand') || document.querySelector('tp-yt-paper-button#expand');
    if (expand) { try { expand.click(); } catch {} await sleep(250); }
    const button = findTranscriptButton();
    if (!button) return null;
    try { button.click(); } catch { return null; }
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) { await sleep(150); data = scrapeDomTranscript(); if (data?.segments?.length) return data; }
    return null;
  }

  function findTranscriptButton() {
    for (const selector of ['ytd-video-description-transcript-section-renderer button', 'ytd-video-description-transcript-section-renderer yt-button-shape button', '#primary-button > ytd-button-renderer > yt-button-shape > button']) {
      const button = document.querySelector(selector); if (button) return button;
    }
    return [...document.querySelectorAll('button, tp-yt-paper-button')].find(button => /\b(show\s+transcript|transcript)\b/i.test(`${button.getAttribute('aria-label') || ''} ${button.textContent || ''}`)) || null;
  }

  function getVideoId(url) {
    if (url.hostname === 'youtu.be') { const id = url.pathname.split('/').filter(Boolean)[0]; return VIDEO_ID_RE.test(id || '') ? id : null; }
    const watch = url.searchParams.get('v'); if (VIDEO_ID_RE.test(watch || '')) return watch;
    const parts = url.pathname.split('/').filter(Boolean); return ['shorts','live','embed'].includes(parts[0]) && VIDEO_ID_RE.test(parts[1] || '') ? parts[1] : null;
  }

  function withFormat(url, fmt) { const base = withoutFormat(url); return `${base}${base.includes('?') ? '&' : '?'}fmt=${encodeURIComponent(fmt)}`; }
  function withoutFormat(url) { return String(url || '').replace(/([?&])fmt=[^&]*/g, '$1').replace(/[?&]$/, ''); }
  function addParams(url, params) {
    let out = String(url || '');
    for (const [key, value] of Object.entries(params)) {
      const re = new RegExp(`([?&])${key}=[^&]*`, 'i');
      out = re.test(out) ? out.replace(re, `$1${key}=${encodeURIComponent(value)}`) : `${out}${out.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(value)}`;
    }
    return out;
  }
  function textFromRuns(value) { return value?.simpleText || (value?.runs || []).map(r => r?.text || '').join(''); }
  function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function cleanCaption(value) { const el = document.createElement('textarea'); el.innerHTML = String(value || ''); return el.value.replace(/<[^>]*>/g, ' ').replace(/\u200b/g, '').replace(/\s+/g, ' ').trim(); }
  function normalize(value) { return cleanCaption(value).toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, '').replace(/\s+/g, ' ').trim(); }
  function isNoise(value) { return /^\[(music|applause|laughter|noise|silence|foreign)\]$/i.test(value) || /^(♪+|♫+)$/.test(value); }
  function parseTimestamp(value) { const p = String(value).trim().split(':').map(Number); return p.length === 3 ? p[0]*3600+p[1]*60+p[2] : p.length === 2 ? p[0]*60+p[1] : p[0] || 0; }
  function formatTimestamp(value) { const sec = Math.max(0, Math.floor(Number(value) || 0)), h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60; return h ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`; }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function friendlyError(error) { return String(error?.message || error || 'Unknown error').replace(/\s+/g, ' ').trim(); }
})();

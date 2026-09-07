'use strict';

(() => {
  if (window.__YT2GPT_BRIDGE_INSTALLED__) return;
  window.__YT2GPT_BRIDGE_INSTALLED__ = true;

  const REQUEST_EVENT = 'YT2GPT_REQUEST_PLAYER_INFO';
  const RESPONSE_EVENT = 'YT2GPT_PLAYER_INFO';

  window.addEventListener(REQUEST_EVENT, (event) => {
    const requestId = event?.detail?.requestId || '';
    let playerResponse = null;
    let videoData = null;

    // Prefer the live player. Unlike ytInitialPlayerResponse, this normally tracks
    // YouTube's SPA navigation when the user moves to another video without a reload.
    try {
      const player = document.getElementById('movie_player');
      if (typeof player?.getPlayerResponse === 'function') {
        playerResponse = player.getPlayerResponse();
      }
      if (typeof player?.getVideoData === 'function') {
        videoData = player.getVideoData();
      }
    } catch {}

    if (!playerResponse) {
      try {
        if (window.ytInitialPlayerResponse && typeof window.ytInitialPlayerResponse === 'object') {
          playerResponse = window.ytInitialPlayerResponse;
        }
      } catch {}
    }

    if (!playerResponse) {
      try {
        const raw = window.ytplayer?.config?.args?.player_response;
        if (raw) playerResponse = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {}
    }

    let serialized = null;
    try {
      serialized = JSON.stringify({ playerResponse, videoData });
    } catch {}

    window.dispatchEvent(new CustomEvent(RESPONSE_EVENT, {
      detail: { requestId, serialized }
    }));
  });
})();

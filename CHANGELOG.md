# Changelog

## 0.1.2

- Adds a short 3–5 bullet **Video TL;DR** before **Apply to Project** analysis so you know what the video is about before recommendations.
- Adds the same brief orientation TL;DR before **Analyze**, while keeping the main body focused on critical evaluation.
- Leaves **Summarize** unchanged because summary is already its primary job.
- No UI or permission changes.

## 0.1.1

- Fixes YouTube caption tracks that appear in player metadata but return an empty timedtext response.
- Adds a local Proof-of-Origin (`pot`) token fallback by triggering YouTube's own caption request and reusing its token.
- Automatically opens YouTube's transcript panel and scrapes it when direct caption download still fails.
- Supports both legacy `ytd-transcript-segment-renderer` and newer `transcript-segment-view-model` transcript rows.
- Preserves signed caption URLs more carefully when switching caption formats.
- Improves transcript fallback status and error wording.

## 0.1.0

- Initial private beta.
- YouTube transcript extraction and cleanup.
- Apply to Project / Analyze / Summarize modes.
- Saved ChatGPT destinations and optional question.
- Clipboard-first ChatGPT handoff with composer insertion fallback.

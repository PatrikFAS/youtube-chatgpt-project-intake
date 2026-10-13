# YouTube → ChatGPT Project Intake

A lightweight Chrome/Edge browser extension that extracts YouTube transcripts and sends them to ChatGPT Projects for summarization, critical analysis, or project-specific application.

**Current beta: v0.1.4 — READY TO TEST**

The extension does **not** run its own AI. It extracts YouTube captions locally, packages them with a focused instruction, copies the complete prompt to your clipboard as a safety fallback, opens the selected ChatGPT destination, and tries to populate the composer. You review the prompt and press **Send** yourself.

## Core modes

### Apply to Project
Starts with a brief 3–5 bullet **Video TL;DR** for orientation, then uses the current ChatGPT Project/conversation context to decide what from the video is actually useful. The prompt asks ChatGPT to distinguish **ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK** and to avoid blindly copying the creator's recommendations.

### Analyze
Starts with the same brief orientation **Video TL;DR**, then critically evaluates the creator's reasoning, evidence, assumptions, novelty, limitations, hype, feasibility, and implications.

### Summarize
Faithfully compress the video into a TL;DR, key ideas, examples, conclusions, and useful timestamps.

The raw transcript is a separate utility rather than a fourth reasoning mode.

## Update an existing installation to v0.1.4

1. Extract the versioned ZIP and overwrite its files in the **same unpacked extension folder** you originally loaded. Keep that folder's location. You can back it up first.
2. Open `edge://extensions/` or `chrome://extensions/` and click **Reload** on the existing extension entry. Do not uninstall it; updating in place retains saved destinations and preferences.
3. Refresh your open YouTube and ChatGPT tabs.
4. Send a video to your saved Project/conversation. Check that it opens the intended ChatGPT destination immediately beside the originating YouTube tab, in the same window. Review the prompt and press Send yourself.

The update keeps supported destination URLs intact and rejects Codex or unfamiliar routes with repair guidance. It checks the actual URL, selected product controls and specific ChatGPT composer markers before insertion, preserves existing drafts, and consumes a handoff before editing to avoid duplicates. Unrecognized interfaces get a visible clipboard fallback; choose the intended ChatGPT surface before pasting. No product-mode override is invented.

For saved Projects, v0.1.4 also accepts a Project landing page opening a conversation inside that same Project. Saved conversations still require their exact path, and query/fragment differences remain rejected.

**LIVE UPDATE TEST STILL NEEDED:** private Edge feedback established that a saved Project landing URL opened a conversation inside the same Project, triggering v0.1.3's strict path warning. v0.1.4 covers that transition with regression fixtures. Automatic insertion with the current authenticated interface still needs confirmation. The user confirmed adjacent-tab placement in their ordinary source-tab case; pinned/grouped cases remain untested. Keep [issue #1](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/issues/1) open through merge and installation until destination routing is also confirmed. See [TESTING.md](TESTING.md) for the remaining checks.

Tab creation uses the captured source tab's current `windowId`, `index + 1` and `openerTabId`, following the [Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs). A new result is unpinned; browsers can place it after the pinned area rather than directly after a pinned source. Tab-group behavior needs a browser check; no group-management permission is added. A closed source or creation failure leaves the copied prompt available rather than using an unrelated tab.

## Install in Microsoft Edge

1. Unzip the extension somewhere you want to keep it.
2. Open `edge://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the **folder containing `manifest.json`**, not the ZIP itself.
6. Pin the extension if you want quick access.
7. Reload any YouTube or ChatGPT tabs that were already open before installation.

## Install in Google Chrome

1. Unzip the extension somewhere you want to keep it.
2. Open `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. Reload any already-open YouTube or ChatGPT tabs once.

## First-time setup

### Save ChatGPT Projects/destinations

1. Open ChatGPT and navigate to the Project/page you want the extension to reopen.
2. Click the extension icon **while you are on that ChatGPT page**.
3. Give the destination a short name, for example:
   - Yacht Master Class
   - Hermes
   - Wealth
   - AI / Workflow Business
4. Click **Save current destination**.

You can edit or delete saved destinations from **Manage destinations**.

> v0.1 deliberately treats a destination as a saved ChatGPT URL. If ChatGPT later changes its Project URL structure, simply resave the destination.

## Daily use

1. Open a YouTube video.
2. Click the extension.
3. Pick the transcript track if more than one is available.
4. Pick the ChatGPT destination.
5. Pick one mode:
   - **Apply to Project**
   - **Analyze**
   - **Summarize**
6. Optionally type a specific question.
7. Click **Send to ChatGPT**.
8. ChatGPT opens with the prompt inserted where possible.
9. Review it and press **Send** yourself.

The full prompt is copied to your clipboard **before** ChatGPT opens. If automatic insertion ever breaks because ChatGPT changes its interface, press `Ctrl+V`.

## Hermes workflow

Hermes is intentionally **not** a separate top-level mode.

A good flow is:

1. Send a video to the relevant business/project context using **Apply to Project**.
2. Decide which ideas are actually worth adopting.
3. Then ask ChatGPT something like:

   `Create a Hermes handoff for points 2 and 4.`

This preserves the judgement step before changing Hermes skills/workflows.

## Privacy

- No backend.
- No extension account.
- No analytics.
- No AI API key.
- No transcript library/history.
- Saved destination URLs/preferences stay in Chrome/Edge extension storage.
- Pending ChatGPT handoffs use session-only extension storage and expire.
- The transcript is sent to ChatGPT only when you choose to do so.

## Permissions

v0.1 requests:

- `activeTab`
- `storage`
- `clipboardWrite`
- narrow host access to YouTube and ChatGPT only

It does **not** request `<all_urls>`, browsing history, downloads, cookies, or debugger access.

## Transcript strategy

The extension reads caption-track metadata from the live YouTube player and first tries the selected track in JSON3 and XML form. It cleans duplicate rolling captions, markup, and whitespace, and groups small fragments into readable timestamped paragraphs.

Some current YouTube videos expose a caption URL but return an empty response unless the request includes YouTube's Proof-of-Origin token (`pot`). v0.1.1 can trigger YouTube's own caption request locally, harvest that token from browser resource timing, and retry the selected track.

If direct caption retrieval still fails, the extension automatically expands the video description, opens YouTube's built-in transcript panel when possible, and reads the transcript rows from the page. No external transcript service is used.

## Known v0.1 limitations

- Videos with no usable captions are not transcribed from audio. There is no Whisper or remote transcription fallback in v0.1.
- YouTube caption internals are undocumented and may change. The code is designed with fallbacks, but YouTube can still break extraction temporarily.
- ChatGPT composer auto-insertion depends on ChatGPT's page structure. Clipboard-first handoff is the permanent fallback.
- Saved Project routing is URL-based rather than using an internal ChatGPT Project API.
- Very long transcripts produce a warning rather than being automatically chunked.

## If something breaks

### Extension says it cannot access YouTube
Reload the YouTube tab once. This is especially common immediately after installing/reloading an unpacked extension.

### No caption tracks found
Press **Retry**. The extension will attempt YouTube's built-in transcript panel automatically. If YouTube itself does not offer a transcript for the video, there is no audio-transcription fallback in this version.

### ChatGPT opens but prompt is not inserted
Press `Ctrl+V`. The prompt was copied before the ChatGPT tab opened.

### A saved Project opens the wrong place
Navigate to the exact ChatGPT Project/page you want and save it again as a destination.

## Scope guard

The extension's product principle is:

> **Move useful source material into ChatGPT. Let ChatGPT do the thinking.**

v0.1 intentionally does not include APIs, a backend, built-in AI summaries, Hermes integration, video history, highlights, notes, multi-video research, automatic Send, Whisper, or model selection.

## Development and release packaging

Run `npm run verify` and `npm test`. Tests execute the extension's source using simulated browser objects; they are not authenticated end-to-end proof.

After committing with a clean tracked tree, build the ZIP using Python's standard library:

```sh
python3 scripts/package.py /path/outside/repository/youtube-chatgpt-project-intake-0.1.4.zip
```

The archive contains the committed runtime files and product documentation, with version and exact commit in `BUILD.txt`. No dependencies or developer tests are needed to load it unpacked.

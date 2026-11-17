# YouTube → ChatGPT Project Intake

A lightweight Chrome/Edge browser extension that extracts YouTube transcripts and routes them to ChatGPT or Claude for summarization, critical analysis, or project-specific application.

**Current beta: v0.1.8 - reply headers and Claude ready to test**

The existing Chrome and Edge workflow is user-confirmed working. Sarah's Claude acceptance is not run. See [PROJECT_PLAN.md](PROJECT_PLAN.md) for milestones, owners and the next action.

The extension does **not** run its own AI. It extracts YouTube captions locally, packages them with a focused instruction and copies the complete prompt before opening your selected destination. ChatGPT uses the existing guarded composer insertion. Claude uses **copy/open/paste**: check the context, paste with `Ctrl+V`, review and send yourself. Claude automatic insertion is unverified and disabled; no extra host permission is needed.

## Core modes

### Apply to Project
Starts with a brief 3–5 bullet **Video TL;DR** for orientation, then uses the current Project/conversation context to decide what from the video is actually useful. The prompt asks the chosen assistant to distinguish **ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK** and to avoid blindly copying the creator's recommendations.

### Analyze
Starts with the same brief orientation **Video TL;DR**, then critically evaluates the creator's reasoning, evidence, assumptions, novelty, limitations, hype, feasibility, and implications.

### Summarize
Faithfully compress the video into a TL;DR, key ideas, examples, conclusions, and useful timestamps.

The raw transcript is a separate utility rather than a fourth reasoning mode.

## Update an existing installation to v0.1.8

1. Extract the versioned ZIP and overwrite its files in the **same unpacked extension folder** you originally loaded. Keep that folder's location. You can back it up first.
2. Open `edge://extensions/` or `chrome://extensions/` and click **Reload** on the existing extension entry. Do not uninstall it; updating in place retains saved destinations and preferences.
3. Refresh your open YouTube and ChatGPT tabs. Your saved destinations, mode and caption preference remain available; General Claude is added.
4. For Claude, choose it on a YouTube video and click **Copy & open Claude**. Check the opened context, paste with `Ctrl+V`, review and send yourself. Follow [Sarah's short check](TESTING.md#sarahs-short-claude-acceptance-check). Existing Chrome/Edge behavior is already confirmed.

The update keeps supported destination URLs intact and rejects Codex or unfamiliar routes with repair guidance. It checks the actual URL, selected product controls and specific ChatGPT composer markers before insertion, preserves existing drafts, and consumes a handoff before editing to avoid duplicates. Unrecognized interfaces get a visible clipboard fallback; choose the intended ChatGPT surface before pasting. No product-mode override is invented.

For saved Projects, v0.1.4 also accepts a Project landing page opening a conversation inside that same Project. Saved conversations still require their exact path, and query/fragment differences remain rejected.

v0.1.5 recognizes the current Project-page message box using its specific ChatGPT form, editor-container and model-control markers. Its Pro model label and empty-editor voice button are supported; a visible Send button is not required before inserting into this verified composer.

In all three modes, v0.1.6 asks ChatGPT to name new chats `YT · <original YouTube title>` when starting from General ChatGPT or a recognized Project landing page. Saved conversation links get no naming instruction. ChatGPT controls whether the suggested title appears in its sidebar. See [TESTING.md](TESTING.md) for the browser check.

v0.1.8 puts the original source metadata first and strengthens the new-chat title preference. Patrik reports the earlier request still produced odd names. The extension only requests a title in the prompt; it never sets or verifies the sidebar name. An exact automatic title fix is **not confirmed**. For an exact name, use **Copy title** in the YouTube popup, then paste into the destination's Rename control yourself. This copies the preferred `YT · <full video title>` without opening a tab or renaming an existing chat.

All three modes now ask **ChatGPT and Claude to begin every reply about the video, including follow-ups**, with its full original title, a Featuring line only for speakers/guests explicitly identified in the supplied title or transcript, then the video link. Unknown people are omitted; an uploading channel is not evidence that a person is featured. The TL;DR/analysis follows this header. These are model instructions; actual reply formatting needs your test.

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

> Destinations are saved website URLs. If a provider changes its Project URL structure, open the intended page and resave it.

### Save Claude Projects/destinations

1. Open Claude and sign in normally.
2. Open the actual Project or conversation you want.
3. Click the extension, give it a name, and click **Save current destination**.

**General Claude (paste manually)** is built in. Saved Claude URLs keep their path, query and fragment. The extension never guesses a Project URL, adds prompt parameters or edits Claude's composer. If Claude redirects or needs login, check/navigate to the right context before pasting. The Claude live UI has not been verified in this session; Sarah's browser acceptance is pending.

## Daily use

1. Open a YouTube video.
2. Click the extension.
3. Pick the transcript track if more than one is available.
4. Pick a ChatGPT or Claude destination.
5. Pick one mode:
   - **Apply to Project**
   - **Analyze**
   - **Summarize**
6. Optionally type a specific question.
7. Click **Send to ChatGPT** or **Copy & open Claude**.
8. The destination opens beside the captured YouTube tab. ChatGPT insertion is attempted in a recognized empty composer; for Claude, check the destination and paste with `Ctrl+V`. Keep any existing draft until you decide what to do with it.
9. Review the prompt and press **Send** yourself.

The full prompt is copied to your clipboard **before** either destination opens. Claude always uses manual paste in this beta. If ChatGPT insertion fails, check the destination and existing draft before pasting. If opening fails, the popup confirms that the complete prompt remains copied. If copying fails, no destination is opened.

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
- No extension-operated server receives transcripts. You use your own ChatGPT or Claude account and its normal website controls/privacy settings.
- Claude prompts are copied locally, not put in URLs or stored as pending insertion payloads. The extension never edits Claude drafts.

## Permissions

v0.1 requests:

- `activeTab`
- `storage`
- `clipboardWrite`
- narrow host access to YouTube and ChatGPT only (unchanged for Claude copy/open/paste)

It does **not** request `<all_urls>`, browsing history, downloads, cookies, or debugger access.

## Transcript strategy

The extension reads caption-track metadata from the live YouTube player and first tries the selected track in JSON3 and XML form. It cleans duplicate rolling captions, markup, and whitespace, and groups small fragments into readable timestamped paragraphs.

Some current YouTube videos expose a caption URL but return an empty response unless the request includes YouTube's Proof-of-Origin token (`pot`). v0.1.1 can trigger YouTube's own caption request locally, harvest that token from browser resource timing, and retry the selected track.

If direct caption retrieval still fails, the extension automatically expands the video description, opens YouTube's built-in transcript panel when possible, and reads the transcript rows from the page. No external transcript service is used.

## Known v0.1 limitations

- Videos with no usable captions are not transcribed from audio. There is no Whisper or remote transcription fallback in v0.1.
- YouTube caption internals are undocumented and may change. The code is designed with fallbacks, but YouTube can still break extraction temporarily.
- ChatGPT composer auto-insertion depends on ChatGPT's page structure. Clipboard-first handoff is the permanent fallback.
- Saved destinations use normal web URLs; no internal Project API is used for either provider.
- Claude automatic insertion is unverified and disabled. Copy/open/paste is the supported beta path; Sarah still needs to confirm it in her browser.
- Very long transcripts produce a warning rather than being automatically chunked.

## If something breaks

### Extension says it cannot access YouTube
Reload the YouTube tab once. This is especially common immediately after installing/reloading an unpacked extension.

### No caption tracks found
Press **Retry**. The extension will attempt YouTube's built-in transcript panel automatically. If YouTube itself does not offer a transcript for the video, there is no audio-transcription fallback in this version.

### The destination opens but the prompt is not inserted
For Claude this is expected: check the intended Project/chat, then paste with `Ctrl+V` into your chosen message box. For ChatGPT, read any fallback warning and check for an existing draft before pasting. Review and send yourself.

### A saved Project opens the wrong place
Open the actual ChatGPT or Claude Project/page you want and save it again as a destination. Never guess its URL.

## Scope guard

The extension's product principle is:

> **Move useful source material into your chosen assistant. Let the assistant do the thinking.**

v0.1 intentionally does not include APIs, a backend, built-in AI summaries, Hermes integration, video history, highlights, notes, multi-video research, automatic Send, Whisper, or model selection.

## Development and release packaging

Run `npm run verify` and `npm test`. Tests execute the extension's source using simulated browser objects; they are not authenticated end-to-end proof.

After committing with a clean tracked tree, build the ZIP using Python's standard library:

```sh
python3 scripts/package.py /path/outside/repository/youtube-chatgpt-project-intake-0.1.8.zip
```

The archive contains the committed runtime files and product documentation, with version and exact commit in `BUILD.txt`. No dependencies or developer tests are needed to load it unpacked.

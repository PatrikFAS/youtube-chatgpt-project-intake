# YouTube AI Bridge

A lightweight Chrome/Edge browser extension that extracts YouTube transcripts and routes them to ChatGPT or Claude for summarization, critical analysis, or project-specific application.

**Beta candidate v0.1.18 — session Collection and explicit ChatGPT Send**

v0.1.18 adds a three-video session basket; v0.1.17 remains a separate Send-only milestone. Both additions await Patrik's own live acceptance. His v0.1.16 Claude autofill and v0.1.15 Custom journeys are accepted. Keep the working v0.1.16 ZIP as a fallback.

Patrik confirmed v0.1.16 Claude autofill in his selected real-browser journey and v0.1.15 Custom instructions. v0.1.17 keeps those flows and adds a separate, default-off ChatGPT Send action. Under Faster sending, opt in to reveal **Send to ChatGPT** and its destination URL. That button authorizes one send for the chosen video; Open, Copy, Preview and Retry remain manual. The opt-in is remembered on this browser and can be turned off. Claude has no Send action. New Send behavior is fixture-tested and still needs Patrik's harmless live sample.

YouTube AI Bridge is Patrik's chosen working name, used in forthcoming beta interfaces and documentation. This is the same extension: update the existing installation in place to retain its identity and saved settings. The name is provisional; no trademark/name clearance or store publication is implied.

Patrik accepted v0.1.10's Claude insertion in his tested case and v0.1.11's ChatGPT flow/UI, then reported later Claude failures including v0.1.15. His opt-in structural report now grounds the bounded v0.1.16 path; it does not prove live insertion or identify any Send button. Review and send yourself. See [PROJECT_PLAN.md](PROJECT_PLAN.md) for evidence and next actions; Sarah's separate acceptance is unrecorded.

The extension does **not** run its own AI. It extracts YouTube captions locally, packages them with a focused instruction and copies the complete prompt before opening your selected destination. ChatGPT uses the existing guarded composer insertion. Claude now attempts **guarded automatic insertion** in a recognized empty message box on the exact saved route. Patrik confirmed automatic insertion in his signed-in browser; his exact browser version and destination were not recorded. Drafts/attachments are preserved, the complete prompt stays copied, and you review and send yourself.

## Core modes

### Apply to Project
Starts with a brief 3–5 bullet **Video TL;DR** for orientation, then uses the current Project/conversation context to decide what from the video is actually useful. The prompt asks the chosen assistant to distinguish **ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK** and to avoid blindly copying the creator's recommendations.

### Analyze
Starts with the same brief orientation **Video TL;DR**, then critically evaluates the creator's reasoning, evidence, assumptions, novelty, limitations, hype, feasibility, and implications.

### Summarize
Faithfully compress the video into a TL;DR, key ideas, examples, conclusions, and useful timestamps.

### Custom instructions
Choose your own task without changing the presets. Enter nonempty instructions, then Preview, Copy or Open as usual. The full title/link, transcript and source-safety instructions are retained. The preset's optional question is preserved when you switch back; it is not appended to Custom.

After the required source header, Custom follows your requested answer structure. It does not demand an extra TL;DR, verdict or next step unless you request one. For a compact response experiment, explicitly ask for the brief opening you want.

Text is **one-off by default** and cleared when the popup closes. **Save locally** explicitly remembers one instruction on this browser, available under both assistants and retained across restarts/in-place updates. Later edits are one-off until you save again. **Forget saved instructions** clears it. Nothing is synced or uploaded by the extension. Unsaved Custom restores the last preset when you reopen; Retry keeps your current text.

For an optional skip/skim/watch/apply response experiment, see the [draft Custom prompt and comparison plan](PROJECT_PLAN.md#draft-custom-response-experiment). It uses existing Custom instructions; the preset/default prompts are unchanged.

The [optional compact-triage example](examples/compact-triage.txt) works in the already delivered v0.1.18: choose Custom, deliberately paste/edit the text, then Preview or Copy/Open and review manually. It requests one opening of at most 60 words after the full source header, distinguishes quality from relevance, allows provisional judgments and treats timestamps as approximate starts. Save locally only if useful; no example is loaded or saved automatically. Fixtures verify the prepared instructions/source integrity, not the resulting answer or actual time saved. No new extension update is needed; v0.1.18's Send/Collection live checks remain pending.

The raw transcript is a separate utility. The selected task appears above the action button and as SELECTED MODE in the copied prompt, so task choices remain easy to distinguish.

## Update an existing installation to v0.1.18

1. Extract the versioned ZIP and overwrite its files in the **same unpacked extension folder** you originally loaded. Keep that folder's location. You can back it up first.
2. Open `edge://extensions/` or `chrome://extensions/` and click **Reload** on the existing extension entry. Do not uninstall it; updating in place retains saved destinations and preferences.
3. Refresh relevant tabs without clearing drafts and confirm **YouTube AI Bridge / v0.1.18**. No new permissions. Keep the working v0.1.16 ZIP as a fallback; destinations/preferences remain. Reload/update clears any session Collection and Send attempt records.
4. For the new action, use [the harmless-sample Send check](TESTING.md#v0117-smallest-user-test). Send requires the exact saved route/document, one empty recognized composer, the complete exact prompt and one stable known enabled native Send control. Uncertain/partial cases stay manual. Same-video/prompt/destination requests are blocked for the browser session after any Send request, even if opening or sending failed. Check the conversation before any manual retry; a notice confirms the click request, not server acceptance.

## Collect two or three videos

Open **Collection** below the normal handoff actions. On each individual captioned video, choose **Add current video**. Repeat on the next video: the basket survives closing the popup and moving between tabs. Nothing is copied, opened or sent by Add. Review the full titles, links and caption tracks; use Up/Down, Remove or Clear as needed. Missing captions, duplicate IDs and oversized additions leave existing entries intact.

After at least two successful captures, choose **Use collection**, optionally enter one comparison question and choose the assistant/destination. The summary changes to Compare N videos; the single-video presets remain available through **Back to single video**. Preview, Copy and Open prepare the same combined source-labelled prompt. Collections always require manual Send, including when the individual-video Send opt-in is enabled. Sources keep their own title/link/timestamps; a repeated claim is not independent evidence.

Captions stay only in extension session storage, never local/sync storage. **Browser restart or extension reload/update/disable loses the basket.** Remove/Clear deliberately erases Collection items; handoff does not silently clear them. No background collection or playlist scraping. This beta holds three videos and refuses a complete serialized prompt above 60,000 JavaScript characters (UTF-16 units), plus a 512 KiB encoded-state bound. These are application trial limits, not model/token capacity guarantees; nothing is truncated or automatically split.

The update keeps supported destination URLs intact and rejects Codex or unfamiliar routes with repair guidance. It checks the actual URL, selected product controls and specific ChatGPT composer markers before insertion, preserves existing drafts, and consumes a handoff before editing to avoid duplicates. Unrecognized interfaces get a visible clipboard fallback; choose the intended ChatGPT surface before pasting. No product-mode override is invented.

For saved Projects, v0.1.4 also accepts a Project landing page opening a conversation inside that same Project. Saved conversations still require their exact path, and query/fragment differences remain rejected.

v0.1.5 recognizes the current Project-page message box using its specific ChatGPT form, editor-container and model-control markers. Its Pro model label and empty-editor voice button are supported; a visible Send button is not required before inserting into this verified composer.

In all three modes, v0.1.6 asks ChatGPT to name new chats `YT · <original YouTube title>` when starting from General ChatGPT or a recognized Project landing page. Saved conversation links get no naming instruction. ChatGPT controls whether the suggested title appears in its sidebar. See [TESTING.md](TESTING.md) for the browser check.

v0.1.8 puts the original source metadata first and strengthens the new-chat title preference. Patrik reports the earlier request still produced odd names. The extension only requests a title in the prompt; it never sets or verifies the sidebar name. An exact automatic title fix is **not confirmed**. For an exact name, use **Copy title** in the YouTube popup, then paste into the destination's Rename control yourself. This copies the preferred `YT · <full video title>` without opening a tab or renaming an existing chat.

All tasks, including Custom, ask **ChatGPT and Claude to begin every reply about the video, including follow-ups**, with its full original title, a Featuring line only for speakers/guests explicitly identified in the supplied title or transcript, then the video link. Unknown people are omitted; an uploading channel is not evidence that a person is featured. These are model instructions; actual reply formatting needs your test.

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

**Claude** is a top-level assistant choice. Under it, **New chat** is built in; saved Projects and conversations are labelled separately. Saved Claude URLs keep their path, query and fragment. The extension never guesses a Project URL or appends prompt parameters. It edits only a uniquely recognized empty composer on the exact saved route. If Claude redirects or needs login, check/navigate to the right context before pasting. Claude insertion has native-DOM fixture coverage and user-confirmed automatic insertion in Patrik's browser. A Project redirect to a chat is not assumed to prove Project membership; it uses clipboard fallback.

## Daily use

1. Open a YouTube video.
2. Click the extension.
3. Keep the preferred transcript track, or expand **Caption language** to choose another.
4. Choose **ChatGPT** or **Claude**, then a new chat or saved Project/conversation. Each assistant remembers its last destination.
5. Pick one mode:
   - **Apply to Project**
   - **Analyze**
   - **Summarize**
   - **Custom instructions** for your own one-off or explicitly saved task
6. For a preset, expand **Add a question** for a specific question. Custom has its own instructions field. Expand **Caption language** to change tracks.
7. Check the task summary. Optionally choose **Preview prompt** to read the full instructions, question and transcript. **Copy prompt** copies that complete text without opening a tab; use it to paste into an existing assistant conversation yourself. A changed task, destination, question or caption track clears the old preview.
8. Click **Open in ChatGPT** or **Open in Claude** when you want the normal handoff. Task, destination and question are captured at this click; controls lock while preparing the prompt.
9. The destination opens beside the captured YouTube tab. ChatGPT insertion is attempted in a recognized empty composer; for Claude, the beta checks the exact destination and a marked empty message box before attempting insertion. Keep any existing draft until you decide what to do with it.
10. Review the prompt and press **Send** yourself.

The full prompt is copied to your clipboard **before** either destination opens. Both providers keep clipboard fallback. If insertion is refused or unconfirmed, inspect the destination and any draft/partial insertion before pasting. If opening fails, the popup confirms that the complete prompt remains copied. If copying fails, no destination is opened.

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
- Saved destination URLs/preferences and custom instructions explicitly saved with Save locally stay in this browser's extension storage. One-off custom edits are not stored.
- Pending ChatGPT and Claude handoffs use session-only extension storage, expire after ten minutes, and are consumed before editing to avoid duplicate insertion.
- No extension-operated server receives transcripts. You use your own ChatGPT or Claude account and its normal website controls/privacy settings.
- Claude prompts are copied locally and never put in URLs. Only newly opened handoff tabs receive a temporary insertion payload; existing drafts and attachments block insertion. No Send button or Enter key is activated.

## Permissions

v0.1 requests:

- `activeTab`
- `storage`
- `clipboardWrite`
- narrow host access to YouTube, ChatGPT and https://claude.ai/* (Claude access enables its local content script)

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
- Claude insertion is user-confirmed in Patrik's tested case; other layouts and account/browser combinations still need their own acceptance. Unrecognized, ambiguous, redirected or busy composers get clipboard fallback; no generic editor fallback is used.
- Very long transcripts produce a warning rather than being automatically chunked.

## If something breaks

### Extension says it cannot access YouTube
Reload the YouTube tab once. This is especially common immediately after installing/reloading an unpacked extension.

### No caption tracks found
Press **Retry**. The extension will attempt YouTube's built-in transcript panel automatically. If YouTube itself does not offer a transcript for the video, there is no audio-transcription fallback in this version.

### The destination opens but the prompt is not inserted
For Claude, read the fallback notice and inspect the intended Project/chat and any existing or partial draft before pasting with Ctrl+V. For ChatGPT, read any fallback warning and check for an existing draft before pasting. Review and send yourself.

### A saved Project opens the wrong place
Open the actual ChatGPT or Claude Project/page you want and save it again as a destination. Never guess its URL.

## Scope guard

The extension's product principle is:

> **Move useful source material into your chosen assistant. Let the assistant do the thinking.**

v0.1 intentionally does not include APIs, a backend, built-in AI summaries, Hermes integration, video history, highlights, notes, multi-video research, automatic Send, Whisper, or model selection.

## Development and release packaging

Run `npm run verify` and `npm test`. Tests use simulated browser objects, not authenticated end-to-end sessions. Optional native-popup checks: `npm run test:browser -- /absolute/path/to/chromium` with Node 22+ and an existing browser binary. This uses an isolated synthetic profile and adds no dependency.

After committing with a clean tracked tree, build the ZIP using Python's standard library:

```sh
python3 scripts/package.py /path/outside/repository/youtube-chatgpt-project-intake-0.1.10.zip
```

The archive contains the committed runtime files and product documentation, with version and exact commit in `BUILD.txt`. No dependencies or developer tests are needed to load it unpacked.

Claude automation status: at Patrik's explicit request this beta enables a narrowly recognized insertion attempt for his browser test, despite the isolated tool browser being blocked by security verification. Source-reported markers and a reconstructed DOM are tested. Patrik subsequently confirmed automatic insertion in his signed-in browser; this is user-reported acceptance, not tool-observed verification of every guard or route. Clipboard fallback stays available. Run the optional native editing checks with npm run test:claude-browser -- /absolute/path/to/chromium.

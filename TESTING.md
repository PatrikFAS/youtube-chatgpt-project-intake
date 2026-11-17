# Manual and regression testing

## Current status

**v0.1.7 Claude beta: implemented; Sarah's acceptance not run.** The existing
Chrome and Edge workflow is user-confirmed working. This update preserves the
v0.1.6 title experiment below; its actual sidebar title remains unverified.
Ordinary Chrome/Edge acceptance does not need repeating without a new regression.

Claude uses copy/open/paste only. No live browser inspection tool is available
in this session, so no Claude editor selectors or automatic insertion are
claimed verified. There is no Claude injector or Claude host permission; the
extension cannot edit its composer, draft or Send control. Actual Claude
routing, paste behavior, account access,
framework synchronization and Sarah's acceptance are **not run**.

The bounded web routes use the new/chat/project URL shapes described in
[Claude's official link documentation](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link).
This reference identifies chat/project IDs as those in the web URL; its Desktop
prefill parameters are not assumed to be a web API. Project IDs are never
invented, and a saved Project URL is opened exactly as saved without inferring
which chat it might create. Queries and fragments are preserved.

### Sarah's short Claude acceptance check

1. Extract v0.1.7 to a permanent folder, then use **Load unpacked** from
   `chrome://extensions/` or `edge://extensions/` with Developer mode on. For an
   existing installation, update files in its existing folder and **Reload** the
   same extension entry; do not uninstall. Refresh the YouTube tab.
2. Sign into Claude normally. For a Project/conversation, open its actual page,
   click the extension, name it and **Save current destination**. General Claude
   is already available; no Project URL needs to be typed or guessed.
3. Open a captioned YouTube video, choose **General Claude**, **Summarize**, and
   an optional question. Click **Copy & open Claude**. Confirm the new Claude
   tab opens beside YouTube in the same window. Check the context, paste with
   `Ctrl+V`, and confirm the title, URL, transcript, mode and question are present.
   Review and send yourself.
4. Repeat **Analyze** and **Apply to Project** with a saved Claude conversation
   or Project. Confirm the saved context is the intended one before pasting.
   If Claude redirects or needs login, navigate to that context yourself and
   paste there; the extension makes no claim about editor identity.
5. Leave a draft in an existing Claude tab and repeat a handoff: confirm the
   extension leaves it untouched. Do not paste over a draft you want to keep.
   Reopen the popup to confirm the last mode/destination and caption preference
   remain selected. Report browser/version and pass, fail or not run.

### v0.1.7 regression evidence

- `npm run verify` passes Manifest V3, version synchronization, existing narrow
  permissions and all JavaScript syntax checks. `npm test` passes all four
  suites, including the unchanged extraction fallbacks and ChatGPT injector
  draft/attachment/route protections.
- Added fixtures execute the actual worker, popup, options and destination
  helper for all three Claude modes, source-tab anchoring, exact URL state,
  clipboard-before-open, blocked clipboard/open failure, no missing-selection
  redirect, built-in migration, saved destinations/preferences and cross-provider
  handoff rejection. No Claude prompt is stored for automatic insertion.
- These checks are automated fixture passes, not authenticated Claude or Sarah
  acceptance. Existing title instructions remain covered by the original
  v0.1.6 tests.

## Previous title experiment status (v0.1.6)

**v0.1.6 naming / Edge sidebar check pending.** The user confirmed v0.1.5 worked in Edge after earlier confirmation of ordinary source-adjacent tab placement. Pinned and grouped source tabs remain untested. For v0.1.6, tests verify the outgoing prompt, while checking the actual sidebar title requires a signed-in ChatGPT session.

Popup fixtures verify the exact title and clipboard payload for all three modes, and omission on existing or ambiguous routes. The browser tool's request to ChatGPT received HTTP 403, and the local browser connection did not expose the signed-in Edge session. No actual sidebar title was observed.

## Naming experiment in Edge (v0.1.6)

- [ ] Open a captioned video with a distinctive title and use **Summarize** with **General ChatGPT**. After pressing **Send** yourself, let ChatGPT set the title. Verify the title shown in the ChatGPT sidebar is exactly `YT · <original YouTube title>`, including punctuation. Text in ChatGPT's reply does not count.
- [ ] Repeat with **Analyze** and **Apply to Project** from fresh chats, including at least one saved Project landing page. Record the actual sidebar titles even if they differ from the request.
- [ ] Send to a saved conversation. Confirm the prompt has no `CHAT TITLE` block and the sidebar still shows the previous chat title.

## Automated checks

Run from the repository root with Node.js:

```sh
npm run verify
npm test
```

`npm run verify` checks Manifest V3, expected narrow permissions, manifest-referenced files and JavaScript syntax, and that `manifest.json` and `package.json` versions agree. `npm test` runs simulated transcript-fallback, routing-handoff and popup/options fixtures. These checks do not prove live ChatGPT routing or actual browser tab placement.

## Evidence recorded for v0.1.3 (2026-10-13)

- Baseline inspected: `6d7e0e3754454ea101b0f8a068ec1957e55eed18` (v0.1.2). Both existing caption fallback tests passed. `npm run verify` initially hit sandbox `spawnSync EPERM`; rerunning with subprocess access passed all nine baseline JavaScript syntax checks.
- Baseline source executed in a VM accepted `https://chatgpt.com/codex` and inserted into a generic form editor. These are fixture reproductions of unsafe code paths, not a reproduction of the affected browser's routing problem.
- Updated `npm run verify` passed Manifest V3, unchanged narrow permissions, version consistency and 12 JavaScript syntax checks. Updated `npm test` passed both original caption tests and the routing/handoff and popup/options suites, executing the actual changed extension source with simulated browser objects.
- The available browser started with only `about:blank`; navigating to `https://chatgpt.com/` returned HTTP 403 and a “Just a moment…” page. No authenticated ChatGPT surface was accessible. Live destination routing, the current composer markers, real tab placement, pinned/grouped tabs and update retention remain **not run** in the affected browser.

## Evidence recorded for v0.1.4 (2026-10-13)

- Private user feedback supplied the saved Project URL and the opened same-Project conversation URL. Only synthetic identifiers are used in documentation and regression fixtures.
- The new same-Project regression failed with v0.1.3's strict matcher and passed after the shared helper change. `npm run verify`, all four `npm test` suites and `git diff --check` passed for v0.1.4; the verifier required subprocess access after sandbox `spawnSync EPERM`.
- Regression checks execute the actual helper, background listener and injector for the Project landing-to-conversation transition. Different Projects, saved-conversation changes, queries/fragments and Codex remain rejected; existing draft and no-automatic-Send protections remain in place.
- Fixture checks do not establish insertion into the current authenticated composer. Update the existing installation in place, refresh open tabs, and repeat the saved-Project handoff before confirming the fix in Edge.

## Current Project composer coverage (v0.1.5, 2026-10-13)

- A private screenshot showed the composer-recognition timeout in Chat mode. Private inspected HTML identified `form[data-chatgpt-composer]`, `[data-composer-body]`, `[data-composer-input]`, and an editable `[data-composer-markdown]` textbox with no legacy editor ID or test ID. The form contains `button[aria-label="Select ChatGPT model"]` with a Pro label and a Start Voice button instead of a visible Send button while empty.
- The model button's internal `data-codex-intelligence-trigger` attribute is present in this verified ChatGPT layout. It is not evidence that Codex is the active product; active controls and destination checks remain enforced.
- Regression fixtures use synthetic names and IDs. The real-browser fixture at `tests/fixtures/chatgpt-project-composer.html` recreates the verified semantic structure without private HTML values or generated CSS classes. It supplies a mock extension handoff; the actual destination helper and injector must be injected separately. This is browser verification of insertion into a reconstructed DOM, not an authenticated end-to-end run in the user's Edge session.
- The old injector reproduced the exact composer timeout in the real browser fixture. The new injector inserted the complete fixture prompt once, with one handoff claim, no button clicks and the unrelated editor untouched. Playwright intercepted synthetic ChatGPT URLs locally and loaded the actual helper/injector source; virtual browser time advanced timeout checks.
- All eight additional browser scenarios passed: the same-Project conversation transition, an existing draft, a nonempty hidden attachment container, visible Codex mode, mode and route changes during claim, a missing composer-body marker, and duplicate script loading. Safety cases left content untouched with a visible clipboard fallback.
- Final `npm run verify`, all four `npm test` suites and `git diff --check` passed. The affected signed-in Edge session remains inaccessible to the separate tool browser; this update still needs installation confirmation there.

## Focused browser acceptance checks

Load or update the unpacked extension, then refresh the YouTube and ChatGPT tabs. Keep the existing unpacked folder and reload its extension entry so saved destinations and preferences remain available.

- [ ] From a YouTube video, send to a saved ordinary ChatGPT conversation and confirm the exact intended URL, including meaningful path, query and fragment, remains selected.
- [ ] Repeat with a saved ChatGPT Project. If its landing page opens a conversation, confirm it is inside the same Project and no destination-mismatch warning appears. Confirm insertion or record the exact clipboard-fallback reason, and verify the active mode is ChatGPT. Do not publish private Project IDs or conversation contents.
- [ ] Confirm the result opens in the same browser window immediately to the right of the originating YouTube tab. During transcript extraction, move the source tab and repeat; placement should follow its current index. Repeat with multiple windows to ensure the source window is used.
- [ ] Pin the source tab and record the browser's placement: browser behavior can clamp a new result after the pinned-tab area. Test with a grouped source tab and note the browser's group behavior; group inheritance is browser-dependent and the extension does not request group-management permission.
- [ ] Close the source tab during extraction and confirm the handoff fails visibly without selecting an unrelated tab as the source. Simulate or observe tab-creation failure and confirm the prompt remains available from the clipboard.
- [ ] Try an unfamiliar/invalid destination, a Codex destination/mode (including a ChatGPT URL whose product mode is selected in-page), and a login/access screen. The extension should not insert into an ambiguous or inaccessible surface; it should leave the clipboard fallback visible and preserve the saved destination for repair/resave.
- [ ] Put a draft in the destination composer before handoff, then confirm it remains untouched. Confirm an unrelated editable field is never treated as the ChatGPT composer and no duplicate insertion occurs.
- [ ] Confirm both composer insertion and visible clipboard fallback paths. In either path, verify that the extension never triggers **Send** automatically; review and send manually.
- [ ] Confirm the three modes, optional question, saved destinations/preferences, transcript view/copy and caption fallback still work after reloading the extension.

Record each result as **pass**, **fail**, or **not run** and name the browser/version. A fixture or code inspection does not count as a pass for a live browser item. The supplied links explain the destination warning; they do not establish the original Codex report's cause or prove successful insertion with this update.

## Existing transcript acceptance checks

- [ ] Manual English captions, auto-generated captions and multiple caption tracks load and show the selected track correctly.
- [ ] YouTube single-page navigation updates the video metadata without restarting the browser.
- [ ] Short and long transcripts load; a very large transcript shows its warning.
- [ ] A no-caption video gives a clear failure or transcript-panel fallback guidance.
- [ ] Transcript view is readable and timestamped; copy includes title, URL, track, timestamps and transcript.
- [ ] Apply includes ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK guidance; Analyze asks for critical evaluation; Summarize asks for faithful compression.
- [ ] An optional question appears in the prompt.

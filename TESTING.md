# Manual and regression testing

## Current status

**READY TO TEST / BLOCKED ON LIVE REPRODUCTION.** Issue #1's reported live misrouting has not been reproduced. The current automated transcript checks use simulated browser objects; they are useful fixture evidence, not an authenticated YouTube → ChatGPT end-to-end test. No authenticated browser verification has been completed. Keep issue #1 open after merge until the user tests both requested outcomes in the affected browser.

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

## Focused browser acceptance checks

Load or update the unpacked extension, then refresh the YouTube and ChatGPT tabs. Keep the existing unpacked folder and reload its extension entry so saved destinations and preferences remain available.

- [ ] From a YouTube video, send to a saved ordinary ChatGPT conversation and confirm the exact intended URL, including meaningful path, query and fragment, remains selected.
- [ ] Repeat with a saved ChatGPT Project and confirm the actual destination is that Project, not a Codex conversation or general chat. Record the URL shape and visible product/mode. Do not publish private Project IDs or conversation contents.
- [ ] Confirm the result opens in the same browser window immediately to the right of the originating YouTube tab. During transcript extraction, move the source tab and repeat; placement should follow its current index. Repeat with multiple windows to ensure the source window is used.
- [ ] Pin the source tab and record the browser's placement: browser behavior can clamp a new result after the pinned-tab area. Test with a grouped source tab and note the browser's group behavior; group inheritance is browser-dependent and the extension does not request group-management permission.
- [ ] Close the source tab during extraction and confirm the handoff fails visibly without selecting an unrelated tab as the source. Simulate or observe tab-creation failure and confirm the prompt remains available from the clipboard.
- [ ] Try an unfamiliar/invalid destination, a Codex destination/mode (including a ChatGPT URL whose product mode is selected in-page), and a login/access screen. The extension should not insert into an ambiguous or inaccessible surface; it should leave the clipboard fallback visible and preserve the saved destination for repair/resave.
- [ ] Put a draft in the destination composer before handoff, then confirm it remains untouched. Confirm an unrelated editable field is never treated as the ChatGPT composer and no duplicate insertion occurs.
- [ ] Confirm both composer insertion and visible clipboard fallback paths. In either path, verify that the extension never triggers **Send** automatically; review and send manually.
- [ ] Confirm the three modes, optional question, saved destinations/preferences, transcript view/copy and caption fallback still work after reloading the extension.

Record each result as **pass**, **fail**, or **not run** and name the browser/version. A fixture or code inspection does not count as a pass for a live browser item. The original routing failure needs a live reproduction before claiming its cause is confirmed.

## Existing transcript acceptance checks

- [ ] Manual English captions, auto-generated captions and multiple caption tracks load and show the selected track correctly.
- [ ] YouTube single-page navigation updates the video metadata without restarting the browser.
- [ ] Short and long transcripts load; a very large transcript shows its warning.
- [ ] A no-caption video gives a clear failure or transcript-panel fallback guidance.
- [ ] Transcript view is readable and timestamped; copy includes title, URL, track, timestamps and transcript.
- [ ] Apply includes ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK guidance; Analyze asks for critical evaluation; Summarize asks for faithful compression.
- [ ] An optional question appears in the prompt.

# Manual and regression testing

## v0.1.21 startup check

**Confirmed regression:** Patrik installed v0.1.20 and got only a small green
square. The exact shipped ZIP reproduces a 25x25 **real action popup** with
startup complete and the manifest loaded. v0.1.19 opens normally. The root's
max-width:100vw / max-height:100vh formed a loop with Chromium's initial action
auto-sizing. Fixed viewport tests hid that loop. v0.1.21 changes only root/shell
layout and version metadata; permissions, preferences, prompts and Send guards
are unchanged. Keep v0.1.20 for regression evidence, not as the working fallback.

**Actual action test:** run `npm run test:action-browser -- CHROMIUM OLD19 OLD20 CANDIDATE`
with the existing Chromium executable and extracted exact ZIP directories. It
loads an unpacked extension into disposable profiles and opens chrome.action.openPopup
through its own options-page control context. No Emulation/device-metrics command
sets the popup size. Each action is a native popup view, not a normal extension
tab (getViews popup count=1, tabs.getCurrent=null). Its API/worker/storage are real;
YouTube/provider HTTP responses and captions are intercepted synthetic fixtures.
It checks unsupported/no-source content, collapsed controls, actual caption Add,
ready Collection/manual file action, retained ChatGPT opt-in and saved destination
view. No primary handoff/Send is activated and no pending/Send records appear.

The same unpacked path/profile is updated 19 -> 20 -> candidate **between browser
restarts**; this verifies local settings and URL/query/fragment retention through
that update path. The browser extension-entry Reload button itself is not driven.
A separate fresh candidate profile runs the same states. In this headless Chromium
setup the candidate's actual viewport is approximately 415x510, constrained by its
display/work area; the footer fits the actual height. Do not claim every browser
will grant those exact dimensions. The root's preferred 400x600 is independent
of the initial viewport, and the fixed shell fits the available viewport.

**Separate page fixtures:** `npm run test:browser -- CHROMIUM` still forces
400x600, 360x480 and 320x400 to test keyboard/hit targets, long source/basket
scrolling and footer access. Those page/API fixtures validate 24 task/provider
cases plus Collection and exact 78,817-unit Preview/Copy/download/manual-Open
equality. They supplement real action startup coverage; they do not establish
intrinsic action sizing or authenticated ChatGPT/Claude behavior.

The supplied PNG's metadata/caption was accessible, but its transfer helper
failed on Windows extended-attribute support before leaving readable local bytes.
User pixels were not inspected. The independently reproduced native green square
was captured and viewed locally; no personal browser/draft was accessed.

**Smallest owner test after receiving the verified v0.1.21 ZIP:** overwrite the
SAME unpacked folder, Reload the existing extension, then refresh relevant tabs
safely. Do not uninstall/load a duplicate. Click Bridge and confirm v0.1.21 opens
normally. Set Auto-send off first: a prior opt-in remains remembered. Check saved
destinations/Custom and one ordinary manual/Collection handoff. Session baskets
clear on reload; downloaded/clipboard/provider copies have separate lifetimes.
If Send is tested later, use one harmless sample and report only its code if
withheld; never retry an uncertain send. The prior COMPOSER_UNSAFE investigation
is preserved, and this CSS fix makes no new live Send claim.


## v0.1.20 focused UI check

Patrik confirmed **Collection worked in his v0.1.19 browser**. The report does
not identify a specific mode or attachment format. He reported the popup was
clunky and separately supplied the Send code discussed below. Keep those
outcomes separate; v0.1.19 is retained as rollback.

A read-only native check of the exact shipped ZIP at 400x600, with the prior
Send opt-in remembered, placed the primary action at y=651..694, below the
viewport; no message was opened/sent. The candidate fixes that measured layout
issue with a bounded body scroller and a separate footer. Local fixtures pass
400x600 and 360x480 with long titles/baskets, open alternatives, native hit targets,
no horizontal/whole-popup scrolling, keyboard intent selection and Tab access
to the primary action. These are geometry/fixture checks, not personal-browser
inspection or a real install/update lifecycle test.

1. Review any earlier uncertain conversation result before changing builds.
   Overwrite the SAME unpacked folder with v0.1.20, Reload its existing entry,
   refresh tabs safely and check the version. No uninstall/duplicate entry.
   Session baskets/attempt records clear on reload; local settings survive.
2. **Set Auto-send off** for the manual check. A prior opt-in stays remembered;
   updating does not reset it. The visible main label must be Open in ChatGPT
   or Open in Claude. Confirm the footer remains reachable while scrolling the
   body, opening source review and using the keyboard.
3. With zero/one Collection entries, Add current video stays visible; one entry
   asks for another. At two/three, choose Use collection. Its compact selector
   defaults to Compare & synthesize; Summarize/Apply have distinct purposes,
   and Analyze remains an explicit focused evidence-review option. No saved
   Analyze setting is silently remapped; Collection intent is still one-off.
   The optional decision question is disclosed, not required. Back to single
   video restores its preset/Custom draft. Collections never auto-send.
4. A Collection above our local 60,000-unit autofill bound shows **Download .txt**
   as its primary action. Check the file's complete last source/end marker;
   Preview/Copy are under Other options. Use the alternative Open in the chosen
   assistant, attach the file yourself if supported, and type only “Follow the
   instructions in the attached file.” Do not also paste the whole copied
   prompt. Check destination and any pre-existing draft; Send stays manual.
   Provider file/context limits remain separate and unverified.
5. Optional Send diagnosis: follow the separate harmless-sample check below once.
   Report only the bracketed code if withheld; never retry an uncertain Send.

**Two live outcomes still needed:** (a) footer/intent/file flow is understandable
and reachable in Patrik's installed popup, with one complete manual Collection
handoff; (b) one controlled ChatGPT Send succeeds once or identifies the remaining
guard through the new code. Claude's selected v0.1.16 acceptance remains separate.
After acceptance, the highest-value next step is one independent unaided beta
using an actual task and the existing feedback guide, not another feature sprint.


## v0.1.20 Send diagnosis candidate

**User evidence:** Patrik received COMPOSER_UNSAFE in v0.1.19. That code is
produced only in checkSend, after the initial insertion verification. No Send
is requested on that path. Since destination, recognized editor and known
attachment/activity checks precede it, the remaining ordinary reachable branches
are a blocked ancestor, unexpected writable-field count, or a node wrapper /
non-editable child. An offscreen textarea with layout dimensions is conservatively
counted by the existing predicate. Own read-only state or a missing form normally
fails the preceding recognized-editor check instead. These are reachable cases,
not a diagnosis of his unseen DOM.

The exact shipped v0.1.19 ZIP reproduces COMPOSER_UNSAFE for six injected local
shapes; the candidate distinguishes COMPOSER_ANCESTOR_BLOCKED,
COMPOSER_EDITOR_COUNT, COMPOSER_NODE_VIEW and COMPOSER_NONEDITABLE_NODE. Marked
synthetic attachment conversion yields UPLOAD_OR_ACTIVITY; plain unsupported
formatting still fails exact payload verification. A long native insertText
remains plain in the local fixture. All 53 Send cases pass against both asset
sets, with the same click/no-click results. No recognition or safety condition
is relaxed; no unknown rich node is assumed harmless.

[OpenAI release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
describe large pastes over 10,000 characters converting to attachments, and rich
paste retaining formatting. Bridge uses insertText rather than a paste handler;
the documentation does not establish its result or Patrik's affected DOM.

**Smallest next Send test, owner Patrik:** after reviewing any earlier uncertain
conversation result, choose one harmless short captioned sample and the intended
empty destination. Check the exact URL, deliberately enable Auto-send and choose
Send to ChatGPT once. Report only the bracketed code if withheld. Do not provide
transcript, draft, HTML, Project URL, account IDs or credentials. Do not repeat an
uncertain Send; review manually. No extra diagnostic-copy step is required and
the full copied prompt is preserved. Keep the v0.1.19 ZIP unchanged as rollback.


## v0.1.19 focused user check

**Actual report:** Patrik's v0.1.18 ChatGPT attempt displayed the generic
“automatic Send was withheld” warning. This proves the post-insertion Send
routine ended without a native click; it does not identify whether route,
composer, exact serialization, Send-control readiness or authorization failed.
Claude was not tested in that report. No personal browser/draft was inspected.

1. Update the SAME unpacked folder to v0.1.19, Reload the existing extension,
   refresh relevant tabs safely and confirm the version. Reload loses any basket.
   Do not uninstall or load a duplicate. Keep old ZIPs unchanged.
2. Normal manual task: leave Auto-send off, choose the provider/destination and
   mode, Preview, then Open. Inspect source, exact destination and full unsent
   draft. Existing drafts must remain untouched. Claude stays manual.
3. Optional ChatGPT Send: choose one harmless short sample and an empty intended
   composer; turn Auto-send on. Check the displayed URL and main button labelled
   Send to ChatGPT, then click ONCE. Record one sent message or only the bracketed
   code and public notice. Never share the prompt, draft, Project URL or credentials.
   Do not retry an uncertain attempt; check the conversation first. Disable the
   toggle afterward if unwanted. Codex performs no live third-party sends.
4. Collection: Add two/three captioned sources, review and Use collection. Confirm
   Compare & synthesize is selected. Try Summarize, Analyze and Apply via Preview:
   SELECTED MODE and the task instructions must differ. Back to single video must
   restore the prior task/Custom draft. Collections always use manual Send.
5. For a large Collection, Preview and Copy retain all sources. Save prompt .txt,
   open the file locally and check the last source/end marker. Above the local
   60,000-unit autofill bound, Open copies and opens only. Attach the file yourself
   if supported and ask “Follow the instructions in the attached file.” This is
   not automatic attachment or a provider-size guarantee. Delete local files and
   clear clipboard/provider copies separately when appropriate.

**Fixture evidence:** mandated verify/tests; 24 native single-video popup
combinations plus opt-in/main-action and Collection journeys; exact 78,817-unit
Preview = Copy = downloaded UTF-8 .txt = Open payload; no pending worker insertion
for oversized Collections on either provider; four Collection prompts/defaults and
single Custom restoration; existing missing/duplicate/quota/race/source guards;
45 native Send cases with closed reason codes and native one-click/no-send effects;
68 Claude manual/draft/route cases. No model answers, real installation lifecycle,
provider upload behavior or live Send success are inferred from these fixtures.

Reason codes identify a conservative guard, not a diagnosis of the provider.
UPLOAD_OR_ACTIVITY may include an idle upload-shaped control; recognition was
not broadened without live evidence. PAYLOAD_MISMATCH keeps exact comparison.
AUTH_* reports one-time worker refusal; no URL/content is echoed or uploaded.
The original v0.1.18 generic report cannot be assigned a specific code retroactively.


## Current status

**Optional compact example follow-up, no new extension build:**
examples/compact-triage.txt can be pasted deliberately into existing v0.1.18
Custom. Forty prepared-prompt comparisons cover useful, weak, off-topic and
incomplete synthetic captions, both providers, the three unchanged presets,
ordinary Custom and this example. Full titles/URLs/captions, source safety and
hour-long timestamps remain intact. Two popup fixture journeys verify matching
Preview/Copy/Open, no automatic save and manual Open even after Send opt-in.
No AI answers were generated: the 60-word target, judgments, timestamp choices,
missing-caption awareness and practical usefulness still need human review.
The versioned v0.1.18 ZIP and live Send/Collection checklists below are unchanged.

**v0.1.18 Collection milestone:** two or three captioned videos in a manually
filled session basket. Review/reorder/remove/clear, one comparison question and
source-labelled Preview/Copy/Open work with both providers; Send remains manual.
Session data is lost on browser restart or extension reload/update/disable.
The separate v0.1.17 artifact tests explicit ChatGPT Send independently.

Required verification/test suites pass, including worker revision/generation,
source/segment pairing, size boundary, duplicate/missing/source/quota failures
and source navigation before/during extraction. Native popup checks exercise
the complete three-video Add/reopen/review/copy/open path, source-specific
hour-long timestamps, safe title rendering, stale previews, write failures and
late capture after Clear; all 24 single-video combinations and explicit opt-in
checks pass. The 35 native Send cases and 68 Claude cases remain synthetic.

### v0.1.18 focused Collection check

1. Update the same unpacked folder, Reload and refresh relevant tabs. Confirm
   v0.1.18; updating loses any earlier session basket. Saved destinations and
   Custom settings remain. Leave explicit Send off while testing Collection.
2. On a captioned video expand Collection and Add current video. Repeat on two
   related videos. Reopen the popup between videos: count/titles/tracks should
   remain. Add does not copy/open/send. A duplicate/missing/oversized source
   must not replace previously added items.
3. Review titles/links/tracks, try Up/Down or Remove, then Use collection. Add
   a short comparison question and choose the intended provider/destination.
   Preview/Copy/Open should contain the same sources/question/timestamps, with
   each timestamp tied to its own video. Current-video Copy title/transcript
   utilities are hidden while using Collection to avoid mixing sources.
4. Open, check the intended destination and complete unsent prompt. Existing
   drafts must remain untouched. There is no Collection Send action. Any actual
   model comparison is Patrik's manual choice; check usefulness and citations
   separately from successful handoff.
5. Clear removes the basket; reload/restart also loses it as disclosed. Keep
   working v0.1.16 and Send-only v0.1.17 ZIPs for isolated comparisons. No live
   new-feature acceptance or real browser storage lifecycle was run by Codex;
   native popup tests use mocked extension APIs and actual DOM interactions.

**v0.1.17 explicit ChatGPT Send milestone:** default off; remembered opt-in only
reveals a separate Send action and destination URL. Open/Copy/Preview/Retry remain
manual. Worker fixtures cover duplicate requests, reload/document binding,
authorization consumption and provider/Collection rejection. Native intercepted
DOM tests exercise one-click effects and protected failures; these do not
establish live ChatGPT acceptance.

Verification: required suites, 24 native popup combinations plus the native
remembered-opt-in/action check, 31 native Send cases and 66 Claude cases pass.
Send cases include exact paragraph/indentation preservation, known/unknown and
duplicate controls, drafts/uploads, claim/focus changes, route/control/text
changes during authorization, denied permission and one-click submit effects.

Patrik confirmed v0.1.16 Claude autofill on his selected real-browser journey and
v0.1.15 Custom instructions. Keep the v0.1.16 ZIP as the accepted fallback.

### v0.1.17 smallest user test

Update the same unpacked folder, Reload and refresh relevant tabs. On one short,
harmless captioned sample choose ChatGPT and inspect the visible destination.
Open Faster sending, enable the remembered opt-in, then click **Send to ChatGPT**
once. Check that exactly one full prompt appears as a sent message, or that the
notice withholds Send and leaves manual review. Do not retry an uncertain send;
check the conversation first. Existing drafts must remain untouched. Claude has
no Send action. Turn the opt-in off afterward if undesired. Codex does not run
this live test.

**v0.1.16 addresses the reported Claude pre-insertion refusal.** The supplied
v0.1.15 report has one recognized chat-input / textbox / tiptap / ProseMirror
editor with the exact Write your prompt to Claude label, four enabled controls
at ancestor five and six, and no chat-input-send marker. A redacted matching DOM
fixture reproduced the old refusal with zero claims/edits. It now accepts native
manual autofill with full-text stability checks, without identifying Send.
The report describes control structure, not the failed handoff's timing,
destination or framework acceptance. No signed-in browser is controlled here.

### v0.1.16 focused Claude acceptance

1. Overwrite the files in the same unpacked extension folder with v0.1.16,
   Reload the existing extension entry, refresh relevant tabs and confirm the
   version. Do not uninstall, load a duplicate or clear any existing draft.
2. From one captioned video, select Summarize and the same affected saved Claude
   destination. Choose Open. Check the exact intended Project/chat and that the
   full selected prompt appears. **Do not press Send.**
3. If there is an existing draft/attachment, the safe result is untouched content
   plus clipboard fallback. Never delete a draft simply to make the test pass.
4. Report inserted/not inserted, destination kind and exact notice if any.
   The supplied diagnostic is sufficient; no repeat is requested. After any
   uncertain/partial insertion, inspect before pasting to avoid duplication.

Native fixture checks establish text acceptance and guards, not live Send
readiness. No button, form or Enter submission is triggered. ChatGPT's accepted
normal-case test and Sarah's independent acceptance remain separate.

**v0.1.16 verification:** `npm run verify` and `npm test` pass. Native Chromium
passes all 24 popup task/provider/destination cases, including retained choices
and Preview = Copy = Open, plus 66 Claude cases (42 existing and 24 new). The new
cases cover the reported layout on all destination kinds, text/whitespace/rich
drafts, hidden attachments, busy/readonly/dialog states, claim/focus restoration,
wrong/changed routes, partial/rejected edits, duplicate scripts/composers,
ambiguous marked controls, missing identity markers and redacted diagnostics.
All assert zero automatic button clicks, submissions and Enter events.

## Previous candidate history

**v0.1.15 optional candidate: Custom's answer-structure conflict corrected.**
The shared header used to require a TL;DR even for a Custom task requesting
questions or another format. The source title/known-people/link header is kept;
after it, Custom follows USER INSTRUCTIONS without an imposed summary/verdict/
template/next step unless requested. The three presets are unchanged. Current
v0.1.14 testing continues in the original checkout; this candidate is in an
isolated worktree of the same repository. No visible browser or live AI prompt
was used in this pass. Claude's recognition/Send identity remains unresolved.

### v0.1.15 focused acceptance

1. Finish any in-progress v0.1.14 test first. When ready, overwrite the same
   unpacked installation folder and Reload its existing extension entry; do
   not uninstall or load a duplicate. Refresh tabs and confirm v0.1.15.
2. Choose Custom and enter "After the required source header, give exactly two
   discussion questions. Do not add a summary." Preview/Copy must retain the
   task, real source metadata/link, transcript and safety instructions without
   the old unconditional "its TL;DR follows the header" instruction.
3. If you explicitly ask for a TL;DR or a 60-word skip/skim/watch/apply opening,
   that text must remain in the prepared prompt. Save/forget and one-off behavior
   are unchanged. Preview, Copy and Open must carry the same complete payload.
4. Optional actual-answer review is Patrik's manual choice in the working
   ChatGPT path. Confirm the source header then requested structure; do not
   treat payload tests as proof of model compliance. No agent sends a live test
   message. The smallest existing Claude check remains separate and needs no
   new candidate installation simply to obtain the structural report.

Required verify/test suites and all 24 native popup combinations pass. A local
comparison against delivered v0.1.14 proves 18 preset payloads byte-identical
and removes the conflicting directive in all six Custom destination cases.
Both injectors, destination/routing code and permissions are unchanged; the
previous 42 Claude safety cases remain evidence, not a new live verification.

## Active user test v0.1.14

The engineering plan now follows the shared Product and Launch strategy:
reliability first, a compact-response experiment through existing Custom, then
independent-user evidence before expansion. This documentation pass changes no
runtime, preset/default prompt, version or delivered ZIP. The [smallest Claude
user check](PROJECT_PLAN.md#smallest-claude-user-check) is one affected handoff
without Send, followed by the opt-in structural report only if recognition still
fails. Actual DOM/Send identity is still missing, not just final acceptance.
The [Custom response experiment](PROJECT_PLAN.md#draft-custom-response-experiment)
needs human output review; payload fixtures cannot establish good AI judgment.

**v0.1.14 candidate: Custom instructions implemented; live Claude recognition remains unresolved.**
Signed-in Edge accessibility/DevTools were reachable during Patrik's authorized
free window, but bounded read-only expression and focus/hit-test attempts did
not return usable DOM evidence. No Claude composer values, drafts, messages,
cookies or profile files were read/changed, and no AI message was sent. Temporary
inspection code was confined to DevTools, not Claude's editor. Browser control
stopped when Patrik returned. Do not repeat input workarounds or claim this
establishes raw DOM markers; prefer supported inspection or the opt-in report.

### v0.1.14 focused acceptance

1. Overwrite files in the same unpacked folder, Reload the existing extension
   entry and refresh tabs. Do not uninstall or load a duplicate. Confirm
   **YouTube AI Bridge / v0.1.14** and your retained destinations/preset.
2. On a captioned video, choose Custom instructions and enter "Create five
   discussion questions with timestamps." Preview the full task, source title/
   link and transcript; Copy should match without opening a tab. Empty Custom
   must refuse preparation. Switching presets keeps their original behavior.
3. Close/reopen without saving: custom text should be gone and your last preset
   restored. Try again with Save locally: reopen to see the saved instruction.
   Edit without saving and reopen to recover the original saved text. Forget
   saved instructions clears it. Retry keeps a current one-off draft.
4. Use Open with your intended provider/destination, review insertion or fallback
   and send only yourself. Existing drafts remain untouched. Patrik's accepted
   ChatGPT path needs only a new-Custom regression, not redundant whole-product
   acceptance. Claude insertion remains a pending live check.
5. If Claude still reports an unrecognized message box, optionally Copy
   troubleshooting details and paste that structural report into the support
   conversation with the destination kind. It contains no prompt/draft/message
   text or URLs. This replaces the clipboard prompt; Copy prompt restores it.

Required verify/test suites pass. Native popup tests cover 24 combinations
(four tasks, both providers, new/saved chat/Project), Preview = Copy = Open,
explicit local save/forget/reload and one-off clearing. Unit fixtures cover
Retry, async capture, empty instructions and save/forget failures. The existing
42 Claude safety/diagnostic native-DOM cases pass separately. These are mocked
handoffs, not live Claude insertion or Sarah's acceptance. Custom's expanded
editor scrolls within the popup; the primary action remains visible for the
standard collapsed-preset fixture.

## Previous candidate v0.1.13

**v0.1.13 candidate: YouTube AI Bridge name and bounded Claude editor support.**
The signed-in accessibility evidence below supports an exact label plus both
tiptap/ProseMirror classes. The new candidate requires all three on a
contenteditable element, while the original Claude Send marker and all route,
unique-editor, draft/attachment and one-time-claim checks remain mandatory.
Accessible name can come from different DOM mechanisms; the actual aria-label
and Send marker have not yet been inspected. Fixtures reconstruct that
candidate; they do not prove that the real page matches or that the reported
failure is fixed. Browser control stays paused until a coordinated window.

### v0.1.13 focused acceptance

1. Prefer direct, coordinated inspection of the existing signed-in Claude tab
   before asking for another installation. If trying the candidate, overwrite
   the same unpacked folder and Reload its existing entry. Do not uninstall or
   load a duplicate. Refresh tabs and confirm YouTube AI Bridge / v0.1.13.
2. Confirm saved destinations, task and caption preferences remain. The name
   change affects display text, not IDs, storage keys or URL handling. All
   three modes and Preview/Copy/Open keep their existing prompt wording.
3. For the affected Claude destination, inspect exact editor/Send controls
   read-only before any broader change. If the candidate is tested, review
   insertion or fallback without sending; existing drafts must stay untouched.
   Do not claim success for an untested route/account/layout.
4. If it still fails and a self-service report is preferred, use the optional
   Copy troubleshooting details button as described below. That explicit copy
   replaces the clipboard prompt; the YouTube popup's Copy prompt restores it.

Required verify/test checks pass. The isolated native popup passes all 18
task/provider/destination combinations and the longer product name fits the
reviewed light/dark layouts without horizontal overflow. Claude's native-DOM
fixture passes 42 cases, including ten cases for the labelled candidate across
destination kinds and missing-marker/draft/duplicate/focus-race refusal paths.
The missing-Send case also verifies its opt-in diagnostic identifies the editor
without permitting insertion. No signed-in insertion or submission is claimed.

## v0.1.12 investigation and diagnostic evidence

**v0.1.12 troubleshooting beta: Claude recognition failure remains unresolved.**
Patrik confirmed v0.1.11's ChatGPT flow and UI, but Claude waited and reported
"This Claude message box was not recognized. Your saved destination was kept."
This identifies the pre-insertion recognition timeout, not a rejected edit or
wrong-destination notice. Git comparison confirms v0.1.11 changed neither
injector from v0.1.10; that does not establish why this live case differs.

Read-only isolated navigation to https://claude.ai/new reached security
verification ("Just a moment...") with zero editors. No browser/computer
connector or running Edge debugging endpoint is exposed. A later native Windows
accessibility check found a tab label mentioning Claude, but did not confirm a
Claude document from that tab; no page content was inspected there. Opening a
fresh https://claude.ai/new tab in the existing visible Edge session did reach
a signed-in composer: one enabled, onscreen editor labelled "Write your prompt
to Claude", with tiptap and ProseMirror classes, and no allowlisted named Send
button exposed while empty. This is limited live accessibility evidence, not
raw DOM/data-testid inspection, proof of the reported layout's cause, or a live
insertion test. AutomationId is not data-testid and must not be conflated with it.

No editor values, message text, draft content, cookies or profile files were
read/copied. No typing, paste or Send occurred. An attempt to open DevTools
stopped because the foreground-window check failed; no F12 key was sent.
Browser control is now paused so Patrik can use Edge normally. Direct DOM
inspection can continue during a coordinated window; the diagnostic beta is
an alternative, not a prerequisite. The earlier blanket signed-in-access
blocker was incomplete: normal signed-in Edge navigation/accessibility works.

### v0.1.12 focused acceptance

First prefer direct, coordinated inspection of the existing signed-in Claude
tab. If Patrik prefers the diagnostic path, these are the minimal steps:

1. Update the same unpacked folder, Reload its existing extension entry, refresh
   YouTube and Claude tabs and confirm **v0.1.12** in the popup. Retain saved
   settings; do not uninstall or load a duplicate entry.
2. Repeat the affected Claude handoff. Do not send anything. If the same
   recognition notice appears, click its **Copy troubleshooting details** button.
   Paste that JSON report into the support conversation, together with whether
   the destination was New chat, a saved Project or a saved conversation.
3. This explicit copy replaces the clipboard prompt. **Copy prompt** in the
   YouTube popup restores the full prompt if needed. Check context and existing
   draft/partial text before any manual paste. The diagnostic does not edit or
   focus the Claude composer, invoke Send, or upload anything.
4. The report contains bounded editor/control counts, fixed marker booleans,
   allowlisted labels, readiness flags and extension version. Draft/message
   contents, transcript/prompt, URLs, titles, raw HTML, arbitrary labels and
   account information are omitted. On clipboard denial, the notice reports
   failure and leaves the message box untouched.

Native-DOM coverage passes **32 cases**: the existing 28 safety/insertion cases
plus unmarked-editor details, missing-Send details, private draft/attribute
redaction and denied diagnostic copy. No failure copies automatically; explicit
diagnostic clicks never invoke Claude Send or edit a draft. All 18 native popup
task/provider/destination combinations and required verify/test checks also
pass. These are synthetic fixtures, not reproduction of Patrik's live markup.
The four new cases validate evidence collection, not a recognition fix.

## Previous candidate: v0.1.11

**v0.1.11 candidate: prompt preview and copy implemented, user acceptance pending.**
The accepted v0.1.10 composer/routing behavior is retained. Prompt wording,
permissions and both injectors are unchanged. Sarah's first-run acceptance
remains unrecorded; the new actions' usefulness is a hypothesis for beta feedback.

### v0.1.11 focused acceptance

1. Overwrite files in the same unpacked extension folder, Reload its existing
   entry and refresh open YouTube/assistant tabs. Do not uninstall or load a
   duplicate. Confirm **v0.1.11** in the footer and retained task/destinations.
2. On a captioned video, choose a provider, destination and **Summarize**; add a
   question. Choose **Preview prompt**: check SELECTED MODE, your question,
   full source title/link and transcript. No assistant tab should open and the
   clipboard should stay unchanged. Preview is scrollable and read-only.
3. Choose **Copy prompt** and paste into an empty temporary text document. It
   should match the full preview, including the question. No new assistant tab
   should open. Change to Analyze (or change provider/destination/question/track):
   the old preview must clear; preview again for the current selection.
4. Choose **Open** when ready. Check the same selected task in the prepared
   prompt, correct context and existing guarded insertion/fallback. Review and
   Send yourself. Existing drafts must remain untouched. No need to repeat all
   of Patrik's accepted normal-case browser checks without a new failure.
5. Sarah installs using the README with her own account and saves her own
   destination. Record whether she completes one useful task unaided, any
   fallback/confusing step and whether she would reuse the tool.

**Automated evidence:** npm run verify and all four npm test suites pass.
Native clicks on the actual popup assets in an isolated synthetic profile pass
18 combinations (three tasks, both providers, new chat/saved chat/Project):
Preview = Copy = Open, no tab opened or popup closed by Preview/Copy, preview
does not copy, reload retention, safe plain-text rendering and stale previews.
Failure/snapshot fixtures cover extraction and clipboard failures and choice
changes during asynchronous preparation. Light/dark and preview screenshots
were reviewed. These mocked handoffs do not establish authenticated behavior
or user demand. The v0.1.10 Claude native-DOM results below are retained evidence,
not a claim of newly inspected live markup.

## Accepted baseline: v0.1.10

**v0.1.10 guarded Claude insertion: user-confirmed working.** On 2026-11-17,
Patrik explicitly confirmed Claude inserted automatically without manual paste
and requested pushing/merging this version. His exact browser version and
destination were not reported; no new private browser data was collected.

Initial implementation evidence:  Patrik accepted the v0.1.9 UI/workflow and explicitly requested adding
automatic pasting despite the isolated browser's lack of signed-in access.
This replaces the previous decision to leave Claude insertion disabled; it
was initially fixture-only evidence. The later confirmation above records user acceptance of his tested signed-in case, not independent live inspection.

The new injector uses source-reported input/control markers and refuses
unrecognized surfaces. Its real-DOM fixture passes all 28 cases: native complete
insertion, marked wrappers, named textarea, exact chat/Project URLs, replacement
Send controls, duplicate scripts, ordinary/whitespace/rich drafts, hidden
attachments, busy/read-only/ambiguous editors, missing markers, dialogs, route
and draft changes during claim/focus, rejected claims, partial edits, framework
rejection and readiness failures. Every case asserts zero Send clicks, form
submits and Enter keys; unrelated draft content remains untouched. Polling
timers are accelerated in the fixture; DOM editing/input events are native.

### v0.1.10 focused acceptance

1. Update files in the same unpacked folder, Reload that extension entry, and
   refresh YouTube and Claude/ChatGPT tabs. Confirm **v0.1.10** in the footer.
   Allow the newly requested **claude.ai** site access if the browser asks.
   Do not uninstall or load a duplicate entry.
2. From a captioned video, choose Claude, New chat and Summarize. Click
   **Open in Claude** and wait for the notice. Verify the full prompt appears
   without Ctrl+V, the task is Summarize, and nothing is sent. Review and send
   yourself only when ready. A success notice requires the native edit's full
   text plus recognized composer/Send readiness; no control is activated.
3. Repeat using the saved Claude chat or Project you actually use. The script
   requires its exact saved path/query/fragment. A Project redirect into a chat
   cannot prove Project membership, so it must show clipboard fallback rather
   than guess. Record the exact notice if the editor or route is unrecognized.
4. If Claude restores an existing draft/attachment in a saved destination,
   verify it remains untouched and the fallback appears. If no draft restores
   in the new tab, record this live guard check as not run. Fixture guards are
   already covered. With any fallback, inspect the composer for existing or
   partial text before pasting, to avoid duplication.

**Accepted:** Patrik confirmed automatic insertion and approved push/merge.
**Not independently observed:** live composer markup/framework internals, every
Project/route, or live draft/attachment safety cases. Sarah's separate acceptance
is unrecorded. The isolated tool browser reached security verification, not the
composer; this does not contradict the user-confirmed working case. Fixture
passes remain distinct from authenticated user feedback.

### Candidate evidence and reproducible checks

The bounded input markers are supported by the integration author's
[Claude entry](https://github.com/hanzili/hanzi-browse/blob/main/server/src/agent/domain-skills.json)
and its reported chat-input editor. The exact Send marker is present in the
integration author's
[configuration](https://github.com/dliedke/ChatGPTExtension/blob/master/ai-config.json).
These are primary reports of their integrations, not inspected current Claude
markup. No third-party implementation is copied; the new script uses the
extension's own handoff design and standard DOM editing. No generic editor,
placeholder-only or broadly selected Send-button fallback is used.

`npm run verify`, all four `npm test` suites, the 28-case Claude native editing
fixture and the existing 18-case native popup fixture pass. ChatGPT's injector
is unchanged; its existing destination/draft/attachment guards still pass.

Optional browser checks use Node 22+ and an existing Chromium/Chrome/Edge binary,
with a fresh isolated profile and synthetic intercepted pages, not personal
accounts:

```sh
npm run test:claude-browser -- /absolute/path/to/chromium
npm run test:browser -- /absolute/path/to/chromium
```

## Previous UI beta status (v0.1.9, subsequently user-accepted)

**v0.1.9 redesigned popup: ready for Patrik to test.** Patrik confirmed the earlier Claude handoff and Apply to Project work, then reported Summarize producing an Analyze prompt. The cause is not established. The committed v0.1.8 popup was replayed with native mouse clicks from saved Analyze: all three modes across both providers' new chats, saved chats and Projects copied the expected distinct instruction and retained it after reload (18 combinations). This did not reproduce the report. It is a real DOM fixture with mocked extension APIs, not Patrik's authenticated installation.

The new popup captures the visible mode, destination and question at the click, locks changes while preparing the handoff, explicitly restores one mode, and shows a task summary above the action and SELECTED MODE in the copied prompt. Fixtures verify these protections; they do not prove the original failure's cause or an affected-browser fix.

### v0.1.9 focused acceptance

1. Update the existing unpacked folder and Reload the same extension entry. Refresh YouTube/ChatGPT. Confirm **v0.1.9** in the popup footer. Do not uninstall or load a duplicate entry.
2. Starting with Analyze saved, choose **Claude**, a destination, then **Summarize**. The task summary above **Copy & open Claude** must say Summarize. Paste into the intended empty Claude message box: SELECTED MODE: Summarize must be followed by the faithful-summary request, with no Critically analyze the following YouTube video instruction.
3. Reopen the popup: Claude, destination and Summarize should remain selected. Switch providers and back: each remembers its own destination, while task/question remain. Check Analyze and Apply to Project produce their distinct instructions. Send manually.
4. To use a Claude Project, open its actual page and save it through the extension. Back on YouTube, choose Claude and that Project. All three tasks use the saved link. Check the destination before pasting and provide goals/context in Claude if not already available there.
5. Check the full-title/featured-people/link header in a real reply and follow-up. Sidebar naming stays separate and unverified; Copy title plus manual Rename remains available.

### v0.1.9 verification evidence

- npm test passes all four fixture suites, including mode-at-click capture, locked controls, per-provider retention, legacy selected links, uncertain-route repair, caption fallbacks and existing guarded ChatGPT insertion. npm run verify checks unchanged narrow permissions, version consistency and source syntax.
- The optional tests/popup-browser.mjs uses an existing Chromium binary in a new isolated profile, native mouse clicks and the actual popup assets. It checks all 18 combinations, absence of other modes' instructions in each copied prompt, real reload retention, provider switching, horizontal overflow and primary-action visibility for the standard 600px fixture. Light/dark synthetic screenshots were inspected locally.
- Both the v0.1.8 baseline and new popup passed their 18-case mode matrices on Chrome 149.0.7827.55. Handoff APIs are mocked: these are not authenticated end-to-end tests. No browser is downloaded or dependency added to the extension.
- Isolated read-only inspection of https://claude.ai/new reached security verification with zero editors. No signed-in composer or Project editor was exposed. No personal profile, Sarah session or unrelated tabs were accessed. **Claude automatic pasting remains disabled, blocked on inspected authenticated composer evidence.**
- Claude Project semantics were checked against its [official Project guide](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects). The extension reopens user-saved URLs; it does not upload Project knowledge or assume other-chat context exists.

Optional native-DOM check, with Node 22+ and an already installed Chromium/Chrome/Edge binary: npm run test:browser -- /absolute/path/to/chromium.

## Previous reply-header beta status (v0.1.8)

**v0.1.8 reply headers implemented; sidebar naming remains unverified.** Patrik
reports odd automatic names with the inherited v0.1.6 prompt. Inspection shows
the extension only inserts a naming request into the outgoing prompt; there is
no sidebar rename call, Rename UI action, title reader or title confirmation.
No authenticated browser or internal ChatGPT title mechanism was inspected.
The precise cause of those generated names is not established.

The revised prompt leads with source metadata and strengthens the exact-title
preference for recognized new ChatGPT chats. Every mode, for both providers and
existing conversations, requests a reply header of full original video title,
featured speakers/guests only if explicitly identified by the title/transcript,
then the video URL. The uploader is not assumed to be a featured person. These
are model instructions; fixture coverage does not prove actual model compliance.
**Copy title** copies the exact preferred `YT · <full video title>` for manual
Rename when the provider's generated sidebar name differs. Existing chats are
never renamed by the extension, and Claude auto-insertion remains disabled.

### v0.1.8 focused acceptance

1. Update the existing unpacked folder to v0.1.8, Reload the same extension
   entry, then refresh YouTube and ChatGPT tabs. Do not uninstall or load a
   duplicate entry. Keep your existing destinations and preferences.
2. Use a video with a distinctive title in each mode and provider. After sending
   manually, check that the reply begins with its full original title, any
   genuinely source-identified featured people, and the video link, before the
   TL;DR or analysis. Ask a brief follow-up and check that the header repeats.
3. Use a source with no clearly identified participants: the Featuring line
   should be absent. A channel alone is not a person's identity.
4. From General ChatGPT or a saved Project landing page, record the actual new
   sidebar title separately from the reply heading. Do not count the heading or
   a model claim as proof of a renamed chat. If the automatic name differs,
   click **Copy title** on the source video's extension popup and paste into
   the destination's Rename control yourself. Saved conversations receive no
   automatic naming request.

`npm run verify`, `npm test` and `git diff --check` pass for v0.1.8. New fixtures
cover exact source identity (including quotes/Unicode), header requests in both
providers and all modes, existing-chat behavior, anti-invention instructions,
exact title-copy and missing-title errors. They do not test generated replies
or confirm an exact sidebar-title correction. **Both remain ready to test.**

## Previous Claude beta status (v0.1.7)

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

1. Extract the current v0.1.8 ZIP to a permanent folder, then use **Load unpacked** from
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

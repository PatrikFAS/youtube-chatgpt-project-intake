# Changelog

## 0.1.21

- Fixes v0.1.20's 25x25 action-popup startup regression. Root preferred size no longer depends on the viewport being auto-calculated. A fixed shell fits Chrome's actual granted viewport, retaining the scrolling body and reachable footer. No prompt, Send/insertion logic, permissions, identity or storage keys change. v0.1.20 is withdrawn from testing; previous ZIPs stay unchanged.
- Adds an actual unpacked action-popup regression using chrome.action.openPopup, native extension APIs/storage and no device-metrics override. Compares exact v0.1.19/v0.1.20 assets, same-folder updates with a retained disposable profile across browser restarts, and a fresh candidate profile. Synthetic network responses supply YouTube/provider data; this is not authenticated provider acceptance.
- Retains page-fixture regression for 400x600, 360x480 and 320x400, keyboard/hit targets, 24 task/provider combinations, Collection intent/restoration and the complete 78,817-character export route. Actual action tests separately verify normal initial intrinsic size, unsupported/empty/collapsed/source/destination/Collection states, retained preferences and zero handoff/Send requests.

## 0.1.20

- Splits the user-reported post-insertion COMPOSER_UNSAFE refusal into allowlisted parent-state, writable-field-count, node-wrapper and non-editable-element codes. Keeps every safety predicate and exact-payload check; no automatic attachment or broader editor recognition. The affected live shape remains unknown.
- Replays 53 native Send cases against both exact v0.1.19 ZIP assets and the candidate, including long insertText, added helper fields, changed parents and marked/unmarked synthetic attachment conversion. Those fixtures establish branch diagnosis and unchanged no-send behavior, not live ChatGPT markup or Send acceptance.
- Keeps one labelled main action in a persistent footer with selected provider/destination and task/count; only the body scrolls. Moves alternatives/source review behind disclosures, keeps Add current video visible, and replaces Collection cards with a compact intent selector. Compare remains default; Summarize/Apply are common intents and Analyze remains explicitly available under focused evidence review. Single presets/Custom and settings remain unchanged.
- For a Collection above the local autofill bound, the primary action becomes Download .txt; manual Open remains an alternative. File export neither copies nor opens/sends, and uploads remain the user's action. Full 78,817-unit Preview/Copy/file/manual-Open equality remains tested. No automatic attachments or Collection Send.
- Records Patrik's exact acceptance: Collection worked in his v0.1.19 browser; no specific mode, upload format or new Send acceptance is inferred. Native 400x600/360x480 fixtures verify long-basket/title geometry, body-only scrolling, keyboard access, native hit targets, inherited opt-in/destinations/Custom, and no Collection Send. Keeps the exact v0.1.19 ZIP as rollback.

## 0.1.19

- Replaces the duplicate Send action/settings with one primary destination action and a default-off, remembered ChatGPT Auto-send toggle. The main label and exact visible URL identify each deliberate Send; Claude, Collection, Copy, Preview, file export and Retry remain manual.
- Replaces the generic post-insertion automatic-Send refusal with allowlisted actionable guard codes. No prompt/draft/account text is captured or uploaded. Reproduces guarded refusals locally, including payload/control/authorization changes, without weakening destination, draft, exact payload, stable native Send or one-time/no-retry checks. The actual guard behind Patrik's v0.1.18 report remains unknown.
- Gives Collection its own default Compare & synthesize choice alongside distinct Summarize, Analyze and Apply in the same task group. Restores the previous single-video task/Custom draft on exit without persisting Collection choices as single-video preferences.
- Separates the 60,000-unit local Collection autofill trial bound from a 250,000-unit full Preview/Copy/.txt export bound and unchanged 512 KiB session-state guard. Exact 78,817-character fixture retains all sources; oversized Open copies/opens only with no pending injection, automatic attachment or Send. No provider capacity is claimed and nothing is truncated.
- Required suites, 24 native popup combinations plus expanded journeys, 45 native Send cases and 68 Claude cases pass. These are isolated fixtures; v0.1.19 live acceptance remains open. No new permissions, backend, publication or merge. Keeps prior beta ZIPs intact.

## Unreleased optional Custom example

- Adds examples/compact-triage.txt for deliberate use through existing Custom. Requests a source-grounded opening of at most 60 words, separates relevance/quality, allows provisional judgment for missing context/captions, avoids numerical scores and limits watch suggestions to approximate supplied starts. No runtime/preset/default/UI/storage change and no new extension build.
- Compares three presets, ordinary Custom and the optional example across four labelled synthetic source cases and both providers: 40 prepared payloads preserve exact metadata/captions. Popup fixtures prove one-off Preview = Copy = Open and manual Open even with explicit Send opt-in. These are instruction/source tests, not generated-answer quality or word-count evidence. Keep the exact v0.1.18 ZIP and its pending live checks intact.

## 0.1.18

- Required suites, all 24 native single-video combinations plus complete Collection/opt-in journeys, 35 Send native-DOM cases and 68 Claude cases pass. Native tests include actual combined builder payloads with manual insertion and protected drafts. These are local fixtures, not live new-feature acceptance.
- Tightens Send against inherited readonly/disabled controls, competing Send-labelled controls and source navigation during caption capture; those uncertain cases remain manual.
- Adds manually captured Collection for up to three current captioned videos, review/reorder/remove/clear and one optional comparison question. Session-only captions survive popup closure/tab changes, but are lost on browser restart or extension reload/update/disable; no local/sync retention, background or playlist collection.
- Reuses Preview/Copy/Open and provider/destination handoff protections with manual Send only. Every source keeps full title/link, caption track and its own timestamp links. Preserves all single-video presets and Custom. Rejects duplicate/missing/mismatched captions, changed source identity, stale revisions/late captures, oversized prompts and failed writes without replacing previous entries or silently truncating.
- Uses the measured experiment's three-item / 60,000-unit serialized prompt trial bound and a 512 KiB encoded-state guard; neither promises model capacity. Separate v0.1.17 Send-only artifact and accepted v0.1.16 ZIP remain unchanged. New Collection and explicit Send live acceptance remain separate from Patrik's accepted Claude/Custom cases.

## 0.1.17

- Adds default-off, remembered explicit Send to ChatGPT for individual videos. The visible destination and separate Send action authorize each handoff; existing Open, Copy, Preview and Retry remain manual. Claude and Collections cannot use it.
- Session reservations deduplicate the same source/prompt/destination; one-time permission binds the exact destination, tab and document and is consumed before one native click. Drafts/uploads, partial text, changed/ambiguous/disabled controls, route changes or uncertain results stay manual with no retry. No live third-party messages were sent by Codex.
- Records Patrik's accepted v0.1.16 Claude journey and v0.1.15 Custom. New Send behavior is fixture-verified only and awaits his harmless-sample acceptance. Keeps all presets, Claude injector and permissions unchanged. Collection is separately authorized but not included in this milestone.

## 0.1.16

- Addresses the pre-insertion refusal reproduced from Patrik's v0.1.15 structural report: one recognized chat-input / textbox / tiptap / ProseMirror editor with the exact Write your prompt to Claude label, four nearby controls, and no recognized Send marker. The old path waited without claiming or editing. Timing/destination/framework behavior in the actual failed handoff is not recorded by that diagnostic.
- Allows manual autofill only for that stronger combined editor identity, with a bounded, unique-editor controls scope. Unknown buttons are never interpreted or activated as Send. The earlier marked-Send path remains; ambiguous marked controls still refuse insertion. Exact routes, one-time claims, draft/attachment and focus/race checks remain mandatory. Native text must persist over three checks on the new path; this establishes text acceptance, not Send readiness.
- Adds a redacted matching DOM fixture and safety regressions; improves the timeout distinction when an editor exists but supported controls cannot be confirmed. Clipboard fallback, Custom's v0.1.15 structure, all presets, settings and permissions are retained. No automatic Send, browser takeover, merge or publication. Affected signed-in Claude acceptance remains Patrik's focused next check.
- Required verify/test suites, 24 native popup combinations and 66 Claude native-DOM safety/diagnostic cases pass. These tests establish synthetic text acceptance and regressions, not authenticated Claude behavior.

## 0.1.15

- Removes a confirmed prompt contradiction for Custom: the shared source header no longer unconditionally demands a TL;DR. After the required full-title/known-featured-people/link header, Custom follows the user's requested task and answer structure, adding a summary/verdict/template/next step only when requested.
- Preserves the full source/safety envelope, naming preference, optional-question behavior, local save/forget semantics, destination routing and manual-send guards. All three preset payloads remain unchanged; a comparison with delivered v0.1.14 is byte-identical across 18 preset/provider/destination cases.
- Required checks and all 24 native popup handoff cases pass, including both providers, Custom's non-conflicting structure and Preview = Copy = Open. These verify outgoing instructions, not model compliance or live Claude insertion. Claude's reported failure remains open, with no selector/Send change.
- Prepared in an isolated worktree of the existing repository while Patrik tests v0.1.14. This is an optional next candidate, not a replacement of his running test or a store/public release. Strategy, user feedback, batch/playlist gates and parked auto-send/payment ideas are preserved.
- Reconciles the latest proposed Collection concept as the leading batch UX to validate manually before development, ahead of automatic tab/playlist discovery. No collection, transcript library or batch feature is implemented.

## 0.1.14

- Adds Custom instructions below the three unchanged presets. Preview, Copy and Open capture the same nonempty custom task and retain source title/link/featured-people instructions, transcript, source-safety boundaries and guarded manual-send handoff. The preset question is kept when switching back and is not silently appended to Custom.
- Custom text is one-off by default and not persisted. Save locally explicitly remembers one instruction on this browser, shared by both providers; edits remain one-off until saved again. Forget saved instructions clears it. The last preset returns after an unsaved Custom session. Retry retains current custom text and selection, and storage failures keep text with a useful error.
- Required checks, 24 native preset/custom task/destination combinations, local save/forget/reload tests and the existing 42 Claude native-DOM cases pass. These are synthetic fixtures; current Claude recognition and the new Custom interaction still need user acceptance.
- Signed-in Edge accessibility and DevTools were reachable, but safe input/focus/hit-test guards did not yield a usable DOM report. No Claude editor values/drafts, messages, cookies or account files were read or changed; no AI message was sent. Browser control stopped when Patrik returned. Claude's v0.1.13 recognition rules are retained, not claimed fixed. No auto-send/payment/store publication.

## 0.1.13

- Uses Patrik's chosen working name, YouTube AI Bridge, in the manifest/action title, popup, destination manager, both providers' notices and current documentation. Keeps the repository/package identifier, internal message/element IDs, storage keys and saved settings unchanged. Update the same unpacked installation; no new extension entry or permissions. The name remains provisional with no clearance/publication implied.
- Adds one narrowly bounded Claude editor candidate: contenteditable with both tiptap and ProseMirror classes and the exact Write your prompt to Claude aria-label. The class/accessible-label combination was observed read-only in the signed-in Edge session; exact DOM attributes and Send identity remain unverified. Existing Send-marker, unique-editor, exact-destination, one-time-claim and draft/attachment guards stay in place. This is not a generic editor fallback or a confirmed fix of Patrik's reported case.
- Adds native-DOM coverage for the labelled candidate on all destination kinds, missing/wrong markers, drafts, duplicate editors and focus-restored drafts. These reconstructed fixtures do not establish live insertion. The opt-in structural diagnostic remains, and browser control is paused pending a coordinated inspection window.
- Required verification and fixture suites pass, along with 18 native popup combinations and 42 Claude native-DOM cases. Records Patrik's custom-instructions proposal for after the Claude bug: one-off by default, explicit local reuse if useful, and unchanged presets/source envelope. No Custom mode, auto-send or payment infrastructure is implemented.

## 0.1.12

- Adds an opt-in Copy troubleshooting details action only to Claude's unrecognized-composer failure notice. It copies a bounded, allowlisted control-shape report after an explicit click; it does not collect message/draft text, prompts, raw HTML, URLs, arbitrary labels/attributes or account information. No automatic clipboard replacement or remote upload.
- Reports visible editor counts, supported marker presence and nearby button shape so the actual failing browser can supply live evidence before recognition rules change. Explains that this explicit copy replaces the clipboard prompt and that Copy prompt in the YouTube popup restores it.
- Adds four native-DOM diagnostic cases, including private draft/attribute redaction and clipboard denial; all 32 Claude fixture cases pass with no automatic sending or changed drafts. Keeps the same composer recognition and exact-route guards as v0.1.10/v0.1.11.
- Patrik confirmed v0.1.11's ChatGPT flow and UI, but reported Claude's unrecognized-message-box fallback. This version helps investigate that actual failure; it does **not** claim a recognition fix. The isolated browser is security-blocked, but later read-only accessibility inspection reached a signed-in editor in the existing Edge session. Full DOM/control evidence is still needed; browser control is paused for Patrik's use. A diagnostic installation is optional if direct coordinated inspection supplies it.
- Records Patrik's optional auto-send proposal as a later, off-by-default design with destination confirmation, draft protection, provider-specific live-evidence gates and duplicate-submission safeguards. No auto-send implementation or live message test; Claude reliability remains first. Retains the optional coffee/beer footer evaluation without a payment destination.

## 0.1.11

- Adds Preview prompt and Copy prompt to review or copy the full selected instructions, question and transcript without opening an assistant tab. Open keeps its existing handoff behavior; all three actions share the same prompt builder and capture choices at the click.
- Clears previews when task, destination, provider, question or caption track changes. Preview renders plain text, leaves the clipboard unchanged and locks controls during extraction. Copy retains the clipboard fallback and never opens a destination or sends a message.
- Extends popup regression coverage across all 18 task/provider/destination combinations, including native clicks proving Preview = Copy = Open, reload retention, safe text rendering, failed extraction/copy and stale-preview handling. Existing prompt wording, permissions, injectors and saved preferences are preserved.
- Reconciles the product plan around Sarah's first run, a small beta, later store preparation and an optional verified workflow demonstration. v0.1.10 remains the user-accepted baseline; v0.1.11's new interaction and Sarah's acceptance are pending. No public release or payment infrastructure.

## 0.1.10

- Adds guarded Claude composer insertion at Patrik's explicit request after he accepted the v0.1.9 UI/workflow. Adds only the exact `https://claude.ai/*` host and a local content script; no API, backend, analytics or automatic Send.
- Claude handoffs use the existing session-only one-time claim. Insertion requires the exact saved route/query/fragment, a unique source-reported input marker and nearby Claude Send marker, and an empty, editable, nonbusy composer without a dialog or attachments. Unproven Project-to-chat redirects remain clipboard-only.
- Uses native editing and verifies the full text plus editor readiness. Drafts restored during claim/focus, partial or rejected edits, duplicate scripts and uncertain surfaces receive safe fallback without retries, DOM replacement, Enter or Send clicks.
- Adds 28 real-DOM fixture cases using the actual Claude injector, plus worker routing/claim coverage. The accepted popup still passes its 18 native mode/destination/reload cases. These are synthetic fixtures. Patrik subsequently confirmed automatic insertion in his signed-in Claude browser and approved this version for push/merge; this is user-reported acceptance of that tested case.
- Retains all three modes, saved links/preferences, source-adjacent tabs, title/link reply instructions and Copy title. Updates permission explanations, acceptance steps and the project plan.

## 0.1.9

- Redesigns the popup with a top-level ChatGPT/Claude switch, provider-specific destinations, clear Project/chat labels, compact task cards, expandable caption/question controls, light/dark styling, keyboard focus states and a visible build number. Saved links, names, caption preferences and the selected task are preserved; each provider remembers its last destination.
- Groups Manage destinations by provider and makes saving a Claude Project explicit. All three existing modes reuse the same saved Project URL; no internal Claude API or upload into Project knowledge is used.
- Captures the visible mode, destination and question at the action click, locks choices while preparing the prompt, explicitly restores one mode, and shows the selected task both above the action button and in the copied prompt. This hardens against selection changes during asynchronous extraction. Patrik's report that Summarize copied Analyze was not reproduced on the committed v0.1.8 native popup fixture; no exact cause is claimed.
- Adds an optional dependency-free real-browser fixture: native mouse clicks and copied-prompt checks for all 18 mode/provider/destination combinations, reload retention and provider switching. The old and updated popup fixtures both passed their mode matrices. Mocked browser APIs do not establish an authenticated end-to-end result.
- Patrik confirmed the earlier Claude handoff and Apply to Project work. Isolated live Claude inspection stopped at security verification without an editor, so automatic pasting remains unverified and disabled. No personal session, unrelated tabs, permissions or automatic Send behavior are added.
- Preserves v0.1.6 naming preferences, v0.1.8 source-grounded reply headers and Copy title. Sidebar title generation remains provider-controlled.

## 0.1.8

- Puts the real source title, video URL and uploader metadata first in every outgoing prompt, then requests that every video-related reply (including follow-ups) start with the full title, source-identified featured speakers/guests when available, and the video link. Unknown participants must be omitted; the channel is not treated as a featured person.
- Strengthens the new-ChatGPT-chat title preference against paraphrasing and mode/instruction labels. The extension still does not set or verify sidebar names: automatic titles remain provider-controlled, and Patrik reports the earlier request produced odd names. An exact-title fix is not claimed.
- Adds **Copy title** for an exact manual Rename fallback without opening a tab or editing any conversation. Existing conversation naming, Claude copy/open/paste, draft protections and permissions remain unchanged.
- Adds prompt/header and title-copy regression checks and updates the beta acceptance steps and project plan. Actual model reply formatting and the revised sidebar-title request still need user testing.

## 0.1.7

- Adds a built-in Claude destination and saved Claude conversations/Projects alongside existing ChatGPT destinations, preserving names, URLs, selected mode/destination and caption preferences.
- Claude uses clipboard-first copy/open/paste with clear popup guidance, source-adjacent tab placement and manual Send. Its live composer is unverified, so no auto-insertion, Claude host permission, API or prompt-in-URL contract is introduced.
- Reuses caption extraction and all three modes; Claude prompts refer to Claude context without ChatGPT naming or personal Hermes handoff assumptions. Retains v0.1.6 ChatGPT title requests and the existing guarded ChatGPT injector.
- Adds focused regression coverage for Claude routing, migration, prompt copying, failure recovery and provider isolation, plus a durable project plan and Sarah's acceptance checklist. Existing Chrome/Edge behavior is user-confirmed; Sarah's Claude acceptance is not yet performed.

## 0.1.6

- All three modes ask ChatGPT to title a new chat `YT · <original YouTube title>` when opening General ChatGPT or a recognized Project landing page. Saved conversations and ambiguous destinations receive no naming instruction.
- This is a prompt instruction. ChatGPT controls the actual sidebar title; the extension does not rename chats directly.

## 0.1.5

- Recognizes the verified current ChatGPT Project composer: a marked ChatGPT form, its markdown textbox inside the composer input/body, and its accessible ChatGPT model control. A Pro model label and the empty editor's voice controls no longer prevent insertion.
- Retains destination checks, Codex/dialog blocking, unique-editor checks, draft protection, one-time handoff claims and manual Send. Protects attachments in the current composer's attachment container as well.
- Adds regression coverage and a synthetic browser fixture based on privately supplied composer markup. Composer-recognition failures keep the clipboard fallback without incorrectly asking users to resave their destination.

## 0.1.4

- Fixes the destination warning when a saved Project landing page opens a conversation inside the same Project. Both the injector and background handoff accept this specific transition while opening the saved URL unchanged.
- Keeps exact matching for saved conversations, queries and fragments; different Projects, general-chat redirects, Codex, unknown routes and uncertain composers still use the clipboard fallback. Existing drafts remain protected and prompts are never sent automatically.
- Adds regression fixtures for the reported URL transition using synthetic identifiers. The affected Edge installation still needs testing of this update; fixture checks do not prove authenticated composer insertion.

## 0.1.3

- Validates saved ChatGPT destinations with a bounded route check and keeps their intended path, query and fragment intact.
- Checks the opened destination before attempting composer insertion; ambiguous or unsupported destinations use a visible clipboard fallback.
- Captures the originating YouTube tab and opens the result beside it in the same window when the source is still available.
- Preserves existing drafts and never sends the prompt automatically.
- Adds reproducible, versioned ZIP packaging from committed tracked runtime files.
- The reported live ChatGPT/Codex misrouting has not been reproduced. Fixture checks are not live browser verification; status is **READY TO TEST / BLOCKED ON LIVE REPRODUCTION**.

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

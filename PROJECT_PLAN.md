# YouTube AI Bridge engineering and release plan

Updated 2026-11-19. This repository owns implementation milestones and technical
acceptance. The [Product and Launch Space](https://chatgpt.com/space/page_6afdceb7f4b88191911b88bf7f55952e)
owns shared strategy, recommendations, decisions and user feedback. This plan
reconciles Astra's strategy without editing or replacing that material.
[README.md](README.md) covers installation; [TESTING.md](TESTING.md) retains
detailed acceptance history and fixture evidence.

**YouTube AI Bridge** is Patrik's provisional working name. It is used in the
local beta while retaining the existing package/repository identifier, internal
IDs/storage keys, extension identity and in-place installation compatibility.
No name/trademark clearance or public/store release is implied.

## Product intent and boundaries

**Agreed intent: Triage → Understand → Apply.** Help a curious, time-poor learner
decide what deserves attention, understand the useful substance and use it in
ongoing work or learning. Bring the video source into the user's existing AI
conversation/Project, where available context can inform the decision. This
does not permanently train the model or guarantee knowledge in other chats.

Keep Summarize, Analyze and Apply distinct; the framework is not three new
controls. Custom already supports an experiment without changing the presets.
The first audience to test is people who save practical videos and already use
ChatGPT/Claude for ongoing work or learning, including solo operators and
consultants. This is a recommended starting hypothesis, not a validated segment
or a restriction to business topics. “Too many videos. Not enough time.” and
“Find what matters in a YouTube video, and use it in the work you're already
doing” remain copy hypotheses, not proven differentiation.

Keep the extension local, dependency-light and Manifest V3: no backend, AI API,
analytics, broad permissions, unrequested sending or payment infrastructure. Preserve
captions/fallbacks, all three presets, Custom, saved URLs/preferences,
source-adjacent tabs, existing drafts and clipboard fallback. Keep the
v0.1.6 naming preference, Copy title/manual Rename and source-grounded full
title/featured-people/link reply request. Sidebar naming is provider-controlled
and reported unreliable; actual reply formatting and Sarah's acceptance remain
separate checks. Do not reopen scope/terms research for this beta.

## Verified delivery and unresolved work

Patrik confirmed the v0.1.16 Claude autofill journey and v0.1.15 Custom, then
explicitly authorized two bounded milestones on 19 November. **M1 v0.1.17:**
ChatGPT-only default-off remembered opt-in with an explicit per-video Send action,
exact destination/document and one-time no-retry safeguards. Codex validates
local fixtures; Patrik owns one harmless live sample. **M2 v0.1.18:** three-video
session-only manual Collection, reviewed source-labelled Preview/Copy/Open,
manual Send only. It reuses the 39-check offline experiment; no playlist/bulk
capture, persistent transcripts or AI API. Preserve v0.1.16 ZIP, keep milestones
reviewable in the existing PR stack, and do not merge/publish. These approved
milestones supersede older parked/gated wording below; new functionality needs
its own acceptance and fixture results do not establish live behavior.

| State | Evidence and limit |
| --- | --- |
| Accepted baseline | v0.1.10 is merged in [PR #3](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/pull/3). Patrik confirmed the Chrome/Edge workflow, provider UI and automatic Claude insertion in his tested case. The precise Claude route/browser version was not recorded. |
| Delivered versions | v0.1.14 added Custom; v0.1.15 removed its compulsory TL;DR conflict. All 18 preset payloads stayed byte-identical to v0.1.14, and 24 native task/provider/destination cases passed. Patrik tested v0.1.15 and reported no Claude insertion. Its supplied control-shape report now replaces the missing structural evidence; no repeat diagnostic is needed. |
| Current candidates | v0.1.21 corrects the confirmed v0.1.20 action-startup regression. v0.1.20 is withdrawn; v0.1.19 remains the prior working fallback. Historical v0.1.20 adds the footer/compact-selector correction and narrower composer refusal codes; v0.1.19 remains the delivered rollback. v0.1.19 refines the existing v0.1.18 Collection and explicit Send after Patrik's reported refusal and 78,817-character case; see the current refinement below. The work remains on `codex/custom-output-contract` / [draft PR #5](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/pull/5), stacked on PR #4. Separate v0.1.17 ZIP permits independent Send testing; v0.1.16 ZIP remains the accepted fallback. Required tests, 24 native popup combinations plus full Collection/Send interactions, 45 native Send cases and 68 Claude cases pass. New live acceptance remains open. |
| Claude acceptance | Patrik confirmed v0.1.16 autofill in his selected real-browser journey after the report-grounded fix. This does not establish all layouts or Sarah acceptance. New Collection handoffs and explicit ChatGPT Send have separate user checks; no personal browser or live messages are controlled by Codex. |
| Browser and safety | The authorized free window reached DevTools but produced no usable DOM report. No Claude draft/message text, cookies or profile files were read/changed and no AI message was sent. Visible control stopped when Patrik returned. Do not repeat OS input workarounds or take over the browser; use supplied structural evidence or supported inspection. Unknown controls keep fallback. |
| Mode report and demand | Earlier Summarize/Analyze mismatch was not reproduced; later click snapshots/visible mode and retention fixtures pass. No original cause is claimed. The Space records Patrik's 19 November acceptance of ChatGPT and Custom in v0.1.15. Sarah's own journey, independent reuse and willingness to pay remain unrecorded. |

The original v0.1.14 checkout stays untouched. The existing worktree/PR stack owns v0.1.17 and v0.1.18. Update the same loaded unpacked folder in place; no automatic installation, merge or publication.

## Priority startup correction — v0.1.21

**Owner evidence:** Patrik installed v0.1.20 and reported a small green square.
Codex reproduced exact shipped assets in an actual Chromium extension action:
25x25, initialized manifest/page, no script/manifest startup failure. v0.1.19
opened normally. The root viewport caps caused circular intrinsic sizing; the
fixed-size page fixtures were insufficient and are no longer treated as action
startup acceptance. The input PNG could not be materialized due Windows helper
metadata support; own native reproduction pixels were viewed instead.

**Narrow correction:** independent preferred root size plus a viewport-fitted
fixed shell; no business JS, host permissions, storage keys, source prompts or
Send/insertion guards change. A new true action-surface harness uses native
extension APIs/storage with intercepted synthetic sources, no forced popup
viewport, same-folder retained-profile updates across browser restarts and a
fresh profile. Caption Add, collapsed/unsupported/destination/Collection states
and the footer are checked without any real handoff or Send. Tiny viewport and
24-flow/export/keyboard regressions remain separate forced page fixtures.

**Next owner: Patrik.** After the verified v0.1.21 artifact is delivered, update
the same folder and Reload; confirm the popup opens, local settings remain and
one manual/Collection path is usable. Set remembered Auto-send off for this test.
Do not use v0.1.20; preserve that ZIP for regression evidence and v0.1.19 as the
prior working fallback. Installed Chrome/Edge acceptance remains separate from
headless action evidence; the extension-entry Reload UI was not automated.
The earlier COMPOSER_UNSAFE live diagnosis and Sarah's acceptance remain open;
this startup fix does not claim to fix Send or provider attachment handling.
No merge, store/public release or personal browser control.

## Current owner evidence and candidate — v0.1.20

**Patrik:** Collection worked in his v0.1.19 browser. No particular intent,
attachment format or lifecycle is established. Separately, his ChatGPT Send
refused with COMPOSER_UNSAFE; Claude was not tested in that report. The original
full generic warning is now narrowed to a post-insertion guard, not a known DOM.

**Codex:** exact v0.1.19 ZIP hash/CRC checked; six synthetic post-insertion shapes
reproduce that code. Candidate commit `3b8fc6e` splits blocked-parent, writable
field count, node-wrapper and non-editable-node reasons without relaxing any
predicate. Known attachments still yield UPLOAD_OR_ACTIVITY; exact text is still
mandatory. 53 native Send fixtures pass against shipped and candidate assets.
OpenAI documents conversion of long pastes to attachments, but Bridge's insertText
path and Patrik's actual DOM have not been live verified. No live sends/browser use.

A separate exact-ZIP 400x600 fixture measured the main button below the viewport
(y=651..694) with the earlier opt-in remembered. The UI correction keeps context
and one primary action in a footer while the body scrolls. Add current video
is visible at zero/one/ready entries; source review and uncommon alternatives
are disclosed. Small/narrow native fixtures include long titles/baskets, keyboard
selection/Tab, hit targets, no overlap or whole-popup overflow and inherited
preferences. Large Collections use Download .txt first, with explicit manual
Open/upload; file/clipboard/provider copies have separate lifetimes.

**Short decision:** Compare-plus-question is smallest but makes a faithful digest
of three long talks or project decisions depend on the user inventing instructions.
Cards expose intent but compete for space. The compact selector earns its place:
Summarize gives a faithful digest/watch moments, Compare weighs conflicting views
and useful integrated takeaways, Apply uses available project goals. Analyze stays
an explicit focused evidence-review option in that selector, without silent intent
migration. A decision question remains optional/disclosed. No single preset changes.

**Next owner: Patrik — exactly two outcomes.** Check installed footer/intent/file
clarity and reachability with one manual Collection handoff; separately, if desired,
one harmless deliberate ChatGPT Send should succeed once or return the more
specific code. Do not retry uncertain sends or share draft/prompt/account data.
Keep the already delivered v0.1.19 ZIP intact and v0.1.16 as the earlier accepted
fallback. Sarah's own journey and actual sidebar naming remain separate.

**After acceptance:** one unaided private beta using a real task and the existing
feedback template is more valuable than another feature. Measure the actual
decision/usefulness and setup effort; keep optional compact Custom experiments
available. No invitations, merge, store/public release, costs or payment setup.

## Current feedback refinement — v0.1.19

Patrik's real v0.1.18 ChatGPT test reached the generic post-insertion Send refusal;
Claude was not tested in this report. Its exact failing guard cannot be recovered
from that notice. The candidate adds closed actionable reason codes, with no
prompt/draft/credential capture and no relaxation of destination, empty composer,
exact full text, known unique stable Send or one-time/no-retry gates. Native local
Send effects pass in 45 cases; no live AI message/browser control was performed.

At his request the popup now has one main destination action: Open with the
optional remembered ChatGPT Auto-send toggle off, Send to ChatGPT with it on.
The intended URL is shown for Send. Copy/Preview/local export/Retry, Claude and
Collection never auto-send. Transcript/title utilities are collapsed separately.

Collection now defaults to Compare & synthesize in the same task group, with
Summarize (faithful digest), Analyze (critical evidence assessment) and Apply
(available project-context implications). The old builder used one comparison
prompt regardless of individual mode. New mode fixtures preserve source identity,
question and each source's timestamps, and restore prior single-video Custom.

His 78,817-character case exceeds our local 60,000 trial bound, not an established
provider limit. The candidate allows full review/copy/local .txt export up to
250,000 UTF-16 units while retaining 60,000 for Collection autofill and the 512 KiB
session-state guard. Larger Open copies and opens only; no pending insertion or
automatic attachment. The exact-size native fixture validates full-file equality.

**Next owner: Patrik.** Test v0.1.19 with Auto-send off first; optionally replay one
harmless explicit ChatGPT Send and report only the bracketed code if withheld,
without retrying uncertain sends. Replay the large Collection through complete
Preview/Copy/.txt and manual handoff. Live Send, provider file limits/output
quality, real lifecycle and Sarah's independent acceptance remain unperformed.
Earlier v0.1.16 Claude/v0.1.15 Custom passes remain separate; preserve all prior
ZIPs and Space checklists. No merge, store/public release, costs or tester contact.

## NOW NEXT LATER

The preparation notes below record the pre-feedback v0.1.18 state; the current
v0.1.19 refinement and smallest next checks are specified above.

**Bounded trust audit, 19 November:** exact v0.1.18 permissions, network/clipboard
paths, local/session fields and clearing behavior were reviewed. Private tester
copy now makes clear that Copy leaves the extension via the system clipboard
and inserted/pasted text is available to the provider website before Send.
Clear Collection is not a clipboard/provider/global reset. A factual private
privacy/permissions draft is in the original checkout's `.private/beta` and
Space. No runtime, permission or ZIP changes; installer wording/provider network
behavior were not live-observed. The activeTab/host-access overlap was noted,
not changed. No further preparation is queued: wait for Patrik's v0.1.18 live
acceptance, then the unaided private beta. Earlier Claude/Custom passes remain
separate, and all live checkboxes remain pending.

**Independent-beta preparation, 19 November:** a private tester guide, blank
feedback form and exact v0.1.18 ZIP are ready in `.private/beta` in the original
project checkout, excluded through local Git info/exclude. The repository is
public, so the packet and filled feedback must not be force-added/pushed.
The existing Space holds copyable handoff text; Library saving is currently
unavailable through the upload workflow. No invitations,
messages, access grants or public page are created. Normal testing is one
manual task in the tester's existing assistant; Collection and explicit Send
are separate optional steps. Gate remains Patrik's v0.1.18 live acceptance,
then a small unaided independent beta. Earlier Claude/Custom passes do not
close those gates. Installation claims are checked against exact v0.1.18 and
official Chrome/Edge guidance; actual unaided completion remains untested.

| When | Owner and next action | Gate |
| --- | --- | --- |
| NOW: new milestone acceptance | Patrik tests one harmless ChatGPT explicit Send, then a small Collection using his chosen provider/destination. Codex records each outcome separately from v0.1.16 Claude and v0.1.15 Custom acceptance. | Guarded one-click result or clear manual fallback; correct source attribution and one useful cross-source decision. Keep issue #1 open until affected routing/tab placement is confirmed. No agent live sends or broad retest of accepted normal flows. |
| NOW: compact-response experiment | Patrik uses the draft below through existing Custom in the working ChatGPT path, with his chosen Project/context and manual Send. Codex records evidence; no new UI or preset/default change. | Compare useful decisions, reading effort, missed important ideas and handoff friction across contrasting sources. The experiment can run while Claude is investigated. A few cases are directional, not demand proof. |
| NEXT: proven wording only | After Patrik selects/approves a refinement, Codex makes a small prompt-only change. Reconcile shared-header/TL;DR instructions, move generic ChatGPT Apply's hard-coded Hermes detail into Patrik's own Custom/project instructions, and use the available-context rule for both providers. | Preserve distinct tasks, optional question, naming/header/source safety and Preview = Copy = Open. User checks response quality, including a visual-only demonstration and hour-long timestamps; fixtures establish payload integrity only. No default changes are authorized in this reconciliation. |
| NEXT: Sarah and 3–5 matched users | Patrik supplies the actual ZIP; Sarah accepts her own account/destination, then testers try their own task unaided. Record collection habits and alternatives manually. | People finish without coaching, explain an actual skip/skim/watch/apply outcome and choose to return within a week. Observe support effort. Do not equate video duration with time saved or enthusiasm/installs with demand. |
| NEXT: small launch preparation | After reliable beta use, Codex can prepare a small page on Patrik's chosen existing website and one verified 20–40-second workflow demo, with install/support/privacy information. Check name/platform-brand/store/domain constraints when preparing materials. | Patrik chooses site/publisher/contact and reviews honest materials. Website publication, budgets, outreach and Chrome Web Store submission each remain separate decisions. No large marketing site or invented testimonial/metrics. |
| NEXT: store preparation | Codex prepares ZIP/assets/disclosures and narrow-permission justifications after reliability; Patrik owns account/submission. | Complete reviewable package and separate authorization before account costs/submission/publication. Edge add-ons can be evaluated later. Current [publishing](https://developer.chrome.com/docs/webstore/publish) and [privacy](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) requirements must be rechecked then. |
| NOW: Collection usefulness | The 39-check offline fixture experiment supports integrity/feasibility, not demand or model quality. Patrik compares the authorized v0.1.18 three-source result with separate processing. | Useful cross-source triage/synthesis, correct attribution and no false inference that repetition corroborates claims. Missing captions stay unavailable, not low value. |
| LATER: expansion gate | Current Collection is limited to three manually visited videos in session storage. More items, browser-restart retention, arbitrary links, playlist retrieval or staged synthesis need new evidence and approval. | Observe repeat use and support effort before expanding; never silently truncate, persist transcripts or introduce background queues. |

Feature filter: reduce attention spent deciding what to consume; make insight
more relevant/reliable/usable; fit existing habits instead of adding a chore.
Do not build an account system, knowledge library/graph, dashboard, flashcards,
template marketplace, broad content platform or our own AI subscription now.
Avoid numerical quality scores that imply false precision. If users do not
return, improve one evidenced friction point or keep it a useful personal tool.

Feasibility limit: the current extractor needs a loaded video tab; pasted URLs
are not automatically easier. The extension hands off one prompt and does not
read AI replies or orchestrate staged summarization. Its 100,000-character
warning is neither automatic chunking nor a provider capacity guarantee.
Playlist retrieval and automatic multi-stage synthesis require separate work.

The manual basket is now explicitly approved and implemented as the bounded
v0.1.18 candidate. See [COLLECTION_PLAN.md](COLLECTION_PLAN.md) for current
behavior, retention/budget decisions, verified fixtures and remaining gates.
The broader batch/playlist ideas remain separate; no model quality or demand
has been established by the offline experiment.

## Smallest Claude user check

Patrik completed the affected v0.1.16 autofill check successfully in his own
browser; do not request the same diagnostic or replay it without a relevant
regression. Sarah's acceptance remains separate. The new v0.1.18 Collection
journey needs its own source/destination/manual-handoff check; explicit Send
is ChatGPT-only and needs one harmless user-run sample. [TESTING.md](TESTING.md)
holds the focused steps. Preserve drafts and check the conversation after any
uncertain Send; no retry is automatic.

## Draft Custom response experiment

The optional [compact-triage example](examples/compact-triage.txt) is now the
canonical copyable candidate. It works through existing v0.1.18 Custom, with no
new installation, preset/default change or automatic loading/saving. Paste it
only deliberately; Save locally remains explicit and one-off behavior is
unchanged. Keep the v0.1.18 ZIP and its Send/Collection live checks intact.

**Local evidence, 19 November:** four labelled synthetic source cases (useful,
weak, off-topic and incomplete) were compared across both providers, the three
current presets, ordinary Custom and the optional example: 40 prepared payloads.
Full title/link/captions and source-safety instructions remain exact, including
Unicode/punctuation and 1:01:05. Presets retain their existing wording; Analyze
and Apply request a 100–200-word orientation, Summarize a short TL;DR without a
numerical cap, and Custom imposes no competing TL;DR. The example requests one
opening of at most 60 words with provisional judgments and timestamp uncertainty.
Two popup fixture journeys preserve Preview = Copy = Open, one-off storage and
manual Open even with the individual-video Send opt-in enabled.

These are instruction/transport checks, not AI-generated summaries. No live/paid
model calls or signed-in browser use. Whether answers are shorter, useful,
source-faithful, correctly cited or sensitive to missing captions remains a
human test. Silent gaps cannot reliably be inferred from captions alone. Do not
claim time saved or promote this example into default presets without output
evidence. The current beta live acceptance remains the separate first gate.

**Owner: Patrik; Codex records findings.** Use the same assistant/model and
comparable Project context to compare this with the current preset and the
person's real alternative. Try useful/relevant, strong-but-irrelevant,
low-signal and missing-context/incomplete-caption cases. If extraction fails,
record unavailable rather than inventing a model verdict. Check whether one
clear decision emerges quickly, what useful substance was lost and whether
viewing the recommended moment adds value. Current timestamps are approximate
transcript paragraph starts, not visual boundaries; do not invent end times
or on-screen events. A future timestamp helper needs observed link errors,
not a speculative feature brief.

## Commercial and parked decisions

Keep a useful free extension first. Patrik's quiet “Finding this helpful?
Buy me a coffee or beer” footer remains an optional later experiment after he
supplies a real URL: no interruption, paywall, automatic opening or recurring
payment implication. It may bring negligible/unpredictable support. No support
destination/account or payment infrastructure is created. Revisit keep-free,
optional support, one-time purchase or paid features only after repeat use,
concrete willingness to support/pay and upkeep costs are understood; no revenue
is promised.

ChatGPT-only explicit Send is now authorized and implemented in v0.1.17,
retained in v0.1.18: default off, a visible destination and separate per-video
action, strict full-text/control checks and persisted one-time/no-retry guards.
Its live harmless-sample acceptance is pending. Claude and Collection always
remain manual Send. Automatic provider acknowledgement, playlist discovery,
background collection, staged synthesis and restart retention remain outside
this scope. No agent live test is authorized.

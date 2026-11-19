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
| Current candidates | v0.1.18 includes Collection plus the v0.1.17 explicit ChatGPT Send milestone on `codex/custom-output-contract` / [draft PR #5](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/pull/5), stacked on PR #4. Separate v0.1.17 ZIP permits independent Send testing; v0.1.16 ZIP remains the accepted fallback. Required tests, 24 native popup combinations plus full Collection/Send interactions, 35 native Send cases and 68 Claude cases pass. New live acceptance remains open. |
| Claude acceptance | Patrik confirmed v0.1.16 autofill in his selected real-browser journey after the report-grounded fix. This does not establish all layouts or Sarah acceptance. New Collection handoffs and explicit ChatGPT Send have separate user checks; no personal browser or live messages are controlled by Codex. |
| Browser and safety | The authorized free window reached DevTools but produced no usable DOM report. No Claude draft/message text, cookies or profile files were read/changed and no AI message was sent. Visible control stopped when Patrik returned. Do not repeat OS input workarounds or take over the browser; use supplied structural evidence or supported inspection. Unknown controls keep fallback. |
| Mode report and demand | Earlier Summarize/Analyze mismatch was not reproduced; later click snapshots/visible mode and retention fixtures pass. No original cause is claimed. The Space records Patrik's 19 November acceptance of ChatGPT and Custom in v0.1.15. Sarah's own journey, independent reuse and willingness to pay remain unrecorded. |

The original v0.1.14 checkout stays untouched. The existing worktree/PR stack owns v0.1.17 and v0.1.18. Update the same loaded unpacked folder in place; no automatic installation, merge or publication.

## NOW NEXT LATER

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

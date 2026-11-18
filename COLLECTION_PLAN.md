# Collection engineering outline

Planning only: Collection is not built in v0.1.14 or the optional v0.1.15.
This document changes no runtime, ZIP, storage or permission. The
[Product and Launch Space](https://chatgpt.com/space/page_6afdceb7f4b88191911b88bf7f55952e)
holds Patrik's concept/feedback; [PROJECT_PLAN.md](PROJECT_PLAN.md) keeps current
Claude reliability and active testing first.

## Gate and smallest experiment

Patrik manually combines three related captioned sources with one guiding
question. Try both attention triage and project-specific synthesis; compare
with separate processing. Record useful decisions, attribution mistakes,
reading effort, missed differences and whether the basket would be reused.
Three to five videos is a proposed trial size, not a model capacity guarantee.

Only after reliable single-video use and useful manual results should Dotty
scope a bounded task for Patrik's approval. Codex then implements that scope.
No visible browser control, live messages or automatic Send is authorized here.

## Proposed flow

1. Visit a normal YouTube video and choose Add to collection. Reuse existing
   caption extraction/fallbacks and capture that source's identity before waits.
   No tab enumeration, playlist import or background scraping.
2. Show Added and increment Collection (N) only after complete captions and a
   successful write. Acknowledged items survive popup closure/tab changes under
   the explicitly chosen retention policy.
3. Review full titles/links, caption tracks and sizes; reorder/remove items or
   clear deliberately. Do not silently clear after a successful/failed handoff.
4. Enter an optional question, choose compare/triage or project synthesis and
   the existing provider/destination. Define Collection's instruction layer
   explicitly without rewriting the three single-video presets.
5. Preview/copy/open one source-labelled prompt from the same snapshot. Retain
   the exact saved URL, source-tab placement, one-time claims, draft protection,
   clipboard fallback and manual Send. Capture the caller's YouTube tab once;
   a missing source tab keeps fallback rather than targeting an unrelated tab.

This is a temporary basket, not a permanent knowledge library or AI reply
reader. Videos found in a playlist can be added individually while open;
that is not automatic playlist import or a multi-stage AI pipeline.

## Data and retention decision

Retain only real source data: video ID, full title, URL, available channel/date,
caption track, capture time and complete transcript/timestamp starts. Channel
names are not featured participants. Deduplicate by video ID. Refreshing or
changing a track requires an explicit replacement; failed recapture preserves
the old entry.

Use a separate versioned Collection key and preserve all existing preferences.
Centralize bounded state writes through the current worker to avoid lost edits
across popup windows. A cancelled/late capture must not revive a cleared basket;
no silent capture queue or background AI work is introduced.

**Decide lifetime before code:** session storage survives popup closure but is
cleared on restart/reload/update; local storage retains data until removal/
uninstall. Agree whether “until cleared” includes browser restarts and label it
accurately. Provide visible Clear and accurate privacy/onboarding wording. Never
silently persist transcripts or use sync. Both areas have quotas; do not request
unlimitedStorage for the first candidate.
[Chrome storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage)

## Failures and size limits

| Case | Required behavior |
| --- | --- |
| Missing/empty captions, closed source or cancelled capture | Show Not added with the reason; do not count it or claim it was read. Keep existing items. Any unavailable row retained for review must be labelled excluded and block handoff until removed or recaptured. |
| Duplicate video/different track | Show Already added and its track; no duplicate by title or silent overwrite. Commit an explicit replacement only after successful recapture and budget checks. |
| Write/quota/concurrent-edit failure | Keep the previous valid basket and preferences. Explain failure; never show a false successful count. Serialize/revalidate updates. |
| Oversized combined prompt | Count the complete serialized prompt, including metadata/instructions. Show total/per-source size and refuse above an agreed tested budget; ask the user to remove/split sources. Never silently truncate, drop sources, auto-chunk or send stages. |
| Review changes | Invalidate preview. Copy/Open uses an immutable snapshot of order, sources, task, question and destination. |
| Uncertain destination/composer or partial insertion | Keep the full clipboard prompt and basket; preserve drafts, show fallback and never retry an uncertain edit/send. |

Choose storage and prompt budgets through fixtures/manual trials before code.
The existing 100,000-character warning is not a combined-prompt budget, token
estimate or provider-capacity promise.

## Combined prompt contract

Label every reviewed source with its full title and actual URL, pairing each
transcript and supplied timestamp starts with that identity. List sources
included. Never imply an uncaptured source was examined, mix timestamps across
videos, invent segment ends/visual observations or infer speakers from uploaders.
Metadata/transcripts stay untrusted data, separated from the user's task.

Replies identify the included sources with full titles/URLs and cite relevant
source labels for substantive comparisons. Distinguish source claims from
inference; do not invent a combined identity or unsupported featured people.

Request one concise comparison or project-specific synthesis: unique useful
contributions, agreement/contradictions, uncertain claims and what, if anything,
merits use. Repeated claims are not independent corroboration. Use only available
project context, with no permanent-training claim. Offer grounded watch moments
only when useful; avoid five verbose summaries or an invented action per source.

## Build gates and proposed acceptance

| Stage | Owner and next action | Gate |
| --- | --- | --- |
| Manual validation | Patrik runs the three-source comparison/synthesis; Dotty records outcomes. | Clearer decisions and repeat need justify the basket; current Claude acceptance remains separate. |
| Design checkpoint | Dotty/Patrik choose lifetime, item scope, budget and task wording; Codex reviews feasibility. | Explicit bounded approval and accurate retention/clear disclosure. |
| Capture/review | Codex reuses extraction and adds only approved Collection state/review. | Fixtures: popup reopen/tab changes, metadata/track pairing, duplicate/failed capture/write, cancellation/clear races, reorder/remove and preserved preferences. |
| One handoff | Codex builds the reviewed source snapshot and reuses current handoff. | Preview = Copy = Open, every source retained in order, size boundaries, Unicode/hour-long times, transcript injection, exact destination, protected drafts and zero auto-send. |
| User acceptance | Patrik, then Sarah/testers use their own contexts. | One useful cross-source decision and understandable missing/large-source handling. Fixtures do not prove live insertion or good synthesis. |

**Next action now:** finish the current Claude handoff/report and active v0.1.14
test. Run the manual experiment in the working path when useful. No Collection
implementation or new installation is delivered by this planning-only update.

# Collection implementation and acceptance

Updated 19 November 2026. Patrik explicitly authorized this bounded milestone
after accepting his v0.1.16 Claude autofill journey and v0.1.15 Custom. v0.1.18
implements Collection in the existing repository/PR stack, retaining the
independently testable v0.1.17 Send-only artifact and accepted v0.1.16 ZIP.
The [Product and Launch Space](https://chatgpt.com/space/page_6afdceb7f4b88191911b88bf7f55952e)
keeps strategy/feedback; [PROJECT_PLAN.md](PROJECT_PLAN.md) owns milestones.
No merge, publication or agent live AI messages are authorized.

## Current bounded behavior

Visit each standard YouTube video manually, expand Collection below the usual
handoff actions and Add current video. Reuse current caption tracks, parser and
fallbacks. A source must still match before/after extraction, during the popup
recheck and when the worker acknowledges Add. Only successful complete captures
count; no background capture or playlist/tab enumeration.

The session basket holds up to three unique video IDs. Review full titles,
links, caption tracks and character counts; reorder with Up/Down, Remove or
Clear. Explicit removal is required before recapturing a different track.
Failed/missing/duplicate/oversized/stale writes preserve existing entries.
Two or three sources enable Use collection; one is retained while collecting.

Use collection hides the individual-video presets and transcript/title copy
utilities, displays Compare N videos and offers one optional comparison
question. Back to single video restores the existing selected preset/Custom
without rewriting its instructions. Existing provider/destination preferences
are shared. Preview/Copy/Open use one immutable source/order/question snapshot
and the same combined builder. Preview is plain text, Copy opens no tab, and
input/review changes clear stale previews.

Collection is ALWAYS manual Send, including when the ChatGPT individual-video
Send opt-in is remembered. Open copies first and uses the existing adjacent-tab,
exact-provider/destination, one-time insertion, draft and clipboard safeguards.
The basket is not silently cleared after handoff. No API/backend/analytics or
new permission. Unknown/redirected/ambiguous composers keep manual fallback.

## Source and prompt integrity

Every captured record keeps video ID, full title, canonical captured video URL,
available channel/date, capture time, caption track and complete text/segments.
Caption text must match supplied timestamp segments when present. Each source
gets its own S1/S2/S3 label, full title/link and source-specific start links.
Reordering relabels only within the new coherent snapshot; metadata and captions
never switch sources. Channel names are not featured participants.

One Collection instruction layer replaces concatenation of three single-video
prompts, which would repeat competing headers/tasks. The answer identifies all
included sources, compares unique contributions/agreement/contradictions and
cites source labels. Repetition is not independent corroboration; unavailable
material was not read and must not be ranked. Source metadata/captions are
untrusted JSON data; model compliance is not established by serialization.
No invented timestamps, segment ends, visuals, participants or project context.

## Retention and write rules

Use only `chrome.storage.session`, key `collection_v1`; no local/sync fallback
or unlimitedStorage. Visible wording states: popup closure/tab changes retain
the basket, but browser restart or extension reload/update/disable loses it.
This is a temporary basket, not a permanent library. Remove/Clear affects only
Collection state, never pending handoffs or explicit Send reservations.

Worker writes are serialized, revision-checked and acknowledged only after a
successful single-key write. Clear also advances a generation; a late capture
cannot revive the old basket. Read/quota/write failures report an error rather
than a false success. Malformed saved data is left unchanged; the single-video
workflow remains available. Chrome describes the session area's memory-backed
lifetime and restricted default content-script access in its
[storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage).
Real browser lifecycle/quota behavior still needs user acceptance; fixtures
use mocked extension storage APIs.

## Measured trial bounds

The prior offline three-fixture experiment passed 39 assertions with no network
or model calls. Three padded 18,000-unit transcripts fit at 58,648 serialized
units; three 20,000-unit transcripts refused at 64,648. Those numbers describe
the experiment's wrapper, not the current wrapper or provider capacity.

Current code independently counts the entire actual serialized prompt, including
instructions, metadata, escaping and the optional question. It refuses above
60,000 UTF-16 code units, never truncates/splits silently, and preserves the
basket. Storage also has a 512 KiB encoded-state application guard. Neither
bound is token accounting or Chrome quota accounting; provider capacity remains
unknown. Larger sets, chunking and staged AI synthesis are separate work.

## Verified and remaining gates

- Required verify/test suites: caption fallback/source-navigation guards,
  unique identities, text/segment pairing, complete prompt boundaries, missing
  captions, duplicates, source mismatch, quota/write failure, serialized updates,
  stale revisions, clear/capture races and preservation of preferences/handoffs.
- Native popup fixtures use actual assets and worker logic with mocked extension
  APIs: Add three videos across popup reopenings, safe full-title rendering,
  source-specific hour-long times, reorder/remove/clear, missing/oversized/
  duplicate/write failures, late capture after Clear, stale previews and manual
  provider handoffs with Preview = Copy = Open. All 24 single-video cases remain.
- Existing native guarded injectors are exercised separately; those fixtures do
  not establish authenticated provider insertion, server acceptance, good model
  citations, useful synthesis, demand or real session-storage lifecycle.

**Next owner: Patrik.** Follow [TESTING.md](TESTING.md) with three short related
videos and his own destination. Check complete unsent handoff first; any actual
comparison is his manual choice. Record one useful cross-source decision and
attribution errors, then compare against separate processing. Sarah's own
acceptance and independent reuse remain later gates. Do not expand retention,
item count, playlist scraping, automatic Send or paid infrastructure on assumed
demand. The existing product/customer/marketing strategy remains intact.

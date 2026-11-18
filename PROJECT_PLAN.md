# YouTube intake: product and release plan

Updated 2026-11-18. Delivery plan for the existing
`PatrikFAS/youtube-chatgpt-project-intake` extension. See [README.md](README.md)
for installation and [TESTING.md](TESTING.md) for evidence and acceptance steps.

**Provisional working name: YouTube AI Bridge**, chosen by Patrik. Record this
for product planning only. The manifest/display name and existing published
identity are unchanged; no trademark/name clearance has been performed.

## Goal and proposed audience

Help someone turn a captioned video into something useful in their existing
ChatGPT or Claude work: a faithful summary, an assessment of the ideas, or a
decision about what to apply to a Project. Keep the three tasks clear and let
the user review and send. The candidate first audience is people already using
AI Projects for ongoing work or study. This positioning is a hypothesis to test
with a few users, not evidence of demand or a claim of market uniqueness.

Keep the extension local, dependency-light and understandable. No backend, AI
API, analytics, automatic Send or payment infrastructure. Use the person's own
assistant account. Preserve saved URLs, preferences, existing drafts, caption
fallbacks and source-adjacent tabs; uncertain composers retain clipboard fallback.

## Evidence and current delivery

| State | Evidence and practical limit |
| --- | --- |
| Accepted baseline: v0.1.10, merged in [PR #3](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/pull/3) | Patrik confirmed the Chrome/Edge workflow, redesigned provider/task UI, Claude handoff/Apply and automatic Claude insertion in his signed-in browser. His exact Claude route/browser version was not recorded. This is user acceptance of his tested case, not live inspection of every layout. The v0.1.10 ZIP remains the accepted baseline. |
| Mode selection | Patrik previously reported Summarize producing Analyze. The v0.1.8 native popup fixture did not reproduce it. Later versions snapshot the click's task and show it in the UI/payload; selection and reload fixtures pass and Patrik accepted the later workflow. No original cause is claimed. |
| Naming and reply headers | Preserve v0.1.6's new-ChatGPT-chat naming preference and the later source-grounded full-title/featured-people/link reply-header instruction in all modes/providers. Sidebar naming was reported unreliable and is provider-controlled. Copy title supports manual Rename. Actual sidebar names and model reply formatting remain separate user checks; unknown participants must be omitted. |
| v0.1.11 user feedback | Adds Preview prompt and Copy prompt without opening a destination; 18 native task/provider/destination cases pass. Patrik confirmed the ChatGPT flow works and overall UI looks very good. His Claude test instead timed out with the unrecognized-message-box fallback. Current Claude reliability takes priority over further product work. |
| Troubleshooting beta: v0.1.12 | Adds an explicit Copy troubleshooting details action on that failure notice. It copies only bounded, allowlisted control shape, never message/draft contents, prompts, URLs or account data; no automatic copy/upload. All 32 Claude safety/diagnostic native-DOM cases and the 18 popup cases pass. Recognition rules are unchanged; this is **not a confirmed fix**. Actual failing composer evidence is still needed. |
| Composer safety and live access | Existing guarded injectors/fixtures are retained. An additional read-only check opened https://claude.ai/new in the existing signed-in Edge session: accessibility exposes one enabled editor labelled Write your prompt to Claude with tiptap/ProseMirror classes, and no expected named Send control while empty. No raw DOM marker capture or insertion was performed. DevTools opening stopped at a foreground-window guard before any key was sent. Browser control is now paused so Patrik can use Edge; do not claim all signed-in routes are blocked or that this is a confirmed fix. |
| Sarah and demand | Sarah's own installation/Claude acceptance is unrecorded. Repeat use, willingness to recommend/support and ease of unaided setup are unknown. Automated tests do not answer these questions. |

## Chosen improvement and scope

The popup previously exposed the raw transcript, but the full instructions and
optional question were available only by opening the assistant. v0.1.11 adds a
compact **Copy prompt** action beside Open and an expandable **Preview prompt**.
Both use the same prompt builder and choice snapshot as Open; Preview does not
change the clipboard, Copy opens no tab, and changed inputs clear the preview.
No prompt wording, permissions, destination routing or composer rules change.

This is a small way to make task selection visible and support someone who
prefers to paste into an already-open conversation. The hypothesis is that this
improves confidence and reduces handoff friction. Test that with people before
adding more controls, integrations or a transcript library.

## Priorities, owners and gates

| Priority | Owner | Next action | Evidence needed to move on |
| --- | --- | --- | --- |
| 1. Fix the reported Claude recognition failure, then Sarah's first run | Codex investigates/fixes; Patrik coordinates browser availability or supplies structural details and tests; Sarah accepts her own case | Existing signed-in Edge accessibility works; full DOM inspection is paused to avoid driving Patrik's browser while he uses it. Continue in a coordinated short window, or use the v0.1.12 opt-in structural report if Patrik prefers. The isolated browser remains security-blocked. Bound a fix to actual controls, then test safety/provider/mode regressions. After reliability is restored, Sarah installs with her own account/destination. | A fix is grounded in the actual failing layout and Patrik confirms that case. Sarah separately confirms task/context, source-adjacent opening, insertion or clear fallback, drafts untouched and manual Send. No claim that fixtures establish a live fix; no repeat of accepted ChatGPT normal-case checks without regression. |
| 2. Small beta and onboarding | Patrik invites 3-5 people after Sarah succeeds; Codex fixes concrete problems | Ask testers to complete a useful task without live coaching using the README; collect browser/version, confusing step, outcome and whether they return within a week. Record feedback manually, without analytics. | Most can complete unaided and explain one useful result; identify repeat use and support effort. This is a proposed decision gate, not proven demand or a statistical claim. If they struggle, improve that step before widening distribution. |
| 3. Chrome Web Store preparation | Codex prepares; Patrik owns publisher account and submission | After reliable beta use, prepare listing copy around the demonstrated result, synthetic screenshots/icons, support contact, privacy URL/disclosures, narrow permission justifications and a reproducible ZIP. Recheck current requirements at preparation time. | Patrik reviews complete materials and separately authorizes account costs/submission/publication. No store submission or deployment is authorized by this plan. |
| 4. One small promotion experiment | Patrik chooses/approves/posts; Codex can draft | Optionally demonstrate video -> existing Project -> Apply -> one useful ADOPT/ADAPT/TEST decision. Verify that exact run first and hide private project/account data. Let the same beta cohort reproduce it unaided; then consider one relevant community post where allowed. | Manually compare completion, help needed, repeat use and support effort. Keep the demonstration if people understand/reproduce its value; otherwise fix the confusing step. No outreach is sent by this plan. |
| 5. Free plus optional coffee/beer | Patrik decides and supplies a real destination; Codex can add the reviewed footer | Patrik proposed a small voluntary-support footer. Recommend it as a later, quiet text link after the main workflow; no pop-up, paywall, recurring-payment language or billing system. No destination is configured in this beta. | Patrik chooses wording and an actual support URL, and the small beta still finds the workflow clear. Support is optional and revenue is uncertain. |
| 6. Later monetization decision | Patrik | After the small beta/promotion evidence, compare repeat use, willingness to support/pay, maintenance cost and current store constraints. | Explicitly choose keep-free, optional support or a paid proposition before designing payment infrastructure. No guaranteed revenue or speculative paid feature build. |

Store preparation references: [publishing workflow](https://developer.chrome.com/docs/webstore/publish)
and [privacy/disclosure requirements](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).
These guide a later review; they do not establish that this beta is store-ready.
Existing scope/terms research is not reopened.

## Voluntary support recommendation

Patrik's suggested **"Finding this helpful? Buy me a coffee or beer."** fits a
free local utility. Recommend a single low-emphasis text link below the normal
footer, visually separate from Open/Copy. **"Finding this helpful? Buy me a
coffee."** is the shorter default; coffee/beer is an optional personal tone.
Make voluntary support explicit on the destination, with no recurring commitment
implied. Never gate a task, interrupt first use or automatically open the page.

| Approach | Fit and trade-off |
| --- | --- |
| Optional footer link | Small implementation and no account/payment logic in the extension; keeps all tasks available. Visibility is limited, support may be negligible/unpredictable, and even a small link adds popup clutter. Best first experiment once there is a real URL and a useful beta. |
| One-time paid extension/features | Could tie income to value, but introduces purchase/support expectations and a separate entitlement/distribution decision. Revisit only if repeated use and willingness to pay justify it. |
| Subscription | Recurring income would require continuing value and ongoing billing/support. A lightweight local handoff tool has not established that proposition; premature for this beta. |

No payment destination is invented or connected, no account is created and no
footer is added in these betas. Patrik supplies/selects a real support destination
before implementation. Count voluntary feedback/support manually; no tracking
or revenue promise. The link can be removed if users find it distracting.

## Remaining decisions

- **Patrik now:** coordinate a short window for existing-session DOM inspection,
  or use v0.1.12 to reproduce the affected handoff and explicitly copy/share its
  structural troubleshooting report and destination category if preferred.
  No diagnostic installation is necessary if direct inspection supplies the
  missing DOM evidence. This is not a claim the fix is delivered.
  After a verified fix, send Sarah the actual downloaded ZIP for her separate
  acceptance. Her account/destinations are never bundled.
- **After beta feedback:** choose the clearest first audience/use case and
  whether the optional demonstration is worth preparing. Avoid broad promotion
  until people can finish unaided and find a reason to reuse it.
- **Before submission:** Patrik selects publisher identity, support contact and
  privacy-page hosting, then authorizes any account expense and store submission.
  Code delivery is separate from public release.
- **Later:** choose coffee versus coffee/beer wording and supply a genuine support
  URL if pursuing the footer. Decide any larger monetization change using observed
  value and upkeep, with no payment infrastructure in this milestone.

## Proposed optional auto-send: evaluate after Claude reliability

Patrik proposed an optional auto-send toggle for people processing many videos.
This is a later design candidate, not part of v0.1.12. Current product/code
guidance still requires manual Send. Its possible benefit is one fewer action
per video; its costs are unwanted messages/model usage, harder recovery from a
wrong context, and additional provider-specific maintenance. First establish
whether repeated beta users need it enough to justify that complexity.

Minimum design if Patrik prioritizes implementation after the current bug:

- **Off by default and explicitly chosen:** distinguish Open from Open & send.
  Show provider, saved destination and task; require explicit destination
  confirmation for each action and reset it when destination/task changes.
  The user must know that the assistant will receive a message. Keep ordinary
  Preview, Copy and manual Send available.
- **Refuse uncertainty:** require the exact confirmed destination, a uniquely
  recognized live composer and Send control, no dialog/busy state, no existing
  draft (including whitespace/rich content) or attachment, and complete verified
  insertion of this handoff's prompt. Recheck immediately before a bounded Send
  action. If any condition fails, leave drafts untouched and use a clear manual
  clipboard path; never guess another destination or press Enter generically.
- **Avoid duplicate submissions:** claim each handoff once; track an explicit
  prepared/submitting/confirmed-or-unknown state. Duplicate scripts, reloads or
  uncertain acknowledgement must never trigger another Send attempt. On an
  unknown outcome, tell the user to inspect the conversation; do not present
  retry as safe. Verify the provider-specific submission acknowledgement before
  describing any send as successful.
- **Provider-specific gates:** ChatGPT insertion is user-confirmed, but this is
  not evidence of reliable automatic submission or acknowledgement. It needs
  inspected live Send behavior and separate acceptance. Claude additionally has
  the current recognition failure; resolve it and inspect its actual composer,
  Send and acknowledgement before claiming auto-send support. A toggle must be
  unavailable for an unverified provider/layout, not silently less safe.
- **Tests and authorization:** start with synthetic no-send fixtures for every
  refusal/race/duplicate path. Real submission tests require Patrik's explicit
  authorization of the target account/conversation and test message; none is
  authorized or performed by this plan. No batching, background queue, backend
  or AI API is assumed.

**Owner/next action:** Codex first uses Patrik's control-only report to fix
Claude recognition. Patrik then decides whether repeat-use feedback justifies
an auto-send milestone and which provider/account can be tested. The coffee
footer remains a separate voluntary-support option, with no payment destination
invented or connected.

# YouTube transcript intake: project plan

Updated 2026-11-17. This is the durable delivery plan for the existing
`PatrikFAS/youtube-chatgpt-project-intake` extension. Technical test evidence and
acceptance steps live in [TESTING.md](TESTING.md); installation is in
[README.md](README.md).

## Goal and boundaries

Make it easy to move a captioned YouTube video into the user's chosen ChatGPT
or Claude context, with Apply to Project, Analyze or Summarize and an optional
question. Keep the extension local, small and understandable. Users review and
send themselves. No backend, AI API, analytics, automatic sending or payment
infrastructure is part of this beta. Revenue is uncertain.

## Current state

- The existing Chrome and Edge workflow is **user-confirmed working**, including
  the tested ordinary source-adjacent tab behavior. Pinned/grouped tabs remain
  browser-dependent; no group-management permission is requested.
- Patrik confirmed Claude handoff and Apply to Project work, then reported Summarize copying an Analyze prompt. The v0.1.8 native popup fixture did not reproduce it; the cause is unresolved. v0.1.9 captures the click's visible task, locks changes during preparation, and shows the task in the UI and prompt. Native selection/reload fixtures pass; Patrik subsequently confirmed v0.1.9 looks good and works great. The original mix-up's precise cause was not established.
- v0.1.9 implements the top-level ChatGPT/Claude switch, provider-specific Project/chat destinations, per-provider remembered links, compact light/dark styling and a visible build number. Patrik confirmed this UI looks good and works great.
- Patrik reports odd names from v0.1.6's ChatGPT sidebar-title request. v0.1.8
  strengthens that prompt preference and adds **Copy title** for manual Rename.
  Inspection confirms there is no automatic rename/verification mechanism in
  the extension. Exact automatic sidebar naming is **not fixed or verified**.
- v0.1.8 asks both providers to start every video-related reply, including
  follow-ups, with the full source title, featured people only when explicitly
  identified by the source title/transcript, then the video link. No participant
  is invented or inferred from a channel name. Outgoing prompts are tested;
  actual model response formatting remains **ready for user acceptance**.
- v0.1.10 implements guarded Claude auto-insertion at Patrik's explicit request. Only the exact Claude HTTPS host is added. The new script requires a unique specifically marked input and Send control, exact saved route, no dialog/draft/attachment/busy state, and a one-time claim. It uses native editing, verifies text/readiness, and never sends. Clipboard fallback remains.
- Candidate editor/control markers are supported by primary open-source integration reports, not an inspected signed-in session. The tool browser still reached security verification. All 28 native-DOM scenarios pass; **Patrik confirmed automatic insertion in his signed-in Claude browser on 2026-11-17**. His exact browser version and destination were not recorded. This is user-reported acceptance of the tested case, not tool inspection of every live guard or route. Unknown markup must refuse editing rather than try a generic editor.
- Automated verification and regression checks pass for the beta source. They
  do not prove an authenticated session. **Sarah's Claude acceptance is not run**.
- The accepted v0.1.10 version is merged in
  [PR #3](https://github.com/PatrikFAS/youtube-chatgpt-project-intake/pull/3).
  The user-testable `youtube-chatgpt-project-intake-0.1.10.zip`, available through
  the original Library delivery, remains the package. This plan changes no runtime or
  version and requires no reinstall. Send Sarah the downloaded ZIP itself for
  her own installation/account. Her acceptance is still unrecorded. Store
  submission and public deployment remain separate decisions.

## Milestones and next actions

| Milestone | Owner | Status and next action | Done when |
| --- | --- | --- | --- |
| Claude beta for Sarah | Codex implements; Sarah accepts; Patrik supplies beta | v0.1.10 is delivered and merged; Patrik confirmed UI/workflow and automatic Claude insertion in his tested case. Next give Sarah the ZIP and gather her own feedback, without repeating Patrik's accepted normal-case test. | Sarah confirms all three modes prepare the correct prompt, her chosen Claude context opens beside YouTube, guarded insertion or a clear clipboard fallback works, existing drafts remain untouched, and she reviews/sends manually. |
| Simple onboarding and reliability | Codex; Patrik prioritizes feedback | Instructions and copy/paste guidance are included. Next fix only problems observed in Sarah's path. Retain Patrik's live acceptance record; inspect any new failing layout before broadening recognition. | A new tester completes a video unaided and understands captions, destination selection, clipboard fallback and manual Send. |
| Chrome Web Store preparation | Patrik owns account/submission; Codex prepares assets | After Sarah's acceptance, prepare concise listing copy, screenshots with synthetic data, icons, privacy disclosure and permission explanations; check current submission requirements then. | Patrik reviews the complete package and separately authorizes submission. Existing scope/terms research is not reopened for this beta. |
| Small beta | Patrik recruits; Sarah and a few invited testers give feedback | After Sarah's first successful run, invite 3-5 people using their own ChatGPT/Claude accounts. Ask for browser/version, task completed, friction and whether they would reuse it; collect feedback manually without analytics. | Repeated use and main failure patterns are understood; priority bugs have fixes and clear owners. |
| Promotion experiments | Patrik approves/posts; Codex prepares drafts | After reliable beta use, consider the optional demonstration experiment below, then one relevant community post where allowed. Compare manually reported completion, repeat use and support effort; no outreach is sent by this plan. | One or two small experiments show whether people understand and want this workflow. |
| Free plus optional coffee | Patrik decides | Recommend a free useful extension first, with an optional coffee link only if Patrik wants one. No checkout, billing, account system or payment integration now. | Beta feedback shows enough value to justify offering voluntary support. |
| Later monetization decision | Patrik | Revisit after the small beta and promotion experiments. Compare repeat use, willingness to support/pay, maintenance/support cost and store constraints. | Make an explicit keep-free / optional-support / paid-feature decision before building payment infrastructure. No revenue is promised. |

## Optional demonstration experiment

An option informed by Patrik's creator playbook: demonstrate one useful workflow,
then see whether a few beta users can reproduce it unaided. This stays behind
requested implementation, reliability fixes and Sarah's acceptance.

- **Owner and timing:** Patrik chooses/approves the demonstration and any sharing;
  Codex can prepare a short script. Use the existing small beta cohort of 3-5
  volunteers after the workflow is reliable. This is an optional experiment,
  not the next delivery priority.
- **Demonstrate a verified result:** use a captioned video and an existing saved
  Project with a clear goal. Verify that particular end-to-end run before
  recording: choose Apply to Project, review the prepared prompt, send manually,
  then show one useful ADOPT/ADAPT/TEST decision tied to the Project's goal.
  Show clipboard fallback if that is the verified path; do not imply automatic
  insertion is verified for an untested provider, route or account. Use safe demo
  content so private Project names, links and conversation details stay private.
- **Test reproduction:** give volunteers the brief demonstration and normal
  installation instructions. Ask each to use the same video in their own
  existing Project, with their own account and goal. Initially provide no live
  coaching. Success means reaching the intended Project, choosing Apply,
  reviewing/sending themselves and explaining one useful project-specific
  decision, without additional help.
- **Record and decide:** tally completion unaided, approximate time, where help
  was needed and whether they choose to reuse the workflow. Collect this
  feedback manually, without analytics. If most can reproduce it and describe
  the value, keep the demonstration as an onboarding/promotion candidate;
  otherwise improve the confusing step before wider promotion. A small sample
  informs usability, not guaranteed demand or revenue.

**Next action:** give Sarah the delivered v0.1.10 ZIP and record her individual acceptance, then gather the small beta's feedback. The optional demonstration experiment stays behind that acceptance and any reliability fixes. Prepare store assets and disclosures only for a separate submission decision. No repeat of Patrik's accepted normal-case test is required without new failure evidence. Exact sidebar titles remain provider-controlled, with Copy title available for manual Rename.

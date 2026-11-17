# Project guidance

- Keep this a local, dependency-light Manifest V3 extension. Do not add a backend, AI/API service, analytics, broad permissions, or automatic message sending.
- Preserve the three prompt modes, transcript/caption fallbacks, saved destinations and preferences. Keep the selected ChatGPT or Claude URL intact; if destination or composer identity is uncertain, show a useful clipboard fallback and leave user drafts untouched. Claude currently uses copy/open/paste, with no injector or extra host permission; require inspected live composer evidence before adding auto-insertion.
- Open the result beside the captured source tab in its current window when available. Browser behavior can constrain pinned tabs and tab groups; do not add group-management permission.
- Keep `manifest.json` and `package.json` versions synchronized and document releases in `CHANGELOG.md`.
- Run `npm run verify` and `npm test` from the repository root. Tests use fixtures and do not establish authenticated live-browser behavior.
- Build a release ZIP only after committing: `python3 scripts/package.py /path/outside/repository/extension-VERSION.zip`. The script requires a clean tracked tree and packages committed files.
- Keep issue #1 open through merge until the user confirms destination routing and source-adjacent tab placement in the affected browser. Do not use an auto-closing issue reference in the PR.
- Read and update `PROJECT_PLAN.md` for product milestones and owners. Chrome/Edge's existing workflow is user-confirmed working; do not repeat those acceptance checks without a relevant regression. Sarah's Claude acceptance and ChatGPT's actual sidebar naming remain separate, unperformed checks. Do not reopen terms research or add payment infrastructure for this beta.
- Sidebar naming is only a prompt preference and has been reported unreliable; never claim an exact automatic rename without observing it. Preserve **Copy title** for manual Rename and the source-grounded full-title/featured-people/link reply-header request in all modes and both providers. Omit unknown participants and do not infer them from the uploader.

# Project guidance

- Keep this a local, dependency-light Manifest V3 extension. Do not add a backend, AI/API service, analytics, broad permissions, or automatic message sending.
- Preserve the three prompt modes, transcript/caption fallbacks, saved destinations and preferences. Keep the selected ChatGPT URL intact; if destination or composer identity is uncertain, show a useful clipboard fallback and leave user drafts untouched.
- Open the result beside the captured source tab in its current window when available. Browser behavior can constrain pinned tabs and tab groups; do not add group-management permission.
- Keep `manifest.json` and `package.json` versions synchronized and document releases in `CHANGELOG.md`.
- Run `npm run verify` and `npm test` from the repository root. Tests use fixtures and do not establish authenticated live-browser behavior.
- Build a release ZIP only after committing: `python3 scripts/package.py /path/outside/repository/extension-VERSION.zip`. The script requires a clean tracked tree and packages committed files.
- Keep issue #1 open through merge until the user confirms destination routing and source-adjacent tab placement in the affected browser. Do not use an auto-closing issue reference in the PR.

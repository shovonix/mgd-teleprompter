# Space Prompter (repo: space-teleprompter)

Self-hosted teleprompter for video shoots. Live at https://prompter.shovonix.dev (old address studio.shovonix.dev is being phased out). The first Space app; the others copy its style.

## What's in this repo
- `index.html` — the whole app. No build step. Scripts and settings live in `localStorage`.
- `relay/` — small Node relay for QR phone/tablet pairing (end-to-end encrypted). Setup in `relay/INSTALL.md`.
- `site/` — the shovonix.dev hub page and blog.
- `landing/` — landing pages (`space-prompter/`, `fx/`).
- `ops/sp-stats.sh` — GoAccess traffic stats from nginx logs (runs on the VPS as root).
- `migrate.html` — moves saved scripts from the old studio address.

Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000

## Space key
- Tap = play/pause. Double tap = previous paragraph. Hold = back to top. `F` = full screen.
- Bluetooth pedals send keys too. Test pedal keys after touching keyboard handling.

## Space Cam is a fork
- `space-cam` copies this prompter (v3.5, Dual Monitor only). When you fix a bug in the prompter core, say whether it should be ported to space-cam.

## Design
- Black and white only. Tokens: `--bg #070707`, `--fg #F0F0EE`, `--hair #2A2A2C`. Red only for warnings.

## Rules
- After changing any cached file, bump `CACHE` in `sw.js` so installed copies update.
- Never break existing saved scripts in `localStorage`. Migrate old data instead of dropping it.
- No analytics or tracking scripts.
- Licence: all rights reserved. Don't add an open-source licence.
- Ask before adding a dependency or a build step.

## Workflow
- Work on the Mac in `~/Sites/space/space-teleprompter`. Preview locally, commit small, push to `main`.
- Live files on the VPS (CloudPanel, one site user each):
  - App: `/home/prompter/htdocs/prompter.shovonix.dev` (user `prompter`)
  - Old address: `/home/studio/htdocs/studio.shovonix.dev` (user `studio`)
  - Hub + blog + landing pages (`site/`, `landing/`): `/home/shovonix/htdocs/shovonix.dev` (user `shovonix`)
  - Stats: `/home/stats/htdocs/stats.shovonix.dev` (user `stats`)
  - Relay: not under any htdocs folder. Location not recorded yet; find it before touching it, then add it here.
- None of these folders is a git checkout yet, and this repo is private, so the server can't fetch it without a deploy key. Until one is set up (like Space Balance), ask Shovon before deploying. Keep each site's files owned by its own user.
- Never edit the live files on the VPS directly.

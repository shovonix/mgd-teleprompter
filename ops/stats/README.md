# stats.shovonix.dev

Private stats hub (Basic Auth set in CloudPanel, site user `stats`).

- `index.html` + `cards.json`: hub. Add a card = add one object to cards.json and its page.
- `traffic.html`: studio vs prompter comparison, reads `data/traffic.json`.
- `build.sh` -> `/usr/local/bin/sp-stats-build.sh`, run hourly by `/etc/cron.d/sp-stats-site` (mode must be 644, cron ignores group-writable files).
- Reports: GoAccess HTML in `reports/`. Old private path `shovonix.dev/stats-<token>/` still updated by `sp-stats-run.sh`.

## SSL note (4 Nov 2026)
CloudPanel's Let's Encrypt button failed: the VPS could not reach `acme-staging-v02.api.letsencrypt.org` (timeout; production worked).
Workaround: `certbot certonly --webroot -w /home/stats/htdocs/stats.shovonix.dev -d stats.shovonix.dev`, then the cert is copied over
`/etc/nginx/ssl-certificates/stats.shovonix.dev.{crt,key}` by `/etc/letsencrypt/renewal-hooks/deploy/clp-stats.sh` (also reloads nginx).
CloudPanel UI still shows "Self-Signed" for this site; that is expected.

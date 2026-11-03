#!/bin/bash
# Privacy-friendly traffic stats from nginx access logs (no scripts or cookies on the sites).
# Installs GoAccess, builds hourly reports with IPs anonymised and bots filtered.
set -e
export DEBIAN_FRONTEND=noninteractive
command -v goaccess >/dev/null || { apt-get update -qq && apt-get install -y -qq goaccess; }
TOKFILE=/root/.sp-stats-token
[ -s "$TOKFILE" ] || openssl rand -hex 10 > "$TOKFILE"
T=$(cat "$TOKFILE")
OUT=/home/shovonix/htdocs/shovonix.dev/stats-$T
cat > /usr/local/bin/sp-stats-run.sh <<RUN
#!/bin/bash
OUT=$OUT
mkdir -p "\$OUT"
for pair in shovonix:hub studio:studio; do
  u=\${pair%%:*}; n=\${pair##*:}
  L=\$(ls /home/\$u/logs/nginx/access.log* 2>/dev/null)
  [ -n "\$L" ] || continue
  zcat -f \$L 2>/dev/null | goaccess - --log-format=COMBINED --anonymize-ip --ignore-crawlers --ignore-panel=HOSTS --no-query-string --no-progress -o "\$OUT/\$n.html" 2>/dev/null
done
cat > "\$OUT/index.html" <<HTML
<!doctype html><meta charset=utf-8><meta name=robots content="noindex,nofollow"><meta name=viewport content="width=device-width,initial-scale=1"><title>Stats</title>
<body style="font:16px system-ui;background:#0a0a0b;color:#f4f4f2;padding:40px"><h2>Traffic stats</h2><p><a style="color:#fff" href="hub.html">shovonix.dev (hub + Space Prompter page)</a></p><p><a style="color:#fff" href="studio.html">studio.shovonix.dev (the app)</a></p><p style="color:#8a8a90">Updated hourly. IPs anonymised, known bots excluded.</p>
HTML
chown -R shovonix:shovonix "\$OUT"; chmod -R a+rX "\$OUT"
RUN
chmod +x /usr/local/bin/sp-stats-run.sh
echo '5 * * * * root /usr/local/bin/sp-stats-run.sh' > /etc/cron.d/sp-stats
/usr/local/bin/sp-stats-run.sh
echo "STATS URL: https://shovonix.dev/stats-$T/"
ls -l "$OUT"

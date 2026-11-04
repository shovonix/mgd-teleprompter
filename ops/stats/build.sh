#!/bin/bash
# Hourly: builds /data/traffic.json and GoAccess reports for stats.shovonix.dev.
# Runs as root from cron. Add a new card = add its JSON writer here + a line in cards.json.
SITE=/home/stats/htdocs/stats.shovonix.dev
mkdir -p "$SITE/data" "$SITE/reports"
TMP=$(mktemp -d)
for pair in shovonix:hub studio:studio prompter:prompter; do
  u=${pair%%:*}; n=${pair##*:}
  L=$(ls /home/$u/logs/nginx/access.log* 2>/dev/null); [ -n "$L" ] || continue
  zcat -f $L 2>/dev/null | goaccess - --log-format=COMBINED --anonymize-ip --ignore-crawlers --ignore-panel=HOSTS --no-query-string --no-progress -o "$SITE/reports/$n.html" 2>/dev/null
  zcat -f $L 2>/dev/null | goaccess - --log-format=COMBINED --anonymize-ip --ignore-crawlers --ignore-panel=HOSTS --no-query-string --no-progress -o "$TMP/$n.json" 2>/dev/null
done
python3 - "$TMP" "$SITE/data/traffic.json" <<'PY'
import json,sys,os,datetime
tmp,out=sys.argv[1:3]
sites={}
for n in ('hub','studio','prompter'):
    p=f'{tmp}/{n}.json'
    if not os.path.exists(p): continue
    j=json.load(open(p))
    sites[n]=sorted([{'d':r['data'],'v':r['visitors']['count'],'h':r['hits']['count']} for r in j['visitors']['data']],key=lambda r:r['d'])
json.dump({'generated':datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),'sites':sites},open(out+'.tmp','w'))
os.replace(out+'.tmp',out)
PY
cat > "$SITE/reports/index.html" <<'H'
<!doctype html><meta charset=utf-8><meta name=robots content="noindex,nofollow"><meta name=viewport content="width=device-width,initial-scale=1"><title>Reports</title>
<body style="font:16px system-ui;background:#0a0a0b;color:#f4f4f2;padding:40px"><p><a style="color:#6b9bff" href="../">&larr; Stats</a></p><h2>Full traffic reports</h2><p><a style="color:#fff" href="hub.html">shovonix.dev (hub + Space Prompter page)</a></p><p><a style="color:#fff" href="prompter.html">prompter.shovonix.dev</a></p><p><a style="color:#fff" href="studio.html">studio.shovonix.dev (old)</a></p>
H
rm -rf "$TMP"
chown -R stats:stats "$SITE"; chmod -R a+rX "$SITE"

#!/usr/bin/env bash
set -euo pipefail
release_id="$1"
[[ "$release_id" =~ ^[0-9]{8}T[0-9]{6}Z$ ]]
deploy_root=/var/www/blessing-history
config=/etc/nginx/conf.d/blessing-history.conf
release_path="$deploy_root/releases/$release_id"
test -s "$release_path/index.html"
mkdir -p "$deploy_root/backups"
previous="$(readlink "$deploy_root/current" || true)"
had_config=false
if [[ -f "$config" ]]; then cp -p "$config" "$deploy_root/backups/nginx-$release_id.conf"; had_config=true; fi
rollback() {
  if $had_config; then cp -p "$deploy_root/backups/nginx-$release_id.conf" "$config"; else rm -f "$config"; fi
  if [[ -n "$previous" ]]; then ln -sfn "$previous" "$deploy_root/current.rollback"; mv -Tf "$deploy_root/current.rollback" "$deploy_root/current"; fi
  nginx -t && systemctl reload nginx || true
}
trap rollback ERR
chmod -R a+rX "$release_path"
ln -sfn "$release_path" "$deploy_root/current.next"
mv -Tf "$deploy_root/current.next" "$deploy_root/current"
install -m 0644 "$deploy_root/nginx.candidate" "$config"
nginx -t
systemctl reload nginx
for attempt in {1..10}; do
  if curl --max-time 10 -fsS -H 'Host: history.blessingshs.cc.cd' http://127.0.0.1/ | grep -F 'hub-shell.js' >/dev/null; then break; fi
  sleep 0.3
done
curl --max-time 10 -fsS -H 'Host: history.blessingshs.cc.cd' http://127.0.0.1/modules.json | grep -F 'atlas' >/dev/null
curl --max-time 10 -fsS -H 'Host: history.blessingshs.cc.cd' http://127.0.0.1/jiangshan/js/atlas_boot.js >/dev/null
curl --max-time 10 -fsS -H 'Host: blessingshs.cc.cd' http://127.0.0.1/ >/dev/null
curl --max-time 10 -fsS -H 'Host: api.blessingshs.cc.cd' http://127.0.0.1/ >/dev/null
trap - ERR
if [[ -n "$previous" ]]; then printf '%s\n' "$previous" > "$deploy_root/previous-release"; fi
printf 'Activated history release: %s\n' "$release_id"

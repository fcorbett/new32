#!/usr/bin/env bash
# Rsync a local site folder to DreamHost. Never deletes server-only secrets.
# Usage: rsync-deploy.sh [--dry-run] <local_dir> <remote_path>
set -euo pipefail

usage() {
  echo "Usage: rsync-deploy.sh [--dry-run] <local_dir> <remote_path>" >&2
  exit 1
}

dry=0
if [[ "${1:-}" == "--dry-run" ]]; then
  dry=1
  shift
fi

[[ $# -eq 2 ]] || usage

local_dir="$1"
remote_path="$2"

: "${DREAMHOST_USER:?DREAMHOST_USER is required}"
: "${DREAMHOST_HOST:?DREAMHOST_HOST is required}"

if [[ ! -d "$local_dir" ]]; then
  echo "Local dir not found: $local_dir" >&2
  exit 1
fi

identity="${DREAMHOST_SSH_IDENTITY:-$HOME/.ssh/id_ed25519}"
ssh_shell="ssh -i ${identity} -o IdentitiesOnly=yes -o BatchMode=yes"

# #region agent log
_agent_log() {
  local hid="$1" msg="$2" data="$3"
  local line ts
  ts="$(date +%s000)"
  line="$(printf '{"sessionId":"2afe34","runId":"%s","hypothesisId":"%s","location":"scripts/rsync-deploy.sh","message":"%s","data":%s,"timestamp":%s}' "${DEBUG_RUN_ID:-pre-fix}" "$hid" "$msg" "$data" "$ts")"
  echo "$line"
  for p in "/Users/forrest/Documents/GitHub/new32/.cursor/debug-2afe34.log" "${DEBUG_LOG_PATH:-}"; do
    [[ -n "$p" && "$p" == *[!/]* ]] || continue
    mkdir -p "$(dirname "$p")" 2>/dev/null || true
    printf '%s\n' "$line" >> "$p" 2>/dev/null || true
  done
}
_id_exists=0
_id_size=0
_id_parse=0
[[ -f "$identity" ]] && _id_exists=1
[[ -f "$identity" ]] && _id_size="$(wc -c < "$identity" | tr -d ' ')"
if [[ -f "$identity" ]] && ssh-keygen -y -f "$identity" >/dev/null 2>&1; then
  _id_parse=1
fi
_agent_log A "rsync start" "$(printf '{"identity_exists":%s,"identity_size":%s,"identity_parseable":%s,"remote_path_len":%s,"user_len":%s,"host_len":%s}' "$_id_exists" "${_id_size:-0}" "$_id_parse" "${#remote_path}" "${#DREAMHOST_USER}" "${#DREAMHOST_HOST}")"
# #endregion

# #region agent log
_ssh_err="$(mktemp)"
set +e
ssh -i "$identity" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=10 \
  "${DREAMHOST_USER}@${DREAMHOST_HOST}" 'echo SSH_OK' >/dev/null 2>"$_ssh_err"
_ssh_ec=$?
set -e
_ssh_err_snip="$(tr '\n' '|' < "$_ssh_err" | sed 's/"/\\"/g' | cut -c1-240)"
_agent_log B "ssh probe" "$(printf '{"exit":%s,"err":"%s"}' "$_ssh_ec" "$_ssh_err_snip")"
rm -f "$_ssh_err"
# #endregion

rsync_opts=(-az --delete --itemize-changes -e "$ssh_shell")
if [[ "$dry" -eq 1 ]]; then
  rsync_opts+=(--dry-run)
  echo "Dry run — no files will be changed on the server."
fi

set +e
rsync "${rsync_opts[@]}" \
  --exclude 'api/config.php' \
  --exclude 'api/storage/*.json' \
  --exclude '.ssr' \
  "${local_dir%/}/" \
  "${DREAMHOST_USER}@${DREAMHOST_HOST}:${remote_path}"
_rsync_ec=$?
set -e

# #region agent log
_agent_log A "rsync finished" "$(printf '{"exit":%s,"dry":%s}' "$_rsync_ec" "$dry")"
# #endregion

exit "$_rsync_ec"

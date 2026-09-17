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

rsync_opts=(-az --delete --itemize-changes)
if [[ "$dry" -eq 1 ]]; then
  rsync_opts+=(--dry-run)
  echo "Dry run — no files will be changed on the server."
fi

rsync "${rsync_opts[@]}" \
  --exclude 'api/config.php' \
  --exclude 'api/storage/*.json' \
  --exclude '.ssr' \
  "${local_dir%/}/" \
  "${DREAMHOST_USER}@${DREAMHOST_HOST}:${remote_path}"

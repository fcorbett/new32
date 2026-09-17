#!/usr/bin/env bash
# Hardlink-copy a remote DreamHost docroot to <path>.bak-YYYYMMDDHHMMSS
# Usage: backup-docroot.sh <remote_path>
set -euo pipefail

remote_path="${1:?Usage: backup-docroot.sh <remote_path>}"

: "${DREAMHOST_USER:?DREAMHOST_USER is required}"
: "${DREAMHOST_HOST:?DREAMHOST_HOST is required}"

identity="${DREAMHOST_SSH_IDENTITY:-$HOME/.ssh/id_ed25519}"
ssh -i "$identity" -o IdentitiesOnly=yes -o BatchMode=yes \
  "${DREAMHOST_USER}@${DREAMHOST_HOST}" bash -s -- "$remote_path" <<'REMOTE'
set -euo pipefail
src="${1%/}"
if [[ ! -d "$src" ]]; then
  echo "Remote docroot not found: $src" >&2
  exit 1
fi
dest="${src}.bak-$(date -u +%Y%m%d%H%M%S)"
cp -al "$src" "$dest"
echo "Backed up to $dest"
REMOTE

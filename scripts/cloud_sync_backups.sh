#!/bin/zsh
set -euo pipefail

SRC="/Users/odellroberts31/Desktop/AppProjects/roberts-ventures-app/backups/"
DST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Roberts Ventures/roberts-ventures-app/backups/"

mkdir -p "$DST"

/usr/bin/rsync -a --delete --human-readable --stats "$SRC" "$DST"

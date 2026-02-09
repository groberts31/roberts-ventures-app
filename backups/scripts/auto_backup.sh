#!/bin/bash

APP_DIR="/Users/odellroberts31/Desktop/AppProjects/roberts-ventures-app"
BACKUP_DIR="$APP_DIR/backups"
DATE=$(date +"%Y-%m-%d-%H%M")
TMP="/tmp/rv_backup_$DATE"

mkdir -p "$TMP"

# Export browser localStorage builds (Chrome)
osascript <<EOD
tell application "Google Chrome"
  repeat with w in windows
    repeat with t in tabs of w
      try
        set u to URL of t
        if u contains "localhost" or u contains "roberts" then
          execute t javascript "localStorage.getItem('rv_build_submissions')" returning result
        end if
      end try
    end repeat
  end repeat
end tell
EOD > "$TMP/builds.json"

# Save source snapshot
tar -cf "$TMP/source.tar" src package.json vite.config.* tsconfig.json 2>/dev/null

# Zip everything
cd /tmp || exit 1
zip -r "$BACKUP_DIR/rv-auto-$DATE.zip" "rv_backup_$DATE" >/dev/null

# Cleanup
rm -rf "$TMP"

echo "RV BACKUP COMPLETE: rv-auto-$DATE.zip"
rsync -a --delete "$BACKUP_DIR/" "$HOME/Library/Mobile Documents/com~apple~CloudDocs/RV-Backups/"

# Auto iCloud sync
rsync -a --delete "$BACKUP_DIR/" "$HOME/Library/Mobile Documents/com~apple~CloudDocs/RV-Backups/"

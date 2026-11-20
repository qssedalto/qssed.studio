#!/bin/sh
set -eu

PLIST="/Library/LaunchAgents/com.aertex.bridge.plist"
BASE="/Library/Application Support/AERTEX Bridge"
MANAGER="/Applications/AERTEX Bridge.app"

if [ "$(/usr/bin/id -u)" -ne 0 ]; then
  echo "Administrator permission is needed to uninstall AERTEX Bridge."
  exec /usr/bin/sudo "$0" "$@"
fi

USER_NAME="$(/usr/bin/stat -f '%Su' /dev/console)"
if [ -n "$USER_NAME" ] && [ "$USER_NAME" != "root" ] && [ "$USER_NAME" != "loginwindow" ]; then
  UID_NUM="$(/usr/bin/id -u "$USER_NAME")"
  /bin/launchctl bootout "gui/$UID_NUM" "$PLIST" >/dev/null 2>&1 || true
fi

/bin/rm -f "$PLIST"
/bin/rm -rf "$BASE" "$MANAGER"
# The installer receipt is deliberately left for macOS package accounting.
echo "AERTEX Bridge removed. Personal logs were preserved in ~/Library/Logs/AERTEX Bridge."

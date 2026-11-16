#!/bin/sh
set -eu
PLIST="/Library/LaunchAgents/com.aertex.bridge.plist"
APP="/Library/Application Support/AERTEX Bridge"
if [ "$(id -u)" -ne 0 ]; then
  echo "Administrator permission is required to remove the system-wide installation."
  exec sudo "$0" "$@"
fi
USER_NAME="$(stat -f '%Su' /dev/console)"
if [ -n "$USER_NAME" ] && [ "$USER_NAME" != "root" ] && [ "$USER_NAME" != "loginwindow" ]; then
  UID_NUM="$(id -u "$USER_NAME")"
  launchctl bootout "gui/$UID_NUM" "$PLIST" >/dev/null 2>&1 || true
fi
rm -f "$PLIST"
rm -rf "$APP"
echo "AERTEX Bridge removed. User log files were left intact."

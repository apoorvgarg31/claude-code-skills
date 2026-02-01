#!/bin/bash
# Restore state from backup
BACKUP=$1
if [ -z "$BACKUP" ]; then
  echo "Usage: restore-state.sh <backup-dir>"
  exit 1
fi
cp "$BACKUP"/*.yaml state/
echo "✅ Restored from $BACKUP"

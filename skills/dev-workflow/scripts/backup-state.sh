#!/bin/bash
# Backup current state
BACKUP_DIR="state/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp state/*.yaml "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backed up to $BACKUP_DIR"

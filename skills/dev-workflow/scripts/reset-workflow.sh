#!/bin/bash
# Reset workflow to start over

STATE_DIR="state"

if [ -d "$STATE_DIR" ]; then
  rm -rf "$STATE_DIR"/*
  echo "✅ Workflow reset. Run /new-project to start fresh."
else
  echo "❌ No state directory found."
fi

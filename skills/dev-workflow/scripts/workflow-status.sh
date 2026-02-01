#!/bin/bash
# Show current workflow status

STATE_FILE="state/workflow.yaml"

if [ ! -f "$STATE_FILE" ]; then
  echo "❌ No workflow found. Run /new-project first."
  exit 1
fi

echo "📊 Workflow Status"
echo "=================="
grep "project_name:" "$STATE_FILE"
grep "current_phase:" "$STATE_FILE"
grep "total_commits:" "$STATE_FILE"
echo ""
echo "Phases completed:"
grep -A10 "phases_completed:" "$STATE_FILE" | head -10

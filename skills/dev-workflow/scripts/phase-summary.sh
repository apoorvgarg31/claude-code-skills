#!/bin/bash
# Generate summary for current phase
STATE_FILE="state/workflow.yaml"
PHASE=$(grep "current_phase:" "$STATE_FILE" | cut -d'"' -f2)
echo "📋 Phase Summary: $PHASE"
case $PHASE in
  ba) cat state/tech-spec.yaml 2>/dev/null || echo "No tech spec yet" ;;
  developer) cat state/dev-progress.yaml 2>/dev/null || echo "No progress yet" ;;
  code-review) cat state/review-notes.yaml 2>/dev/null || echo "No review yet" ;;
  test) cat state/test-results.yaml 2>/dev/null || echo "No results yet" ;;
  *) echo "Unknown phase: $PHASE" ;;
esac

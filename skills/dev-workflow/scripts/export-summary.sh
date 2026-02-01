#!/bin/bash
# Export workflow summary to markdown
echo "# Workflow Summary"
echo ""
echo "## Project"
grep "project_name:" state/workflow.yaml
echo ""
echo "## Stats"
grep "total_commits:" state/workflow.yaml
grep "review_iterations:" state/workflow.yaml
echo ""
echo "## Phases"
grep -A5 "phases_completed:" state/workflow.yaml

#!/bin/bash
# Initialize a new workflow project

PROJECT_NAME=${1:-"my-project"}
STATE_DIR="state"

mkdir -p "$STATE_DIR"

cat > "$STATE_DIR/workflow.yaml" << YAML
project_name: "$PROJECT_NAME"
created_at: "$(date -Iseconds)"
current_phase: "ba"
phases_completed: []
history: []
config:
  skip_devops: false
  auto_advance: true
stats:
  total_commits: 0
  review_iterations: 0
  test_runs: 0
YAML

echo "✅ Workflow initialized for: $PROJECT_NAME"
echo "📁 State directory: $STATE_DIR"
echo "🚀 Run /new-project to start!"

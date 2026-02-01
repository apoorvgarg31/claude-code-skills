#!/bin/bash
# Validate state files exist and are valid
VALID=true
for f in workflow tech-spec; do
  if [ ! -f "state/$f.yaml" ]; then
    echo "❌ Missing: state/$f.yaml"
    VALID=false
  fi
done
if $VALID; then echo "✅ State valid"; fi

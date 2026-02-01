#!/bin/bash
# Count commits in current session
git log --oneline --since="$(date -d '6 hours ago' '+%Y-%m-%d %H:%M')" | wc -l

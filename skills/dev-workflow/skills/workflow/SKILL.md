---
name: dev-workflow
description: Complete development workflow with Business Analyst, Developer, Code Review, Test, and DevOps sub-agents. Start with /new-project to begin a new project workflow.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Development Workflow Skill

A comprehensive development workflow that guides you through the entire software development lifecycle using specialized sub-agents.

## ⚠️ IMPORTANT: Start Fresh

**Always start a new project with a fresh context!** Run `/new-project` in a new Claude Code session for best results.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  /new-project → Business Analyst → Tech Spec                        │
│                                    ↓                                 │
│  /developer → Developer → Code Review ←──┐                          │
│                              ↓           │                          │
│                         [Issues?] ───Yes─┘                          │
│                              ↓ No                                    │
│                            Test ←────────┐                          │
│                              ↓           │                          │
│                         [Issues?] ───Yes─┘                          │
│                              ↓ No                                    │
│                    DevOps (optional)                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Commands

| Command | Description |
|---------|-------------|
| `/new-project` | Start a new project - initiates Business Analyst |
| `/developer` | Start development phase after tech spec is ready |
| `/code-review` | Trigger code review (usually auto-triggered) |
| `/test` | Run test phase (usually auto-triggered) |
| `/devops` | Deploy (optional, manual trigger) |
| `/workflow-status` | Check current workflow state |

## Sub-Agents

Each phase uses a specialized sub-agent:

### 1. Business Analyst (`/new-project`)
- Brainstorms with you to understand requirements
- Asks clarifying questions
- Creates comprehensive tech spec
- Saves spec to `.dev-workflow/tech-spec.yaml`

### 2. Developer (`/developer`)
- Reads tech spec from state
- Implements features incrementally
- Small commits, one change at a time
- Hands off to Code Review when ready

### 3. Code Review (`/code-review`)
- Reviews code changes
- Checks for bugs, security issues, best practices
- If issues found → sends back to Developer
- If approved → proceeds to Test

### 4. Test (`/test`)
- Runs test suite
- Creates new tests for new features
- If failures → sends back to Developer
- If passing → proceeds to DevOps (if enabled)

### 5. DevOps (`/devops`)
- Optional deployment phase
- Handles CI/CD, deployment scripts
- Only triggered manually

## State Management

All progress is saved to YAML files in `.dev-workflow/`:

```
.dev-workflow/
├── workflow.yaml      # Current workflow state
├── tech-spec.yaml     # Tech spec from BA phase
├── dev-progress.yaml  # Development progress
├── review-notes.yaml  # Code review feedback
└── test-results.yaml  # Test results
```

### workflow.yaml structure:
```yaml
project_name: "My Project"
created_at: "2026-02-01T23:00:00Z"
current_phase: "developer"  # ba | developer | code-review | test | devops | complete
phases_completed:
  - ba
history:
  - phase: ba
    started: "2026-02-01T23:00:00Z"
    completed: "2026-02-01T23:15:00Z"
    notes: "Tech spec created"
```

## Getting Started

1. **Start a new Claude Code session** (fresh context)
2. Run `/new-project My Awesome Project`
3. Answer the Business Analyst's questions
4. Review the generated tech spec
5. Run `/developer` to start coding
6. Follow the workflow through review and testing

## Best Practices

- Start each new project with a fresh context
- Let the workflow guide you through each phase
- Don't skip phases - they build on each other
- Review state files if you need to resume
- Use `/workflow-status` to see where you are

## Files Reference

- [agents/business-analyst.md](agents/business-analyst.md) - BA sub-agent
- [agents/developer.md](agents/developer.md) - Developer sub-agent  
- [agents/code-review.md](agents/code-review.md) - Code Review sub-agent
- [agents/test.md](agents/test.md) - Test sub-agent
- [agents/devops.md](agents/devops.md) - DevOps sub-agent
- [templates/tech-spec.yaml](templates/tech-spec.yaml) - Tech spec template
- [templates/workflow.yaml](templates/workflow.yaml) - Workflow state template

## Quick Reference

| Phase | Input | Output | Next |
|-------|-------|--------|------|
| BA | User requirements | tech-spec.yaml | /developer |
| Developer | Tech spec | Code + commits | /code-review |
| Code Review | Code changes | review-notes.yaml | /test or /developer |
| Test | Code | test-results.yaml | /devops or /developer |
| DevOps | Tested code | Deployed app | Complete |

## Metrics Tracked

- Total commits
- Review iterations
- Test pass rate
- Phase durations
- Total workflow time

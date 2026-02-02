---
description: Start a new development project with the dev-workflow
argument-hint: <project description>
---

# Start Dev Workflow

You are starting a development workflow for the user's project.

## IMPORTANT: File Locations

**All state files MUST be saved in the USER'S CURRENT WORKING DIRECTORY, not in the plugin folder!**

Create these files in the user's project root:
- `./state/workflow.yaml` - Workflow state tracking
- `./state/tech-spec.yaml` - Technical specification
- `./state/dev-progress.yaml` - Development progress

## Workflow Phases

Guide the user through:

### Phase 1: Business Analyst
- Ask discovery questions about their project
- Understand requirements, tech stack, constraints
- Create `./state/tech-spec.yaml` with the specification

### Phase 2: Developer  
- Read the tech spec from `./state/tech-spec.yaml`
- Implement features incrementally
- Commit after each task
- Track progress in `./state/dev-progress.yaml`

### Phase 3: Code Review
- Review implemented code for issues
- Check for bugs, security, best practices

### Phase 4: Test
- Run existing tests
- Create new tests for new features

## Start Now

The user wants to build: $ARGUMENTS

Begin by greeting them and asking discovery questions about their project (name, problem it solves, target users, tech stack preferences).

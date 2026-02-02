---
description: Start a new development project with the dev-workflow
argument-hint: <project description>
---

# Start Dev Workflow

You are starting a development workflow for the user's project.

## IMPORTANT: File Locations

**All state files MUST be saved in the USER'S CURRENT WORKING DIRECTORY, not in the plugin folder!**

## Step 1: Get Project Name

Parse from $ARGUMENTS or ask:
```
What should I call this project? (used for state folder, e.g., todo-api)
```

Sanitize: lowercase, hyphens instead of spaces.

## Step 2: Check for existing project

```bash
ls ./.dev-workflow/<project-name>/ 2>/dev/null
```

If exists, ask: "Resume or start fresh?"

## Step 3: Create project folder

```bash
mkdir -p .dev-workflow/<project-name>
```

Create these files in the project folder:
- `./.dev-workflow/<project-name>/workflow.yaml` - Workflow state tracking
- `./.dev-workflow/<project-name>/tech-spec.yaml` - Technical specification
- `./.dev-workflow/<project-name>/dev-progress.yaml` - Development progress

## Workflow Phases

Guide the user through:

### Phase 1: Business Analyst (Thorough & Interactive)

**Read `skills/workflow/ba-phase.md` for detailed instructions.**

1. **Initial Discovery**
   Ask: "What are you trying to achieve? Describe in as much detail as you can."

2. **Codebase Analysis**
   Analyze existing code for patterns, frameworks, conventions:
   ```bash
   find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.js" \) | head -30
   cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null
   ```

3. **Clarifying Questions**
   Based on codebase + user description, ask specific clarifying questions.

4. **Propose Ideas**
   Offer options and recommendations based on analysis.

5. **Iterate Until Satisfied**
   Keep dialogue going until user explicitly approves.

6. **Lock Tech Spec**
   Only when user confirms: "Ready to lock the tech spec?"
   Create `./.dev-workflow/<project-name>/tech-spec.yaml`

### Phase 2: Developer  
- Read the tech spec from `./.dev-workflow/<project-name>/tech-spec.yaml`
- Implement features incrementally
- Commit after each task
- Track progress in `./.dev-workflow/<project-name>/dev-progress.yaml`

### Phase 3: Code Review
- Review implemented code for issues
- Check for bugs, security, best practices

### Phase 4: Test
- Run existing tests
- Create new tests for new features

## Start Now

The user wants to build: $ARGUMENTS

Begin by greeting them and asking discovery questions about their project (name, problem it solves, target users, tech stack preferences).

# dev-workflow

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-purple)

# dev-workflow

A comprehensive Claude Code skill that implements a complete software development workflow with specialized sub-agents.

## Features

- 🧑‍💼 **Business Analyst** - Brainstorms requirements, creates tech specs
- 👨‍💻 **Developer** - Implements features with small, focused commits
- 🔍 **Code Review** - Reviews code for quality, security, best practices
- 🧪 **Test** - Runs tests, ensures coverage, writes new tests
- 🚀 **DevOps** - Handles deployment (optional)

## Installation

### As a Claude Code Skill

Copy to your Claude skills directory:

```bash
cp -r dev-workflow ~/.claude/skills/
```

Or install from npm:

```bash
npm install @apoorvgarg-31/dev-workflow
```

## Usage

### Start a New Project

**Always start in a fresh Claude Code context!**

```
/new-project My Awesome App
```

This initiates the Business Analyst who will:
1. Ask questions about your project
2. Create a comprehensive tech spec
3. Save progress to `.dev-workflow/tech-spec.yaml`

### Development Phase

After the tech spec is approved:

```
/developer
```

The Developer sub-agent will:
1. Read the tech spec
2. Break down features into tasks
3. Implement with small commits (50+ per session)
4. Hand off to Code Review

### Code Review

Automatically triggered after development, or manually:

```
/code-review
```

Reviews for:
- Functionality
- Code quality
- Security
- Performance
- Test coverage

### Testing

Automatically triggered after code review passes, or manually:

```
/test
```

Runs tests, writes new tests, ensures coverage.

### Deployment (Optional)

```
/devops
```

Handles deployment to your platform of choice.

### Check Status

```
/workflow-status
```

Shows current phase and progress.

## Workflow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  /new-project                                                │
│       ↓                                                       │
│  Business Analyst ──→ Tech Spec                              │
│       ↓                                                       │
│  /developer                                                   │
│       ↓                                                       │
│  Developer ──→ Code ──→ Code Review                          │
│                              ↓                                │
│                      ┌─ Issues? ─┐                           │
│                      ↓ Yes       ↓ No                        │
│                   Developer     Test                          │
│                                  ↓                            │
│                          ┌─ Pass? ─┐                         │
│                          ↓ No      ↓ Yes                     │
│                       Developer   DevOps (optional)          │
│                                    ↓                          │
│                               Complete! 🎉                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## State Management

All progress is saved to YAML files in `.dev-workflow/`:

| File | Purpose |
|------|---------|
| `workflow.yaml` | Current phase, history |
| `tech-spec.yaml` | Requirements from BA |
| `dev-progress.yaml` | Tasks, commits |
| `review-notes.yaml` | Code review feedback |
| `test-results.yaml` | Test results |
| `deploy-config.yaml` | Deployment config |

## Sub-Agent Files

| File | Purpose |
|------|---------|
| `agents/business-analyst.md` | BA instructions |
| `agents/developer.md` | Developer instructions |
| `agents/code-review.md` | Code Review instructions |
| `agents/test.md` | Test instructions |
| `agents/devops.md` | DevOps instructions |

## Best Practices

1. **Start fresh** - New project = new Claude Code context
2. **Don't skip phases** - Each phase builds on the previous
3. **Small commits** - 50+ commits per session
4. **Check state files** - Resume by reading .dev-workflow/
5. **Review tech spec** - Ensure BA understood your requirements

## License

MIT

## FAQ

### Q: Can I skip phases?
A: Not recommended. Each phase builds on the previous.

### Q: How do I resume a workflow?
A: The state files track progress. Just run the appropriate command.

### Q: Can I customize the agents?
A: Yes! Edit the files in `agents/` folder.

### Q: What if code review keeps failing?
A: Check `.dev-workflow/review-notes.yaml` for specific issues.

## Troubleshooting

### "No workflow found"
Run `/new-project` to initialize.

### State files corrupted
Use `./scripts/restore-state.sh` with a backup.

### Stuck in a phase
Check the state file for that phase and fix issues.

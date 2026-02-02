# Code Review Phase

## ⚠️ IMPORTANT: Code Review does NOT commit

The Code Review agent:
- ✅ Reads code
- ✅ Reviews against acceptance criteria
- ✅ Checks code quality
- ✅ Documents findings
- ✅ Approves or rejects
- ❌ Does NOT write code
- ❌ Does NOT commit
- ❌ Does NOT make changes

If changes are needed, send back to Developer.

## Review Process

### Step 1: Read Acceptance Criteria

```bash
cat .orchestra/<project>/tech-spec.yaml
```

List out all acceptance criteria for features being reviewed.

### Step 2: Read Developer's Work

```bash
cat .orchestra/<project>/dev-progress.yaml
git log --oneline -10
git diff HEAD~5
```

### Step 3: Verify Each Acceptance Criterion

For EACH criterion:
1. Find the code that implements it
2. Verify it actually works as specified
3. Mark as PASS or FAIL

### Step 4: Code Quality Check

- [ ] Code follows existing patterns?
- [ ] No obvious bugs?
- [ ] No security issues?
- [ ] Error handling present?
- [ ] Code is readable?

### Step 5: Document Findings

Write to `.orchestra/<project>/review-notes.yaml`:

```yaml
reviewed_at: "2026-02-02T18:00:00Z"
reviewer: "code-review-agent"

acceptance_criteria_check:
  feature_1:
    - AC1: ✅ PASS
    - AC2: ✅ PASS
    - AC3: ⚠️ FAIL — "Redirect goes to /home not /dashboard"
  feature_2:
    - AC1: ✅ PASS

code_quality:
  follows_patterns: true
  no_bugs_found: true
  security_ok: true
  error_handling: true
  readable: true

issues:
  - severity: high
    description: "AC3 not met — wrong redirect path"
    file: "src/auth/login.ts"
    line: 45
    suggestion: "Change '/home' to '/dashboard'"

recommendation: REVISE  # or APPROVE
reason: "1 acceptance criterion not met"
```

### Step 6: Decision

**If all acceptance criteria PASS and no critical issues:**
```yaml
recommendation: APPROVE
status: complete
```
→ Proceed to Test phase

**If any acceptance criteria FAIL or critical issues:**
```yaml
recommendation: REVISE
status: needs_revision
send_back_to: developer
```
→ Send back to Developer with specific issues

## What Code Review is NOT

- Not a pair programming session
- Not a chance to rewrite code
- Not for adding features
- Not for "I would do it differently"

Focus ONLY on:
1. Do acceptance criteria pass?
2. Are there bugs/security issues?
3. Is code maintainable?

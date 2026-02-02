# Acceptance Criteria: The Source of Truth

Every feature/story in the tech spec MUST have clear acceptance criteria. Every downstream agent MUST verify these are met.

## Tech Spec Format (BA Creates)

```yaml
features:
  - id: 1
    name: "User login"
    description: "Users can log in with email/password"
    acceptance_criteria:
      - AC1: "User can enter email and password"
      - AC2: "Invalid credentials show error message"
      - AC3: "Successful login redirects to dashboard"
      - AC4: "Session persists for 24 hours"
    status: pending
```

## Developer Phase

Before marking a feature complete, Developer MUST:

1. Go through EACH acceptance criterion
2. Verify implementation meets it
3. Update status in dev-progress.yaml:

```yaml
features:
  - id: 1
    name: "User login"
    acceptance_criteria:
      - AC1: ✅ "User can enter email and password" — implemented in LoginForm.tsx
      - AC2: ✅ "Invalid credentials show error message" — error state in useAuth hook
      - AC3: ✅ "Successful login redirects to dashboard" — router.push('/dashboard')
      - AC4: ✅ "Session persists for 24 hours" — JWT expiry set to 24h
    commits: ["abc123", "def456"]
    status: complete
```

**DO NOT mark complete unless ALL acceptance criteria are checked.**

## Code Review Phase

Code Reviewer MUST:

1. Read the acceptance criteria from tech-spec.yaml
2. For EACH criterion, verify the code actually implements it
3. Check off in review-notes.yaml:

```yaml
feature_id: 1
acceptance_criteria_review:
  - AC1: ✅ PASS — LoginForm has email/password fields
  - AC2: ✅ PASS — Error message displayed on 401 response
  - AC3: ✅ PASS — useRouter redirects to /dashboard
  - AC4: ⚠️ FAIL — JWT expiry is 1h, not 24h as specified
issues:
  - "AC4 not met: JWT expiry should be 24h, currently 1h"
recommendation: "REVISE — send back to developer to fix AC4"
```

**Code Review does NOT commit code. Only reviews and reports.**

## Test Phase

Tester MUST:

1. Create/verify tests for EACH acceptance criterion
2. Map tests to criteria:

```yaml
feature_id: 1
test_coverage:
  - AC1: 
      test: "test_login_form_has_email_password_fields"
      status: ✅ PASS
  - AC2:
      test: "test_invalid_credentials_shows_error"
      status: ✅ PASS
  - AC3:
      test: "test_successful_login_redirects_to_dashboard"
      status: ✅ PASS
  - AC4:
      test: "test_session_persists_24_hours"
      status: ✅ PASS
all_criteria_tested: true
all_tests_passing: true
```

**Every acceptance criterion MUST have at least one test.**

## DevOps Phase

Before deployment, DevOps MUST verify:

```yaml
pre_deploy_checklist:
  - all_acceptance_criteria_met: true
  - code_review_approved: true
  - all_tests_passing: true
  - no_open_issues: true
ready_to_deploy: true
```

## Failure Handling

If ANY agent finds acceptance criteria not met:

1. Document which criteria failed
2. Update workflow.yaml to send back to appropriate phase
3. Do NOT proceed to next phase

```yaml
# workflow.yaml
current_phase: developer  # Sent back from code-review
reason: "AC4 not met — JWT expiry incorrect"
action_required: "Fix JWT expiry to 24h"
```

## Summary

```
BA: Creates acceptance criteria
     ↓
Developer: Implements + verifies each AC ✓
     ↓
Code Review: Re-verifies each AC in code ✓ (NO COMMITS)
     ↓
Test: Creates tests for each AC ✓
     ↓
DevOps: Final checklist before deploy ✓
```

**Acceptance criteria flow through the ENTIRE pipeline.**

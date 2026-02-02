---
name: test-architect
description: Generate comprehensive tests via interactive Q&A conversation
argument-hint: <code-file> [--framework jest|pytest|vitest]
user-invocable: true
allowed-tools: Read, Glob, Grep, AskUserQuestion, Write, Edit
---

# Test Architect

Generate comprehensive test suites through an interactive conversation that explores edge cases, error handling, and testing priorities.

## Usage

```
/test-architect src/utils/parser.ts
/test-architect lib/auth.py --framework pytest
/test-architect components/Button.tsx --framework vitest
```

## Arguments

- `$0` - Path to code file to test (required)
- `--framework` - Test framework: `jest` (default for JS/TS), `pytest` (Python), `vitest`
- `--output` - Output test file path (optional, auto-generated based on conventions)

## How It Works

### Phase 1: Code Analysis

First, read and analyze the provided source file:

```
Read the file at: $0
```

Analyze the code to identify:
- All exported functions/classes/methods
- Function signatures and return types
- Dependencies and imports
- Existing error handling patterns
- Complex logic branches
- Integration points with external systems

### Phase 2: Interactive Q&A

Ask clarifying questions using AskUserQuestion to understand testing requirements:

**Question Categories:**

1. **Edge Cases**
   - "What should happen when [input] is empty/null/undefined?"
   - "Are there maximum/minimum value constraints for [parameter]?"
   - "How should the function behave with malformed input?"

2. **Error Handling**
   - "Should [function] throw or return null on invalid input?"
   - "What error types should be caught vs propagated?"
   - "Are there specific error messages required?"

3. **Priorities**
   - "Which functions are most critical to test thoroughly?"
   - "Are there any known bug-prone areas?"
   - "What's the desired code coverage target?"

4. **Environment & Dependencies**
   - "Should we mock [external dependency]?"
   - "Are there environment-specific behaviors to test?"
   - "What test data or fixtures are needed?"

5. **Business Logic**
   - "What are the expected outputs for these inputs: [examples]?"
   - "Are there race conditions or async behavior to consider?"
   - "What invariants must always hold?"

### Phase 3: Test Generation

Based on the analysis and Q&A responses, generate comprehensive tests.

**For Jest/Vitest (JavaScript/TypeScript):**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// or: import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { functionName } from './source-file';

describe('functionName', () => {
  describe('happy path', () => {
    it('should handle valid input correctly', () => {
      // Test implementation
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {});
    it('should handle null/undefined', () => {});
    it('should handle boundary values', () => {});
  });

  describe('error handling', () => {
    it('should throw on invalid input', () => {});
    it('should handle async errors', () => {});
  });

  describe('integration', () => {
    it('should work with mocked dependencies', () => {});
  });
});
```

**For Pytest (Python):**

```python
import pytest
from unittest.mock import Mock, patch
from source_file import function_name

class TestFunctionName:
    """Tests for function_name"""

    def test_happy_path(self):
        """Test valid input produces expected output"""
        pass

    class TestEdgeCases:
        def test_empty_input(self):
            pass

        def test_none_input(self):
            pass

        def test_boundary_values(self):
            pass

    class TestErrorHandling:
        def test_invalid_input_raises(self):
            with pytest.raises(ValueError):
                pass

        def test_handles_exceptions(self):
            pass
```

### Phase 4: Review & Refinement

After generating tests, ask:
- "Would you like to add more test cases for any function?"
- "Should I adjust the mocking strategy?"
- "Are there additional scenarios to cover?"

## Framework Detection

If `--framework` is not specified, detect based on:
- `.ts` or `.tsx` files → Check for vitest.config or jest.config → Default to jest
- `.js` or `.jsx` files → Check for vitest.config or jest.config → Default to jest
- `.py` files → pytest

## Test File Naming

Default output locations:
- Jest/Vitest: `[filename].test.ts` or `__tests__/[filename].test.ts`
- Pytest: `test_[filename].py` or `tests/test_[filename].py`

## Example Session

```
User: /test-architect src/utils/validator.ts

Test Architect: I've analyzed validator.ts. It exports 3 functions:
- validateEmail(email: string): boolean
- validatePassword(password: string): ValidationResult
- validateForm(data: FormData): FormErrors

Let me ask a few questions to generate comprehensive tests:

Q1: For validateEmail, should it accept internationalized domain names (IDN)?
Q2: What are the password requirements (min length, special chars, etc.)?
Q3: Should validateForm stop at the first error or collect all errors?

User: 1) No IDN support needed. 2) Min 8 chars, 1 uppercase, 1 number. 3) Collect all.

Test Architect: Got it! Generating tests...
[Writes validator.test.ts with comprehensive test coverage]
```

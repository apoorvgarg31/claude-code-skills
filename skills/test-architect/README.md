# test-architect

A Claude Code skill for generating comprehensive tests via interactive Q&A conversation.

## Features

- **Code Analysis**: Automatically analyzes source files to identify functions, classes, and exports
- **Interactive Q&A**: Asks clarifying questions about edge cases, error handling, and priorities
- **Multi-Framework Support**: Generates tests for Jest, Vitest, or Pytest
- **Smart Detection**: Auto-detects language and test framework from project configuration

## Installation

### As a Claude Code Skill

```bash
npm install @apoorvgarg31/test-architect
```

Or copy to your Claude skills directory:

```bash
cp -r test-architect ~/.claude/skills/
```

## Usage

In Claude Code, use the `/test-architect` command:

```
/test-architect src/utils/parser.ts
/test-architect lib/auth.py --framework pytest
/test-architect components/Button.tsx --framework vitest
```

### Options

| Option | Description |
|--------|-------------|
| `--framework` | Test framework: `jest`, `vitest`, or `pytest` |
| `--output` | Output test file path |

### Direct Script Usage

```bash
npx ts-node scripts/generate.ts src/utils/parser.ts
npx ts-node scripts/generate.ts lib/auth.py --framework pytest
npx ts-node scripts/generate.ts components/Button.tsx --output __tests__/Button.test.tsx
```

## How It Works

### Phase 1: Code Analysis

The skill reads and analyzes the provided source file to identify:
- All exported functions/classes/methods
- Function signatures and return types
- Dependencies and imports
- Existing error handling patterns

### Phase 2: Interactive Q&A

The skill asks clarifying questions to understand:
- **Edge Cases**: Empty inputs, null values, boundary conditions
- **Error Handling**: Expected exceptions, error messages
- **Priorities**: Critical functions, known bug-prone areas
- **Dependencies**: What to mock, environment-specific behavior

### Phase 3: Test Generation

Generates comprehensive test suites organized by:
- Happy path tests
- Edge case tests
- Error handling tests
- Integration tests (with mocks)

### Phase 4: Review & Refinement

After generating tests, offers to:
- Add more test cases
- Adjust mocking strategies
- Cover additional scenarios

## Framework Detection

If `--framework` is not specified:
- `.ts` / `.tsx` / `.js` / `.jsx` files → Checks for vitest.config or jest.config → Defaults to Jest
- `.py` files → Pytest

## Test File Naming Conventions

Default output locations:
- **Jest/Vitest**: `[filename].test.ts` or `[filename].test.tsx`
- **Pytest**: `test_[filename].py`

## Example Output

### Jest/Vitest (TypeScript)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEmail, validatePassword } from './validator';

describe('validateEmail', () => {
  describe('happy path', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw on null input', () => {
      expect(() => validateEmail(null)).toThrow();
    });
  });
});
```

### Pytest (Python)

```python
import pytest
from validator import validate_email, validate_password

class TestValidateEmail:
    def test_happy_path(self):
        assert validate_email('user@example.com') is True

    class TestEdgeCases:
        def test_empty_string(self):
            assert validate_email('') is False

    class TestErrorHandling:
        def test_none_input_raises(self):
            with pytest.raises(TypeError):
                validate_email(None)
```

## Requirements

- Node.js 18+
- TypeScript 5.0+

For the generated tests:
- Jest, Vitest, or Pytest (depending on framework)

## License

MIT

#!/usr/bin/env npx ts-node

/**
 * Test Architect - Generate comprehensive tests via interactive Q&A
 *
 * This script analyzes source code and generates test files based on
 * the detected patterns, functions, and user preferences gathered
 * through interactive conversation.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FunctionInfo {
  name: string;
  params: string[];
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
}

interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  isExported: boolean;
}

interface CodeAnalysis {
  language: 'typescript' | 'javascript' | 'python';
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: string[];
  exports: string[];
}

interface TestConfig {
  framework: 'jest' | 'vitest' | 'pytest';
  outputPath: string;
  coverage: {
    happyPath: boolean;
    edgeCases: boolean;
    errorHandling: boolean;
    integration: boolean;
  };
}

/**
 * Detect language from file extension
 */
function detectLanguage(filePath: string): CodeAnalysis['language'] {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
    case '.mjs':
      return 'javascript';
    case '.py':
      return 'python';
    default:
      return 'typescript';
  }
}

/**
 * Detect test framework based on project configuration
 */
function detectFramework(projectRoot: string, language: CodeAnalysis['language']): TestConfig['framework'] {
  if (language === 'python') {
    return 'pytest';
  }

  // Check for vitest config
  const vitestConfigs = ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mts'];
  for (const config of vitestConfigs) {
    if (fs.existsSync(path.join(projectRoot, config))) {
      return 'vitest';
    }
  }

  // Check for jest config
  const jestConfigs = ['jest.config.ts', 'jest.config.js', 'jest.config.mjs'];
  for (const config of jestConfigs) {
    if (fs.existsSync(path.join(projectRoot, config))) {
      return 'jest';
    }
  }

  // Check package.json for jest
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.devDependencies?.vitest || packageJson.dependencies?.vitest) {
        return 'vitest';
      }
      if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
        return 'jest';
      }
    } catch {
      // Ignore parse errors
    }
  }

  return 'jest'; // Default
}

/**
 * Parse TypeScript/JavaScript code to extract functions and classes
 */
function analyzeTypeScriptCode(content: string): Pick<CodeAnalysis, 'functions' | 'classes' | 'imports' | 'exports'> {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const imports: string[] = [];
  const exports: string[] = [];

  // Extract imports
  const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Extract exported functions
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
  while ((match = functionRegex.exec(content)) !== null) {
    const isExported = content.substring(match.index - 10, match.index).includes('export');
    functions.push({
      name: match[1],
      params: match[2].split(',').map(p => p.trim()).filter(Boolean),
      returnType: match[3]?.trim() || 'void',
      isAsync: match[0].includes('async'),
      isExported
    });
    if (isExported) exports.push(match[1]);
  }

  // Extract arrow functions
  const arrowFuncRegex = /(?:export\s+)?(?:const|let)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*([^=]+))?\s*=>/g;
  while ((match = arrowFuncRegex.exec(content)) !== null) {
    const isExported = content.substring(match.index - 10, match.index).includes('export');
    const isAsync = content.substring(match.index, match.index + 100).includes('async');
    functions.push({
      name: match[1],
      params: [], // Would need more complex parsing
      returnType: match[2]?.trim() || 'unknown',
      isAsync,
      isExported
    });
    if (isExported) exports.push(match[1]);
  }

  // Extract classes
  const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[^{]+)?\s*{([^}]+(?:{[^}]*}[^}]*)*)}/g;
  while ((match = classRegex.exec(content)) !== null) {
    const isExported = content.substring(match.index - 10, match.index).includes('export');
    const classBody = match[2];
    const methods: FunctionInfo[] = [];

    const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(classBody)) !== null) {
      if (methodMatch[1] !== 'constructor') {
        methods.push({
          name: methodMatch[1],
          params: methodMatch[2].split(',').map(p => p.trim()).filter(Boolean),
          returnType: methodMatch[3]?.trim() || 'void',
          isAsync: classBody.substring(methodMatch.index - 10, methodMatch.index).includes('async'),
          isExported: true
        });
      }
    }

    classes.push({
      name: match[1],
      methods,
      isExported
    });
    if (isExported) exports.push(match[1]);
  }

  return { functions, classes, imports, exports };
}

/**
 * Parse Python code to extract functions and classes
 */
function analyzePythonCode(content: string): Pick<CodeAnalysis, 'functions' | 'classes' | 'imports' | 'exports'> {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const imports: string[] = [];
  const exports: string[] = [];

  // Extract imports
  const importRegex = /^(?:from\s+(\S+)\s+)?import\s+(.+)$/gm;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1] || match[2]);
  }

  // Extract functions
  const functionRegex = /^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/gm;
  while ((match = functionRegex.exec(content)) !== null) {
    const isPrivate = match[1].startsWith('_');
    functions.push({
      name: match[1],
      params: match[2].split(',').map(p => p.split(':')[0].trim()).filter(Boolean),
      returnType: match[3]?.trim() || 'None',
      isAsync: match[0].includes('async'),
      isExported: !isPrivate
    });
    if (!isPrivate) exports.push(match[1]);
  }

  // Extract classes
  const classRegex = /^class\s+(\w+)(?:\([^)]*\))?:/gm;
  while ((match = classRegex.exec(content)) !== null) {
    const isPrivate = match[1].startsWith('_');
    classes.push({
      name: match[1],
      methods: [], // Would need indentation-aware parsing
      isExported: !isPrivate
    });
    if (!isPrivate) exports.push(match[1]);
  }

  return { functions, classes, imports, exports };
}

/**
 * Analyze source code file
 */
function analyzeCode(filePath: string): CodeAnalysis {
  const content = fs.readFileSync(filePath, 'utf-8');
  const language = detectLanguage(filePath);

  const analysis = language === 'python'
    ? analyzePythonCode(content)
    : analyzeTypeScriptCode(content);

  return {
    language,
    ...analysis
  };
}

/**
 * Generate test file path based on conventions
 */
function generateTestPath(sourcePath: string, framework: TestConfig['framework']): string {
  const dir = path.dirname(sourcePath);
  const ext = path.extname(sourcePath);
  const base = path.basename(sourcePath, ext);

  if (framework === 'pytest') {
    return path.join(dir, `test_${base}.py`);
  }

  // Jest/Vitest
  const testExt = ext === '.tsx' ? '.test.tsx' : '.test.ts';
  return path.join(dir, `${base}${testExt}`);
}

/**
 * Generate Jest/Vitest test template
 */
function generateJestTests(analysis: CodeAnalysis, sourcePath: string, framework: 'jest' | 'vitest'): string {
  const importSource = framework === 'vitest'
    ? `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';`
    : `import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';`;

  const relativePath = './' + path.basename(sourcePath, path.extname(sourcePath));
  const exportedItems = analysis.exports.join(', ');

  let tests = `${importSource}
import { ${exportedItems} } from '${relativePath}';

`;

  // Generate tests for each function
  for (const func of analysis.functions.filter(f => f.isExported)) {
    tests += `describe('${func.name}', () => {
  describe('happy path', () => {
    it('should return expected result for valid input', () => {
      // TODO: Add test implementation
      // const result = ${func.isAsync ? 'await ' : ''}${func.name}(${func.params.map(() => '/* arg */').join(', ')});
      // expect(result).toEqual(/* expected */);
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      // TODO: Test with empty/minimal input
    });

    it('should handle null/undefined parameters', () => {
      // TODO: Test null/undefined handling
    });

    it('should handle boundary values', () => {
      // TODO: Test min/max values, empty strings, etc.
    });
  });

  describe('error handling', () => {
    it('should throw on invalid input', () => {
      // TODO: Test error cases
      // expect(() => ${func.name}(invalidInput)).toThrow();
    });
${func.isAsync ? `
    it('should handle async errors gracefully', async () => {
      // TODO: Test async error handling
    });
` : ''}  });
});

`;
  }

  // Generate tests for each class
  for (const cls of analysis.classes.filter(c => c.isExported)) {
    tests += `describe('${cls.name}', () => {
  let instance: ${cls.name};

  beforeEach(() => {
    instance = new ${cls.name}();
  });

  afterEach(() => {
    // Cleanup if needed
  });

`;
    for (const method of cls.methods) {
      tests += `  describe('${method.name}', () => {
    it('should work correctly', ${method.isAsync ? 'async ' : ''}() => {
      // TODO: Add test implementation
      // const result = ${method.isAsync ? 'await ' : ''}instance.${method.name}();
      // expect(result).toEqual(/* expected */);
    });
  });

`;
    }
    tests += `});

`;
  }

  return tests;
}

/**
 * Generate Pytest test template
 */
function generatePytestTests(analysis: CodeAnalysis, sourcePath: string): string {
  const moduleName = path.basename(sourcePath, '.py');
  const exportedItems = analysis.exports.join(', ');

  let tests = `import pytest
from unittest.mock import Mock, patch, MagicMock
from ${moduleName} import ${exportedItems}


`;

  // Generate tests for each function
  for (const func of analysis.functions.filter(f => f.isExported)) {
    const testClassName = `Test${func.name.charAt(0).toUpperCase() + func.name.slice(1)}`;
    tests += `class ${testClassName}:
    """Tests for ${func.name}"""

    def test_happy_path(self):
        """Test ${func.name} with valid input"""
        # TODO: Add test implementation
        # result = ${func.isAsync ? 'await ' : ''}${func.name}(${func.params.map(() => '/* arg */').join(', ')})
        # assert result == expected
        pass

    class TestEdgeCases:
        """Edge case tests for ${func.name}"""

        def test_empty_input(self):
            """Test with empty/minimal input"""
            # TODO: Implement
            pass

        def test_none_input(self):
            """Test with None parameters"""
            # TODO: Implement
            pass

        def test_boundary_values(self):
            """Test with boundary values"""
            # TODO: Implement
            pass

    class TestErrorHandling:
        """Error handling tests for ${func.name}"""

        def test_invalid_input_raises(self):
            """Test that invalid input raises appropriate exception"""
            with pytest.raises(ValueError):
                # TODO: Call with invalid input
                pass
${func.isAsync ? `
        @pytest.mark.asyncio
        async def test_async_error_handling(self):
            """Test async error handling"""
            # TODO: Implement
            pass
` : ''}

`;
  }

  // Generate tests for each class
  for (const cls of analysis.classes.filter(c => c.isExported)) {
    tests += `class Test${cls.name}:
    """Tests for ${cls.name} class"""

    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${cls.name}()

    def test_initialization(self, instance):
        """Test class initialization"""
        assert instance is not None

`;
  }

  return tests;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Test Architect - Generate comprehensive tests

Usage:
  npx ts-node generate.ts <source-file> [options]

Options:
  --framework <framework>  Test framework: jest, vitest, or pytest
  --output <path>          Output test file path
  --help, -h               Show this help message

Examples:
  npx ts-node generate.ts src/utils/parser.ts
  npx ts-node generate.ts lib/auth.py --framework pytest
  npx ts-node generate.ts components/Button.tsx --framework vitest --output __tests__/Button.test.tsx
`);
    process.exit(0);
  }

  const sourceFile = args[0];

  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  // Parse arguments
  let framework: TestConfig['framework'] | undefined;
  let outputPath: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--framework' && args[i + 1]) {
      framework = args[++i] as TestConfig['framework'];
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[++i];
    }
  }

  // Analyze source code
  console.log(`Analyzing: ${sourceFile}`);
  const analysis = analyzeCode(sourceFile);

  console.log(`Language: ${analysis.language}`);
  console.log(`Functions found: ${analysis.functions.length}`);
  console.log(`Classes found: ${analysis.classes.length}`);
  console.log(`Exports: ${analysis.exports.join(', ')}`);

  // Detect or use specified framework
  const projectRoot = process.cwd();
  const selectedFramework = framework || detectFramework(projectRoot, analysis.language);
  console.log(`Test framework: ${selectedFramework}`);

  // Generate test file path
  const testPath = outputPath || generateTestPath(sourceFile, selectedFramework);
  console.log(`Output path: ${testPath}`);

  // Generate tests
  let testContent: string;
  if (selectedFramework === 'pytest') {
    testContent = generatePytestTests(analysis, sourceFile);
  } else {
    testContent = generateJestTests(analysis, sourceFile, selectedFramework);
  }

  // Write test file
  fs.writeFileSync(testPath, testContent);
  console.log(`\nTest file generated: ${testPath}`);
  console.log('\nNext steps:');
  console.log('1. Review generated tests and fill in TODO sections');
  console.log('2. Add specific test cases based on your business logic');
  console.log('3. Run tests with your test runner');
}

main();

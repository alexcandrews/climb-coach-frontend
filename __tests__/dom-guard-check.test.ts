/**
 * Test to ensure all DOM manipulation is properly gated by platform checks
 *
 * This test scans all .tsx and .ts files in the app directory to find any
 * direct usage of browser-only globals (document, window, etc.) and ensures
 * they are properly guarded by platform checks.
 */

import * as fs from 'fs';
import * as path from 'path';

// DOM/Browser globals that should be guarded
const BROWSER_GLOBALS = [
  'document.',
  'window.',
  'localStorage.',
  'sessionStorage.',
  'navigator.',
  'location.',
];

// Valid guard patterns that should precede browser global usage
const VALID_GUARDS = [
  /Platform\.OS\s*===\s*['"]web['"]/,
  /typeof\s+document\s*!==\s*['"]undefined['"]/,
  /typeof\s+window\s*!==\s*['"]undefined['"]/,
  /typeof\s+localStorage\s*!==\s*['"]undefined['"]/,
  /typeof\s+navigator\s*!==\s*['"]undefined['"]/,
  // Early return guard pattern: if (typeof window === 'undefined') return
  /if\s*\(\s*typeof\s+(window|document|localStorage|navigator)\s*===\s*['"]undefined['"]\s*.*\)\s*return/,
];

interface Violation {
  file: string;
  line: number;
  code: string;
  global: string;
}

/**
 * Recursively find all .ts and .tsx files in a directory
 */
function findTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .expo, dist, build directories
      if (!['node_modules', '.expo', 'dist', 'build', '.git', '.jest-cache'].includes(file)) {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if a line of code using a browser global is properly guarded
 */
function isProperlyGuarded(lines: string[], lineIndex: number, line: string, global: string): boolean {
  // If the line itself is a typeof check (it's the guard itself), allow it
  if (
    /typeof\s+(window|document|localStorage|navigator|location)\s*[!=]=/.test(line) ||
    line.includes('typeof window') ||
    line.includes('typeof document') ||
    line.includes('typeof localStorage') ||
    line.includes('typeof navigator')
  ) {
    return true;
  }

  // Special case for 'location' - check if it's actually window.location or just a variable name
  if (global === 'location') {
    // If it's not prefixed with 'window.' and appears in a context like 'location:' or '= location'
    // it's likely a variable/parameter name, not window.location
    if (!line.includes('window.location') &&
        (line.match(/\blocation\s*[:=]/) || line.match(/[,{]\s*location\s*[,}]/))) {
      return true;
    }
  }

  // Look at the previous 40 lines for guard patterns (to handle nested function definitions)
  const contextStart = Math.max(0, lineIndex - 40);
  const context = lines.slice(contextStart, lineIndex + 1).join('\n');

  // Check if any valid guard pattern exists in the context
  return VALID_GUARDS.some(pattern => pattern.test(context));
}

/**
 * Scan a file for ungated browser global usage
 */
function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    // Check for browser globals
    for (const global of BROWSER_GLOBALS) {
      if (line.includes(global)) {
        // Special case: ignore type definitions and imports
        if (
          line.trim().startsWith('import ') ||
          line.includes('// @ts-') ||
          line.includes('as HTML') ||
          line.includes('as Window') ||
          line.includes('as Document')
        ) {
          continue;
        }

        // Check if this usage is guarded
        if (!isProperlyGuarded(lines, index, line, global.replace('.', ''))) {
          violations.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
            global: global.replace('.', ''),
          });
        }
      }
    }
  });

  return violations;
}

describe('DOM Manipulation Guard Check', () => {
  it('should ensure all DOM/window access is properly guarded by platform checks', () => {
    const appDir = path.join(__dirname, '../app');
    const libDir = path.join(__dirname, '../lib');

    const appFiles = findTsFiles(appDir);
    const libFiles = findTsFiles(libDir);
    const allFiles = [...appFiles, ...libFiles];

    const allViolations: Violation[] = [];

    allFiles.forEach(file => {
      const violations = scanFile(file);
      allViolations.push(...violations);
    });

    // Format violations for error message
    if (allViolations.length > 0) {
      const message = allViolations
        .map(v => {
          const relativePath = path.relative(path.join(__dirname, '..'), v.file);
          return `\n  ${relativePath}:${v.line}\n    → Ungated ${v.global} usage: ${v.code}`;
        })
        .join('\n');

      const errorMessage =
        `Found ${allViolations.length} ungated browser global usage(s):\n${message}\n\n` +
        `All browser globals (document, window, localStorage, etc.) must be guarded with:\n` +
        `  - Platform.OS === 'web'\n` +
        `  - typeof document !== 'undefined'\n` +
        `  - typeof window !== 'undefined'\n`;

      throw new Error(errorMessage);
    }

    expect(allViolations).toHaveLength(0);
  });

  it('should pass for properly guarded DOM access', () => {
    // Create a test case showing proper guards work
    const testCode = `
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const element = document.createElement('div');
        document.body.appendChild(element);
      }
    `;

    const lines = testCode.split('\n');
    const documentLineIndex = lines.findIndex(l => l.includes('document.createElement'));
    const documentLine = lines[documentLineIndex];

    expect(isProperlyGuarded(lines, documentLineIndex, documentLine, 'document')).toBe(true);
  });

  it('should fail for ungated DOM access', () => {
    // Create a test case showing ungated access fails
    const testCode = `
      function doSomething() {
        const element = document.createElement('div');
        return element;
      }
    `;

    const lines = testCode.split('\n');
    const documentLineIndex = lines.findIndex(l => l.includes('document.createElement'));
    const documentLine = lines[documentLineIndex];

    expect(isProperlyGuarded(lines, documentLineIndex, documentLine, 'document')).toBe(false);
  });
});

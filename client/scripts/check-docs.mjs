#!/usr/bin/env node
/**
 * Documentation validation checker for CI
 * Ensures tests/README.md is current and complete
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const README_PATH = join(__dirname, '../tests/README.md');

function checkDocumentation() {
  console.log('📚 Checking documentation...\n');

  if (!existsSync(README_PATH)) {
    console.error('❌ FAILED: tests/README.md not found');
    console.error('\n💡 Remediation steps:');
    console.error('   1. Create tests/README.md documenting the test suite');
    console.error('   2. Include sections for unit tests, E2E tests, and CI/CD');
    console.error('   3. Document how to run tests locally and in CI\n');
    process.exit(1);
  }

  const content = readFileSync(README_PATH, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  console.log(`✓ tests/README.md exists (${lineCount} lines)\n`);

  // Check for required sections
  const requiredSections = [
    { name: 'Test Types', patterns: [/test types/i, /types of tests/i] },
    { name: 'Unit Tests', patterns: [/unit test/i, /component test/i] },
    { name: 'E2E Tests', patterns: [/e2e test/i, /end-to-end/i, /playwright/i] },
    { name: 'Running Tests', patterns: [/running test/i, /how to run/i, /npm test/i, /npm run test/i] },
    { name: 'CI/CD', patterns: [/ci\/cd/i, /continuous integration/i, /github actions/i, /ci workflow/i] }
  ];

  const missing = [];
  console.log('Checking required sections:');

  for (const section of requiredSections) {
    const found = section.patterns.some(pattern => 
      lines.some(line => pattern.test(line))
    );
    
    if (found) {
      console.log(`  ✓ ${section.name}`);
    } else {
      console.log(`  ✗ ${section.name} (missing)`);
      missing.push(section.name);
    }
  }
  console.log();

  if (missing.length > 0) {
    console.error(`❌ FAILED: tests/README.md is missing required sections:\n`);
    missing.forEach(s => console.error(`  - ${s}`));
    console.error('\n💡 Remediation steps:');
    console.error('   1. Update tests/README.md to include all required sections');
    console.error('   2. Document test types, how to run them, and CI/CD integration');
    console.error('   3. Ensure documentation reflects current test suite state\n');
    process.exit(1);
  }

  // Check minimum content length (should be comprehensive)
  const MIN_LINES = 50;
  if (lineCount < MIN_LINES) {
    console.error(`❌ FAILED: tests/README.md is too short (${lineCount} lines)`);
    console.error(`   Expected at least ${MIN_LINES} lines for comprehensive documentation\n`);
    console.error('💡 Remediation steps:');
    console.error('   1. Expand tests/README.md with detailed test documentation');
    console.error('   2. Include examples, usage patterns, and troubleshooting');
    console.error('   3. Document all test files and their purposes\n');
    process.exit(1);
  }

  console.log(`✅ PASSED: Documentation is current and complete\n`);
  console.log(`   - All required sections present`);
  console.log(`   - ${lineCount} lines of documentation`);
  console.log();
  process.exit(0);
}

checkDocumentation();

#!/usr/bin/env node
/**
 * Documentation freshness checker — S3R-UX-04
 *
 * Validates that tests/README.md and client/e2e/README.md contain all required
 * sections, preventing documentation drift as new test infrastructure is added.
 *
 * Exit codes:
 *   0  All required sections present, docs meet minimum length
 *   1  One or more sections missing or docs too short (CI failure)
 *
 * Run locally:  npm run check:docs
 * Run in CI:    same — triggered automatically on every push
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const README_PATH = join(__dirname, '../tests/README.md');
const E2E_README_PATH = join(__dirname, '../e2e/README.md');

function checkFile(filePath, label, requiredSections, minLines) {
  console.log(`📚 Checking ${label}...\n`);

  if (!existsSync(filePath)) {
    console.error(`❌ FAILED: ${label} not found at ${filePath}`);
    console.error('\n💡 Remediation: create the file and add all required sections.\n');
    return ['FILE_MISSING'];
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  console.log(`✓ ${label} exists (${lineCount} lines)\n`);

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
    console.error(`❌ FAILED: ${label} is missing required sections:\n`);
    missing.forEach(s => console.error(`  - ${s}`));
    console.error('\n💡 Remediation steps:');
    console.error('   1. Add the missing sections to the documentation file.');
    console.error('   2. Each section name must match one of the expected patterns.');
    console.error('   3. Re-run: npm run check:docs\n');
    return missing;
  }

  if (lineCount < minLines) {
    console.error(`❌ FAILED: ${label} is too short (${lineCount} lines, expected >= ${minLines})\n`);
    console.error('💡 Remediation: expand the documentation with more detail.\n');
    return [`TOO_SHORT(${lineCount}<${minLines})`];
  }

  console.log(`✅ PASSED: ${label} is current and complete`);
  console.log(`   - All required sections present`);
  console.log(`   - ${lineCount} lines of documentation\n`);
  return [];
}

function checkDocumentation() {
  let failed = false;

  // -----------------------------------------------------------------------
  // 1. tests/README.md — main test documentation
  // -----------------------------------------------------------------------
  const testsReadmeSections = [
    { name: 'Test Types',      patterns: [/test types/i, /types of tests/i] },
    { name: 'Unit Tests',      patterns: [/unit test/i, /component test/i] },
    { name: 'E2E Tests',       patterns: [/e2e test/i, /end-to-end/i, /playwright/i] },
    { name: 'Running Tests',   patterns: [/running test/i, /how to run/i, /npm test/i, /npm run test/i] },
    { name: 'CI/CD',           patterns: [/ci\/cd/i, /continuous integration/i, /github actions/i, /ci workflow/i] },
    // S3R additions — must stay documented
    { name: 'Form Validation (S3R-UX-02)',    patterns: [/validateArtifactForm/i, /s3r-ux-02/i, /artifact editor form validation/i] },
    { name: 'API Fallback (S3R-UX-03)',       patterns: [/withApiFallback/i, /s3r-ux-03/i, /api error fallback/i] },
  ];

  const testsMissing = checkFile(README_PATH, 'tests/README.md', testsReadmeSections, 50);
  if (testsMissing.length > 0) failed = true;

  // -----------------------------------------------------------------------
  // 2. e2e/README.md — E2E test documentation
  // -----------------------------------------------------------------------
  const e2eReadmeSections = [
    { name: 'Overview',                   patterns: [/## overview/i] },
    { name: 'Running Tests',              patterns: [/## running tests/i, /run.*tests/i] },
    { name: 'Writing Tests',              patterns: [/## writing tests/i, /writing tests/i] },
    { name: 'Deterministic Fixture (S3R-UX-01)', patterns: [/DeterministicFixtureHelper/i, /s3r-ux-01/i, /deterministic fixture/i] },
  ];

  const e2eMissing = checkFile(E2E_README_PATH, 'e2e/README.md', e2eReadmeSections, 30);
  if (e2eMissing.length > 0) failed = true;

  if (failed) {
    process.exit(1);
  }

  console.log('🎉 All documentation checks passed.\n');
  process.exit(0);
}

checkDocumentation();

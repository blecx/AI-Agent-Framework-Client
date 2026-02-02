#!/usr/bin/env node
/**
 * Bundle size checker for CI
 * Validates that the main bundle stays under 500KB gzipped
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUNDLE_SIZE_LIMIT_KB = 500;
const DIST_DIR = join(__dirname, '../dist/assets');

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function checkBundleSize() {
  console.log('🔍 Checking bundle sizes...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/assets directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const files = [];
  try {
    const entries = readdirSync(DIST_DIR);
    
    for (const file of entries) {
      if (file.endsWith('.js')) {
        const filePath = join(DIST_DIR, file);
        const content = readFileSync(filePath);
        const stats = statSync(filePath);
        const gzipped = gzipSync(content);
        
        files.push({
          name: file,
          size: stats.size,
          gzipped: gzipped.length
        });
      }
    }
  } catch (error) {
    console.error('❌ Error reading dist directory:', error.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('❌ Error: No JavaScript bundles found in dist/assets');
    process.exit(1);
  }

  // Sort by gzipped size descending
  files.sort((a, b) => b.gzipped - a.gzipped);

  console.log('Bundle sizes:');
  files.forEach(file => {
    console.log(`  ${file.name}`);
    console.log(`    Raw: ${formatBytes(file.size)}`);
    console.log(`    Gzipped: ${formatBytes(file.gzipped)}`);
  });
  console.log();

  // Check main bundle (largest)
  const mainBundle = files[0];
  const mainBundleSizeKB = mainBundle.gzipped / 1024;

  console.log(`📦 Main bundle: ${mainBundle.name}`);
  console.log(`   Size: ${formatBytes(mainBundle.gzipped)} (gzipped)`);
  console.log(`   Limit: ${BUNDLE_SIZE_LIMIT_KB} KB\n`);

  if (mainBundleSizeKB > BUNDLE_SIZE_LIMIT_KB) {
    console.error(`❌ FAILED: Main bundle exceeds size limit!`);
    console.error(`   Current: ${mainBundleSizeKB.toFixed(2)} KB`);
    console.error(`   Limit: ${BUNDLE_SIZE_LIMIT_KB} KB`);
    console.error(`   Exceeded by: ${(mainBundleSizeKB - BUNDLE_SIZE_LIMIT_KB).toFixed(2)} KB\n`);
    console.error('💡 Remediation steps:');
    console.error('   1. Check for large dependencies that can be code-split');
    console.error('   2. Use dynamic imports for route-based code splitting');
    console.error('   3. Review and remove unused dependencies');
    console.error('   4. Consider lazy loading heavy components');
    console.error('   5. Analyze bundle with `npm run build -- --mode analyze`\n');
    process.exit(1);
  }

  console.log('✅ PASSED: All bundles within size limits\n');
  process.exit(0);
}

checkBundleSize();

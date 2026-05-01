#!/usr/bin/env node

/**
 * Bundle Report Script
 * Displays comprehensive bundle size metrics
 *
 * This script:
 * 1. Reads bundle-sizes.json
 * 2. Reads package.json bundleSize metadata
 * 3. Shows historical comparison if available
 * 4. Provides formatted report for CI/CD and developers
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_SIZES_PATH = path.join(__dirname, '../dist/bundle-sizes.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatPercentage(value, max) {
  return `${((value / max) * 100).toFixed(1)}%`;
}

function generateProgressBar(value, max, width = 40) {
  const percentage = value / max;
  const filled = Math.floor(percentage * width);
  const empty = width - filled;

  let color = colors.green;
  if (percentage > 0.8) color = colors.yellow;
  if (percentage > 0.95) color = colors.red;

  return color + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
}

function displayReport() {
  console.log(`${colors.bold}${colors.cyan}Bundle Size Report${colors.reset}`);
  console.log('='.repeat(70));
  console.log('');

  // Check if bundle-sizes.json exists
  if (!fs.existsSync(BUNDLE_SIZES_PATH)) {
    console.error(`${colors.red}✗ Error: bundle-sizes.json not found${colors.reset}`);
    console.log(`${colors.yellow}  Run 'npm run build' first${colors.reset}`);
    process.exit(1);
  }

  // Read bundle sizes
  let bundleSizes;
  try {
    const bundleSizesContent = fs.readFileSync(BUNDLE_SIZES_PATH, 'utf8');
    bundleSizes = JSON.parse(bundleSizesContent);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to read bundle-sizes.json: ${error.message}${colors.reset}`);
    process.exit(1);
  }

  // Read package.json for metadata
  let packageJson = {};
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    try {
      const packageContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
      packageJson = JSON.parse(packageContent);
    } catch (error) {
      console.warn(`${colors.yellow}⚠ Could not read package.json metadata${colors.reset}`);
    }
  }

  const MAX_SIZE_BYTES = 500 * 1024; // 500KB
  const MAX_GZIP_BYTES = 100 * 1024; // 100KB

  // Display current metrics
  console.log(`${colors.bold}Current Bundle Sizes:${colors.reset}`);
  console.log('');

  // Raw size
  console.log(`  ${colors.bold}Raw Bundle:${colors.reset}`);
  console.log(`    Size:        ${colors.blue}${formatBytes(bundleSizes.raw)}${colors.reset} / ${formatBytes(MAX_SIZE_BYTES)}`);
  console.log(`    Percentage:  ${formatPercentage(bundleSizes.raw, MAX_SIZE_BYTES)}`);
  console.log(`    Progress:    ${generateProgressBar(bundleSizes.raw, MAX_SIZE_BYTES)}`);
  console.log('');

  // Gzipped size
  console.log(`  ${colors.bold}Gzipped Bundle:${colors.reset}`);
  console.log(`    Size:        ${colors.blue}${formatBytes(bundleSizes.gzipped)}${colors.reset} / ${formatBytes(MAX_GZIP_BYTES)}`);
  console.log(`    Percentage:  ${formatPercentage(bundleSizes.gzipped, MAX_GZIP_BYTES)}`);
  console.log(`    Progress:    ${generateProgressBar(bundleSizes.gzipped, MAX_GZIP_BYTES)}`);
  console.log('');

  // Brotli size (if available)
  if (bundleSizes.brotli > 0) {
    console.log(`  ${colors.bold}Brotli Bundle:${colors.reset}`);
    console.log(`    Size:        ${colors.blue}${formatBytes(bundleSizes.brotli)}${colors.reset}`);
    const brotliSavings = ((1 - (bundleSizes.brotli / bundleSizes.gzipped)) * 100).toFixed(1);
    console.log(`    vs Gzip:     ${colors.green}${brotliSavings}% smaller${colors.reset}`);
    console.log('');
  }

  // Compression stats
  const compressionRatio = ((1 - (bundleSizes.gzipped / bundleSizes.raw)) * 100).toFixed(1);
  console.log(`  ${colors.bold}Compression:${colors.reset}`);
  console.log(`    Gzip Ratio:  ${colors.green}${compressionRatio}%${colors.reset}`);
  if (bundleSizes.brotli > 0) {
    const brotliRatio = ((1 - (bundleSizes.brotli / bundleSizes.raw)) * 100).toFixed(1);
    console.log(`    Brotli Ratio: ${colors.green}${brotliRatio}%${colors.reset}`);
  }
  console.log('');

  // Metadata from package.json
  if (packageJson.bundleSize) {
    console.log(`  ${colors.bold}Metadata:${colors.reset}`);
    console.log(`    Version:     ${bundleSizes.version || 'unknown'}`);
    console.log(`    Last Update: ${packageJson.bundleSize.lastUpdated || 'unknown'}`);
    console.log(`    Timestamp:   ${bundleSizes.timestamp || 'unknown'}`);
    console.log('');
  }

  // Budget status
  console.log('='.repeat(70));
  console.log(`${colors.bold}Budget Status:${colors.reset}`);
  console.log('');

  const rawStatus = bundleSizes.raw <= MAX_SIZE_BYTES;
  const gzipStatus = bundleSizes.gzipped <= MAX_GZIP_BYTES;

  console.log(`  Raw Bundle:     ${rawStatus ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset} (${formatBytes(bundleSizes.raw)} / ${formatBytes(MAX_SIZE_BYTES)})`);
  console.log(`  Gzipped Bundle: ${gzipStatus ? colors.green + '✓ PASS' : colors.yellow + '⚠ WARNING'}${colors.reset} (${formatBytes(bundleSizes.gzipped)} / ${formatBytes(MAX_GZIP_BYTES)})`);
  console.log('');

  // Final status
  console.log('='.repeat(70));
  if (rawStatus && gzipStatus) {
    console.log(`${colors.green}${colors.bold}✓ ALL CHECKS PASSED${colors.reset}`);
  } else if (rawStatus) {
    console.log(`${colors.yellow}${colors.bold}⚠ WARNINGS PRESENT${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}✗ BUDGET EXCEEDED${colors.reset}`);
  }
  console.log('');

  // Suggestions if budget is tight
  const utilization = (bundleSizes.raw / MAX_SIZE_BYTES) * 100;
  if (utilization > 80) {
    console.log(`${colors.yellow}${colors.bold}Optimization Suggestions:${colors.reset}`);
    console.log('  Bundle is approaching size limit (>80% utilization)');
    console.log('  1. Run bundle analyzer: npm run build:analyze');
    console.log('  2. Check for duplicate dependencies');
    console.log('  3. Ensure tree-shaking is working');
    console.log('  4. Consider code splitting');
    console.log('  5. Review imported libraries for smaller alternatives');
    console.log('');
  }
}

// Run the report
displayReport();

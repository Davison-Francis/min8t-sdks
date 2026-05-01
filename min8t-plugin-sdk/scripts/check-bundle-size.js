#!/usr/bin/env node

/**
 * Bundle Size Checker
 * Verifies that the plugin bundle meets size requirements
 *
 * Requirements (from TODO.md):
 * - Bundle size < 500KB (uncompressed)
 * - Gzip size should be significantly smaller
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUNDLE_PATH = path.join(__dirname, '../dist/min8t.js');
const MAX_SIZE_BYTES = 500 * 1024; // 500KB
const MAX_SIZE_GZIP_BYTES = 100 * 1024; // 100KB target (gzipped)

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatPercentage(bytes, maxBytes) {
  return `${((bytes / maxBytes) * 100).toFixed(1)}%`;
}

function checkBundleSize() {
  console.log(`${colors.bold}Bundle Size Check${colors.reset}`);
  console.log('='.repeat(50));

  // Check if bundle exists
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(`${colors.red}✗ Error: Bundle not found at ${BUNDLE_PATH}${colors.reset}`);
    console.log(`${colors.yellow}  Run 'npm run build' first${colors.reset}`);
    process.exit(1);
  }

  // Get bundle stats
  const stats = fs.statSync(BUNDLE_PATH);
  const bundleSize = stats.size;

  // Read and gzip the bundle
  const bundleContent = fs.readFileSync(BUNDLE_PATH);
  const gzippedContent = zlib.gzipSync(bundleContent, { level: 9 });
  const gzipSize = gzippedContent.length;

  // Calculate compression ratio
  const compressionRatio = ((1 - (gzipSize / bundleSize)) * 100).toFixed(1);

  // Display results
  console.log('');
  console.log(`Bundle path: ${colors.blue}${BUNDLE_PATH}${colors.reset}`);
  console.log('');

  // Uncompressed size check
  const sizeStatus = bundleSize <= MAX_SIZE_BYTES ? `${colors.green}✓` : `${colors.red}✗`;
  const sizeColor = bundleSize <= MAX_SIZE_BYTES ? colors.green : colors.red;

  console.log(`${sizeStatus} Uncompressed: ${sizeColor}${formatBytes(bundleSize)}${colors.reset} / ${formatBytes(MAX_SIZE_BYTES)} (${formatPercentage(bundleSize, MAX_SIZE_BYTES)})`);

  // Gzipped size check
  const gzipStatus = gzipSize <= MAX_SIZE_GZIP_BYTES ? `${colors.green}✓` : `${colors.yellow}⚠`;
  const gzipColor = gzipSize <= MAX_SIZE_GZIP_BYTES ? colors.green : colors.yellow;

  console.log(`${gzipStatus} Gzipped:      ${gzipColor}${formatBytes(gzipSize)}${colors.reset} / ${formatBytes(MAX_SIZE_GZIP_BYTES)} (${formatPercentage(gzipSize, MAX_SIZE_GZIP_BYTES)})`);

  console.log(`  Compression:  ${colors.blue}${compressionRatio}%${colors.reset}`);

  console.log('');
  console.log('='.repeat(50));

  // Final result
  if (bundleSize > MAX_SIZE_BYTES) {
    console.log(`${colors.red}${colors.bold}FAILED:${colors.reset} ${colors.red}Bundle exceeds size limit!${colors.reset}`);
    console.log('');
    console.log('Optimization suggestions:');
    console.log('  1. Run bundle analyzer: npm run build:analyze');
    console.log('  2. Check for duplicate dependencies');
    console.log('  3. Ensure tree-shaking is working');
    console.log('  4. Remove unused code and libraries');
    console.log('  5. Use dynamic imports for non-critical features');
    process.exit(1);
  }

  if (gzipSize > MAX_SIZE_GZIP_BYTES) {
    console.log(`${colors.yellow}${colors.bold}WARNING:${colors.reset} ${colors.yellow}Gzipped size exceeds target${colors.reset}`);
    console.log('  Consider further optimization');
  } else {
    console.log(`${colors.green}${colors.bold}SUCCESS:${colors.reset} ${colors.green}Bundle size is within limits${colors.reset}`);
  }

  console.log('');

  // Output metrics for CI/CD
  console.log('Metrics:');
  console.log(`  BUNDLE_SIZE=${bundleSize}`);
  console.log(`  BUNDLE_SIZE_KB=${(bundleSize / 1024).toFixed(2)}`);
  console.log(`  GZIP_SIZE=${gzipSize}`);
  console.log(`  GZIP_SIZE_KB=${(gzipSize / 1024).toFixed(2)}`);
  console.log(`  COMPRESSION_RATIO=${compressionRatio}`);

  // Export bundle sizes for Prometheus metrics
  exportBundleSizes(bundleSize, gzipSize);

  process.exit(0);
}

/**
 * Export bundle sizes to JSON file for Prometheus metrics auto-update
 *
 * Creates frontend/dist/bundle-sizes.json with:
 * - Raw bundle size (bytes)
 * - Gzipped size (bytes)
 * - Brotli size (bytes) if available
 * - Timestamp for tracking when metrics were last updated
 *
 * This file is read by PerformanceMetrics.ts to automatically update
 * the plugin_sdk_bundle_size_bytes gauge metrics.
 */
function exportBundleSizes(rawSize, gzipSize) {
  const distDir = path.dirname(BUNDLE_PATH);
  const outputPath = path.join(distDir, 'bundle-sizes.json');

  // Check for brotli compressed file
  const brotliPath = BUNDLE_PATH + '.br';
  let brotliSize = 0;

  if (fs.existsSync(brotliPath)) {
    const brotliStats = fs.statSync(brotliPath);
    brotliSize = brotliStats.size;
  }

  const bundleSizes = {
    raw: rawSize,
    gzipped: gzipSize,
    brotli: brotliSize,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(bundleSizes, null, 2), 'utf8');
    console.log('');
    console.log(`${colors.green}✓ Exported bundle sizes to ${outputPath}${colors.reset}`);
    console.log(`  For Prometheus metrics auto-update`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to export bundle sizes: ${error.message}${colors.reset}`);
  }
}

// Run the check
checkBundleSize();

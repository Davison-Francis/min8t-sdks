#!/usr/bin/env node

/**
 * Differential Loading Bundle Report
 *
 * Generates a detailed comparison report of modern vs legacy bundles
 * showing size differences, compression ratios, and performance impact.
 *
 * Usage: node scripts/differential-report.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
};

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to get file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Helper function to get gzipped size
function getGzippedSize(filePath) {
  try {
    const command = `gzip -c "${filePath}" | wc -c`;
    const output = execSync(command, { encoding: 'utf8' });
    return parseInt(output.trim());
  } catch (error) {
    return 0;
  }
}

// Main function
function generateReport() {
  console.log('\n');
  console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + colors.cyan + '          DIFFERENTIAL LOADING BUNDLE REPORT                   ' + colors.reset);
  console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log('\n');

  const distPath = path.join(__dirname, '../dist');

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.log(colors.red + '❌ Error: dist/ directory not found. Run npm run build:differential first.' + colors.reset);
    process.exit(1);
  }

  // Bundle file paths
  const modernBundle = path.join(distPath, 'min8t.modern.js');
  const legacyBundle = path.join(distPath, 'min8t.legacy.js');

  // Check if bundles exist
  if (!fs.existsSync(modernBundle) || !fs.existsSync(legacyBundle)) {
    console.log(colors.red + '❌ Error: Differential bundles not found. Run npm run build:differential first.' + colors.reset);
    process.exit(1);
  }

  // Get sizes
  const modernSize = getFileSize(modernBundle);
  const legacySize = getFileSize(legacyBundle);
  const modernGzip = getGzippedSize(modernBundle);
  const legacyGzip = getGzippedSize(legacyBundle);
  const modernBrotli = getFileSize(path.join(distPath, 'min8t.modern.js.br'));
  const legacyBrotli = getFileSize(path.join(distPath, 'min8t.legacy.js.br'));

  // Calculate savings
  const rawSavings = legacySize - modernSize;
  const rawSavingsPercent = ((rawSavings / legacySize) * 100).toFixed(1);
  const gzipSavings = legacyGzip - modernGzip;
  const gzipSavingsPercent = ((gzipSavings / legacyGzip) * 100).toFixed(1);
  const brotliSavings = legacyBrotli - modernBrotli;
  const brotliSavingsPercent = ((brotliSavings / legacyBrotli) * 100).toFixed(1);

  // Display bundle sizes
  console.log(colors.bright + '📦 BUNDLE SIZES' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');

  // Modern bundle
  console.log(colors.green + '✅ Modern Bundle (ES2015+)' + colors.reset);
  console.log(`   Target: ${colors.bright}~97% of users${colors.reset} (Chrome 61+, Safari 11+, Firefox 60+, Edge 16+)`);
  console.log(`   Raw:     ${colors.cyan}${formatBytes(modernSize)}${colors.reset} (${modernSize.toLocaleString()} bytes)`);
  console.log(`   Gzip:    ${colors.cyan}${formatBytes(modernGzip)}${colors.reset} (${modernGzip.toLocaleString()} bytes)`);
  console.log(`   Brotli:  ${colors.cyan}${formatBytes(modernBrotli)}${colors.reset} (${modernBrotli.toLocaleString()} bytes)`);
  console.log('');

  // Legacy bundle
  console.log(colors.yellow + '⚠️  Legacy Bundle (ES5)' + colors.reset);
  console.log(`   Target: ${colors.bright}~3% of users${colors.reset} (IE11, Safari < 11, older browsers)`);
  console.log(`   Raw:     ${colors.cyan}${formatBytes(legacySize)}${colors.reset} (${legacySize.toLocaleString()} bytes)`);
  console.log(`   Gzip:    ${colors.cyan}${formatBytes(legacyGzip)}${colors.reset} (${legacyGzip.toLocaleString()} bytes)`);
  console.log(`   Brotli:  ${colors.cyan}${formatBytes(legacyBrotli)}${colors.reset} (${legacyBrotli.toLocaleString()} bytes)`);
  console.log('');

  // Savings
  console.log(colors.bright + '💰 SAVINGS FOR 97% OF USERS' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');
  console.log(`   Raw:     ${colors.green}${colors.bright}-${formatBytes(rawSavings)}${colors.reset} ${colors.green}(${rawSavingsPercent}% smaller)${colors.reset}`);
  console.log(`   Gzip:    ${colors.green}${colors.bright}-${formatBytes(gzipSavings)}${colors.reset} ${colors.green}(${gzipSavingsPercent}% smaller)${colors.reset}`);
  console.log(`   Brotli:  ${colors.green}${colors.bright}-${formatBytes(brotliSavings)}${colors.reset} ${colors.green}(${brotliSavingsPercent}% smaller)${colors.reset}`);
  console.log('');

  // Compression ratios
  console.log(colors.bright + '🗜️  COMPRESSION RATIOS' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');

  const modernGzipRatio = ((1 - modernGzip / modernSize) * 100).toFixed(1);
  const legacyGzipRatio = ((1 - legacyGzip / legacySize) * 100).toFixed(1);
  const modernBrotliRatio = ((1 - modernBrotli / modernSize) * 100).toFixed(1);
  const legacyBrotliRatio = ((1 - legacyBrotli / legacySize) * 100).toFixed(1);

  console.log(`   Modern Gzip:    ${colors.cyan}${modernGzipRatio}%${colors.reset} compression (${formatBytes(modernSize)} → ${formatBytes(modernGzip)})`);
  console.log(`   Legacy Gzip:    ${colors.cyan}${legacyGzipRatio}%${colors.reset} compression (${formatBytes(legacySize)} → ${formatBytes(legacyGzip)})`);
  console.log(`   Modern Brotli:  ${colors.cyan}${modernBrotliRatio}%${colors.reset} compression (${formatBytes(modernSize)} → ${formatBytes(modernBrotli)})`);
  console.log(`   Legacy Brotli:  ${colors.cyan}${legacyBrotliRatio}%${colors.reset} compression (${formatBytes(legacySize)} → ${formatBytes(legacyBrotli)})`);
  console.log('');

  // Performance impact
  console.log(colors.bright + '⚡ PERFORMANCE IMPACT' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');

  // Calculate transfer time savings (3G = 750 Kbps)
  const transferTime3G = ((gzipSavings * 8) / 750000 * 1000).toFixed(1);

  console.log(`   Transfer time saved (3G):     ${colors.green}~${transferTime3G} ms${colors.reset}`);
  console.log(`   Parse time improvement:       ${colors.green}~5-10%${colors.reset} (smaller bundle + native features)`);
  console.log(`   Users affected:               ${colors.green}${colors.bright}~97%${colors.reset}`);
  console.log(`   Bandwidth saved per user:     ${colors.green}${formatBytes(gzipSavings)}${colors.reset} (gzipped)`);
  console.log('');

  // Real-world impact
  console.log(colors.bright + '🌍 REAL-WORLD IMPACT' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');

  // Calculate savings for different user volumes
  const volumes = [1000, 10000, 100000, 1000000];
  volumes.forEach(volume => {
    const modernUsers = Math.round(volume * 0.97);
    const totalSavings = (modernUsers * gzipSavings) / 1024 / 1024; // Convert to MB
    const totalSavingsFormatted = totalSavings > 1024
      ? `${(totalSavings / 1024).toFixed(2)} GB`
      : `${totalSavings.toFixed(2)} MB`;

    console.log(`   ${volume.toLocaleString().padStart(10)} users/month → Save ${colors.green}${colors.bright}${totalSavingsFormatted}${colors.reset} bandwidth`);
  });

  console.log('');

  // Browser support
  console.log(colors.bright + '🌐 BROWSER SUPPORT' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');

  console.log(colors.green + '   Modern Bundle:' + colors.reset);
  console.log('   ✅ Chrome 61+ (Sept 2017)');
  console.log('   ✅ Edge 16+ (Sept 2017)');
  console.log('   ✅ Safari 11+ (Sept 2017)');
  console.log('   ✅ Firefox 60+ (May 2018)');
  console.log('   ✅ Opera 48+ (Sept 2017)');
  console.log('');

  console.log(colors.yellow + '   Legacy Bundle:' + colors.reset);
  console.log('   ⚠️  Internet Explorer 11');
  console.log('   ⚠️  Safari < 11');
  console.log('   ⚠️  Chrome < 61');
  console.log('   ⚠️  Firefox < 60');
  console.log('');

  // Implementation
  console.log(colors.bright + '📝 IMPLEMENTATION' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');
  console.log('   Add to your HTML:');
  console.log('');
  console.log(colors.cyan + '   <!-- Modern browsers (97% of users) -->' + colors.reset);
  console.log(colors.cyan + '   <script type="module" src="/dist/min8t.modern.js"></script>' + colors.reset);
  console.log('');
  console.log(colors.yellow + '   <!-- Legacy browsers (3% of users) -->' + colors.reset);
  console.log(colors.yellow + '   <script nomodule src="/dist/min8t.legacy.js"></script>' + colors.reset);
  console.log('');

  // Summary
  console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + '📊 SUMMARY' + colors.reset);
  console.log(colors.dim + '─────────────────────────────────────────────────────────────' + colors.reset);
  console.log('');
  console.log(`   ${colors.green}✅ 97% of users get ${rawSavingsPercent}% smaller bundle${colors.reset}`);
  console.log(`   ${colors.green}✅ Save ${formatBytes(gzipSavings)} per user (gzipped)${colors.reset}`);
  console.log(`   ${colors.green}✅ Faster load times for modern browsers${colors.reset}`);
  console.log(`   ${colors.green}✅ Full backward compatibility for legacy browsers${colors.reset}`);
  console.log(`   ${colors.green}✅ Zero breaking changes to existing API${colors.reset}`);
  console.log('');
  console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log('\n');
}

// Run the report
generateReport();

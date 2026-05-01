/**
 * Babel Configuration - Legacy Browsers (ES5)
 *
 * This configuration targets older browsers that don't support ES modules.
 * It applies full transpilation to ES5 and includes necessary polyfills.
 *
 * Target Browsers: ~3% of users
 * - Internet Explorer 11
 * - Safari < 11
 * - Chrome < 61
 * - Firefox < 60
 *
 * Bundle Characteristics:
 * - Full ES5 transpilation
 * - Includes polyfills for modern features
 * - Larger file size (but only served to 3% of users)
 * - Maximum compatibility
 *
 * @see https://babeljs.io/docs/en/babel-preset-env
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Target IE11 and other legacy browsers
        targets: {
          ie: 11,
          edge: 14,
          firefox: 52,
          chrome: 58,
          safari: 10
        },

        // Transform all ES6+ features to ES5
        bugfixes: false, // Use full spec-compliant transforms

        // Use loose mode for smaller output
        loose: true,

        // Include polyfills for modern features
        // Note: In production, you'd typically use core-js with useBuiltIns: 'usage'
        // For this plugin SDK, we're keeping it simple with no external polyfills
        useBuiltIns: false,

        // Output CommonJS modules (compatible with UMD)
        modules: false,

        // Debugging: Show which transforms are applied
        // debug: false
      }
    ]
  ],

  // Additional settings
  comments: false, // Remove comments for smaller bundle
  minified: false,  // Let Terser handle minification
  compact: false    // Don't compact code (Terser will do this)
};

/**
 * Babel Configuration - Modern Browsers (ES2015+)
 *
 * This configuration targets modern browsers that support ES modules.
 * It applies minimal transformations, resulting in smaller bundle sizes.
 *
 * Target Browsers: ~97% of users
 * - Chrome 61+ (Sept 2017)
 * - Edge 16+ (Sept 2017)
 * - Safari 11+ (Sept 2017)
 * - Firefox 60+ (May 2018)
 *
 * Bundle Characteristics:
 * - ES2015+ syntax (arrow functions, classes, const/let, etc.)
 * - Native async/await support
 * - No polyfills needed
 * - Smaller file size (~25% reduction vs ES5)
 *
 * @see https://caniuse.com/es6-module
 * @see https://babeljs.io/docs/en/babel-preset-env#targetsesmodules
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Target browsers that support ES modules (esmodules: true)
        // This automatically excludes IE11 and other legacy browsers
        targets: {
          esmodules: true
        },

        // Only transform features that aren't supported by target browsers
        // This keeps modern syntax like arrow functions, classes, async/await
        bugfixes: true,

        // Use loose mode for smaller output (trades spec compliance for size)
        loose: true,

        // Don't add polyfills - modern browsers have native support
        useBuiltIns: false,

        // Use native ES modules (better for tree-shaking)
        modules: false,

        // Debugging: Show which transforms are applied
        // debug: false
      }
    ]
  ],

  // Additional optimizations
  comments: false, // Remove comments for smaller bundle
  minified: false,  // Let Terser handle minification
  compact: false    // Don't compact code (Terser will do this)
};

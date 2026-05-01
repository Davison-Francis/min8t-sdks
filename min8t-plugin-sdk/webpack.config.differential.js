/**
 * Webpack Configuration - Differential Loading
 *
 * This configuration generates TWO bundles:
 * 1. Modern bundle (ES2015+) - Served to 97% of users via <script type="module">
 * 2. Legacy bundle (ES5) - Served to 3% of users via <script nomodule>
 *
 * Benefits:
 * - Modern bundle: ~25% smaller (no ES5 transpilation or polyfills)
 * - Automatic browser selection (no user-agent detection)
 * - Better performance for 97% of users
 * - Full backward compatibility for legacy browsers
 *
 * @see https://web.dev/codelab-serve-modern-code/
 * @see https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
const analyzeBundle = process.env.ANALYZE === 'true';

/**
 * Base configuration shared by both builds
 */
const baseConfig = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/index.ts',

  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['module', 'browser', 'main']
  },

  // Source maps
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',

  // Performance budgets (more lenient for differential loading)
  performance: {
    maxEntrypointSize: 500000,
    maxAssetSize: 500000,
    hints: isDevelopment ? false : 'warning',
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  },

  // Stats configuration
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    entrypoints: true,
    assets: true,
    assetsSort: '!size',
    builtAt: true,
    hash: false,
    timings: true,
    version: false
  },

  // Cache for faster rebuilds
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  // Development server (shared)
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  }
};

/**
 * Modern Bundle Configuration (ES2015+)
 *
 * Target: Browsers supporting ES modules (~97% of users)
 * Output: min8t.modern.js
 * Features: ES2015+ syntax, no polyfills, smaller size
 */
const modernConfig = {
  ...baseConfig,
  name: 'modern',

  output: {
    filename: 'min8t.modern.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'min8t',
      type: 'umd',
      umdNamedDefine: true,
      export: 'default'
    },
    globalObject: 'this',
    clean: false, // Don't clean on each build (we have two configs)
    environment: {
      // Target modern environments with native support
      arrowFunction: true,
      const: true,
      destructuring: true,
      forOf: true,
      dynamicImport: true,
      module: true
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, 'babel.config.modern.js'),
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Skip type checking for faster builds
              compilerOptions: {
                target: 'ES2015', // TypeScript targets ES2015
                module: 'esnext'
              }
            }
          }
        ]
      }
    ]
  },

  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDevelopment,
            drop_debugger: true,
            pure_funcs: isDevelopment ? [] : ['console.log', 'console.info', 'console.debug'],
            passes: 2,
            ecma: 2015 // Use ES2015 optimizations
          },
          mangle: {
            properties: false
          },
          format: {
            comments: false,
            ecma: 2015 // Output ES2015 syntax
          },
          ecma: 2015 // Parse as ES2015
        },
        extractComments: false,
        parallel: true
      })
    ],
    usedExports: true,
    sideEffects: false,
    runtimeChunk: false
  },

  plugins: [
    // Gzip compression for modern bundle
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /min8t\.modern\.js$/,
        threshold: 0, // Always compress (even small files)
        minRatio: 0.8
      })
    ] : []),
    // Brotli compression for modern bundle
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /min8t\.modern\.js$/,
        compressionOptions: {
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
            [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT
          }
        },
        threshold: 0, // Always compress
        minRatio: 0.8
      })
    ] : []),
    // Bundle analyzer for modern build
    ...(analyzeBundle ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report-modern.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats-modern.json'
      })
    ] : [])
  ].filter(Boolean)
};

/**
 * Legacy Bundle Configuration (ES5)
 *
 * Target: Legacy browsers (IE11, Safari < 11, etc.) (~3% of users)
 * Output: min8t.legacy.js
 * Features: Full ES5 transpilation, polyfills, larger size
 */
const legacyConfig = {
  ...baseConfig,
  name: 'legacy',

  output: {
    filename: 'min8t.legacy.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'min8t',
      type: 'umd',
      umdNamedDefine: true,
      export: 'default'
    },
    globalObject: 'this',
    clean: false,
    environment: {
      // Target legacy environments - disable modern features
      arrowFunction: false,
      const: false,
      destructuring: false,
      forOf: false,
      dynamicImport: false,
      module: false
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, 'babel.config.legacy.js'),
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Skip type checking for faster builds
              compilerOptions: {
                target: 'ES5', // TypeScript targets ES5
                module: 'esnext'
              }
            }
          }
        ]
      }
    ]
  },

  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDevelopment,
            drop_debugger: true,
            pure_funcs: isDevelopment ? [] : ['console.log', 'console.info', 'console.debug'],
            passes: 2,
            ecma: 5 // Use ES5 optimizations only
          },
          mangle: {
            properties: false
          },
          format: {
            comments: false,
            ecma: 5 // Output ES5 syntax
          },
          ecma: 5 // Parse as ES5
        },
        extractComments: false,
        parallel: true
      })
    ],
    usedExports: true,
    sideEffects: false,
    runtimeChunk: false
  },

  plugins: [
    // Gzip compression for legacy bundle
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /min8t\.legacy\.js$/,
        threshold: 0,
        minRatio: 0.8
      })
    ] : []),
    // Brotli compression for legacy bundle
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /min8t\.legacy\.js$/,
        compressionOptions: {
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
            [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT
          }
        },
        threshold: 0,
        minRatio: 0.8
      })
    ] : []),
    // Bundle analyzer for legacy build
    ...(analyzeBundle ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report-legacy.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats-legacy.json'
      })
    ] : [])
  ].filter(Boolean)
};

/**
 * Export both configurations as an array
 * Webpack will build them in parallel (multi-compiler mode)
 */
module.exports = [modernConfig, legacyConfig];

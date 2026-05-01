const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
const analyzeBundle = process.env.ANALYZE === 'true';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/index.ts',

  output: {
    filename: 'min8t.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'min8t',
      type: 'umd',
      umdNamedDefine: true,
      export: 'default'
    },
    globalObject: 'this',
    clean: true,
    // Add content hash for cache busting (production only)
    ...(isDevelopment ? {} : {
      chunkFilename: '[name].[contenthash].js'
    })
  },

  resolve: {
    extensions: ['.ts', '.js'],
    // Prioritize ES modules for better tree-shaking
    mainFields: ['module', 'browser', 'main']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: isDevelopment, // Faster builds in dev
            compilerOptions: {
              // Enable strict mode for better optimization
              strict: true,
              // Use ES6 modules for tree-shaking
              module: 'esnext'
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },

  optimization: {
    // Enable minimization in production
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            // Remove console.log in production
            drop_console: !isDevelopment,
            // Remove debugger statements
            drop_debugger: true,
            // Pure functions for better tree-shaking
            pure_funcs: isDevelopment ? [] : ['console.log', 'console.info', 'console.debug'],
            // Additional compression
            passes: 2
          },
          mangle: {
            // Mangle property names for smaller bundle
            properties: false // Don't mangle properties to avoid breaking external APIs
          },
          format: {
            // Remove comments
            comments: false
          }
        },
        extractComments: false,
        parallel: true
      })
    ],
    // Tree-shaking configuration
    usedExports: true,
    sideEffects: false,
    // Code splitting for dynamic imports
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        }
      }
    },
    // Runtime chunk for better caching
    runtimeChunk: false // Keep single bundle for plugin simplicity
  },

  // Plugins
  plugins: [
    // Gzip compression for production (legacy browser support)
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Only compress files > 10KB
        minRatio: 0.8
      })
    ] : []),
    // Brotli compression for production (modern browsers - 97%+ support)
    // Provides ~15% better compression than gzip (3.1 KB vs 3.94 KB for 11.8 KB bundle)
    // CloudFront automatically serves .br files when Accept-Encoding: br header is present
    ...(!isDevelopment ? [
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11, // Maximum compression (0-11)
            [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT
          }
        },
        threshold: 10240, // Only compress files > 10KB
        minRatio: 0.8
      })
    ] : []),
    // Bundle analyzer (run with ANALYZE=true npm run build)
    ...(analyzeBundle ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json'
      })
    ] : [])
  ].filter(Boolean),

  // Source maps
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',

  // Performance budgets
  performance: {
    maxEntrypointSize: 500000, // 500KB target (uncompressed)
    maxAssetSize: 500000,
    hints: isDevelopment ? false : 'error', // Fail build if exceeds in production
    assetFilter: function(assetFilename) {
      // Only check JS files
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

  // Development server (if needed)
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

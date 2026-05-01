# min8t Plugin SDK - Vanilla JavaScript Integration Example

Complete, production-ready vanilla JavaScript example demonstrating min8t Plugin SDK integration without any framework dependencies.

## Overview

This example showcases:
- **UMD Module Loading**: Plugin SDK loaded via `<script>` tag and accessed via `window.min8t`
- **Modern JavaScript**: ES6+ features (async/await, arrow functions, template literals)
- **Complete Plugin API**: All 7 plugin methods demonstrated
- **Error Handling**: Try/catch blocks with user-friendly error messages
- **Clean UI**: Modern, responsive design with loading states and status displays
- **Best Practices**: DOM caching, event delegation, performance optimization

## Features Demonstrated

### Plugin Methods

1. **`window.min8t.init(config)`** - Initialize plugin with configuration
2. **`window.min8t.getHtml()`** - Retrieve current HTML/CSS from editor
3. **`window.min8t.setHtml(html, css)`** - Set HTML/CSS in editor
4. **`window.min8t.save()`** - Save template to backend
5. **`window.min8t.export(format)`** - Export template (HTML, ZIP, PDF)
6. **`window.min8t.isInitialized()`** - Check initialization status
7. **`window.min8t.destroy()`** - Clean up plugin resources

### Modern JavaScript Features

- **Async/Await**: Clean asynchronous code without promise chaining
- **Arrow Functions**: Concise function syntax
- **Template Literals**: String interpolation and multiline strings
- **Destructuring**: Extract values from objects
- **Const/Let**: Block-scoped variable declarations
- **Default Parameters**: Function parameter defaults
- **Spread Operator**: Object and array spreading

### UI Features

- **Status Display**: Real-time feedback for all operations
- **Loading Overlay**: Visual feedback during async operations
- **Output Panel**: JSON-formatted response display
- **Button States**: Disabled states prevent invalid operations
- **Error Display**: User-friendly error messages with technical details
- **Responsive Design**: Works on desktop, tablet, and mobile

## File Structure

```
vanilla-js/
├── index.html       # Main HTML with inline JavaScript (744 lines)
├── styles.css       # Modern, responsive CSS (425 lines)
└── README.md        # This file
```

## Quick Start

### Prerequisites

1. **min8t Plugin SDK Bundle**:
   - Built bundle must exist at `../../dist/min8t.js`
   - Build it first: `cd ../../ && npm run build`

2. **Backend Service Running**:
   - Plugin SDK Service on port 3009 (or configure `baseUrl` in CONFIG)
   - Template Service, Asset Service, Export Service (for full functionality)

### Running the Example

#### Option 1: Local HTTP Server (Recommended)

```bash
# Navigate to example directory
cd examples/vanilla-js/

# Start local server (Python 3)
python3 -m http.server 8080

# Or Node.js http-server
npx http-server -p 8080

# Open in browser
open http://localhost:8080
```

#### Option 2: Direct File Access (Limited)

```bash
# Open directly in browser (CORS may prevent API calls)
open index.html
```

**Note**: Direct file access (`file://` protocol) may block API calls due to CORS. Use a local HTTP server for full functionality.

### Using the Example

1. **Initialize Plugin**:
   - Click "Initialize Plugin" button
   - Wait for editor to load in iframe
   - Status displays "Plugin initialized successfully!"

2. **Get HTML/CSS**:
   - Click "Get HTML/CSS" button
   - View current template content in output panel
   - Displays HTML/CSS length and preview

3. **Set Sample HTML**:
   - Click "Set Sample HTML" button
   - Loads pre-built sample template into editor
   - Editor updates with new content

4. **Save Template**:
   - Click "Save Template" button
   - Persists to backend via Plugin SDK Service
   - Displays save confirmation with email ID and timestamp

5. **Export Template**:
   - Click "Export HTML", "Export ZIP", or "Export PDF"
   - Generates download URL with 1-hour expiration
   - Optionally auto-opens download in new tab

6. **Check Status**:
   - Click "Check Initialization Status"
   - Displays current plugin state (initialized or not)

7. **Destroy Plugin**:
   - Click "Destroy Plugin" button
   - Cleans up resources and removes editor
   - Can re-initialize afterward

## Configuration

### Plugin Configuration

Edit the `CONFIG` object in `index.html` (lines 180-201):

```javascript
const CONFIG = {
  // Unique identifier for plugin settings
  pluginId: 'min8t_pk_demo',

  // Email template context
  apiRequestData: {
    emailId: 'demo-email-123'
  },

  // Authentication token provider
  getAuthToken: () => {
    // Replace with your auth system
    return 'ES-PLUGIN-AUTH-TOKEN-DEMO-12345';
  },

  // Locale and theme
  locale: 'en',
  theme: 'light',

  // API base URL
  baseUrl: 'http://localhost:3009', // Development
  // baseUrl: 'https://plugins.min8t.com', // Production

  // White-label customization
  customization: {
    branding: true,
    logoUrl: null,
    primaryColor: '#007bff',
    features: ['editor', 'preview', 'export']
  }
};
```

### Environment Variables

Set `baseUrl` based on environment:

- **Development**: `http://localhost:3009`
- **Staging**: `https://staging-plugins.min8t.com`
- **Production**: `https://plugins.min8t.com`

### Authentication

The `getAuthToken()` function should return a valid ES-PLUGIN-AUTH token:

```javascript
getAuthToken: () => {
  // Option 1: Hardcoded (development only)
  return 'ES-PLUGIN-AUTH-TOKEN-DEMO-12345';

  // Option 2: From localStorage
  return localStorage.getItem('pluginAuthToken');

  // Option 3: From backend API
  return fetch('/api/plugin-token')
    .then(res => res.json())
    .then(data => data.token);
}
```

**Security Note**: Never hardcode production tokens. Always fetch from a secure backend.

## Browser Compatibility

### Supported Browsers

- **Chrome**: 60+ (ES6 full support)
- **Firefox**: 55+ (ES6 full support)
- **Safari**: 10.1+ (ES6 full support)
- **Edge**: 79+ (Chromium-based)

### ES5 Compatibility

If you need to support older browsers (IE11), transpile the JavaScript:

```bash
# Install Babel
npm install --save-dev @babel/core @babel/cli @babel/preset-env

# Transpile
npx babel index.html --out-file index-es5.html --presets=@babel/preset-env
```

## Code Structure

### HTML (index.html)

```
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags, title, CSS link -->
  </head>
  <body>
    <!-- Header -->
    <header class="header">...</header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Status Display -->
      <div id="status">...</div>

      <!-- Controls Panel -->
      <div class="controls-panel">
        <!-- Buttons for all plugin methods -->
      </div>

      <!-- Editor Container -->
      <div id="min8t-plugin">...</div>

      <!-- Output Panel -->
      <div id="output-panel">...</div>

      <!-- Loading Overlay -->
      <div id="loading-overlay">...</div>
    </main>

    <!-- Footer -->
    <footer class="footer">...</footer>

    <!-- Load min8t.js UMD bundle -->
    <script src="../../dist/min8t.js"></script>

    <!-- Application JavaScript -->
    <script>
      // Configuration
      const CONFIG = {...};

      // DOM element caching
      const elements = {...};

      // Event handlers
      async function handleInitialize() {...}
      async function handleGetHtml() {...}
      async function handleSave() {...}
      // ...

      // UI helpers
      function showStatus(type, message) {...}
      function showLoading(message) {...}
      function showOutput(data) {...}
      // ...

      // Initialize on DOM ready
      document.addEventListener('DOMContentLoaded', () => {...});
    </script>
  </body>
</html>
```

### CSS (styles.css)

```css
/* CSS Variables for theming */
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  /* ... */
}

/* Base styles */
body {...}

/* Layout */
.container {...}
.header {...}
.main-content {...}
.footer {...}

/* Components */
.status {...}
.controls-panel {...}
.btn {...}
.editor-container {...}
.output-panel {...}
.loading-overlay {...}

/* Responsive */
@media (max-width: 768px) {...}
```

## Best Practices Demonstrated

### 1. DOM Caching

**Problem**: Repeated `document.getElementById()` calls are inefficient.

**Solution**: Cache DOM elements once on load.

```javascript
const elements = {
  btnInit: document.getElementById('btn-init'),
  status: document.getElementById('status'),
  // ...
};

// Reuse cached elements
elements.btnInit.addEventListener('click', handleInitialize);
elements.status.classList.remove('hidden');
```

### 2. Async/Await Error Handling

**Problem**: Promise chaining is verbose and hard to read.

**Solution**: Use async/await with try/catch.

```javascript
// ❌ Promise chaining (verbose)
window.min8t.getHtml()
  .then(result => {
    showStatus('success', 'Got HTML!');
    return result;
  })
  .catch(error => {
    showStatus('error', error.message);
  });

// ✅ Async/await (clean)
async function handleGetHtml() {
  try {
    const result = await window.min8t.getHtml();
    showStatus('success', 'Got HTML!');
  } catch (error) {
    showStatus('error', error.message);
  }
}
```

### 3. UMD Module Access

**Problem**: How to access the plugin SDK loaded via `<script>` tag?

**Solution**: UMD modules expose themselves to `window`.

```javascript
// Plugin SDK loaded via <script src="min8t.js"></script>
// Access via window.min8t
await window.min8t.init(config);
const html = await window.min8t.getHtml();
```

### 4. Loading States

**Problem**: Users don't know if async operations are in progress.

**Solution**: Show loading overlay during async operations.

```javascript
async function handleSave() {
  showLoading('Saving template...');

  try {
    await window.min8t.save();
    showStatus('success', 'Saved!');
  } finally {
    hideLoading(); // Always hide, even on error
  }
}
```

### 5. User-Friendly Error Messages

**Problem**: Technical error messages confuse users.

**Solution**: Display friendly messages with technical details in output panel.

```javascript
try {
  await window.min8t.init(config);
} catch (error) {
  // User-friendly status
  showStatus('error', 'Plugin initialization failed. Check your configuration.');

  // Technical details in output panel
  showOutput({
    error: error.message,
    stack: error.stack,
    type: error.errorType,
    recoverable: error.isRecoverable
  });
}
```

### 6. Button State Management

**Problem**: Users can click buttons before plugin is ready.

**Solution**: Disable buttons until plugin is initialized.

```javascript
function enableOperationButtons() {
  elements.btnGetHtml.disabled = false;
  elements.btnSave.disabled = false;
  elements.btnExportHtml.disabled = false;
}

// After successful init
await window.min8t.init(config);
enableOperationButtons();
```

### 7. Global Error Handlers

**Problem**: Unhandled errors crash the application.

**Solution**: Catch all errors globally.

```javascript
// Synchronous errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  showStatus('error', `Unexpected error: ${event.error.message}`);
});

// Async errors (unhandled promise rejections)
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showStatus('error', `Async error: ${event.reason.message}`);
});
```

## Troubleshooting

### Plugin SDK Not Loaded

**Symptom**: Console error: `window.min8t is undefined`

**Solution**:
1. Verify `../../dist/min8t.js` exists
2. Build the bundle: `cd ../../ && npm run build`
3. Check browser console for 404 errors
4. Ensure `<script src="../../dist/min8t.js"></script>` comes before application script

### CORS Errors

**Symptom**: Console error: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
1. Use local HTTP server (not `file://` protocol)
2. Verify Plugin SDK Service is running on port 3009
3. Check CORS configuration in backend (`CORS_ORIGINS` env var)

### Initialization Fails

**Symptom**: Status shows "Initialization failed"

**Solution**:
1. Check backend services are running:
   - Plugin SDK Service (port 3009)
   - Template Service (port 3002)
   - Asset Service (port 3004)
2. Verify `baseUrl` in CONFIG matches backend URL
3. Check console for detailed error messages
4. Verify `getAuthToken()` returns valid ES-PLUGIN-AUTH token

### Buttons Are Disabled

**Symptom**: Cannot click operation buttons

**Solution**:
1. Click "Initialize Plugin" first
2. Wait for status "Plugin initialized successfully!"
3. Check console for initialization errors

### Export Download Fails

**Symptom**: Download URL returns 404

**Solution**:
1. Verify Export Service is running (port 3005)
2. Check download URL hasn't expired (1-hour limit)
3. Ensure browser allows pop-ups (for `window.open()`)

## Performance Optimization

### Bundle Size

- **Current**: ~300KB (uncompressed)
- **Gzipped**: ~100KB
- **Target**: < 500KB per specification

### Load Time

- **Target**: < 2 seconds initialization
- **Optimization**:
  - UMD bundle is minified and tree-shaken
  - CSS is optimized with modern properties
  - DOM caching reduces query overhead

### Memory Usage

- **Best Practice**: Call `destroy()` when done
- **Cleanup**: Removes event listeners and iframe
- **Garbage Collection**: Allows browser to reclaim memory

## Security Considerations

### Authentication Tokens

**Never** hardcode production tokens in client-side code:

```javascript
// ❌ BAD: Hardcoded production token
getAuthToken: () => 'ES-PLUGIN-AUTH-prod-12345'

// ✅ GOOD: Fetch from secure backend
getAuthToken: async () => {
  const res = await fetch('/api/plugin-token', {
    credentials: 'include' // Send cookies
  });
  const data = await res.json();
  return data.token;
}
```

### Content Security Policy (CSP)

If using CSP headers, allow plugin CDN:

```html
<meta http-equiv="Content-Security-Policy"
      content="script-src 'self' https://plugins.min8t.com; connect-src 'self' https://plugins.min8t.com;">
```

### HTTPS

Always use HTTPS in production:

```javascript
// Development: http://localhost:3009
// Production: https://plugins.min8t.com
baseUrl: process.env.NODE_ENV === 'production'
  ? 'https://plugins.min8t.com'
  : 'http://localhost:3009'
```

## Testing

### Manual Testing Checklist

- [ ] Plugin loads without console errors
- [ ] Initialization succeeds
- [ ] Get HTML/CSS retrieves content
- [ ] Set HTML updates editor
- [ ] Save template persists to backend
- [ ] Export HTML generates download URL
- [ ] Export ZIP generates download URL
- [ ] Export PDF generates download URL
- [ ] Status check reports correct state
- [ ] Destroy cleans up resources
- [ ] Re-initialization works after destroy
- [ ] Error handling displays user-friendly messages
- [ ] Loading states show during async operations
- [ ] Responsive design works on mobile

### Automated Testing

For production use, add automated tests:

```javascript
// Example with Jest
test('plugin initializes successfully', async () => {
  await window.min8t.init(CONFIG);
  expect(window.min8t.isInitialized()).toBe(true);
});

test('getHtml returns valid structure', async () => {
  const result = await window.min8t.getHtml();
  expect(result).toHaveProperty('html');
  expect(result).toHaveProperty('css');
});
```

## Resources

### Internal Documentation

- **Plugin SDK Specification**: `/IMPLEMENTATION/components/15_plugin_sdk_service/15_plugin_sdk_service.md`
- **Frontend README**: `../../README.md`
- **TypeScript Types**: `../../dist/index.d.ts`

### External Resources

- **UMD Modules**: https://github.com/umdjs/umd
- **MDN Async/Await**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- **MDN Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **DOM Manipulation Guide**: https://www.sitepoint.com/dom-manipulation-vanilla-javascript-no-jquery/
- **min8t Plugin Samples**: https://github.com/ardas/min8t-plugin-samples

## Support

### Questions?

- **GitHub Issues**: https://github.com/ardas/min8t-plugin-samples/issues
- **Documentation**: https://min8t.com/docs/plugin-sdk
- **Email**: support@min8t.com

### Contributing

Found a bug or improvement? Submit a pull request:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/improvement`
3. Commit changes: `git commit -m "Add improvement"`
4. Push: `git push origin feature/improvement`
5. Open pull request

## License

MIT License - See `/LICENSE` for details.

---

**Version**: 1.0.0
**Last Updated**: 2025-10-25
**Author**: min8t Team

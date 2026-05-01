# min8tEmail Plugin SDK - React Integration Example

Complete, production-ready React integration example demonstrating how to embed the min8t email editor in a React application.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- ✅ **Full TypeScript Support**: Complete type definitions from plugin SDK
- ✅ **React 18 Compatible**: Uses modern React patterns (hooks, concurrent rendering)
- ✅ **Error Boundary Integration**: Graceful error handling with `react-error-boundary`
- ✅ **Proper Cleanup**: useEffect cleanup prevents memory leaks
- ✅ **Imperative API Access**: forwardRef pattern for calling plugin methods
- ✅ **All Plugin Methods**: init, getHtml, setHtml, save, export fully demonstrated
- ✅ **Loading & Error States**: User-friendly UI feedback
- ✅ **Production Ready**: Follows React best practices and security guidelines

---

## 📦 Installation

### Step 1: Install React and Dependencies

```bash
npm install react@^18.2.0 react-dom@^18.2.0
npm install react-error-boundary@^4.0.11
npm install --save-dev @types/react @types/react-dom typescript
```

### Step 2: Load Plugin Script

Add the min8t plugin script to your HTML:

```html
<!-- Option 1: CDN (Production) -->
<script src="https://plugins.min8t.com/static/latest/min8t.js"></script>

<!-- Option 2: Local Development -->
<script src="/path/to/min8t.js"></script>
```

### Step 3: Copy Components

Copy the following files to your React project:

```
your-react-app/
├── src/
│   └── components/
│       ├── Min8tEditor.tsx
│       ├── Min8tEditorWithErrorBoundary.tsx
│       └── App.example.tsx (optional - full example)
```

---

## 🚀 Quick Start

### Basic Integration (No Ref)

```tsx
import React from 'react';
import { Min8tEditor } from './components/Min8tEditor';

function App() {
  return (
    <Min8tEditor
      pluginId="min8t_pk_your_plugin_id"
      emailId="email-456"
      authToken="your-es-plugin-auth-token"
      locale="en"
      theme="light"
      onSave={(result) => {
        console.log('Saved:', result);
      }}
      onError={(error) => {
        console.error('Error:', error);
      }}
    />
  );
}

export default App;
```

### Advanced Integration (With Ref)

```tsx
import React, { useRef } from 'react';
import { Min8tEditorWithRef, Min8tEditorHandle } from './components/Min8tEditor';

function App() {
  const editorRef = useRef<Min8tEditorHandle>(null);

  const handleSave = async () => {
    if (editorRef.current) {
      const result = await editorRef.current.save();
      console.log('Saved:', result);
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save Template</button>
      <Min8tEditorWithRef
        ref={editorRef}
        pluginId="min8t_pk_your_plugin_id"
        emailId="email-456"
        authToken="your-es-plugin-auth-token"
      />
    </div>
  );
}
```

### With Error Boundary

```tsx
import React from 'react';
import { Min8tEditorWithErrorBoundary } from './components/Min8tEditorWithErrorBoundary';

function App() {
  return (
    <Min8tEditorWithErrorBoundary
      pluginId="min8t_pk_your_plugin_id"
      emailId="email-456"
      authToken="your-es-plugin-auth-token"
      onSave={(result) => console.log('Saved:', result)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

---

## 📚 Components

### 1. `Min8tEditor` (Basic Component)

Standard component for embedding the email editor.

**Props:**
- `pluginId` (string, required): Plugin identifier
- `emailId` (string, required): Email template identifier
- `authToken` (string, required): ES-PLUGIN-AUTH token
- `locale` (string, optional): Language code (default: 'en')
- `theme` ('light' | 'dark', optional): UI theme (default: 'light')
- `baseUrl` (string, optional): Plugin API base URL (auto-detected)
- `customization` (object, optional): White-label customization options
- `onSave` (function, optional): Callback when template is saved
- `onError` (function, optional): Callback when error occurs
- `onInitialized` (function, optional): Callback when plugin initializes
- `className` (string, optional): Custom CSS class
- `style` (object, optional): Custom inline styles

### 2. `Min8tEditorWithRef` (Advanced Component)

Component with forwardRef for imperative API access.

**Exposed Methods (via ref):**
- `getHtml()`: Returns Promise<{ html: string, css: string }>
- `setHtml(html, css)`: Returns Promise<void>
- `save()`: Returns Promise<{ success: boolean, emailId: string, savedAt: string }>
- `export(format)`: Returns Promise<{ downloadUrl: string, expiresIn: number, format: string }>
- `isInitialized()`: Returns boolean

**Example:**
```tsx
const editorRef = useRef<Min8tEditorHandle>(null);

// Later...
const { html, css } = await editorRef.current.getHtml();
```

### 3. `Min8tEditorWithErrorBoundary` (Production Component)

Component with error boundary for graceful error handling.

**Features:**
- Catches and displays plugin errors gracefully
- Prevents entire app from crashing
- Provides "Try Again" button to reset error state
- Logs errors to external services (Sentry, LogRocket)

---

## 💡 Usage Examples

### Get HTML/CSS from Editor

```tsx
const { html, css } = await editorRef.current.getHtml();
console.log('HTML:', html);
console.log('CSS:', css);
```

### Set Custom HTML/CSS

```tsx
const customHtml = '<div><h1>Hello World</h1></div>';
const customCss = 'h1 { color: red; }';

await editorRef.current.setHtml(customHtml, customCss);
```

### Save Template

```tsx
const result = await editorRef.current.save();
console.log('Saved at:', result.savedAt);
console.log('Email ID:', result.emailId);
```

### Export Template

```tsx
// Export as HTML
const htmlExport = await editorRef.current.export('html');
window.open(htmlExport.downloadUrl, '_blank');

// Export as ZIP
const zipExport = await editorRef.current.export('zip');
window.open(zipExport.downloadUrl, '_blank');

// Export as PDF
const pdfExport = await editorRef.current.export('pdf');
window.open(pdfExport.downloadUrl, '_blank');
```

### Check Initialization Status

```tsx
if (editorRef.current?.isInitialized()) {
  console.log('Plugin is ready!');
} else {
  console.log('Plugin is still initializing...');
}
```

---

## 🔧 API Reference

### `Min8tEditorProps` Interface

```typescript
interface Min8tEditorProps {
  pluginId: string;
  emailId: string;
  authToken: string;
  locale?: string;
  theme?: 'light' | 'dark';
  baseUrl?: string;
  customization?: {
    branding?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    features?: string[];
  };
  onSave?: (result: PluginSaveResponse) => void;
  onError?: (error: ErrorResponse | Error) => void;
  onInitialized?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
```

### `Min8tEditorHandle` Interface

```typescript
interface Min8tEditorHandle {
  getHtml: () => Promise<PluginApiResponse>;
  setHtml: (html: string, css: string) => Promise<void>;
  save: () => Promise<PluginSaveResponse>;
  export: (format: 'html' | 'zip' | 'pdf') => Promise<PluginExportResponse>;
  isInitialized: () => boolean;
}
```

### Type Imports

```typescript
import type {
  PluginConfig,
  PluginApiResponse,
  PluginSaveResponse,
  PluginExportResponse,
  ErrorResponse
} from '../../dist/index.d';
```

---

## 📘 TypeScript Support

### Full Type Safety

All components are fully typed with TypeScript:

```tsx
import { Min8tEditorWithRef, Min8tEditorHandle } from './Min8tEditor';
import type { PluginSaveResponse } from '../../dist/index.d';

const editorRef = useRef<Min8tEditorHandle>(null);

const handleSave = async (): Promise<void> => {
  const result: PluginSaveResponse = await editorRef.current!.save();
  // result is fully typed with intellisense
};
```

### Type Definitions Location

Type definitions are automatically generated from the plugin SDK:

```
frontend/
├── dist/
│   ├── index.d.ts         # Main type definitions
│   └── index.d.ts.map     # Source map
```

---

## 🛡️ Error Handling

### Option 1: Error Boundary (Recommended)

```tsx
import { Min8tEditorWithErrorBoundary } from './Min8tEditorWithErrorBoundary';

<Min8tEditorWithErrorBoundary
  {...props}
  onError={(error) => {
    // Log to Sentry, LogRocket, etc.
    Sentry.captureException(error);
  }}
/>
```

### Option 2: Try-Catch

```tsx
try {
  await editorRef.current.save();
} catch (error) {
  if (error.errorType === 'auth') {
    // Handle authentication error
  } else if (error.errorType === 'network') {
    // Handle network error
  }
}
```

### Error Types

```typescript
type ErrorType = 'auth' | 'network' | 'server' | 'validation' | 'rate_limit';

interface ErrorResponse {
  error: string;
  details?: string;
  errorType: ErrorType;
  isRecoverable: boolean;
}
```

---

## ✅ Best Practices

### 1. Always Use Error Boundaries in Production

```tsx
// ✅ Good
<Min8tEditorWithErrorBoundary {...props} />

// ❌ Avoid
<Min8tEditor {...props} />
```

### 2. Clean Up on Unmount

The component automatically handles cleanup, but ensure you don't call methods after unmount:

```tsx
useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    const data = await fetchData();
    if (isMounted) {
      setData(data);
    }
  };

  return () => {
    isMounted = false;
  };
}, []);
```

### 3. Use forwardRef for Complex Interactions

```tsx
// ✅ Good - Parent can control plugin
<Min8tEditorWithRef ref={editorRef} {...props} />

// ❌ Avoid - Limited control
<Min8tEditor {...props} />
```

### 4. Validate Props

```tsx
// ✅ Good
if (!authToken || !emailId || !pluginId) {
  throw new Error('Missing required props');
}

<Min8tEditor
  pluginId={pluginId}
  emailId={emailId}
  authToken={authToken}
/>
```

### 5. Handle Loading States

```tsx
const [isLoading, setIsLoading] = useState(true);

<Min8tEditor
  {...props}
  onInitialized={() => setIsLoading(false)}
/>

{isLoading && <LoadingSpinner />}
```

---

## 🐛 Troubleshooting

### Issue 1: "min8t plugin not found"

**Cause:** Plugin script not loaded before component mounts

**Solution:**
```html
<!-- Load plugin script BEFORE React app -->
<script src="https://plugins.min8t.com/static/latest/min8t.js"></script>
<script src="/your-react-app.js"></script>
```

### Issue 2: "Plugin not initialized"

**Cause:** Calling plugin methods before initialization completes

**Solution:**
```tsx
// ✅ Good - Wait for initialization
<Min8tEditor
  {...props}
  onInitialized={() => {
    // Now safe to call methods
    editorRef.current?.getHtml();
  }}
/>

// OR check initialization status
if (editorRef.current?.isInitialized()) {
  await editorRef.current.save();
}
```

### Issue 3: TypeScript Errors

**Cause:** Type definitions not found

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@min8t/plugin": ["./frontend/dist/index.d.ts"]
    }
  }
}
```

### Issue 4: CORS Errors

**Cause:** Plugin API not allowing your domain

**Solution:**
Contact min8t support to add your domain to the CORS allowlist, or configure `CORS_ORIGINS` environment variable.

### Issue 5: Component Won't Unmount

**Cause:** Memory leak from missing cleanup

**Solution:**
The component handles cleanup automatically, but verify:
```tsx
useEffect(() => {
  // Cleanup is automatic
  return () => {
    // Plugin destroy() is called here
  };
}, []);
```

---

## 📖 Additional Resources

- **Plugin SDK Documentation**: `/frontend/README.md`
- **API Specification**: `/IMPLEMENTATION/components/15_plugin_sdk_service/15_plugin_sdk_service.md`
- **React Documentation**: https://react.dev/
- **React Error Boundaries**: https://github.com/bvaughn/react-error-boundary
- **TypeScript React Cheatsheet**: https://react-typescript-cheatsheet.netlify.app/

---

## 📄 License

MIT

---

## 👥 Support

- **GitHub Issues**: https://github.com/min8t/plugin-sdk/issues
- **Documentation**: https://docs.min8t.com/plugin-sdk
- **Email**: support@min8t.com

---

**Last Updated:** 2025-10-25
**Version:** 1.0.0
**React Version:** 18.2.0+
**TypeScript Version:** 5.2.2+

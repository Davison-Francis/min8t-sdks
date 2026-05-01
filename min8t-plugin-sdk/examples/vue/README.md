# min8t Email Editor - Vue 3 Integration Example

Production-ready Vue 3 component demonstrating min8t Plugin SDK integration using **Composition API** with **`<script setup>`** and **TypeScript**.

## Features

- ✅ **Vue 3 Composition API** with `<script setup lang="ts">`
- ✅ **Full TypeScript support** with imported types from plugin SDK
- ✅ **Reactive state management** with `ref()` and `reactive()`
- ✅ **Lifecycle management** with `onMounted()` and `onUnmounted()`
- ✅ **Props and Emits** with TypeScript generics
- ✅ **Complete plugin API demonstration** (init, getHtml, setHtml, save, export)
- ✅ **Error handling** with comprehensive error states
- ✅ **Loading states** with spinner and error retry
- ✅ **Responsive design** with mobile support
- ✅ **Accessible UI** with semantic HTML
- ✅ **Production-ready** with proper cleanup and memory management

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Vue 3** >= 3.5.0
- **TypeScript** >= 5.7.0

---

## Installation

### 1. Clone or Copy the Example

```bash
# Navigate to the Vue example directory
cd frontend/examples/vue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Include min8t Plugin SDK Script

Add the following `<script>` tag to your `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>min8t Email Editor - Vue 3 Example</title>

    <!-- min8t Plugin SDK (REQUIRED) -->
    <script src="https://plugins.min8t.com/static/latest/min8t.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**For development/testing**, you can use the local build:

```html
<script src="../../dist/min8t.js"></script>
```

---

## Usage

### Basic Example

```vue
<template>
  <Min8tEditor
    plugin-id="min8t_pk_your_plugin_id"
    email-id="email-456"
    auth-token="ES-PLUGIN-AUTH-TOKEN-HERE"
    locale="en"
    theme="light"
    @save="handleSave"
    @error="handleError"
    @initialized="handleInitialized"
  />
</template>

<script setup lang="ts">
import Min8tEditor from './Min8tEditor.vue'
import type { PluginSaveResponse, ErrorResponse } from '@min8t.com/plugin-sdk'

function handleSave(result: PluginSaveResponse) {
  console.log('✅ Template saved:', result)
  // { success: true, emailId: 'email-456', savedAt: '2025-10-25T...' }
}

function handleError(error: ErrorResponse) {
  console.error('❌ Editor error:', error)
  // { error: 'message', details: '...', errorType: 'auth', isRecoverable: false }
}

function handleInitialized() {
  console.log('🎉 Editor initialized successfully')
}
</script>
```

### Advanced Example with All Features

```vue
<template>
  <div class="email-editor-page">
    <h1>Create Email Template</h1>

    <Min8tEditor
      :plugin-id="pluginSettings.pluginId"
      :email-id="pluginSettings.emailId"
      :auth-token="authToken"
      :locale="locale"
      :theme="theme"
      :customization="customization"
      @save="handleSave"
      @error="handleError"
      @html-retrieved="handleHtmlRetrieved"
      @export="handleExport"
      @initialized="handleInitialized"
      @destroyed="handleDestroyed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Min8tEditor from './Min8tEditor.vue'
import type {
  PluginSaveResponse,
  ErrorResponse,
  PluginApiResponse,
  PluginExportResponse
} from '@min8t.com/plugin-sdk'

// Plugin configuration
const pluginSettings = ref({
  pluginId: 'min8t_pk_your_plugin_id',
  emailId: 'email-456'
})

// Authentication token (fetch from your backend)
const authToken = ref('ES-PLUGIN-AUTH-TOKEN-FROM-BACKEND')

// UI preferences
const locale = ref<string>('en')
const theme = ref<'light' | 'dark'>('light')

// White-label customization
const customization = computed(() => ({
  branding: true,
  logoUrl: 'https://yourcompany.com/logo.png',
  primaryColor: '#3182ce',
  features: ['editor', 'preview', 'export']
}))

// Event handlers
function handleSave(result: PluginSaveResponse) {
  console.log('Template saved:', result)

  // Show success notification
  alert(`✅ Saved successfully at ${result.savedAt}`)

  // Optional: Update your backend
  updateBackendTemplate(result.emailId, result.savedAt)
}

function handleError(error: ErrorResponse) {
  console.error('Editor error:', error)

  // Show error notification
  if (error.errorType === 'auth') {
    alert('❌ Authentication failed. Please log in again.')
    // Redirect to login
  } else if (error.isRecoverable) {
    alert(`❌ Error: ${error.error}. Please try again.`)
  } else {
    alert(`❌ Fatal error: ${error.error}. Please contact support.`)
  }
}

function handleHtmlRetrieved(data: PluginApiResponse) {
  console.log('HTML retrieved:', data)
  // You can use data.html and data.css for custom processing
}

function handleExport(data: PluginExportResponse) {
  console.log('Template exported:', data)
  // Download URL is automatically opened in new tab
  // data.downloadUrl, data.format, data.expiresIn
}

function handleInitialized() {
  console.log('✅ Editor ready')
  // Track analytics event
  trackEvent('editor_initialized')
}

function handleDestroyed() {
  console.log('Editor destroyed')
  // Cleanup any external resources
}

// Helper functions
async function updateBackendTemplate(emailId: string, savedAt: string) {
  // Update your backend with saved template info
  await fetch('/api/templates/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailId, savedAt })
  })
}

function trackEvent(eventName: string) {
  // Track analytics event (e.g., Google Analytics, Amplitude)
  // analytics.track(eventName)
}
</script>

<style scoped>
.email-editor-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
}
</style>
```

---

## Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pluginId` | `string` | ✅ Yes | - | Unique identifier for the plugin |
| `emailId` | `string` | ✅ Yes | - | Email template identifier |
| `authToken` | `string` | ✅ Yes | - | ES-PLUGIN-AUTH authentication token |
| `locale` | `string` | No | `'en'` | Locale/language code (e.g., 'en', 'es', 'fr') |
| `theme` | `'light' \| 'dark'` | No | `'light'` | UI theme preference |
| `baseUrl` | `string` | No | Auto-detected | Base URL for the plugin API |
| `customization` | `object` | No | `undefined` | White-label customization options |

#### Customization Object

```typescript
interface PluginCustomization {
  branding?: boolean        // Show/hide min8t branding
  logoUrl?: string          // Custom logo URL
  primaryColor?: string     // Primary brand color (hex)
  features?: string[]       // Available features list
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `save` | `PluginSaveResponse` | Emitted when template is successfully saved |
| `error` | `ErrorResponse` | Emitted when an error occurs |
| `html-retrieved` | `PluginApiResponse` | Emitted when HTML is retrieved |
| `export` | `PluginExportResponse` | Emitted when template is exported |
| `initialized` | - | Emitted when plugin is initialized |
| `destroyed` | - | Emitted when plugin is destroyed |

---

## Development

### Run Development Server

```bash
npm run dev
```

This starts a Vite development server at `http://localhost:3000` with hot-reload.

### Type Check

```bash
npm run type-check
```

This runs `vue-tsc` to check TypeScript types without emitting files.

### Build for Production

```bash
npm run build
```

This compiles TypeScript and builds the project for production in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
vue/
├── Min8tEditor.vue          # Main component (Vue 3 + TypeScript)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Vite
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

---

## TypeScript Types

All types are imported from the plugin SDK:

```typescript
import type {
  Min8tPlugin,
  PluginConfig,
  PluginSaveResponse,
  PluginApiResponse,
  PluginExportResponse,
  ErrorResponse
} from '@min8t.com/plugin-sdk'
```

**Available types:**
- `Min8tPlugin` - Main plugin interface
- `PluginConfig` - Configuration object for init()
- `PluginSaveResponse` - Response from save() method
- `PluginApiResponse` - Response from getHtml() method
- `PluginExportResponse` - Response from export() method
- `ErrorResponse` - Standard error format

---

## Best Practices

### 1. **Authentication Token Management**

Store the authentication token securely and fetch it from your backend:

```typescript
import { ref, onMounted } from 'vue'

const authToken = ref<string>('')

onMounted(async () => {
  // Fetch token from your backend
  const response = await fetch('/api/auth/plugin-token')
  const data = await response.json()
  authToken.value = data.token
})
```

### 2. **Error Handling**

Always handle errors gracefully:

```typescript
function handleError(error: ErrorResponse) {
  if (error.errorType === 'auth') {
    // Redirect to login
    router.push('/login')
  } else if (error.isRecoverable) {
    // Show retry option
    showNotification('error', error.error, { retry: true })
  } else {
    // Show fatal error
    showNotification('fatal', error.error, { contactSupport: true })
  }
}
```

### 3. **Lifecycle Management**

The component automatically handles initialization and cleanup. No manual cleanup needed!

```typescript
// ✅ Automatic cleanup on unmount
onUnmounted(() => {
  if (pluginInstance) {
    pluginInstance.destroy()
  }
})
```

### 4. **Reactive Props**

Watch for prop changes and reinitialize if needed:

```typescript
watch(() => props.authToken, (newToken, oldToken) => {
  if (newToken !== oldToken && pluginInstance) {
    pluginInstance.destroy()
    initPlugin()
  }
})
```

---

## Troubleshooting

### Issue: "min8t plugin SDK not loaded"

**Solution:** Ensure the script tag is included **before** your Vue app loads:

```html
<!-- MUST be in <head> or before Vue app -->
<script src="https://plugins.min8t.com/static/latest/min8t.js"></script>
```

### Issue: TypeScript errors for plugin types

**Solution:** Ensure types are correctly imported:

```typescript
import type {
  PluginSaveResponse,
  ErrorResponse
} from '../../dist/index.d.ts'
```

### Issue: Plugin not initializing

**Solution:** Check browser console for errors. Common causes:
- Missing or invalid `authToken`
- CORS issues (check server CORS configuration)
- Network timeout (check `baseUrl`)

### Issue: Build fails with "Cannot find module '@min8t.com/plugin-sdk'"

**Solution:** Update `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@min8t.com/plugin-sdk": ["../../dist/index.d.ts"]
    }
  }
}
```

---

## Testing

### Unit Testing with Vitest

```bash
npm install --save-dev vitest @vue/test-utils
```

```typescript
// Min8tEditor.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Min8tEditor from './Min8tEditor.vue'

describe('Min8tEditor', () => {
  it('renders loading state initially', () => {
    const wrapper = mount(Min8tEditor, {
      props: {
        pluginId: 'min8t_pk_test',
        emailId: 'test-email',
        authToken: 'test-token'
      }
    })

    expect(wrapper.find('.min8t-loading').exists()).toBe(true)
  })

  it('emits save event when save succeeds', async () => {
    // Mock window.min8t
    global.window.min8t = {
      init: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue({
        success: true,
        emailId: 'test-email',
        savedAt: '2025-10-25T12:00:00Z'
      })
    }

    const wrapper = mount(Min8tEditor, {
      props: {
        pluginId: 'min8t_pk_test',
        emailId: 'test-email',
        authToken: 'test-token'
      }
    })

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.find('.save-button')
    await saveButton.trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
  })
})
```

---

## Resources

### Official Documentation
- [Vue 3 Documentation](https://vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 TypeScript Support](https://vuejs.org/guide/typescript/composition-api)
- [Vite Documentation](https://vite.dev/)

### min8t Plugin SDK
- [Plugin SDK Specification](../../README.md)
- [API Reference](../../dist/index.d.ts)
- [TypeScript Types](../../dist/index.d.ts)

### Vue 3 Best Practices
- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [TypeScript with Composition API](https://vuejs.org/guide/typescript/composition-api)
- [Script Setup Documentation](https://vuejs.org/api/sfc-script-setup)

---

## License

MIT

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/min8t/plugin-sdk/issues
- Documentation: https://docs.min8t.com/plugin-sdk
- Email: support@min8t.com

---

**Version:** 1.0.0
**Last Updated:** 2025-10-25
**Author:** min8t Team

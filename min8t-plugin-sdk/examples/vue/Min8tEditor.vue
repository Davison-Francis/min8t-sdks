<template>
  <div class="min8t-editor-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="min8t-loading">
      <div class="spinner"></div>
      <p>Initializing min8t Email Editor...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="min8t-error">
      <h3>Error Loading Editor</h3>
      <p>{{ error.message }}</p>
      <p v-if="error.details" class="error-details">{{ error.details }}</p>
      <button @click="retryInit" class="retry-button">Retry</button>
    </div>

    <!-- Editor Container -->
    <div
      v-show="!loading && !error"
      ref="editorContainer"
      id="min8t-plugin"
      class="min8t-editor-container"
    ></div>

    <!-- Action Buttons -->
    <div v-if="!loading && !error" class="min8t-actions">
      <button @click="handleSave" :disabled="saving" class="action-button save-button">
        {{ saving ? 'Saving...' : 'Save Template' }}
      </button>
      <button @click="handleGetHtml" class="action-button">Get HTML</button>
      <button @click="handleExport('html')" class="action-button">Export HTML</button>
      <button @click="handleExport('zip')" class="action-button">Export ZIP</button>
      <button @click="handleExport('pdf')" class="action-button">Export PDF</button>
    </div>

    <!-- HTML Preview (conditionally shown) -->
    <div v-if="htmlPreview" class="min8t-preview">
      <h3>Template HTML Preview</h3>
      <pre><code>{{ htmlPreview }}</code></pre>
      <button @click="htmlPreview = null" class="close-preview">Close Preview</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * min8t Email Editor - Vue 3 Component
 *
 * Production-ready Vue 3 component demonstrating min8t Plugin SDK integration
 * using Composition API with <script setup> and TypeScript.
 *
 * @example
 * ```vue
 * <template>
 *   <Min8tEditor
 *     plugin-id="min8t_pk_your_plugin_id"
 *     email-id="email-456"
 *     auth-token="ES-PLUGIN-AUTH-TOKEN"
 *     locale="en"
 *     theme="light"
 *     @save="handleSave"
 *     @error="handleError"
 *   />
 * </template>
 *
 * <script setup>
 * import Min8tEditor from './Min8tEditor.vue'
 *
 * function handleSave(result) {
 *   console.log('Template saved:', result)
 * }
 *
 * function handleError(error) {
 *   console.error('Editor error:', error)
 * }
 * </script>
 * ```
 *
 * @packageDocumentation
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import type {
  Min8tPlugin,
  PluginConfig,
  PluginSaveResponse,
  PluginApiResponse,
  PluginExportResponse,
  ErrorResponse
} from '../../dist/index.d'

/**
 * Component Props Interface
 *
 * Defines all configurable properties for the min8t editor component.
 */
interface Props {
  /** Unique plugin identifier (from min8t dashboard) */
  pluginId: string

  /** Email template identifier */
  emailId: string

  /** ES-PLUGIN-AUTH authentication token */
  authToken: string

  /** Locale/language code (default: 'en') */
  locale?: string

  /** UI theme preference (default: 'light') */
  theme?: 'light' | 'dark'

  /** Base URL for the plugin API (optional, auto-detected) */
  baseUrl?: string

  /** White-label customization options */
  customization?: {
    branding?: boolean
    logoUrl?: string
    primaryColor?: string
    features?: string[]
  }
}

/**
 * Component Emits Interface
 *
 * Defines all events emitted by this component.
 */
interface Emits {
  /** Emitted when template is successfully saved */
  save: [result: PluginSaveResponse]

  /** Emitted when an error occurs */
  error: [error: ErrorResponse]

  /** Emitted when HTML is retrieved */
  'html-retrieved': [data: PluginApiResponse]

  /** Emitted when template is exported */
  export: [data: PluginExportResponse]

  /** Emitted when plugin is initialized */
  initialized: []

  /** Emitted when plugin is destroyed */
  destroyed: []
}

// Define component props with defaults
const props = withDefaults(defineProps<Props>(), {
  locale: 'en',
  theme: 'light',
  baseUrl: undefined,
  customization: undefined
})

// Define component emits
const emit = defineEmits<Emits>()

/**
 * ========================
 * REACTIVE STATE
 * ========================
 */

/** Reference to the editor container DOM element */
const editorContainer = ref<HTMLElement | null>(null)

/** Loading state during initialization */
const loading = ref<boolean>(true)

/** Error state if initialization fails */
const error = ref<ErrorResponse | null>(null)

/** Saving state during template save */
const saving = ref<boolean>(false)

/** HTML preview content (optional) */
const htmlPreview = ref<string | null>(null)

/** min8t plugin instance (from window.min8t) */
let pluginInstance: Min8tPlugin | null = null

/**
 * ========================
 * PLUGIN INITIALIZATION
 * ========================
 */

/**
 * Initialize the min8t plugin
 *
 * Called on component mount and when retry is clicked.
 */
async function initPlugin(): Promise<void> {
  try {
    loading.value = true
    error.value = null

    // Verify window.min8t is available
    if (typeof window === 'undefined' || !(window as any).min8t) {
      throw new Error(
        'min8t plugin SDK not loaded. Please include the script: ' +
        '<script src="https://plugins.min8t.com/static/latest/min8t.js"></script>'
      )
    }

    pluginInstance = (window as any).min8t as Min8tPlugin

    // Build plugin configuration
    const config: PluginConfig = {
      pluginId: props.pluginId,
      apiRequestData: {
        emailId: props.emailId
      },
      getAuthToken: () => props.authToken,
      locale: props.locale,
      theme: props.theme,
      baseUrl: props.baseUrl,
      customization: props.customization
    }

    // Initialize the plugin
    await pluginInstance.init(config)

    loading.value = false
    emit('initialized')

    console.log('[Min8tEditor] Plugin initialized successfully')
  } catch (err: any) {
    loading.value = false
    error.value = {
      error: err.message || 'Plugin initialization failed',
      details: err.details || err.stack,
      errorType: err.errorType || 'server',
      isRecoverable: err.isRecoverable ?? true
    }

    emit('error', error.value)

    console.error('[Min8tEditor] Initialization failed:', err)
  }
}

/**
 * Retry plugin initialization
 *
 * Called when user clicks "Retry" button after an error.
 */
function retryInit(): void {
  initPlugin()
}

/**
 * ========================
 * PLUGIN METHODS
 * ========================
 */

/**
 * Save the current template
 *
 * Calls plugin.save() and emits the result.
 */
async function handleSave(): Promise<void> {
  if (!pluginInstance) {
    console.error('[Min8tEditor] Plugin not initialized')
    return
  }

  try {
    saving.value = true

    const result = await pluginInstance.save()

    emit('save', result)

    console.log('[Min8tEditor] Template saved:', result)

    // Optional: Show success notification
    alert(`Template saved successfully at ${result.savedAt}`)
  } catch (err: any) {
    const errorResponse: ErrorResponse = {
      error: err.message || 'Save failed',
      details: err.details,
      errorType: err.errorType || 'server',
      isRecoverable: err.isRecoverable ?? true
    }

    emit('error', errorResponse)

    console.error('[Min8tEditor] Save failed:', err)

    alert(`Save failed: ${err.message}`)
  } finally {
    saving.value = false
  }
}

/**
 * Get current HTML/CSS from the editor
 *
 * Calls plugin.getHtml() and displays preview.
 */
async function handleGetHtml(): Promise<void> {
  if (!pluginInstance) {
    console.error('[Min8tEditor] Plugin not initialized')
    return
  }

  try {
    const data = await pluginInstance.getHtml()

    emit('html-retrieved', data)

    // Show preview
    htmlPreview.value = data.html

    console.log('[Min8tEditor] HTML retrieved:', data)
  } catch (err: any) {
    const errorResponse: ErrorResponse = {
      error: err.message || 'Get HTML failed',
      details: err.details,
      errorType: err.errorType || 'server',
      isRecoverable: err.isRecoverable ?? true
    }

    emit('error', errorResponse)

    console.error('[Min8tEditor] Get HTML failed:', err)

    alert(`Get HTML failed: ${err.message}`)
  }
}

/**
 * Export template to specified format
 *
 * @param format - Export format (html, zip, pdf)
 */
async function handleExport(format: 'html' | 'zip' | 'pdf'): Promise<void> {
  if (!pluginInstance) {
    console.error('[Min8tEditor] Plugin not initialized')
    return
  }

  try {
    const result = await pluginInstance.export(format)

    emit('export', result)

    console.log(`[Min8tEditor] Template exported as ${format}:`, result)

    // Open download URL in new tab
    window.open(result.downloadUrl, '_blank')
  } catch (err: any) {
    const errorResponse: ErrorResponse = {
      error: err.message || 'Export failed',
      details: err.details,
      errorType: err.errorType || 'server',
      isRecoverable: err.isRecoverable ?? true
    }

    emit('error', errorResponse)

    console.error('[Min8tEditor] Export failed:', err)

    alert(`Export failed: ${err.message}`)
  }
}

/**
 * ========================
 * LIFECYCLE HOOKS
 * ========================
 */

/**
 * Component mounted - initialize plugin
 */
onMounted(() => {
  console.log('[Min8tEditor] Component mounted, initializing plugin...')
  initPlugin()
})

/**
 * Component unmounted - cleanup plugin
 */
onUnmounted(() => {
  if (pluginInstance) {
    pluginInstance.destroy()
    pluginInstance = null
    console.log('[Min8tEditor] Plugin destroyed')
  }

  emit('destroyed')
})

/**
 * Watch authToken changes and reinitialize
 *
 * If the auth token changes, reinitialize the plugin with the new token.
 */
watch(() => props.authToken, (newToken, oldToken) => {
  if (newToken !== oldToken && pluginInstance) {
    console.log('[Min8tEditor] Auth token changed, reinitializing...')
    pluginInstance.destroy()
    initPlugin()
  }
})
</script>

<style scoped>
/**
 * Component Styles
 *
 * Scoped styles for the min8t editor component.
 */

.min8t-editor-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
}

.min8t-editor-container {
  width: 100%;
  min-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

/* Loading State */
.min8t-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.min8t-loading p {
  margin-top: 20px;
  font-size: 16px;
  color: #666;
}

/* Error State */
.min8t-error {
  padding: 40px 20px;
  text-align: center;
  background: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 8px;
  margin: 20px 0;
}

.min8t-error h3 {
  color: #c53030;
  margin-bottom: 10px;
}

.min8t-error p {
  color: #742a2a;
  margin: 8px 0;
}

.error-details {
  font-size: 14px;
  color: #9b2c2c;
  font-family: monospace;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  overflow-x: auto;
}

.retry-button {
  margin-top: 20px;
  padding: 10px 24px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2c5282;
}

/* Action Buttons */
.min8t-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-button {
  padding: 10px 20px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.action-button:hover:not(:disabled) {
  background: #2c5282;
  transform: translateY(-1px);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.save-button {
  background: #38a169;
}

.save-button:hover:not(:disabled) {
  background: #2f855a;
}

/* HTML Preview */
.min8t-preview {
  margin-top: 20px;
  padding: 20px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.min8t-preview h3 {
  margin-bottom: 15px;
  color: #2d3748;
}

.min8t-preview pre {
  background: #1a202c;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.min8t-preview code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.close-preview {
  margin-top: 10px;
  padding: 8px 16px;
  background: #718096;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.close-preview:hover {
  background: #4a5568;
}

/* Responsive Design */
@media (max-width: 768px) {
  .min8t-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>

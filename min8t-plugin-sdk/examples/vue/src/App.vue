<template>
  <div id="app">
    <header class="app-header">
      <h1>min8t Email Editor - Vue 3 Demo</h1>
      <p>Production-ready Vue 3 component with Composition API + TypeScript</p>
    </header>

    <main class="app-main">
      <Min8tEditor
        :plugin-id="pluginSettings.pluginId"
        :email-id="pluginSettings.emailId"
        :auth-token="authToken"
        :locale="locale"
        :theme="theme"
        @save="handleSave"
        @error="handleError"
        @html-retrieved="handleHtmlRetrieved"
        @export="handleExport"
        @initialized="handleInitialized"
      />
    </main>

    <footer class="app-footer">
      <p>
        Built with
        <a href="https://vuejs.org/" target="_blank">Vue 3</a>
        +
        <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>
        +
        <a href="https://min8t.com" target="_blank">min8t Plugin SDK</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Min8tEditor from '../Min8tEditor.vue'
import type {
  PluginSaveResponse,
  ErrorResponse,
  PluginApiResponse,
  PluginExportResponse
} from '../../dist/index.d'

/**
 * Plugin Configuration
 *
 * In a real application, these would come from your backend/state management.
 */
const pluginSettings = ref({
  pluginId: 'min8t_pk_demo_plugin',
  emailId: 'demo-email-456'
})

/**
 * Authentication Token
 *
 * IMPORTANT: In production, fetch this from your backend API.
 * Never hardcode authentication tokens in production code!
 */
const authToken = ref('DEMO-ES-PLUGIN-AUTH-TOKEN')

/**
 * UI Preferences
 */
const locale = ref<string>('en')
const theme = ref<'light' | 'dark'>('light')

/**
 * Event Handlers
 */
function handleSave(result: PluginSaveResponse) {
  console.log('✅ Template saved:', result)
  alert(`Template saved successfully!\n\nEmail ID: ${result.emailId}\nSaved at: ${result.savedAt}`)
}

function handleError(error: ErrorResponse) {
  console.error('❌ Error:', error)
  alert(`Error: ${error.error}\n\nType: ${error.errorType}\nRecoverable: ${error.isRecoverable}`)
}

function handleHtmlRetrieved(data: PluginApiResponse) {
  console.log('📄 HTML retrieved:', {
    htmlLength: data.html.length,
    cssLength: data.css.length
  })
}

function handleExport(data: PluginExportResponse) {
  console.log('📦 Template exported:', {
    format: data.format,
    downloadUrl: data.downloadUrl,
    expiresIn: data.expiresIn
  })
}

function handleInitialized() {
  console.log('🎉 Editor initialized successfully!')
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
  background: #f7fafc;
  color: #2d3748;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.app-header p {
  font-size: 18px;
  opacity: 0.95;
}

/* Main Content */
.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Footer */
.app-footer {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  text-align: center;
  font-size: 14px;
}

.app-footer a {
  color: #90cdf4;
  text-decoration: none;
  transition: color 0.2s;
}

.app-footer a:hover {
  color: #63b3ed;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 28px;
  }

  .app-header p {
    font-size: 16px;
  }

  .app-main {
    padding: 20px 10px;
  }
}
</style>

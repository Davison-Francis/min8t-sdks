/**
 * min8tEmail Plugin SDK - Frontend Bundle
 *
 * Production-ready plugin wrapper that provides a framework-agnostic
 * email editor embeddable in React, Vue, Angular, or vanilla JavaScript.
 *
 * @packageDocumentation
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 *
 * **Source:**
 * - Specification: 15_plugin_sdk_service.md lines 467-506
 * - Backend API: /src/controllers/pluginController.ts
 * - TODO: TODO.md lines 1787-1796
 */

import { getErrorMessage } from './shared/errorUtils';

/**
 * ========================
 * TYPE DEFINITIONS
 * ========================
 */

/**
 * Plugin Configuration Interface
 *
 * Configuration object required to initialize the min8t plugin.
 *
 * @example
 * ```typescript
 * const config: PluginConfig = {
 *   pluginId: 'min8t_pk_your_plugin_id',
 *   apiRequestData: {
 *     emailId: 'email-123'
 *   },
 *   getAuthToken: () => 'ES-PLUGIN-AUTH-TOKEN',
 *   locale: 'en',
 *   theme: 'light'
 * };
 * ```
 */
export interface PluginConfig {
  /** Unique plugin identifier (min8t_pk_*) from Developer Tools → Projects → Credentials */
  pluginId: string;

  /** API request data containing email context */
  apiRequestData: {
    /** Email template identifier (required) */
    emailId: string;
    /** Additional custom parameters */
    [key: string]: any;
  };

  /** Authentication token provider function */
  getAuthToken: () => string;

  /** Locale/language code (default: 'en') */
  locale?: string;

  /** UI theme preference (default: 'light') */
  theme?: 'light' | 'dark';

  /** White-label customization options */
  customization?: PluginCustomization;

  /** Base URL for the plugin API (default: auto-detected) */
  baseUrl?: string;
}

/**
 * Plugin Customization Options
 */
export interface PluginCustomization {
  /** Show or hide min8t branding */
  branding?: boolean;

  /** Custom logo URL */
  logoUrl?: string;

  /** Primary brand color (hex) */
  primaryColor?: string;

  /** Available features list */
  features?: string[];
}

/**
 * Plugin API Response - HTML/CSS Template Data
 *
 * Returned by getHtml() method and POST /compile endpoint.
 */
export interface PluginApiResponse {
  /** Compiled HTML content */
  html: string;

  /** Compiled CSS styles */
  css: string;
}

/**
 * Plugin Save Response
 *
 * Returned by save() method and POST /plugin/save endpoint.
 */
export interface PluginSaveResponse {
  /** Indicates whether save was successful */
  success: boolean;

  /** Email template identifier */
  emailId: string;

  /** ISO 8601 timestamp of when template was saved */
  savedAt: string;
}

/**
 * Plugin Initialization Response
 *
 * Returned by init() internal call to POST /init endpoint.
 */
export interface PluginInitResponse {
  /** Indicates whether initialization was successful */
  success: boolean;

  /** URL to load the Angular editor */
  editorUrl: string;

  /** Session identifier */
  sessionId: string;
}

/**
 * Plugin Export Response
 *
 * Returned by export() method and POST /export endpoint.
 */
export interface PluginExportResponse {
  /** URL to download the exported file */
  downloadUrl: string;

  /** Expiration time in seconds */
  expiresIn: number;

  /** Export format */
  format: 'html' | 'zip' | 'pdf';
}

/**
 * Error Response
 *
 * Standard error format used across all API endpoints.
 */
export interface ErrorResponse {
  /** Error message */
  error: string;

  /** Detailed error information */
  details?: string;

  /** Error type classification */
  errorType: 'auth' | 'network' | 'server' | 'validation' | 'rate_limit';

  /** Whether the error is recoverable */
  isRecoverable: boolean;
}

/**
 * postMessage Event Types
 *
 * Messages exchanged between plugin and iframe.
 */
interface PostMessageRequest {
  type: 'GET_HTML' | 'SET_HTML' | 'UNDO' | 'REDO' | 'SET_MODE' | 'GET_MODE' | 'TOGGLE_VERSION_HISTORY';
  requestId: string;
  payload?: {
    html?: string;
    css?: string;
    mode?: 'visual' | 'code';
  };
}

interface PostMessageResponse {
  type: 'HTML_RESPONSE' | 'SET_HTML_SUCCESS' | 'UNDO_SUCCESS' | 'REDO_SUCCESS' | 'SET_MODE_SUCCESS' | 'MODE_RESPONSE' | 'VERSION_HISTORY_TOGGLED' | 'ERROR' | 'READY';
  requestId: string;
  payload?: {
    html?: string;
    css?: string;
    error?: string;
    mode?: 'visual' | 'code';
    canUndo?: boolean;
    canRedo?: boolean;
    versionHistoryOpen?: boolean;
    hasVersionHistory?: boolean;
  };
}

/**
 * Supported SDK Events
 */
/**
 * Undo/Redo State Response
 */
export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Editor Mode Response
 */
export interface EditorModeResponse {
  mode: 'visual' | 'code';
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Version History Toggle Response
 */
export interface VersionHistoryResponse {
  versionHistoryOpen: boolean;
  hasVersionHistory: boolean;
}

export type Min8tEvent = 'initialized' | 'ready' | 'destroyed' | 'save' | 'error' | 'authExpired' | 'exported';

/**
 * Event callback type
 */
export type EventCallback = (data?: any) => void;

/**
 * Compile Response
 */
export interface CompileResponse {
  html: string;
  css: string;
  minified: boolean;
}

/**
 * Preview Response
 */
export interface PreviewResponse {
  previewUrl: string;
  expiresIn: number;
}

/**
 * Session Refresh Response
 */
export interface SessionRefreshResponse {
  sessionId: string;
  expiresAt: number;
}

/**
 * ========================
 * MAIN PLUGIN INTERFACE
 * ========================
 */

/**
 * min8t Plugin Interface
 *
 * Defines the public API for the min8t plugin.
 */
export interface Min8tPlugin {
  /** Initialize the plugin with configuration */
  init(config: PluginConfig): Promise<void>;

  /** Get current HTML and CSS from the editor */
  getHtml(): Promise<PluginApiResponse>;

  /** Set HTML and CSS in the editor */
  setHtml(html: string, css: string): Promise<void>;

  /** Save the current template to the backend */
  save(): Promise<PluginSaveResponse>;

  /** Export the template in specified format */
  export(format: 'html' | 'zip' | 'pdf'): Promise<PluginExportResponse>;

  /** Compile template HTML/CSS with minification */
  compile(): Promise<CompileResponse>;

  /** Generate a temporary preview URL */
  preview(device?: 'desktop' | 'mobile'): Promise<PreviewResponse>;

  /** Refresh the editor session (regenerates session ID) */
  refreshSession(): Promise<SessionRefreshResponse>;

  /** Undo the last editor action */
  undo(): Promise<UndoRedoState>;

  /** Redo the last undone editor action */
  redo(): Promise<UndoRedoState>;

  /** Set editor mode (visual or code) */
  setMode(mode: 'visual' | 'code'): Promise<void>;

  /** Get current editor mode and undo/redo state */
  getMode(): Promise<EditorModeResponse>;

  /** Toggle version history sidebar (open/close) */
  toggleVersionHistory(): Promise<VersionHistoryResponse>;

  /** Check if plugin is initialized */
  isInitialized(): boolean;

  /** Destroy the plugin and clean up resources */
  destroy(): void;

  /** Register an event listener */
  on(event: Min8tEvent, callback: EventCallback): void;

  /** Remove an event listener */
  off(event: Min8tEvent, callback: EventCallback): void;

  /** Register a one-time event listener */
  once(event: Min8tEvent, callback: EventCallback): void;
}

/**
 * ========================
 * PLUGIN IMPLEMENTATION
 * ========================
 */

/**
 * min8t Plugin Implementation
 *
 * Complete implementation of the min8t plugin SDK with iframe
 * communication, error handling, and security measures.
 */
class Min8tPluginImpl implements Min8tPlugin {
  private config: PluginConfig | null = null;
  private authToken: string = '';
  private baseUrl: string = '';
  private editorUrl: string = '';
  private sessionId: string = '';
  private iframe: HTMLIFrameElement | null = null;
  private initialized: boolean = false;
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: unknown) => void;
    timeoutId: number;
  }> = new Map();

  /** Message listener bound to this instance */
  private boundMessageListener: ((event: MessageEvent) => void) | null = null;

  /** Event listeners map */
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Generate unique request ID for postMessage communication
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle postMessage events from iframe
   */
  private handleMessage(event: MessageEvent): void {
    // Validate origin (security measure)
    if (!this.editorUrl || !event.origin.includes(new URL(this.editorUrl).origin)) {
      console.warn('[min8t Plugin] Ignored message from untrusted origin:', event.origin);
      return;
    }

    const message = event.data as PostMessageResponse;

    if (!message || !message.type) {
      return; // Ignore invalid messages
    }

    // Handle READY message from iframe (no requestId needed)
    if (message.type === 'READY') {
      this.emit('ready', { timestamp: Date.now() });
      return;
    }

    if (!message.requestId) {
      return; // Ignore invalid messages without requestId
    }

    const pending = this.pendingRequests.get(message.requestId);

    if (!pending) {
      return; // No pending request for this ID
    }

    // Clear timeout
    clearTimeout(pending.timeoutId);
    this.pendingRequests.delete(message.requestId);

    // Handle response
    if (message.type === 'ERROR') {
      pending.reject(new Error(message.payload?.error || 'Unknown error from editor'));
    } else {
      pending.resolve(message.payload);
    }
  }

  /**
   * Send postMessage to iframe with timeout
   */
  private sendMessageToIframe<T>(
    type: PostMessageRequest['type'],
    payload?: any,
    timeoutMs: number = 10000
  ): Promise<T> {
    if (!this.iframe || !this.iframe.contentWindow) {
      return Promise.reject(new Error('Editor iframe not loaded'));
    }

    // Store reference to avoid null checks
    const iframeWindow = this.iframe.contentWindow;

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();

      // Set timeout
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Editor response timeout'));
      }, timeoutMs);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeoutId: timeoutId as any
      });

      // Send message
      const message: PostMessageRequest = {
        type,
        requestId,
        payload
      };

      iframeWindow.postMessage(message, '*');
    });
  }

  /**
   * Make authenticated API call to backend
   */
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.authToken) {
      throw new Error('Plugin not initialized - missing auth token');
    }

    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ES-PLUGIN-AUTH': this.authToken,
        ...options.headers
      }
    });

    if (!response.ok) {
      let errorData: (ErrorResponse & { code?: string }) | null = null;

      try {
        errorData = await response.json();
      } catch (e) {
        // Fallback if response is not JSON
      }

      const error = Object.assign(
        new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`),
        {
          statusCode: response.status,
          code: errorData?.code,
          errorType: errorData?.errorType || 'server',
          isRecoverable: errorData?.isRecoverable ?? true,
          details: errorData?.details,
        }
      );

      // Emit authExpired on 401
      if (response.status === 401) {
        this.emit('authExpired', { pluginId: this.config?.pluginId });
      }

      // Emit error event
      this.emit('error', {
        error: error.message,
        code: errorData?.code,
        errorType: errorData?.errorType || 'server',
        isRecoverable: errorData?.isRecoverable ?? true,
      });

      throw error;
    }

    return response.json();
  }

  /**
   * Detect base URL from script tag or use default
   */
  private detectBaseUrl(configUrl?: string): string {
    // Priority 1: Explicit config
    if (configUrl) {
      return configUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    // Priority 2: Environment variable (if using bundler)
    if (typeof process !== 'undefined' && process.env?.PLUGIN_API_URL) {
      return process.env.PLUGIN_API_URL.replace(/\/$/, '');
    }

    // Priority 3: Script tag data attribute
    if (typeof document !== 'undefined') {
      const script = document.querySelector('script[data-min8t-api]');
      if (script) {
        const apiUrl = script.getAttribute('data-min8t-api');
        if (apiUrl) {
          return apiUrl.replace(/\/$/, '');
        }
      }
    }

    // Priority 4: Production default
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return 'https://plugins.min8t.com';
    }

    // Priority 5: Development default
    return 'http://localhost:3009';
  }

  /**
   * Initialize the plugin with configuration
   */
  async init(config: PluginConfig): Promise<void> {
    // Validate configuration
    if (!config || !config.pluginId || !config.apiRequestData?.emailId) {
      throw new Error('Invalid plugin configuration: pluginId and emailId are required');
    }

    if (!config.getAuthToken || typeof config.getAuthToken !== 'function') {
      throw new Error('Invalid plugin configuration: getAuthToken must be a function');
    }

    // Store configuration
    this.config = config;
    this.authToken = config.getAuthToken();
    this.baseUrl = this.detectBaseUrl(config.baseUrl);

    if (!this.authToken) {
      throw new Error('Auth token is required but getAuthToken() returned empty string');
    }

    console.log('[min8t Plugin] Initializing plugin with pluginId:', config.pluginId);
    console.log('[min8t Plugin] API Base URL:', this.baseUrl);

    try {
      // Call backend POST /init to create session
      const initResponse = await this.apiCall<PluginInitResponse>('/init', {
        method: 'POST',
        body: JSON.stringify({
          pluginId: config.pluginId,
          emailId: config.apiRequestData.emailId,
          locale: config.locale || 'en',
          theme: config.theme || 'light',
          customization: config.customization
        })
      });

      if (!initResponse.success) {
        throw new Error('Plugin initialization failed on backend');
      }

      this.editorUrl = initResponse.editorUrl;
      this.sessionId = initResponse.sessionId;

      console.log('[min8t Plugin] Session created:', this.sessionId);

      // Create iframe and load Angular editor
      await this.loadEditorIframe();

      this.initialized = true;

      console.log('[min8t Plugin] Initialization complete');

      // Emit initialized event
      this.emit('initialized', { sessionId: this.sessionId, pluginId: this.config!.pluginId });

    } catch (error: unknown) {
      console.error('[min8t Plugin] Initialization failed:', error);

      // Wrap error with helpful context
      const initError: any = new Error(
        `Plugin initialization failed: ${getErrorMessage(error)}`
      );
      initError.originalError = error;
      initError.errorType = (error as any)?.errorType || 'network';
      initError.isRecoverable = (error as any)?.isRecoverable ?? true;

      throw initError;
    }
  }

  /**
   * Load Angular editor in iframe
   */
  private async loadEditorIframe(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create iframe element
      const iframe = document.createElement('iframe');

      // Security: Sandbox with necessary permissions
      // Allow scripts (needed for Angular editor) but restrict other dangerous operations
      iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');

      // Set iframe attributes
      iframe.src = this.editorUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      // Handle load event
      iframe.addEventListener('load', () => {
        console.log('[min8t Plugin] Editor iframe loaded successfully');
        resolve();
      });

      // Handle error event
      iframe.addEventListener('error', (event) => {
        console.error('[min8t Plugin] Editor iframe failed to load:', event);
        reject(new Error('Failed to load editor iframe'));
      });

      // Set timeout for iframe load (30 seconds)
      const loadTimeout = window.setTimeout(() => {
        reject(new Error('Editor iframe load timeout (30s)'));
      }, 30000);

      // Clear timeout on success
      iframe.addEventListener('load', () => {
        clearTimeout(loadTimeout);
      });

      // Store iframe reference
      this.iframe = iframe;

      // Find or create container
      let container = document.getElementById('min8t-plugin');

      if (!container) {
        console.warn('[min8t Plugin] Container #min8t-plugin not found, creating one');
        container = document.createElement('div');
        container.id = 'min8t-plugin';
        container.style.width = '100%';
        container.style.height = '600px';
        document.body.appendChild(container);
      }

      // Clear container and append iframe
      container.innerHTML = '';
      container.appendChild(iframe);

      // Setup postMessage listener
      this.boundMessageListener = this.handleMessage.bind(this);
      window.addEventListener('message', this.boundMessageListener);
    });
  }

  /**
   * Get current HTML and CSS from the editor
   */
  async getHtml(): Promise<PluginApiResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    try {
      // Request HTML/CSS from iframe via postMessage
      const response = await this.sendMessageToIframe<{ html: string; css: string }>('GET_HTML');

      return {
        html: response.html || '',
        css: response.css || ''
      };
    } catch (error: unknown) {
      console.error('[min8t Plugin] getHtml() failed:', error);

      const getHtmlError: any = new Error(`Failed to get HTML/CSS: ${getErrorMessage(error)}`);
      getHtmlError.originalError = error;
      getHtmlError.errorType = 'network';
      getHtmlError.isRecoverable = true;

      throw getHtmlError;
    }
  }

  /**
   * Set HTML and CSS in the editor
   */
  async setHtml(html: string, css: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    // Validate inputs
    if (typeof html !== 'string' || typeof css !== 'string') {
      throw new Error('Invalid arguments: html and css must be strings');
    }

    try {
      // Send HTML/CSS to iframe via postMessage
      await this.sendMessageToIframe('SET_HTML', { html, css });

      console.log('[min8t Plugin] HTML/CSS set successfully');
    } catch (error: unknown) {
      console.error('[min8t Plugin] setHtml() failed:', error);

      const setHtmlError: any = new Error(`Failed to set HTML/CSS: ${getErrorMessage(error)}`);
      setHtmlError.originalError = error;
      setHtmlError.errorType = 'network';
      setHtmlError.isRecoverable = true;

      throw setHtmlError;
    }
  }

  /**
   * Save the current template to the backend
   */
  async save(): Promise<PluginSaveResponse> {
    if (!this.initialized || !this.config) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    try {
      // Get current HTML/CSS from editor
      const { html, css } = await this.getHtml();

      // Call backend POST /plugin/save
      const response = await this.apiCall<PluginSaveResponse>('/plugin/save', {
        method: 'POST',
        body: JSON.stringify({
          html,
          css,
          emailId: this.config.apiRequestData.emailId
        })
      });

      console.log('[min8t Plugin] Template saved successfully:', response.emailId);

      // Emit save event
      this.emit('save', { success: response.success, emailId: response.emailId, savedAt: response.savedAt });

      return response;
    } catch (error: unknown) {
      console.error('[min8t Plugin] save() failed:', error);

      const saveError: any = new Error(`Failed to save template: ${getErrorMessage(error)}`);
      saveError.originalError = error;
      saveError.errorType = (error as any)?.errorType || 'server';
      saveError.isRecoverable = (error as any)?.isRecoverable ?? true;

      throw saveError;
    }
  }

  /**
   * Export the template in specified format
   */
  async export(format: 'html' | 'zip' | 'pdf'): Promise<PluginExportResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    // Validate format
    const validFormats: Array<'html' | 'zip' | 'pdf'> = ['html', 'zip', 'pdf'];
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid export format: ${format}. Must be one of: html, zip, pdf`);
    }

    try {
      // Get current HTML/CSS from editor
      const { html, css } = await this.getHtml();

      // Call backend POST /export
      const response = await this.apiCall<PluginExportResponse>('/export', {
        method: 'POST',
        body: JSON.stringify({
          html,
          css,
          format
        })
      });

      console.log('[min8t Plugin] Template exported successfully:', format);

      // Emit exported event
      this.emit('exported', { format: response.format, downloadUrl: response.downloadUrl });

      return response;
    } catch (error: unknown) {
      console.error('[min8t Plugin] export() failed:', error);

      const exportError: any = new Error(`Failed to export template: ${getErrorMessage(error)}`);
      exportError.originalError = error;
      exportError.errorType = (error as any)?.errorType || 'server';
      exportError.isRecoverable = (error as any)?.isRecoverable ?? true;

      throw exportError;
    }
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy the plugin and clean up resources
   */
  destroy(): void {
    // Remove postMessage listener
    if (this.boundMessageListener) {
      window.removeEventListener('message', this.boundMessageListener);
      this.boundMessageListener = null;
    }

    // Clear pending requests
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Plugin destroyed'));
    });
    this.pendingRequests.clear();

    // Remove iframe
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }

    // Reset state
    this.config = null;
    this.authToken = '';
    this.baseUrl = '';
    this.editorUrl = '';
    this.sessionId = '';
    this.iframe = null;
    this.initialized = false;

    // Emit destroyed event before clearing listeners
    this.emit('destroyed', {});

    // Clear all event listeners
    this.eventListeners.clear();

    console.log('[min8t Plugin] Plugin destroyed and resources cleaned up');
  }

  /**
   * Compile template HTML/CSS with minification
   */
  async compile(): Promise<CompileResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    try {
      const { html, css } = await this.getHtml();
      const response = await this.apiCall<CompileResponse>('/compile', {
        method: 'POST',
        body: JSON.stringify({ html, css, minify: true })
      });

      return response;
    } catch (error: unknown) {
      console.error('[min8t Plugin] compile() failed:', error);
      throw error;
    }
  }

  /**
   * Generate a temporary preview URL
   */
  async preview(device: 'desktop' | 'mobile' = 'desktop'): Promise<PreviewResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    try {
      const { html, css } = await this.getHtml();
      const response = await this.apiCall<PreviewResponse>('/preview', {
        method: 'POST',
        body: JSON.stringify({ html, css, device })
      });

      return response;
    } catch (error: unknown) {
      console.error('[min8t Plugin] preview() failed:', error);
      throw error;
    }
  }

  /**
   * Refresh the editor session (regenerates session ID per OWASP)
   */
  async refreshSession(): Promise<SessionRefreshResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    try {
      const response = await this.apiCall<SessionRefreshResponse>('/plugin/session/refresh', {
        method: 'POST',
        body: JSON.stringify({ sessionId: this.sessionId })
      });

      // Update internal session ID
      this.sessionId = response.sessionId;

      return response;
    } catch (error: unknown) {
      console.error('[min8t Plugin] refreshSession() failed:', error);
      throw error;
    }
  }

  /**
   * Undo the last editor action
   */
  async undo(): Promise<UndoRedoState> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    const response = await this.sendMessageToIframe<{ canUndo: boolean; canRedo: boolean }>('UNDO');
    return {
      canUndo: response.canUndo ?? false,
      canRedo: response.canRedo ?? false,
    };
  }

  /**
   * Redo the last undone editor action
   */
  async redo(): Promise<UndoRedoState> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    const response = await this.sendMessageToIframe<{ canUndo: boolean; canRedo: boolean }>('REDO');
    return {
      canUndo: response.canUndo ?? false,
      canRedo: response.canRedo ?? false,
    };
  }

  /**
   * Set editor mode (visual or code)
   */
  async setMode(mode: 'visual' | 'code'): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    if (mode !== 'visual' && mode !== 'code') {
      throw new Error('Invalid mode: must be "visual" or "code"');
    }

    await this.sendMessageToIframe('SET_MODE', { mode });
  }

  /**
   * Get current editor mode and undo/redo state
   */
  async getMode(): Promise<EditorModeResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    const response = await this.sendMessageToIframe<{ mode: 'visual' | 'code'; canUndo: boolean; canRedo: boolean }>('GET_MODE');
    return {
      mode: response.mode,
      canUndo: response.canUndo ?? false,
      canRedo: response.canRedo ?? false,
    };
  }

  /**
   * Toggle version history sidebar (open/close)
   */
  async toggleVersionHistory(): Promise<VersionHistoryResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call init() first.');
    }

    const response = await this.sendMessageToIframe<{ versionHistoryOpen: boolean; hasVersionHistory: boolean }>('TOGGLE_VERSION_HISTORY');
    return {
      versionHistoryOpen: response.versionHistoryOpen ?? false,
      hasVersionHistory: response.hasVersionHistory ?? false,
    };
  }

  /**
   * Register an event listener
   */
  on(event: Min8tEvent, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove an event listener
   */
  off(event: Min8tEvent, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Register a one-time event listener
   */
  once(event: Min8tEvent, callback: EventCallback): void {
    const wrapper: EventCallback = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[min8t Plugin] Error in ${event} event handler:`, err);
        }
      });
    }
  }
}

/**
 * ========================
 * GLOBAL API EXPORT
 * ========================
 */

/**
 * Extend window interface to include min8t plugin
 */
declare global {
  interface Window {
    min8t: Min8tPlugin;
  }
}

/**
 * Initialize and export plugin instance to global scope
 */
if (typeof window !== 'undefined') {
  (window as any).min8t = new Min8tPluginImpl();
  console.log('[min8t Plugin] Plugin SDK loaded successfully (v1.0.0)');
  console.log('[min8t Plugin] Access via window.min8t');
}

/**
 * Export default instance for module imports
 */
export default new Min8tPluginImpl();

/**
 * min8t Email Editor - Angular Standalone Component
 *
 * Production-ready Angular integration demonstrating the complete min8t Plugin SDK API.
 *
 * @component Min8tEditorComponent
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 *
 * **Features:**
 * - Standalone component (Angular 17+ pattern)
 * - Full TypeScript typing with plugin SDK types
 * - @Input decorators for configuration
 * - @Output EventEmitters for save/error events
 * - ngOnInit lifecycle for init() call
 * - ViewChild for container DOM element access
 * - ngOnDestroy cleanup with destroy()
 * - Comprehensive error handling
 * - Production-ready patterns
 *
 * **Research Sources:**
 * - Internal: /frontend/src/index.ts (plugin API)
 * - Internal: /frontend/dist/index.d.ts (TypeScript types)
 * - Internal: /frontend/README.md (integration patterns)
 * - External: Angular Standalone Components Guide (2025)
 * - External: Angular Lifecycle Hooks Best Practices (2025)
 * - External: Angular @Input/@Output TypeScript Typing (2025)
 */

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

/**
 * Import types from min8t Plugin SDK
 *
 * These types are generated from /frontend/dist/index.d.ts
 * and provide full TypeScript IntelliSense support.
 */
import type {
  PluginConfig,
  PluginSaveResponse,
  PluginApiResponse,
  PluginExportResponse,
  ErrorResponse,
  Min8tPlugin
} from '../../../../dist/index';

/**
 * Extend window interface to include min8t plugin
 *
 * This allows TypeScript to recognize window.min8t
 */
declare global {
  interface Window {
    min8t: Min8tPlugin;
  }
}

/**
 * min8t Email Editor Component
 *
 * Standalone Angular component that embeds the min8t email editor
 * into your Angular application.
 *
 * @example
 * ```html
 * <app-min8t-editor
 *   [pluginId]="'min8t_pk_your_plugin_id'"
 *   [emailId]="'email-123'"
 *   [authToken]="'ES-PLUGIN-AUTH-TOKEN'"
 *   [locale]="'en'"
 *   [theme]="'light'"
 *   (saveSuccess)="onSaveSuccess($event)"
 *   (error)="onError($event)">
 * </app-min8t-editor>
 * ```
 *
 * @example Programmatic Usage
 * ```typescript
 * // Get current HTML/CSS
 * const content = await this.editorComponent.getHtml();
 *
 * // Set HTML/CSS
 * await this.editorComponent.setHtml(html, css);
 *
 * // Save template
 * const result = await this.editorComponent.save();
 *
 * // Export template
 * const exportResult = await this.editorComponent.export('html');
 * ```
 */
@Component({
  selector: 'app-min8t-editor',
  standalone: true, // Modern Angular 17+ pattern
  templateUrl: './min8t-editor.component.html',
  styleUrls: ['./min8t-editor.component.css']
})
export class Min8tEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * ========================
   * INPUT PROPERTIES
   * ========================
   */

  /**
   * Unique plugin identifier (required)
   *
   * Obtained from the min8t dashboard (min8t_pk_* format).
   */
  @Input({ required: true }) pluginId!: string;

  /**
   * Email template identifier (required)
   *
   * The ID of the email template to edit.
   */
  @Input({ required: true }) emailId!: string;

  /**
   * Authentication token provider (required)
   *
   * ES-PLUGIN-AUTH token for API authentication.
   * Can be a string or a function that returns a string.
   *
   * @example
   * ```typescript
   * authToken = 'ES-PLUGIN-AUTH-TOKEN-12345';
   * // OR
   * authToken = () => this.authService.getToken();
   * ```
   */
  @Input({ required: true }) authToken!: string | (() => string);

  /**
   * Locale/language code (optional)
   *
   * Default: 'en'
   * Supported: 'en', 'es', 'fr', 'de', 'it', 'pt', etc.
   */
  @Input() locale: string = 'en';

  /**
   * UI theme preference (optional)
   *
   * Default: 'light'
   * Options: 'light' | 'dark'
   */
  @Input() theme: 'light' | 'dark' = 'light';

  /**
   * White-label customization options (optional)
   *
   * Customize branding, logo, colors, and available features.
   *
   * @example
   * ```typescript
   * customization = {
   *   branding: false,
   *   logoUrl: 'https://example.com/logo.png',
   *   primaryColor: '#007bff',
   *   features: ['editor', 'preview', 'export']
   * };
   * ```
   */
  @Input() customization?: {
    branding?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    features?: string[];
  };

  /**
   * Base URL for the plugin API (optional)
   *
   * Default: Auto-detected based on environment
   * Production: 'https://plugins.min8t.com'
   * Development: 'http://localhost:3009'
   */
  @Input() baseUrl?: string;

  /**
   * ========================
   * OUTPUT EVENTS
   * ========================
   */

  /**
   * Emitted when template is saved successfully
   *
   * @example
   * ```typescript
   * onSaveSuccess(response: PluginSaveResponse) {
   *   console.log('Template saved:', response.emailId);
   *   console.log('Saved at:', response.savedAt);
   * }
   * ```
   */
  @Output() saveSuccess = new EventEmitter<PluginSaveResponse>();

  /**
   * Emitted when template save fails
   *
   * @example
   * ```typescript
   * onSaveError(error: ErrorResponse) {
   *   console.error('Save failed:', error.error);
   *   if (error.isRecoverable) {
   *     // Retry logic
   *   }
   * }
   * ```
   */
  @Output() saveError = new EventEmitter<ErrorResponse>();

  /**
   * Emitted when any error occurs
   *
   * @example
   * ```typescript
   * onError(error: ErrorResponse) {
   *   this.toastr.error(error.error, error.details);
   * }
   * ```
   */
  @Output() error = new EventEmitter<ErrorResponse>();

  /**
   * Emitted when plugin is initialized successfully
   */
  @Output() initialized = new EventEmitter<void>();

  /**
   * Emitted when plugin is destroyed
   */
  @Output() destroyed = new EventEmitter<void>();

  /**
   * ========================
   * VIEW CHILDREN
   * ========================
   */

  /**
   * Reference to the editor container div
   *
   * The plugin will be loaded into this container.
   * Accessed in ngAfterViewInit (not ngOnInit).
   */
  @ViewChild('editorContainer', { static: false })
  editorContainer!: ElementRef<HTMLDivElement>;

  /**
   * ========================
   * COMPONENT STATE
   * ========================
   */

  /**
   * Indicates whether the plugin is initialized
   */
  isInitialized: boolean = false;

  /**
   * Indicates whether the plugin is currently loading
   */
  isLoading: boolean = false;

  /**
   * Initialization error (if any)
   */
  initializationError: ErrorResponse | null = null;

  /**
   * ========================
   * CONSTRUCTOR
   * ========================
   */

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * ========================
   * LIFECYCLE HOOKS
   * ========================
   */

  /**
   * ngOnInit - Component initialization
   *
   * Called once, after the first ngOnChanges.
   * Best practice: Initialize component properties, set up subscriptions.
   *
   * NOTE: ViewChild references are NOT available in ngOnInit.
   * Use ngAfterViewInit to access DOM elements.
   */
  ngOnInit(): void {
    console.log('[Min8tEditorComponent] Component initialized');

    // Validate required inputs
    this.validateInputs();

    // Log configuration for debugging
    console.log('[Min8tEditorComponent] Configuration:', {
      pluginId: this.pluginId,
      emailId: this.emailId,
      locale: this.locale,
      theme: this.theme,
      hasCustomization: !!this.customization
    });
  }

  /**
   * ngAfterViewInit - View initialization
   *
   * Called after Angular initializes the component's views and child views.
   * Best practice: Access ViewChild references, interact with DOM.
   *
   * This is where we initialize the min8t plugin because we need
   * access to the #editorContainer DOM element.
   */
  async ngAfterViewInit(): Promise<void> {
    console.log('[Min8tEditorComponent] View initialized, initializing plugin...');

    // Small delay to ensure DOM is fully rendered
    // This prevents race conditions with ViewChild
    await this.delay(100);

    try {
      await this.initializePlugin();
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] Plugin initialization failed:', error);
      this.handleError({
        error: 'Plugin initialization failed',
        details: error instanceof Error ? error.message : String(error),
        errorType: 'server',
        isRecoverable: true
      });
    }
  }

  /**
   * ngOnDestroy - Cleanup
   *
   * Called just before Angular destroys the component.
   * Best practice: Clean up subscriptions, timers, event listeners.
   *
   * CRITICAL: We must call plugin.destroy() to clean up resources.
   */
  ngOnDestroy(): void {
    console.log('[Min8tEditorComponent] Component destroying, cleaning up plugin...');

    try {
      if (window.min8t && window.min8t.isInitialized()) {
        window.min8t.destroy();
        console.log('[Min8tEditorComponent] Plugin destroyed successfully');
      }
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] Error destroying plugin:', error);
    }

    this.destroyed.emit();
  }

  /**
   * ========================
   * PLUGIN INITIALIZATION
   * ========================
   */

  /**
   * Initialize the min8t plugin
   *
   * This method:
   * 1. Validates that window.min8t is available
   * 2. Creates a PluginConfig object
   * 3. Calls window.min8t.init(config)
   * 4. Waits for initialization to complete
   * 5. Emits initialized event
   */
  private async initializePlugin(): Promise<void> {
    // Check if min8t SDK is loaded
    if (!window.min8t) {
      throw new Error(
        'min8t Plugin SDK not loaded. Add <script src="https://plugins.min8t.com/static/latest/min8t.js"></script> to your index.html'
      );
    }

    // Check if container element exists
    if (!this.editorContainer) {
      throw new Error('Editor container element not found. ViewChild reference is undefined.');
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Trigger change detection for loading state

    // Build plugin configuration
    const config: PluginConfig = {
      pluginId: this.pluginId,
      apiRequestData: {
        emailId: this.emailId
      },
      getAuthToken: this.getAuthTokenFunction(),
      locale: this.locale,
      theme: this.theme,
      customization: this.customization,
      baseUrl: this.baseUrl
    };

    console.log('[Min8tEditorComponent] Initializing plugin with config:', config);

    try {
      // Initialize the plugin
      await window.min8t.init(config);

      this.isInitialized = true;
      this.isLoading = false;
      this.initializationError = null;

      console.log('[Min8tEditorComponent] Plugin initialized successfully');

      this.initialized.emit();
      this.cdr.detectChanges();
    } catch (error: unknown) {
      this.isLoading = false;
      this.isInitialized = false;

      const errorResponse: ErrorResponse = {
        error: 'Plugin initialization failed',
        details: error instanceof Error ? error.message : String(error),
        errorType: (error as ErrorResponse).errorType || 'server',
        isRecoverable: (error as ErrorResponse).isRecoverable ?? true
      };

      this.initializationError = errorResponse;
      this.cdr.detectChanges();

      throw errorResponse;
    }
  }

  /**
   * ========================
   * PUBLIC API METHODS
   * ========================
   */

  /**
   * Get current HTML and CSS from the editor
   *
   * @returns Promise resolving to HTML and CSS
   * @throws Error if plugin is not initialized
   *
   * @example
   * ```typescript
   * const content = await this.editorComponent.getHtml();
   * console.log(content.html, content.css);
   * ```
   */
  async getHtml(): Promise<PluginApiResponse> {
    this.ensureInitialized();

    try {
      const response = await window.min8t.getHtml();
      console.log('[Min8tEditorComponent] getHtml() successful');
      return response;
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] getHtml() failed:', error);
      this.handleError({
        error: 'Failed to get HTML/CSS',
        details: error instanceof Error ? error.message : String(error),
        errorType: (error as ErrorResponse).errorType || 'network',
        isRecoverable: true
      });
      throw error;
    }
  }

  /**
   * Set HTML and CSS in the editor
   *
   * @param html - HTML content
   * @param css - CSS content
   * @throws Error if plugin is not initialized
   *
   * @example
   * ```typescript
   * await this.editorComponent.setHtml('<html>...</html>', 'body { ... }');
   * ```
   */
  async setHtml(html: string, css: string): Promise<void> {
    this.ensureInitialized();

    try {
      await window.min8t.setHtml(html, css);
      console.log('[Min8tEditorComponent] setHtml() successful');
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] setHtml() failed:', error);
      this.handleError({
        error: 'Failed to set HTML/CSS',
        details: error instanceof Error ? error.message : String(error),
        errorType: (error as ErrorResponse).errorType || 'network',
        isRecoverable: true
      });
      throw error;
    }
  }

  /**
   * Save the current template to the backend
   *
   * @returns Promise resolving to save response
   * @throws Error if save fails
   *
   * @example
   * ```typescript
   * const result = await this.editorComponent.save();
   * console.log('Saved at:', result.savedAt);
   * ```
   */
  async save(): Promise<PluginSaveResponse> {
    this.ensureInitialized();

    try {
      const response = await window.min8t.save();
      console.log('[Min8tEditorComponent] save() successful:', response);

      // Emit success event
      this.saveSuccess.emit(response);

      return response;
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] save() failed:', error);

      const errorResponse: ErrorResponse = {
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : String(error),
        errorType: (error as ErrorResponse).errorType || 'server',
        isRecoverable: (error as ErrorResponse).isRecoverable ?? true
      };

      // Emit error events
      this.saveError.emit(errorResponse);
      this.handleError(errorResponse);

      throw error;
    }
  }

  /**
   * Export the template in specified format
   *
   * @param format - Export format (html, zip, pdf)
   * @returns Promise resolving to export response with download URL
   * @throws Error if export fails
   *
   * @example
   * ```typescript
   * const result = await this.editorComponent.export('html');
   * window.open(result.downloadUrl, '_blank');
   * ```
   */
  async export(format: 'html' | 'zip' | 'pdf'): Promise<PluginExportResponse> {
    this.ensureInitialized();

    try {
      const response = await window.min8t.export(format);
      console.log('[Min8tEditorComponent] export() successful:', response);
      return response;
    } catch (error: unknown) {
      console.error('[Min8tEditorComponent] export() failed:', error);
      this.handleError({
        error: `Failed to export template as ${format}`,
        details: error instanceof Error ? error.message : String(error),
        errorType: (error as ErrorResponse).errorType || 'server',
        isRecoverable: true
      });
      throw error;
    }
  }

  /**
   * Check if plugin is initialized
   *
   * @returns true if initialized, false otherwise
   */
  isPluginInitialized(): boolean {
    return window.min8t ? window.min8t.isInitialized() : false;
  }

  /**
   * ========================
   * PRIVATE HELPER METHODS
   * ========================
   */

  /**
   * Validate required inputs
   *
   * Throws an error if required inputs are missing.
   */
  private validateInputs(): void {
    if (!this.pluginId) {
      throw new Error('[Min8tEditorComponent] pluginId is required');
    }

    if (!this.emailId) {
      throw new Error('[Min8tEditorComponent] emailId is required');
    }

    if (!this.authToken) {
      throw new Error('[Min8tEditorComponent] authToken is required');
    }
  }

  /**
   * Get auth token as a function
   *
   * Converts authToken input to a function, whether it's
   * provided as a string or a function.
   */
  private getAuthTokenFunction(): () => string {
    if (typeof this.authToken === 'function') {
      return this.authToken;
    } else {
      return () => this.authToken as string;
    }
  }

  /**
   * Ensure plugin is initialized before API calls
   *
   * Throws an error if the plugin is not initialized.
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !window.min8t || !window.min8t.isInitialized()) {
      throw new Error('Plugin not initialized. Wait for the initialized event before calling API methods.');
    }
  }

  /**
   * Handle errors with event emission
   *
   * Emits the error event for parent components to handle.
   */
  private handleError(errorResponse: ErrorResponse): void {
    this.error.emit(errorResponse);
  }

  /**
   * Delay helper for async operations
   *
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

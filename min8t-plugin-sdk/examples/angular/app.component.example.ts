/**
 * Example App Component
 *
 * Complete example showing how to use the Min8tEditorComponent
 * in a real Angular application.
 *
 * This file demonstrates:
 * - Component integration
 * - Event handling
 * - Programmatic API usage
 * - Error handling
 * - Loading states
 */

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Min8tEditorComponent } from './min8t-editor.component';
import type {
  PluginSaveResponse,
  ErrorResponse,
  PluginApiResponse,
  PluginExportResponse
} from '../../../../dist/index';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Min8tEditorComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>min8t Email Editor - Angular Example</h1>
      </header>

      <div class="toolbar">
        <button (click)="loadSampleTemplate()" [disabled]="!editorReady">
          Load Sample
        </button>
        <button (click)="saveTemplate()" [disabled]="!editorReady || isSaving">
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button (click)="exportAsHtml()" [disabled]="!editorReady">
          Export HTML
        </button>
        <button (click)="exportAsPdf()" [disabled]="!editorReady">
          Export PDF
        </button>
        <button (click)="getContent()" [disabled]="!editorReady">
          Get Content
        </button>
        <button (click)="toggleTheme()">
          {{ theme === 'light' ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <!-- Editor Component -->
      <div class="editor-wrapper">
        <app-min8t-editor
          #editor
          [pluginId]="pluginId"
          [emailId]="emailId"
          [authToken]="getAuthToken"
          [locale]="locale"
          [theme]="theme"
          [customization]="customization"
          (saveSuccess)="onSaveSuccess($event)"
          (saveError)="onSaveError($event)"
          (error)="onError($event)"
          (initialized)="onEditorInitialized()"
          (destroyed)="onEditorDestroyed()">
        </app-min8t-editor>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <span>Status: {{ editorReady ? '✅ Ready' : '⏳ Loading...' }}</span>
        <span *ngIf="lastSaved">Last saved: {{ lastSaved | date:'short' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .app-header {
      margin-bottom: 20px;
    }

    .app-header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .toolbar button {
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      transition: background-color 0.2s;
    }

    .toolbar button:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .toolbar button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .alert {
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 14px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .editor-wrapper {
      margin-bottom: 20px;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class AppComponent {
  /**
   * ========================
   * VIEWCHILD REFERENCE
   * ========================
   */

  @ViewChild('editor') editor!: Min8tEditorComponent;

  /**
   * ========================
   * CONFIGURATION
   * ========================
   */

  // Replace these with your actual values
  pluginId = 'min8t_pk_your_plugin_id';
  emailId = 'email-template-67890';
  locale = 'en';
  theme: 'light' | 'dark' = 'light';

  customization = {
    branding: false,
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#007bff',
    features: ['editor', 'preview', 'export']
  };

  /**
   * ========================
   * STATE
   * ========================
   */

  editorReady = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  lastSaved: Date | null = null;

  /**
   * ========================
   * AUTH TOKEN PROVIDER
   * ========================
   */

  /**
   * Dynamic auth token provider
   *
   * This function is called by the plugin to get the auth token.
   * It allows for dynamic token refresh without re-initializing the component.
   *
   * In a real application, this would:
   * 1. Check if token is expired
   * 2. Refresh token if needed
   * 3. Return fresh token
   */
  getAuthToken = (): string => {
    // Example: Get from localStorage
    const token = localStorage.getItem('min8tPluginToken');

    if (token) {
      return token;
    }

    // Fallback for development
    return 'ES-PLUGIN-AUTH-TOKEN-DEV';
  };

  /**
   * ========================
   * LIFECYCLE & EVENT HANDLERS
   * ========================
   */

  onEditorInitialized(): void {
    console.log('✅ Editor initialized successfully');
    this.editorReady = true;
    this.showSuccess('Editor loaded successfully');
  }

  onEditorDestroyed(): void {
    console.log('🗑️ Editor destroyed');
    this.editorReady = false;
  }

  onSaveSuccess(response: PluginSaveResponse): void {
    console.log('💾 Template saved:', response);
    this.lastSaved = new Date(response.savedAt);
    this.isSaving = false;
    this.showSuccess(`Template saved successfully at ${this.lastSaved.toLocaleTimeString()}`);
  }

  onSaveError(error: ErrorResponse): void {
    console.error('❌ Save failed:', error);
    this.isSaving = false;
    this.showError(`Save failed: ${error.error}`);

    // Handle recoverable errors
    if (error.isRecoverable) {
      console.log('Error is recoverable, consider retry logic');
    }
  }

  onError(error: ErrorResponse): void {
    console.error('❌ Plugin error:', error);
    this.showError(`Error: ${error.error}`);

    // Handle specific error types
    switch (error.errorType) {
      case 'auth':
        this.handleAuthError(error);
        break;
      case 'network':
        this.handleNetworkError(error);
        break;
      case 'rate_limit':
        this.handleRateLimitError(error);
        break;
      default:
        console.error('Unhandled error type:', error.errorType);
    }
  }

  /**
   * ========================
   * TOOLBAR ACTIONS
   * ========================
   */

  async loadSampleTemplate(): Promise<void> {
    const sampleHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007bff;">Welcome to min8t!</h1>
        <p>This is a sample email template.</p>
        <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Click Here
        </a>
      </div>
    `;

    const sampleCss = `
      body {
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
    `;

    try {
      await this.editor.setHtml(sampleHtml, sampleCss);
      this.showSuccess('Sample template loaded');
    } catch (error: unknown) {
      this.showError(`Failed to load sample: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveTemplate(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      const result = await this.editor.save();
      // Success is handled by onSaveSuccess event
    } catch (error: unknown) {
      // Error is handled by onSaveError event
      this.isSaving = false;
    }
  }

  async exportAsHtml(): Promise<void> {
    try {
      const result = await this.editor.export('html');
      window.open(result.downloadUrl, '_blank');
      this.showSuccess('HTML export ready. Download will start shortly.');
    } catch (error: unknown) {
      this.showError(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportAsPdf(): Promise<void> {
    try {
      const result = await this.editor.export('pdf');
      window.open(result.downloadUrl, '_blank');
      this.showSuccess('PDF export ready. Download will start shortly.');
    } catch (error: unknown) {
      this.showError(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContent(): Promise<void> {
    try {
      const content = await this.editor.getHtml();
      console.log('HTML:', content.html);
      console.log('CSS:', content.css);
      this.showSuccess('Content logged to console');
    } catch (error: unknown) {
      this.showError(`Failed to get content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.showSuccess(`Theme changed to ${this.theme}`);
  }

  /**
   * ========================
   * ERROR HANDLERS
   * ========================
   */

  private handleAuthError(error: ErrorResponse): void {
    console.error('Authentication error:', error);

    // In a real app, redirect to login or refresh token
    // For example:
    // this.router.navigate(['/login']);

    this.showError('Authentication failed. Please log in again.');
  }

  private handleNetworkError(error: ErrorResponse): void {
    console.error('Network error:', error);

    if (error.isRecoverable) {
      this.showError('Network error. Please check your connection and try again.');
    } else {
      this.showError('Network error. Please reload the page.');
    }
  }

  private handleRateLimitError(error: ErrorResponse): void {
    console.error('Rate limit exceeded:', error);
    this.showError('Too many requests. Please wait a moment and try again.');
  }

  /**
   * ========================
   * UI HELPERS
   * ========================
   */

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;

    // Auto-clear after 5 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;

    // Auto-clear after 10 seconds
    setTimeout(() => {
      this.errorMessage = null;
    }, 10000);
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}

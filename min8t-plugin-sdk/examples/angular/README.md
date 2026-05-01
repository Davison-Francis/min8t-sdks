# min8t Email Editor - Angular Integration

Complete, production-ready Angular integration example for the min8t Plugin SDK.

## Overview

This example demonstrates how to integrate the min8t email editor into an Angular application using modern **standalone components** (Angular 17+ pattern). The implementation includes:

- ✅ Full TypeScript typing with plugin SDK types
- ✅ @Input decorators for configuration
- ✅ @Output EventEmitters for save/error events
- ✅ Lifecycle hooks (ngOnInit, ngAfterViewInit, ngOnDestroy)
- ✅ ViewChild for container DOM element access
- ✅ Comprehensive error handling
- ✅ Loading and error states
- ✅ Production-ready patterns

## Prerequisites

- **Node.js**: >= 18.19.0
- **npm**: >= 10.0.0
- **Angular CLI**: >= 17.3.0

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Add Plugin SDK Script

Add the min8t Plugin SDK script to your `index.html` (before `</head>`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- min8t Plugin SDK -->
  <script src="https://plugins.min8t.com/static/latest/min8t.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

**Alternative (NPM Package - Future):**
```bash
npm install @min8t.com/plugin-sdk
```

### Step 3: Copy Component Files

Copy the following files into your Angular project:

```bash
# Copy component files
cp min8t-editor.component.ts src/app/components/
cp min8t-editor.component.html src/app/components/
cp min8t-editor.component.css src/app/components/
```

## Usage

### Basic Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { Min8tEditorComponent } from './components/min8t-editor.component';
import type { PluginSaveResponse, ErrorResponse } from '@min8t.com/plugin-sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Min8tEditorComponent],
  template: `
    <div class="container">
      <h1>Email Editor</h1>

      <app-min8t-editor
        [pluginId]="pluginId"
        [emailId]="emailId"
        [authToken]="authToken"
        [locale]="'en'"
        [theme]="'light'"
        (saveSuccess)="onSaveSuccess($event)"
        (saveError)="onSaveError($event)"
        (error)="onError($event)"
        (initialized)="onInitialized()">
      </app-min8t-editor>
    </div>
  `
})
export class AppComponent {
  pluginId = 'min8t_pk_your_plugin_id';
  emailId = 'email-template-67890';
  authToken = 'ES-PLUGIN-AUTH-TOKEN';

  onSaveSuccess(response: PluginSaveResponse) {
    console.log('Template saved successfully:', response);
    alert(`Template saved at ${response.savedAt}`);
  }

  onSaveError(error: ErrorResponse) {
    console.error('Save error:', error);
    alert(`Save failed: ${error.error}`);
  }

  onError(error: ErrorResponse) {
    console.error('Plugin error:', error);
  }

  onInitialized() {
    console.log('Editor initialized successfully');
  }
}
```

### Advanced Example with Programmatic API

```typescript
// advanced-editor.component.ts
import { Component, ViewChild } from '@angular/core';
import { Min8tEditorComponent } from './components/min8t-editor.component';

@Component({
  selector: 'app-advanced-editor',
  standalone: true,
  imports: [Min8tEditorComponent],
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button (click)="loadTemplate()">Load Template</button>
        <button (click)="saveTemplate()">Save</button>
        <button (click)="exportAsHtml()">Export HTML</button>
        <button (click)="exportAsPdf()">Export PDF</button>
        <button (click)="getContent()">Get Content</button>
      </div>

      <app-min8t-editor
        #editor
        [pluginId]="pluginId"
        [emailId]="emailId"
        [authToken]="getAuthToken"
        [locale]="'en'"
        [theme]="theme"
        [customization]="customization"
        (saveSuccess)="onSaveSuccess($event)"
        (initialized)="onEditorReady()">
      </app-min8t-editor>
    </div>
  `
})
export class AdvancedEditorComponent {
  @ViewChild('editor') editor!: Min8tEditorComponent;

  pluginId = 'min8t_pk_your_plugin_id';
  emailId = 'email-template-67890';
  theme: 'light' | 'dark' = 'light';

  customization = {
    branding: false,
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#007bff',
    features: ['editor', 'preview', 'export']
  };

  // Auth token as a function (useful for dynamic token refresh)
  getAuthToken = (): string => {
    return localStorage.getItem('authToken') || 'ES-PLUGIN-AUTH-TOKEN';
  };

  async loadTemplate() {
    const html = '<div>Sample HTML</div>';
    const css = 'div { color: red; }';

    try {
      await this.editor.setHtml(html, css);
      console.log('Template loaded successfully');
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }

  async saveTemplate() {
    try {
      const result = await this.editor.save();
      console.log('Saved:', result);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save template');
    }
  }

  async exportAsHtml() {
    try {
      const result = await this.editor.export('html');
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  async exportAsPdf() {
    try {
      const result = await this.editor.export('pdf');
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  async getContent() {
    try {
      const content = await this.editor.getHtml();
      console.log('HTML:', content.html);
      console.log('CSS:', content.css);
    } catch (error) {
      console.error('Failed to get content:', error);
    }
  }

  onSaveSuccess(response: any) {
    console.log('Auto-save successful:', response);
  }

  onEditorReady() {
    console.log('Editor is ready for use');
  }
}
```

### With Authentication Service

```typescript
// auth-integrated-editor.component.ts
import { Component, inject } from '@angular/core';
import { Min8tEditorComponent } from './components/min8t-editor.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth-editor',
  standalone: true,
  imports: [Min8tEditorComponent],
  template: `
    <app-min8t-editor
      [pluginId]="'min8t_pk_your_plugin_id'"
      [emailId]="'email-123'"
      [authToken]="getAuthToken"
      (error)="handleError($event)">
    </app-min8t-editor>
  `
})
export class AuthIntegratedEditorComponent {
  private authService = inject(AuthService);

  // Dynamic auth token with refresh logic
  getAuthToken = (): string => {
    const token = this.authService.getPluginToken();

    if (this.authService.isTokenExpired(token)) {
      // Refresh token if expired
      this.authService.refreshPluginToken();
      return this.authService.getPluginToken();
    }

    return token;
  };

  handleError(error: any) {
    if (error.errorType === 'auth') {
      // Handle authentication errors
      this.authService.logout();
      // Redirect to login
    } else {
      // Handle other errors
      console.error('Plugin error:', error);
    }
  }
}
```

## Component API

### Input Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `pluginId` | `string` | ✅ Yes | - | Plugin identifier from min8t dashboard |
| `emailId` | `string` | ✅ Yes | - | Email template identifier |
| `authToken` | `string \| () => string` | ✅ Yes | - | ES-PLUGIN-AUTH token or token provider function |
| `locale` | `string` | ❌ No | `'en'` | Locale/language code (e.g., 'en', 'es', 'fr') |
| `theme` | `'light' \| 'dark'` | ❌ No | `'light'` | UI theme preference |
| `customization` | `object` | ❌ No | `undefined` | White-label customization options |
| `baseUrl` | `string` | ❌ No | Auto-detected | Base URL for the plugin API |

### Output Events

| Event | Type | Description |
|-------|------|-------------|
| `saveSuccess` | `EventEmitter<PluginSaveResponse>` | Emitted when template is saved successfully |
| `saveError` | `EventEmitter<ErrorResponse>` | Emitted when template save fails |
| `error` | `EventEmitter<ErrorResponse>` | Emitted when any error occurs |
| `initialized` | `EventEmitter<void>` | Emitted when plugin is initialized successfully |
| `destroyed` | `EventEmitter<void>` | Emitted when plugin is destroyed |

### Public Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getHtml()` | `Promise<PluginApiResponse>` | Get current HTML and CSS from the editor |
| `setHtml(html, css)` | `Promise<void>` | Set HTML and CSS in the editor |
| `save()` | `Promise<PluginSaveResponse>` | Save the current template to the backend |
| `export(format)` | `Promise<PluginExportResponse>` | Export template in specified format (html, zip, pdf) |
| `isPluginInitialized()` | `boolean` | Check if plugin is initialized |

## TypeScript Types

All types are imported from the plugin SDK:

```typescript
import type {
  PluginConfig,
  PluginSaveResponse,
  PluginApiResponse,
  PluginExportResponse,
  ErrorResponse,
  Min8tPlugin
} from '@min8t.com/plugin-sdk';
```

### PluginSaveResponse

```typescript
interface PluginSaveResponse {
  success: boolean;
  emailId: string;
  savedAt: string; // ISO 8601 timestamp
}
```

### PluginApiResponse

```typescript
interface PluginApiResponse {
  html: string;
  css: string;
}
```

### PluginExportResponse

```typescript
interface PluginExportResponse {
  downloadUrl: string;
  expiresIn: number; // seconds
  format: 'html' | 'zip' | 'pdf';
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  errorType: 'auth' | 'network' | 'server' | 'validation' | 'rate_limit';
  isRecoverable: boolean;
}
```

## Error Handling

The component provides multiple ways to handle errors:

### 1. Event Listeners (Recommended)

```typescript
@Component({
  template: `
    <app-min8t-editor
      (saveError)="onSaveError($event)"
      (error)="onError($event)">
    </app-min8t-editor>
  `
})
export class MyComponent {
  onSaveError(error: ErrorResponse) {
    if (error.isRecoverable) {
      // Retry logic
      this.retryAfterDelay(3000);
    } else {
      // Show permanent error message
      this.showPermanentError(error.error);
    }
  }

  onError(error: ErrorResponse) {
    switch (error.errorType) {
      case 'auth':
        this.handleAuthError();
        break;
      case 'network':
        this.handleNetworkError();
        break;
      case 'rate_limit':
        this.handleRateLimitError();
        break;
      default:
        this.handleGenericError(error);
    }
  }
}
```

### 2. Try-Catch Blocks

```typescript
async saveTemplate() {
  try {
    await this.editor.save();
  } catch (error: any) {
    if (error.errorType === 'auth') {
      // Refresh auth token and retry
      await this.refreshAuthToken();
      await this.editor.save();
    } else {
      console.error('Save failed:', error);
    }
  }
}
```

## Styling

The component includes default styles in `min8t-editor.component.css`. You can customize:

### Override Component Styles

```css
/* In your global styles.css or component styles */
::ng-deep .min8t-editor-wrapper {
  border: 2px solid #007bff;
  border-radius: 12px;
}

::ng-deep .min8t-loading .spinner {
  border-top-color: #28a745;
}
```

### Custom Loading State

```typescript
// Replace the default loading template
@Component({
  template: `
    <app-min8t-editor #editor>
      <div *ngIf="editor.isLoading" class="custom-loading">
        <img src="/assets/loading.gif" alt="Loading...">
        <p>Please wait...</p>
      </div>
    </app-min8t-editor>
  `
})
```

## Testing

### Unit Test Example

```typescript
// min8t-editor.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Min8tEditorComponent } from './min8t-editor.component';

describe('Min8tEditorComponent', () => {
  let component: Min8tEditorComponent;
  let fixture: ComponentFixture<Min8tEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Min8tEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Min8tEditorComponent);
    component = fixture.componentInstance;

    // Set required inputs
    component.pluginId = 'min8t_pk_test';
    component.emailId = 'test-email-id';
    component.authToken = 'test-auth-token';

    // Mock window.min8t
    (window as any).min8t = {
      init: jasmine.createSpy('init').and.returnValue(Promise.resolve()),
      isInitialized: jasmine.createSpy('isInitialized').and.returnValue(true),
      destroy: jasmine.createSpy('destroy')
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize plugin on ngAfterViewInit', async () => {
    await component.ngAfterViewInit();
    expect((window as any).min8t.init).toHaveBeenCalled();
  });

  it('should emit initialized event after successful init', async () => {
    spyOn(component.initialized, 'emit');
    await component.ngAfterViewInit();
    expect(component.initialized.emit).toHaveBeenCalled();
  });

  it('should call destroy on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect((window as any).min8t.destroy).toHaveBeenCalled();
  });
});
```

## Common Issues

### Issue 1: "window.min8t is undefined"

**Solution:** Ensure the plugin SDK script is loaded before Angular bootstraps.

```html
<!-- index.html - Must be in <head> -->
<script src="https://plugins.min8t.com/static/latest/min8t.js"></script>
```

### Issue 2: ViewChild is undefined in ngOnInit

**Solution:** Access ViewChild in `ngAfterViewInit`, not `ngOnInit`.

```typescript
// ❌ Wrong
ngOnInit() {
  console.log(this.editorContainer); // undefined
}

// ✅ Correct
ngAfterViewInit() {
  console.log(this.editorContainer); // ElementRef
}
```

### Issue 3: "Plugin not initialized" error

**Solution:** Wait for the `initialized` event before calling API methods.

```typescript
@Component({
  template: `
    <app-min8t-editor
      #editor
      (initialized)="onReady()">
    </app-min8t-editor>
  `
})
export class MyComponent {
  @ViewChild('editor') editor!: Min8tEditorComponent;

  async onReady() {
    // Now safe to call API methods
    const content = await this.editor.getHtml();
  }
}
```

### Issue 4: Auth token refresh

**Solution:** Use a function for `authToken` to dynamically provide the token.

```typescript
@Component({
  template: `
    <app-min8t-editor
      [authToken]="getAuthToken">
    </app-min8t-editor>
  `
})
export class MyComponent {
  getAuthToken = (): string => {
    // Dynamically get fresh token
    return this.authService.getPluginToken();
  };
}
```

## Production Deployment

### 1. Build for Production

```bash
ng build --configuration production
```

### 2. Environment-Specific Configuration

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  pluginApiUrl: 'https://plugins.min8t.com',
  pluginId: 'min8t_pk_prod_your_plugin_id'
};

// Use in component
import { environment } from '../environments/environment';

@Component({
  template: `
    <app-min8t-editor
      [pluginId]="environment.pluginId"
      [baseUrl]="environment.pluginApiUrl">
    </app-min8t-editor>
  `
})
export class MyComponent {
  environment = environment;
}
```

### 3. Performance Optimization

```typescript
// Lazy load the editor component
const routes: Routes = [
  {
    path: 'editor',
    loadComponent: () =>
      import('./components/min8t-editor.component').then(
        (m) => m.Min8tEditorComponent
      )
  }
];
```

### 4. Error Monitoring

```typescript
// Integrate with Sentry or similar
import * as Sentry from '@sentry/angular';

@Component({
  template: `
    <app-min8t-editor
      (error)="logError($event)">
    </app-min8t-editor>
  `
})
export class MyComponent {
  logError(error: ErrorResponse) {
    Sentry.captureException(error, {
      tags: {
        component: 'min8t-editor',
        errorType: error.errorType
      }
    });
  }
}
```

## Browser Support

- Chrome/Edge: >= 90
- Firefox: >= 88
- Safari: >= 14
- Mobile browsers: iOS Safari >= 14, Chrome Android >= 90

## Resources

- **Plugin SDK Documentation**: [https://docs.min8t.com/plugin-sdk](https://docs.min8t.com/plugin-sdk)
- **Angular Documentation**: [https://angular.dev](https://angular.dev)
- **GitHub Repository**: [https://github.com/min8t/plugin-sdk](https://github.com/min8t/plugin-sdk)
- **Support**: support@min8t.com

## License

MIT

## Changelog

### v1.0.0 (2025-10-25)

- ✅ Initial release
- ✅ Standalone component (Angular 17+ pattern)
- ✅ Full TypeScript typing
- ✅ Comprehensive error handling
- ✅ Loading and error states
- ✅ Production-ready patterns
- ✅ Complete documentation

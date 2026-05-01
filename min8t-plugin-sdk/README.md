# @min8t.com/plugin-sdk

Embed the MiN8T email editor in any web application. Framework-agnostic — works with React, Vue, Angular, or vanilla JavaScript.

## Install

```bash
npm install @min8t.com/plugin-sdk
```

Or via CDN:

```html
<script src="https://plugins.min8t.com/sdk/min8t.js"></script>
```

## Quick Start

```javascript
import min8t from '@min8t.com/plugin-sdk';

await min8t.init({
  settingsId: 'YOUR_SETTINGS_ID',
  apiRequestData: { emailId: 'email-123' },
  getAuthToken: () => sessionStorage.getItem('plugin-token'),
});
```

## TypeScript

Full type definitions are included. No `@types` package needed.

```typescript
import min8t, { PluginConfig, PluginApiResponse } from '@min8t.com/plugin-sdk';
```

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `init(config)` | `Promise<void>` | Initialize the editor |
| `getHtml()` | `Promise<{ html, css }>` | Get current template HTML/CSS |
| `setHtml(html, css)` | `Promise<void>` | Load HTML/CSS into editor |
| `save()` | `Promise<SaveResponse>` | Save template to backend |
| `export(format)` | `Promise<ExportResponse>` | Export as `html`, `zip`, or `pdf` |
| `compile()` | `Promise<CompileResponse>` | Compile with minification |
| `preview(device?)` | `Promise<PreviewResponse>` | Generate preview URL |
| `destroy()` | `void` | Clean up resources |
| `on(event, cb)` | `void` | Listen for SDK events |

## Events

```javascript
min8t.on('ready', () => console.log('Editor loaded'));
min8t.on('save', (data) => console.log('Saved:', data));
min8t.on('error', (err) => console.error(err));
min8t.on('authExpired', () => { /* refresh token */ });
```

## Bundle Size

- **Raw:** 10.31 KB
- **Gzipped:** 3.40 KB
- **Brotli:** 2.94 KB

## Documentation

Full SDK documentation, framework guides, and API reference:
https://app.min8t.com/developer-tools/docs/sdk

## License

Proprietary - see LICENSE for details.

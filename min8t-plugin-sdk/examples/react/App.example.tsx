/**
 * min8tEmail Plugin SDK - Example React Application
 *
 * Complete example application demonstrating how to integrate the min8t
 * email editor into a React application with all plugin API methods.
 *
 * @packageDocumentation
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 *
 * **Features:**
 * - Component integration example
 * - All plugin API methods demonstrated
 * - Save, export, getHtml, setHtml examples
 * - Error handling
 * - Loading states
 * - User-friendly UI
 */

import React, { useRef, useState } from 'react';
import { Min8tEditorWithRef, Min8tEditorHandle } from './Min8tEditor';
import { Min8tEditorWithErrorBoundary } from './Min8tEditorWithErrorBoundary';
import type { PluginSaveResponse, ErrorResponse } from '../../dist/index.d';

/**
 * Example Application Component
 *
 * Demonstrates how to use the Min8tEditor component in a real application
 */
const App: React.FC = () => {
  // Ref to access plugin methods imperatively
  const editorRef = useRef<Min8tEditorHandle>(null);

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handle Save Button Click
   *
   * Calls the plugin's save() method via the ref
   */
  const handleSave = async () => {
    if (!editorRef.current) {
      console.error('Editor not initialized');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      setErrorMessage(null);

      const result = await editorRef.current.save();

      setSaveMessage(
        `Template saved successfully! Email ID: ${result.emailId}, Saved at: ${result.savedAt}`
      );

      console.log('Save result:', result);
    } catch (error: any) {
      console.error('Save failed:', error);
      setErrorMessage(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle Export Button Click
   *
   * Exports the template in the specified format and triggers download
   */
  const handleExport = async (format: 'html' | 'zip' | 'pdf') => {
    if (!editorRef.current) {
      console.error('Editor not initialized');
      return;
    }

    try {
      setIsExporting(true);
      setSaveMessage(null);
      setErrorMessage(null);

      const result = await editorRef.current.export(format);

      // Open download URL in new tab
      window.open(result.downloadUrl, '_blank');

      setSaveMessage(
        `Template exported as ${format.toUpperCase()}. Download will expire in ${result.expiresIn} seconds.`
      );

      console.log('Export result:', result);
    } catch (error: any) {
      console.error('Export failed:', error);
      setErrorMessage(error.message || `Failed to export template as ${format}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle Get HTML Button Click
   *
   * Retrieves current HTML/CSS from the editor
   */
  const handleGetHtml = async () => {
    if (!editorRef.current) {
      console.error('Editor not initialized');
      return;
    }

    try {
      const { html, css } = await editorRef.current.getHtml();

      console.log('HTML/CSS retrieved:', {
        htmlLength: html.length,
        cssLength: css.length,
        html: html.substring(0, 200) + '...',
        css: css.substring(0, 200) + '...'
      });

      alert(
        `HTML/CSS Retrieved!\n\nHTML length: ${html.length} chars\nCSS length: ${css.length} chars\n\nCheck console for full output.`
      );
    } catch (error: any) {
      console.error('getHtml failed:', error);
      setErrorMessage(error.message || 'Failed to get HTML/CSS');
    }
  };

  /**
   * Handle Set HTML Button Click
   *
   * Sets custom HTML/CSS in the editor (for demonstration)
   */
  const handleSetHtml = async () => {
    if (!editorRef.current) {
      console.error('Editor not initialized');
      return;
    }

    const sampleHtml = `
      <div style="padding: 20px; text-align: center;">
        <h1>Sample Email Template</h1>
        <p>This HTML was set programmatically via setHtml() method.</p>
      </div>
    `;

    const sampleCss = `
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
      }
      h1 {
        color: #3498db;
      }
    `;

    try {
      await editorRef.current.setHtml(sampleHtml, sampleCss);

      alert('Sample HTML/CSS has been set in the editor!');
    } catch (error: any) {
      console.error('setHtml failed:', error);
      setErrorMessage(error.message || 'Failed to set HTML/CSS');
    }
  };

  /**
   * Handle Plugin Save Callback
   *
   * Called automatically when the plugin's save() method succeeds
   */
  const handlePluginSave = (result: PluginSaveResponse) => {
    console.log('[App] Plugin save callback triggered:', result);
  };

  /**
   * Handle Plugin Error Callback
   *
   * Called automatically when the plugin encounters an error
   */
  const handlePluginError = (error: ErrorResponse | Error) => {
    console.error('[App] Plugin error callback triggered:', error);
    const message = error instanceof Error ? error.message : error.error;
    setErrorMessage(message);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px' }}>min8t Email Editor - React Example</h1>
        <p style={{ margin: 0, color: '#666' }}>
          Demonstrating complete plugin integration with all API methods
        </p>
      </header>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '10px 20px',
            backgroundColor: isSaving ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isSaving ? 'Saving...' : '💾 Save Template'}
        </button>

        <button
          onClick={handleGetHtml}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📄 Get HTML/CSS
        </button>

        <button
          onClick={handleSetHtml}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ✏️ Set Sample HTML
        </button>

        <button
          onClick={() => handleExport('html')}
          disabled={isExporting}
          style={{
            padding: '10px 20px',
            backgroundColor: isExporting ? '#95a5a6' : '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isExporting ? 'Exporting...' : '📥 Export HTML'}
        </button>

        <button
          onClick={() => handleExport('zip')}
          disabled={isExporting}
          style={{
            padding: '10px 20px',
            backgroundColor: isExporting ? '#95a5a6' : '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isExporting ? 'Exporting...' : '📦 Export ZIP'}
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          style={{
            padding: '10px 20px',
            backgroundColor: isExporting ? '#95a5a6' : '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isExporting ? 'Exporting...' : '📑 Export PDF'}
        </button>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '16px'
          }}
        >
          ✅ {saveMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '16px'
          }}
        >
          ❌ {errorMessage}
        </div>
      )}

      {/* Plugin Editor Component */}
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {/*
          OPTION 1: Using Min8tEditorWithRef for imperative API access
          This allows calling plugin methods via ref (recommended for complex apps)
        */}
        <Min8tEditorWithRef
          ref={editorRef}
          pluginId="min8t_pk_demo_plugin"
          emailId="demo-email-123"
          authToken="your-es-plugin-auth-token-here"
          locale="en"
          theme="light"
          onSave={handlePluginSave}
          onError={handlePluginError}
          onInitialized={() => console.log('[App] Plugin initialized!')}
          style={{ height: '700px' }}
        />

        {/*
          OPTION 2: Using Min8tEditorWithErrorBoundary for graceful error handling
          This prevents the entire app from crashing if the plugin fails

          Uncomment to use this version instead:

          <Min8tEditorWithErrorBoundary
            pluginId="min8t_pk_demo_plugin"
            emailId="demo-email-123"
            authToken="your-es-plugin-auth-token-here"
            locale="en"
            theme="light"
            onSave={handlePluginSave}
            onError={handlePluginError}
            style={{ height: '700px' }}
          />
        */}
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #ddd',
          color: '#666',
          fontSize: '14px'
        }}
      >
        <p style={{ margin: 0 }}>
          💡 <strong>Tip:</strong> Open the browser console to see detailed logs
          of all plugin operations.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          📚 <strong>Documentation:</strong>{' '}
          <a
            href="/frontend/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Plugin SDK README
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;

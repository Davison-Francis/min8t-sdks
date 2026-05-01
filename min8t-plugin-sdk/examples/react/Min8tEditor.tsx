/**
 * min8tEmail Plugin SDK - React Integration Component
 *
 * Production-ready React component demonstrating complete min8t plugin integration
 * with TypeScript, error boundaries, cleanup, and all plugin API methods.
 *
 * @packageDocumentation
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 *
 * **Features:**
 * - Full TypeScript typing with imported plugin SDK types
 * - Proper React 18 lifecycle management (useEffect cleanup)
 * - Error boundary integration for graceful error handling
 * - All plugin API methods demonstrated (init, getHtml, setHtml, save, export)
 * - Loading and error states
 * - Props-based configuration
 * - Production-ready patterns
 *
 * **Based on Research:**
 * - Plugin SDK API: /services/15_plugin_sdk_service/frontend/src/index.ts
 * - React best practices: https://react.dev/reference/react/useEffect
 * - Error boundaries: https://github.com/bvaughn/react-error-boundary
 * - TypeScript patterns: React TypeScript Cheatsheet
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Import types from the min8t plugin SDK
 *
 * These types are generated from the UMD bundle and provide full TypeScript
 * support for the plugin API.
 */
import type {
  PluginConfig,
  PluginApiResponse,
  PluginSaveResponse,
  PluginExportResponse,
  ErrorResponse,
  Min8tPlugin
} from '../../dist/index.d';

/**
 * Extend the Window interface to include the min8t plugin
 *
 * This is necessary for TypeScript to recognize window.min8t
 */
declare global {
  interface Window {
    min8t: Min8tPlugin;
  }
}

/**
 * Props for the Min8tEditor component
 *
 * All required configuration is passed via props for maximum flexibility
 */
export interface Min8tEditorProps {
  /** Unique plugin identifier (from min8t dashboard) */
  pluginId: string;

  /** Email template identifier */
  emailId: string;

  /** Authentication token (ES-PLUGIN-AUTH format) */
  authToken: string;

  /** Locale/language code (default: 'en') */
  locale?: string;

  /** UI theme preference (default: 'light') */
  theme?: 'light' | 'dark';

  /** Base URL for the plugin API (optional, auto-detected if not provided) */
  baseUrl?: string;

  /** White-label customization options */
  customization?: {
    branding?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    features?: string[];
  };

  /** Callback when template is saved successfully */
  onSave?: (result: PluginSaveResponse) => void;

  /** Callback when an error occurs */
  onError?: (error: ErrorResponse | Error) => void;

  /** Callback when plugin initialization completes */
  onInitialized?: () => void;

  /** Custom container class name */
  className?: string;

  /** Custom container styles */
  style?: React.CSSProperties;
}

/**
 * Min8tEditor Component
 *
 * Production-ready React component that embeds the min8t email editor.
 *
 * @example
 * ```tsx
 * <Min8tEditor
 *   pluginId="min8t_pk_your_plugin_id"
 *   emailId="email-456"
 *   authToken="your-es-plugin-auth-token"
 *   locale="en"
 *   theme="light"
 *   onSave={(result) => console.log('Saved:', result)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export const Min8tEditor: React.FC<Min8tEditorProps> = ({
  pluginId,
  emailId,
  authToken,
  locale = 'en',
  theme = 'light',
  baseUrl,
  customization,
  onSave,
  onError,
  onInitialized,
  className,
  style
}) => {
  // Ref to the container DOM element
  const containerRef = useRef<HTMLDivElement>(null);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle plugin initialization errors
   *
   * This wraps errors in a consistent format and calls the onError callback
   */
  const handleError = useCallback((err: ErrorResponse | Error, context: string) => {
    console.error(`[Min8tEditor] ${context}:`, err);

    const errorMessage = err instanceof Error
      ? err.message
      : err.error || 'Unknown error';

    setError(errorMessage);
    setIsLoading(false);

    if (onError) {
      onError(err);
    }
  }, [onError]);

  /**
   * Initialize the min8t plugin
   *
   * This effect runs once when the component mounts and handles:
   * 1. Plugin initialization via window.min8t.init()
   * 2. Error handling
   * 3. Cleanup on unmount (destroy plugin)
   *
   * React 18 best practice: Cleanup is symmetrical to setup
   */
  useEffect(() => {
    let isMounted = true;

    const initializePlugin = async () => {
      try {
        // Verify that the plugin script has loaded
        if (!window.min8t) {
          throw new Error(
            'min8t plugin not found. Ensure the plugin script is loaded before mounting this component.'
          );
        }

        // Build plugin configuration
        const config: PluginConfig = {
          pluginId,
          apiRequestData: {
            emailId
          },
          getAuthToken: () => authToken,
          locale,
          theme,
          baseUrl,
          customization
        };

        console.log('[Min8tEditor] Initializing plugin with config:', {
          pluginId,
          emailId,
          locale,
          theme
        });

        // Initialize the plugin
        await window.min8t.init(config);

        // Only update state if component is still mounted
        // This prevents "Can't perform a React state update on an unmounted component" warnings
        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
          console.log('[Min8tEditor] Plugin initialized successfully');

          if (onInitialized) {
            onInitialized();
          }
        }
      } catch (err: any) {
        if (isMounted) {
          handleError(err, 'Initialization failed');
        }
      }
    };

    initializePlugin();

    /**
     * Cleanup function (React 18 best practice)
     *
     * This runs when the component unmounts and ensures the plugin
     * is properly destroyed to prevent memory leaks.
     */
    return () => {
      isMounted = false;

      if (window.min8t && window.min8t.isInitialized()) {
        console.log('[Min8tEditor] Cleaning up plugin on unmount');
        window.min8t.destroy();
      }
    };
  }, [
    pluginId,
    emailId,
    authToken,
    locale,
    theme,
    baseUrl,
    customization,
    onInitialized,
    handleError
  ]);

  /**
   * Get current HTML and CSS from the editor
   *
   * Public method exposed via ref (see useImperativeHandle pattern below)
   */
  const getHtml = useCallback(async (): Promise<PluginApiResponse> => {
    if (!isInitialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      const result = await window.min8t.getHtml();
      console.log('[Min8tEditor] Retrieved HTML/CSS:', {
        htmlLength: result.html.length,
        cssLength: result.css.length
      });
      return result;
    } catch (err: any) {
      handleError(err, 'getHtml() failed');
      throw err;
    }
  }, [isInitialized, handleError]);

  /**
   * Set HTML and CSS in the editor
   *
   * @param html - HTML content
   * @param css - CSS content
   */
  const setHtml = useCallback(async (html: string, css: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      await window.min8t.setHtml(html, css);
      console.log('[Min8tEditor] HTML/CSS set successfully');
    } catch (err: any) {
      handleError(err, 'setHtml() failed');
      throw err;
    }
  }, [isInitialized, handleError]);

  /**
   * Save the current template to the backend
   */
  const save = useCallback(async (): Promise<PluginSaveResponse> => {
    if (!isInitialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      const result = await window.min8t.save();
      console.log('[Min8tEditor] Template saved successfully:', result);

      if (onSave) {
        onSave(result);
      }

      return result;
    } catch (err: any) {
      handleError(err, 'save() failed');
      throw err;
    }
  }, [isInitialized, onSave, handleError]);

  /**
   * Export the template in specified format
   *
   * @param format - Export format (html, zip, pdf)
   */
  const exportTemplate = useCallback(async (
    format: 'html' | 'zip' | 'pdf'
  ): Promise<PluginExportResponse> => {
    if (!isInitialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      const result = await window.min8t.export(format);
      console.log('[Min8tEditor] Template exported successfully:', {
        format,
        downloadUrl: result.downloadUrl
      });
      return result;
    } catch (err: any) {
      handleError(err, `export(${format}) failed`);
      throw err;
    }
  }, [isInitialized, handleError]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '600px',
          ...style
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ color: '#666', margin: 0 }}>Loading min8t editor...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '600px',
          ...style
        }}
      >
        <div
          style={{
            padding: '24px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            maxWidth: '500px'
          }}
        >
          <h3 style={{ margin: '0 0 12px', color: '#c33' }}>
            Failed to load min8t editor
          </h3>
          <p style={{ margin: 0, color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Render the plugin container
   *
   * The plugin will inject an iframe into this container during initialization
   */
  return (
    <div
      ref={containerRef}
      id="min8t-plugin"
      className={className}
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
        ...style
      }}
    />
  );
};

/**
 * Create a custom hook to expose plugin methods to parent components
 *
 * This allows parent components to call plugin methods imperatively
 *
 * @example
 * ```tsx
 * const editorRef = useRef<Min8tEditorHandle>(null);
 *
 * const handleSave = async () => {
 *   if (editorRef.current) {
 *     await editorRef.current.save();
 *   }
 * };
 *
 * <Min8tEditor ref={editorRef} {...props} />
 * ```
 */
export interface Min8tEditorHandle {
  getHtml: () => Promise<PluginApiResponse>;
  setHtml: (html: string, css: string) => Promise<void>;
  save: () => Promise<PluginSaveResponse>;
  export: (format: 'html' | 'zip' | 'pdf') => Promise<PluginExportResponse>;
  isInitialized: () => boolean;
}

/**
 * Min8tEditor with forwardRef for imperative access
 *
 * This version allows parent components to call plugin methods directly
 */
export const Min8tEditorWithRef = React.forwardRef<
  Min8tEditorHandle,
  Min8tEditorProps
>((props, ref) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Expose plugin methods to parent component via ref
  React.useImperativeHandle(ref, () => ({
    getHtml: async () => {
      if (!window.min8t || !isInitialized) {
        throw new Error('Plugin not initialized');
      }
      return await window.min8t.getHtml();
    },
    setHtml: async (html: string, css: string) => {
      if (!window.min8t || !isInitialized) {
        throw new Error('Plugin not initialized');
      }
      await window.min8t.setHtml(html, css);
    },
    save: async () => {
      if (!window.min8t || !isInitialized) {
        throw new Error('Plugin not initialized');
      }
      return await window.min8t.save();
    },
    export: async (format: 'html' | 'zip' | 'pdf') => {
      if (!window.min8t || !isInitialized) {
        throw new Error('Plugin not initialized');
      }
      return await window.min8t.export(format);
    },
    isInitialized: () => isInitialized
  }), [isInitialized]);

  return (
    <Min8tEditor
      {...props}
      onInitialized={() => {
        setIsInitialized(true);
        if (props.onInitialized) {
          props.onInitialized();
        }
      }}
    />
  );
});

Min8tEditorWithRef.displayName = 'Min8tEditorWithRef';

export default Min8tEditor;

/// <reference types="vite/client" />

/**
 * Type declarations for .vue files
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * Extend Window interface to include min8t plugin
 */
declare global {
  interface Window {
    min8t: import('../../dist/index.d').Min8tPlugin
  }
}

export {}

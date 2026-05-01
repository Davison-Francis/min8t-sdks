/**
 * Web Vitals Monitoring
 * Real User Monitoring (RUM) for Core Web Vitals
 *
 * Metrics Collected:
 * - LCP (Largest Contentful Paint) - Target: < 2.5s
 * - FID (First Input Delay) - Target: < 100ms
 * - CLS (Cumulative Layout Shift) - Target: < 0.1
 * - TTFB (Time to First Byte) - Target: < 600ms
 * - FCP (First Contentful Paint) - Target: < 1.8s
 * - INP (Interaction to Next Paint) - Target: < 200ms
 *
 * Research Sources:
 * - Web.dev Core Web Vitals: https://web.dev/vitals/
 * - Google Web Vitals Thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
 * - web-vitals npm package: https://github.com/GoogleChrome/web-vitals
 * - Real User Monitoring Best Practices: https://web.dev/vitals-measurement-getting-started/
 *
 * Thresholds:
 * - Good: LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1, TTFB ≤ 600ms, FCP ≤ 1.8s, INP ≤ 200ms
 * - Needs Improvement: 2.5s < LCP ≤ 4s, 100ms < FID ≤ 300ms, 0.1 < CLS ≤ 0.25, etc.
 * - Poor: LCP > 4s, FID > 300ms, CLS > 0.25, TTFB > 1.8s, FCP > 3s, INP > 500ms
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

interface WebVitalsConfig {
  endpoint: string;
  batchSize: number;
  batchInterval: number; // milliseconds
  sendImmediately: boolean;
  debug: boolean;
}

interface WebVitalsPayload {
  metrics: Array<{
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    navigationType: string;
  }>;
  context: {
    browser: string;
    browserVersion: string;
    country?: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    connectionType?: string;
    url: string;
    timestamp: number;
  };
}

class WebVitalsMonitor {
  private config: WebVitalsConfig;
  private metricsBuffer: WebVitalsPayload['metrics'] = [];
  private batchTimer: number | null = null;
  private context: WebVitalsPayload['context'];

  constructor(config: Partial<WebVitalsConfig> = {}) {
    this.config = {
      endpoint: config.endpoint || '/api/metrics/web-vitals',
      batchSize: config.batchSize || 10,
      batchInterval: config.batchInterval || 30000, // 30 seconds
      sendImmediately: config.sendImmediately || false,
      debug: config.debug || false
    };

    // Collect context information
    this.context = this.collectContext();

    // Initialize Web Vitals listeners
    this.initializeListeners();

    // Start batch timer
    this.startBatchTimer();

    // Send metrics before page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Fallback for older browsers
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    this.log('Web Vitals monitoring initialized');
  }

  /**
   * Collect browser and device context
   */
  private collectContext(): WebVitalsPayload['context'] {
    const ua = navigator.userAgent;
    const browser = this.detectBrowser(ua);
    const deviceType = this.detectDeviceType(ua);
    const connection = this.getConnectionInfo();

    return {
      browser: browser.name,
      browserVersion: browser.version,
      deviceType,
      connectionType: connection,
      url: window.location.href,
      timestamp: Date.now(),
      // Country will be determined server-side from IP (GeoIP)
      country: undefined
    };
  }

  /**
   * Detect browser from user agent
   */
  private detectBrowser(ua: string): { name: string; version: string } {
    let name = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edg')) {
      name = 'Edge';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      name = 'IE';
      const match = ua.match(/(?:MSIE |rv:)(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return { name, version };
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get connection information (if available)
   */
  private getConnectionInfo(): string | undefined {
    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection && connection.effectiveType) {
      return connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
    }

    return undefined;
  }

  /**
   * Initialize Web Vitals listeners
   */
  private initializeListeners(): void {
    // LCP - Largest Contentful Paint
    onLCP((metric) => this.handleMetric(metric), { reportAllChanges: false });

    // FID - First Input Delay (deprecated but still supported)
    onFID((metric) => this.handleMetric(metric), { reportAllChanges: false });

    // CLS - Cumulative Layout Shift
    onCLS((metric) => this.handleMetric(metric), { reportAllChanges: false });

    // TTFB - Time to First Byte
    onTTFB((metric) => this.handleMetric(metric), { reportAllChanges: false });

    // FCP - First Contentful Paint
    onFCP((metric) => this.handleMetric(metric), { reportAllChanges: false });

    // INP - Interaction to Next Paint (replaces FID)
    onINP((metric) => this.handleMetric(metric), { reportAllChanges: false });
  }

  /**
   * Handle individual metric
   */
  private handleMetric(metric: Metric): void {
    const rating = this.getRating(metric.name, metric.value);

    const metricData = {
      name: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType
    };

    this.log(`${metric.name}: ${metric.value.toFixed(2)} (${rating})`);

    // Add to buffer
    this.metricsBuffer.push(metricData);

    // Send immediately if configured or buffer is full
    if (this.config.sendImmediately || this.metricsBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Get rating based on metric name and value
   * Based on Google's Web Vitals thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],      // ms
      FID: [100, 300],        // ms
      CLS: [0.1, 0.25],       // score
      TTFB: [600, 1800],      // ms
      FCP: [1800, 3000],      // ms
      INP: [200, 500]         // ms
    };

    const [good, poor] = thresholds[name] || [0, 0];

    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Start batch timer
   */
  private startBatchTimer(): void {
    if (this.batchTimer !== null) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = window.setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flush();
      }
    }, this.config.batchInterval);
  }

  /**
   * Send buffered metrics to backend
   */
  private flush(): void {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    const payload: WebVitalsPayload = {
      metrics: [...this.metricsBuffer],
      context: {
        ...this.context,
        timestamp: Date.now()
      }
    };

    // Clear buffer
    this.metricsBuffer = [];

    // Send with sendBeacon (preferred for page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const sent = navigator.sendBeacon(this.config.endpoint, blob);

      if (!sent) {
        this.log('sendBeacon failed, falling back to fetch');
        this.sendWithFetch(payload);
      } else {
        this.log(`Sent ${payload.metrics.length} metrics via sendBeacon`);
      }
    } else {
      this.sendWithFetch(payload);
    }
  }

  /**
   * Send metrics using fetch (fallback)
   */
  private async sendWithFetch(payload: WebVitalsPayload): Promise<void> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true // Important for requests sent during page unload
      });

      if (!response.ok) {
        this.log(`Failed to send metrics: ${response.status} ${response.statusText}`);
      } else {
        this.log(`Sent ${payload.metrics.length} metrics via fetch`);
      }
    } catch (error) {
      this.log('Error sending metrics:', error);
    }
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebVitals]', ...args);
    }
  }

  /**
   * Manually trigger flush
   */
  public forceFlush(): void {
    this.flush();
  }

  /**
   * Stop monitoring and clean up
   */
  public destroy(): void {
    if (this.batchTimer !== null) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Send remaining metrics
    this.flush();

    this.log('Web Vitals monitoring stopped');
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this from your main app entry point
 *
 * @example
 * ```typescript
 * import { initWebVitals } from './monitoring/webVitals';
 *
 * initWebVitals({
 *   endpoint: '/api/metrics/web-vitals',
 *   debug: process.env.NODE_ENV !== 'production'
 * });
 * ```
 */
export function initWebVitals(config?: Partial<WebVitalsConfig>): WebVitalsMonitor {
  return new WebVitalsMonitor(config);
}

// Export for manual usage
export { WebVitalsMonitor };
export type { WebVitalsConfig, WebVitalsPayload };

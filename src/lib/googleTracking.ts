interface GoogleTrackingConfig {
  google_ads_conversion_id: string;
  ga4_measurement_id: string;
  conversion_action_id: string;
  is_enabled: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

let isInitialized = false;
let currentConfig: GoogleTrackingConfig | null = null;
const trackedEvents = new Set<string>();

export async function initializeGoogleTracking(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const response = await fetch('/api/google-tracking');
    const data = await response.json();

    if (!data.success || !data.config || !data.config.is_enabled) {
      console.log('[Google Tracking] Tracking is disabled or not configured');
      return;
    }

    currentConfig = data.config;

    if (currentConfig.ga4_measurement_id) {
      await loadGA4Script(currentConfig.ga4_measurement_id);
      console.log('[Google Tracking] GA4 initialized:', currentConfig.ga4_measurement_id);
    }

    if (currentConfig.google_ads_conversion_id) {
      await loadGoogleAdsScript(currentConfig.google_ads_conversion_id);
      console.log('[Google Tracking] Google Ads initialized:', currentConfig.google_ads_conversion_id);
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Google Tracking] Failed to initialize:', error);
  }
}

function loadGA4Script(measurementId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
      console.log('[Google Tracking] GA4 script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('[Google Tracking] Failed to load GA4 script:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

function loadGoogleAdsScript(conversionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', conversionId);
        console.log('[Google Tracking] Google Ads script loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('[Google Tracking] Failed to load Google Ads script:', error);
        reject(error);
      };
      document.head.appendChild(script);
    } else {
      window.gtag('config', conversionId);
      console.log('[Google Tracking] Google Ads configured using existing gtag');
      resolve();
    }
  });
}

export function trackConversion(): void {
  if (!isInitialized || !currentConfig) {
    console.warn('[Google Tracking] Tracking not initialized');
    return;
  }

  try {
    if (currentConfig.conversion_action_id && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: currentConfig.conversion_action_id,
      });
      console.log('[Google Tracking] Conversion tracked:', currentConfig.conversion_action_id);
    }

    if (currentConfig.ga4_measurement_id && window.gtag) {
      window.gtag('event', 'line_conversion', {
        event_category: 'engagement',
        event_label: 'LINE CTA Click',
      });
      console.log('[Google Tracking] GA4 event tracked: line_conversion');
    }
  } catch (error) {
    console.error('[Google Tracking] Failed to track conversion:', error);
  }
}

export function trackPageView(pagePath?: string): void {
  if (!isInitialized || !window.gtag) {
    return;
  }

  try {
    if (currentConfig?.ga4_measurement_id) {
      window.gtag('config', currentConfig.ga4_measurement_id, {
        page_path: pagePath || window.location.pathname,
      });
      console.log('[Google Tracking] Page view tracked:', pagePath || window.location.pathname);
    }
  } catch (error) {
    console.error('[Google Tracking] Failed to track page view:', error);
  }
}

export function trackEvent(eventName: string, parameters?: Record<string, any>): void {
  if (!isInitialized || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', eventName, parameters);
    console.log('[Google Tracking] Event tracked:', eventName, parameters);
  } catch (error) {
    console.error('[Google Tracking] Failed to track event:', error);
  }
}

export function trackDiagnosisButtonClick(): void {
  if (!isInitialized || !window.gtag) {
    console.warn('[Google Tracking] Tracking not initialized');
    return;
  }

  try {
    window.gtag('event', 'Bdd');
    console.log('[Google Tracking] Diagnosis button click tracked: Bdd');
  } catch (error) {
    console.error('[Google Tracking] Failed to track diagnosis button click:', error);
  }
}

export function trackConversionButtonClick(): void {
  if (!isInitialized || !window.gtag) {
    console.warn('[Google Tracking] Tracking not initialized');
    return;
  }

  try {
    window.gtag('event', 'Add');
    console.log('[Google Tracking] Conversion button click tracked: Add');
  } catch (error) {
    console.error('[Google Tracking] Failed to track conversion button click:', error);
  }
}

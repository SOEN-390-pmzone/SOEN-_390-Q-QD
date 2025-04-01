import * as Sentry from '@sentry/react-native';

/**
 * Measures WebView load performance and reports it to Sentry
 * @param {Object} event - The WebView load event
 * @param {string} [viewName='WebView'] - Optional name to identify the specific WebView
 */
export const measureWebViewPerformance = (event, viewName = 'WebView') => {
  try {
    // Safely extract load time, with fallback
    const loadTime = event?.nativeEvent?.timing?.domLoaded || 0;
    
    if (loadTime <= 0) {
      console.log(`${viewName} load time unavailable`);
      return;
    }
    
    // Try to add breadcrumb if Sentry is available
    try {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${viewName} loaded in ${loadTime}ms`,
        data: {
          viewName,
          loadTime,
          url: event?.nativeEvent?.url || 'unknown'
        }
      });
    } catch (e) {
      console.log("Unable to add Sentry breadcrumb:", e.message);
    }
    
    // Use new API to record measurements
    try {
      Sentry.startInactiveSpan({
        name: `${viewName} Load`,
        op: 'webview.load',
        attributes: {
          loadTime,
          url: event?.nativeEvent?.url || 'unknown'
        }
      }).end();
      
      // Set measurement using the new API
      Sentry.setMeasurement(
        `webview_${viewName.toLowerCase().replace(/\s+/g, '_')}_load_time`,
        loadTime,
        'millisecond'
      );
    } catch (e) {
      console.log("Unable to set Sentry measurement:", e.message);
    }
    
    console.log(`${viewName} loaded in ${loadTime}ms`);
  } catch (error) {
    console.log("Performance monitoring failed:", error.message);
  }
};
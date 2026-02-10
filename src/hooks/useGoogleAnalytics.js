import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    
    // Skip if no measurement ID configured
    if (!measurementId || measurementId === 'your-google-analytics-id-here') {
      return;
    }

    // Initialize GA4 script if not already loaded
    if (!window.dataLayer) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head?.appendChild(script);

      window.dataLayer = [];
      function gtag(...args) {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', measurementId, {
        send_page_view: false // We'll manually track page views
      });
    }

    // Track page view on route change
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: location?.pathname + location?.search,
        page_title: document.title,
      });
    }
  }, [location]);
}

export default useGoogleAnalytics;
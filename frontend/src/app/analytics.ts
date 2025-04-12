// Google Analytics tracking functions
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined') {
    const win = window as Window & { gtag?: (command: string, target: string, params?: object) => void };
    if (win.gtag) {
      const consent = localStorage.getItem('cookieConsent');
      // Only track if consent has been explicitly granted
      if (consent === 'true') {
        win.gtag('config', 'G-E9CLESVLV2', {
          page_path: path,
        });
      }
    }
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    const win = window as Window & { gtag?: (command: string, action: string, params?: object) => void };
    if (win.gtag) {
      const consent = localStorage.getItem('cookieConsent');
      // Only track if consent has been explicitly granted
      if (consent === 'true') {
        win.gtag('event', eventName, properties);
      }
    }
  }
}; 
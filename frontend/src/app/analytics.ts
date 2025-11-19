// Google Analytics tracking functions
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined') {
    const win = window as Window & { gtag?: (command: string, target: string, params?: object) => void };
    if (win.gtag) {
      const consent = localStorage.getItem('cookieConsent') === 'true';
      
      // Track page view, preserving existing config but updating path and privacy settings
      win.gtag('config', 'G-E9CLESVLV2', {
        page_path: path,
        anonymize_ip: true,
        // Don't override the base config unnecessarily - just add what's needed
        restricted_data_processing: !consent
      });
    }
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    const win = window as Window & { gtag?: (command: string, action: string, params?: object) => void };
    if (win.gtag) {
      const consent = localStorage.getItem('cookieConsent') === 'true';
      
      // Create base event parameters
      const eventParams: Record<string, unknown> = {
        // For all events, always include these privacy settings
        non_personalized: !consent,
        anonymize_ip: true
      };
      
      // For important game events, always track them
      const isImportantEvent = eventName === 'game_won' || eventName === 'game_lost';
      
      if (consent || isImportantEvent) {
        // If consent given, include all properties
        // If no consent but important event, still track with minimal data
        if (consent && properties) {
          // Merge properties but don't overwrite privacy settings
          Object.entries(properties).forEach(([key, value]) => {
            // Skip null or undefined values
            if (value != null) {
              eventParams[key] = value;
            }
          });
        }
        
        win.gtag('event', eventName, eventParams);
      }
    }
  }
}; 
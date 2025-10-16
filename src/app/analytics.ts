// Analytics and tracking configuration for SEO monitoring

export const analyticsConfig = {
  // Google Analytics 4 (replace with your tracking ID)
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 measurement ID
    enabled: true
  },
  
  // Google Search Console verification
  searchConsole: {
    verificationCode: '', // Add your verification meta tag content
    enabled: true
  },
  
  // Performance monitoring
  performance: {
    trackCoreWebVitals: true,
    trackPageLoad: true,
    trackUserInteractions: true
  },
  
  // Custom events to track
  events: {
    gameStarted: 'game_started',
    gameCompleted: 'game_completed',
    partyCreated: 'party_created',
    partyJoined: 'party_joined',
    shareClicked: 'share_clicked'
  }
};

// Helper function to track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Helper function to track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', analyticsConfig.googleAnalytics.measurementId, {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// Performance and Core Web Vitals optimization

export const performanceConfig = {
  // Image optimization
  imageSizes: [16, 32, 180, 192, 512],
  
  // Preload critical resources
  preloadResources: [
    {
      href: '/favicon.ico',
      as: 'image',
      type: 'image/x-icon'
    },
    {
      href: '/og-image.png',
      as: 'image',
      type: 'image/png'
    }
  ],
  
  // Font optimization
  fontDisplay: 'swap',
  
  // Critical CSS
  criticalCSS: `
    /* Critical above-the-fold styles */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .min-h-screen { min-height: 100vh; }
    .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
  `
};

// Service Worker registration for caching
export const serviceWorkerConfig = {
  cacheName: 'guess-whos-lying-v1',
  urlsToCache: [
    '/',
    '/game',
    '/favicon.ico',
    '/og-image.png',
    '/site.webmanifest'
  ],
  strategy: 'cacheFirst'
};

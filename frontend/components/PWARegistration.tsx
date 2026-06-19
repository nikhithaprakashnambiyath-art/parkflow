'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    // Only register the service worker in production to prevent caching conflicts during development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[PWA] Service Worker registration is skipped in development mode.');
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      };

      // Register SW after page load to prevent blocking any initial render resources
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service Worker handling (safe + cache cleanup in dev)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // Dev: unregister any SW and clear caches to avoid stale assets/HMR issues
    // Run immediately instead of waiting for 'load' to avoid interception of subsequent module loads
    navigator.serviceWorker.getRegistrations()
      .then((regs) => {
        for (const reg of regs) {
          reg.unregister();
        }
        if (typeof caches !== 'undefined') {
          return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
        }
      })
      .then(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('clear')) {
          window.location.href = window.location.pathname;
        }
      })
      .catch((err) => console.log('Dev mode SW cleanup failed:', err));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './MobileApp';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/toaster';

// Capacitor Plugin imports will go here when needed
import { Capacitor } from '@capacitor/core';

// Wait for the deviceready event to ensure all plugins are ready
document.addEventListener('deviceready', () => {
  console.log('Device is ready');
}, false);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Handle back button on Android
if (Capacitor.isNativePlatform()) {
  document.addEventListener('backbutton', (e) => {
    // You can implement custom back button handling here
    if (window.location.pathname !== '/') {
      // If not on home page, navigate back
      window.history.back();
    } else {
      // If on home page, ask to exit app
      if (confirm('Exit application?')) {
        // Import dynamically to avoid loading in all contexts
        import('./lib/nativeBackButton').then(module => {
          const { NativeBackButton } = module;
          NativeBackButton.exitApp();
        }).catch(error => {
          console.error('Error importing NativeBackButton:', error);
        });
      }
    }
  }, false);
}
"use client";

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';

export function Providers({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  
  // Optional: Only show splash on very first hard load by using sessionStorage
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('fittrack_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('fittrack_splash_seen', 'true');
    }
  }, []);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ 
        opacity: showSplash ? 0 : 1, 
        transition: 'opacity 0.8s ease-in-out',
        pointerEvents: showSplash ? 'none' : 'auto'
      }}>
        {children}
      </div>
    </AuthProvider>
  );
}

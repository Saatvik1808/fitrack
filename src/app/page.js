"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function EntrancePage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  
  // States for animation sequencing
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Show login button after splash animation completes (~3 seconds)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  // If already logged in, show nothing while redirecting
  if (user && !loading) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#050508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Ambient Glows */}
      <motion.div
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 0.6, scale: 1 }}
         transition={{ duration: 2, ease: 'easeOut' }}
         style={{
           position: 'absolute',
           top: '10%',
           left: '-10%',
           width: '80vw',
           height: '80vw',
           background: 'radial-gradient(circle, rgba(11,43,107,0.5) 0%, rgba(0,0,0,0) 70%)',
           borderRadius: '50%',
           filter: 'blur(50px)',
           pointerEvents: 'none'
         }}
      />
      <motion.div
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 0.5, scale: 1 }}
         transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
         style={{
           position: 'absolute',
           bottom: '10%',
           right: '-10%',
           width: '80vw',
           height: '80vw',
           background: 'radial-gradient(circle, rgba(255,139,45,0.4) 0%, rgba(0,0,0,0) 70%)',
           borderRadius: '50%',
           filter: 'blur(50px)',
           pointerEvents: 'none'
         }}
      />

      {/* Fluid Backgrounds using SVG Clip Path */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B2B6B" />
              <stop offset="100%" stopColor="#1E4FAF" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF8B2D" />
              <stop offset="100%" stopColor="#D94900" />
            </linearGradient>

            {/* Organic Liquid Filter using Perlin Noise */}
            <filter id="liquidNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.02" numOctaves="3" result="noise">
                <animate attributeName="baseFrequency" values="0.015 0.02; 0.025 0.04; 0.015 0.02" dur="5s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            <clipPath id="splitClip" clipPathUnits="objectBoundingBox">
              <motion.rect
                x="-1"
                y="-1"
                width="3"
                height="3"
                initial={{ rotate: -35, y: -2 }}
                animate={{
                  rotate: [ -35, 180 ],
                  y: [ -2, 0.5 ]
                }}
                transition={{
                  duration: 3.2,
                  ease: [0.16, 1, 0.3, 1] // Super snappy dramatic expoOut
                }}
                style={{ transformOrigin: '0.5 0.5' }}
              />
            </clipPath>
          </defs>

          {/* Base Bottom Layer: Orange */}
          <rect width="100%" height="100%" fill="url(#orangeGrad)" />
          
          {/* Top Layer: Blue, clipped by the rotating rect and distorted to look like liquid */}
          <rect
            width="120%"
            height="120%"
            x="-10%"
            y="-10%"
            fill="url(#blueGrad)"
            clipPath="url(#splitClip)"
            filter="url(#liquidNoise)"
          />
        </svg>
      </div>

      {/* Rotating Divider Line */}
      <motion.div
        initial={{ rotate: -35, scaleY: 0, opacity: 0 }}
        animate={{ rotate: 180, scaleY: [0, 1.2, 1], opacity: [0, 1, 1, showButton ? 0 : 1] }}
        transition={{
            rotate: { duration: 3.2, ease: [0.16, 1, 0.3, 1] },
            scaleY: { duration: 0.8, ease: 'easeOut' },
            opacity: { times: [0, 0.1, 0.8, 1], duration: 3.2 }
        }}
        style={{
          position: 'absolute',
          width: 2,
          height: '150vh',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)',
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      />

      {/* Central Content (Logo + Login) */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 0, filter: 'blur(8px)' }}
           animate={{ 
             opacity: 1, 
             scale: 1, 
             y: showButton ? -40 : 0, // Slide up slightly when button appears
             filter: 'blur(0px)'
           }}
           transition={{ 
             opacity: { duration: 1.2, delay: 0.3, ease: "easeOut" },
             scale: { duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
             filter: { duration: 1.2, delay: 0.3, ease: "easeOut" },
             y: { duration: 0.8, ease: [0.25, 1, 0.5, 1] }
           }}
           style={{
             fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
             fontSize: '3.5rem',
             fontWeight: 800,
             letterSpacing: '-0.04em',
             color: '#ffffff',
             whiteSpace: 'nowrap',
             textShadow: '0 4px 24px rgba(0,0,0,0.5)',
             marginBottom: 20
           }}
        >
          FitTrack
        </motion.div>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 320 }}
            >
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '16px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  width: '100%',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12
                }}
              >
                {loading ? (
                  <div style={{
                    width: 20, height: 20,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}/>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <div style={{ 
                fontSize: 12, 
                color: 'rgba(255,255,255,0.6)', 
                marginTop: 20,
                textAlign: 'center' 
              }}>
                By continuing, you sync your isolated tracking data to the cloud.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

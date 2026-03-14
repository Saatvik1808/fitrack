"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function EntrancePage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  
  // States for animation sequencing
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  // Track whether user was already logged in when the page mounted
  const [isReturningUser, setIsReturningUser] = useState(false);
  const bgRef = useRef(null);

  // Tilt / parallax effect — directly mutates DOM via ref (zero re-renders)
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    let rafId;
    let tx = 0, ty = 0;

    // Mobile: gyroscope tilt
    const handleOrientation = (e) => {
      // beta = front-back tilt (-180 to 180), gamma = left-right tilt (-90 to 90)
      const x = Math.max(-25, Math.min(25, e.gamma || 0)); // clamp
      const y = Math.max(-25, Math.min(25, (e.beta || 0) - 45)); // offset for natural hold angle
      tx = x * 0.8; // subtle multiplier
      ty = y * 0.6;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    // Desktop: mouse parallax
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      tx = x;
      ty = y;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    // Try to use gyroscope on mobile, fall back to mouse on desktop
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
    window.addEventListener('mousemove', handleMouse, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      // Mark as returning user so we never show the Google button
      setIsReturningUser(true);
      // Play a smooth fade-out, then redirect
      const fadeTimer = setTimeout(() => setExiting(true), 1500);
      const navTimer = setTimeout(() => router.push('/dashboard'), 2200);
      return () => { clearTimeout(fadeTimer); clearTimeout(navTimer); };
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Show login button quickly — but ONLY for unauthenticated users
    const timer = setTimeout(() => {
      if (!user && !loading) {
        setShowButton(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  // We always render the splash — exiting state controls the fade-out for returning users

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Gradient Backdrop — moves with device tilt / mouse via ref */}
      <motion.div
         ref={bgRef}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 1.5, ease: 'easeOut' }}
         style={{
           position: 'absolute',
           inset: -60, // extra space for parallax movement
           background: `
             radial-gradient(ellipse at 20% 30%, rgba(30, 79, 175, 0.5) 0%, transparent 50%),
             radial-gradient(ellipse at 80% 70%, rgba(217, 73, 0, 0.35) 0%, transparent 50%),
             radial-gradient(ellipse at 50% 50%, rgba(11, 43, 107, 0.4) 0%, transparent 70%)
           `,
           zIndex: 0,
           willChange: 'transform',
           transition: 'transform 0.15s ease-out',
         }}
      />

      {/* Subtle ambient glow — pure CSS animation, no JS, GPU-composited */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        <div className="splash-orb splash-orb-blue" />
        <div className="splash-orb splash-orb-orange" />
      </div>

      {/* Central Content (Logo + Login) */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 20px' }}>
        
        {/* FitTrack Logo Intro */}
        <motion.div
           initial={{ opacity: 0, scale: 0.85, y: 30, letterSpacing: '4px' }}
           animate={{ 
             opacity: 1, 
             scale: 1, 
             y: showButton ? -40 : 0,
             letterSpacing: '-1.5px'
           }}
           transition={{ 
             opacity: { duration: 1.2, ease: "easeOut" },
             scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
             y: { duration: 0.8, delay: showButton ? 0 : 0, ease: [0.25, 1, 0.5, 1] },
             letterSpacing: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
           }}
           style={{
             position: 'relative',
             fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
             fontSize: 'clamp(3rem, 10vw, 4.5rem)', // Responsive font size
             fontWeight: 800,
             color: '#ffffff',
             whiteSpace: 'nowrap',
             textAlign: 'center',
             textShadow: '0 10px 30px rgba(0,0,0,0.8)',
             marginBottom: 20
           }}
        >
          FitTrack
          {/* Subtle logo shine sweep */}
          <motion.div
             initial={{ left: '-100%' }}
             animate={{ left: '200%' }}
             transition={{ duration: 2.5, ease: "easeInOut", delay: 1 }}
             style={{
               position: 'absolute',
               top: 0, left: 0, width: '50%', height: '100%',
               background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
               transform: 'skewX(-20deg)',
               WebkitBackgroundClip: 'text',
               color: 'transparent',
               pointerEvents: 'none'
             }}
          />
        </motion.div>

        <AnimatePresence>
          {showButton && !isReturningUser && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 320 }}
            >
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: 100,
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
                fontSize: 13, 
                color: 'rgba(255,255,255,0.5)', 
                marginTop: 24,
                textAlign: 'center',
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                Secure cloud sync <br/>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Powered by Firebase</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .splash-orb {
          position: absolute;
          border-radius: 50%;
          will-change: transform, opacity;
        }
        .splash-orb-blue {
          left: 5%;
          top: 20%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(30,79,175,0.25) 0%, transparent 70%);
          animation: float-up 6s ease-in-out infinite;
        }
        .splash-orb-orange {
          right: 10%;
          bottom: 15%;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(217,73,0,0.2) 0%, transparent 70%);
          animation: float-down 7s ease-in-out 1s infinite;
        }
        @keyframes float-up {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.4; }
          50% { transform: translate3d(10px, -30px, 0); opacity: 0.8; }
        }
        @keyframes float-down {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
          50% { transform: translate3d(-10px, 20px, 0); opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  );
}

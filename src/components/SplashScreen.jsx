"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Total animation time is ~3s
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600); // Wait for fade out
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#050508', // Deep navy/black
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
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

                {/* 
                  The clipping mask is a massive rectangle that rotates around the exact center of the screen.
                  We use AnimatePresence combined with motion.rect for smoothly interpolating SVG attributes.
                */}
                <clipPath id="splitClip" clipPathUnits="objectBoundingBox">
                  <motion.rect
                    x="-1"
                    y="-1"
                    width="3"
                    height="3"
                    initial={{ rotate: -25, y: -2 }}
                    animate={{
                      rotate: [ -25, 180 ],
                      y: [ -2, 0.5 ]
                    }}
                    transition={{
                      duration: 2.8,
                      ease: [0.25, 1, 0.5, 1] // Custom snappy-to-smooth bezier
                    }}
                    style={{ transformOrigin: '0.5 0.5' }}
                  />
                </clipPath>
              </defs>

              {/* Base Bottom Layer: Orange */}
              <rect width="100%" height="100%" fill="url(#orangeGrad)" />
              
              {/* Top Layer: Blue, clipped by the rotating rect so only one half shows */}
              <rect
                width="100%"
                height="100%"
                fill="url(#blueGrad)"
                clipPath="url(#splitClip)"
              />
            </svg>
          </div>

          {/* Rotating Divider Line */}
          {/* We implement the line natively in HTML to get box-shadow glows which SVG lacks natively without heavy filters */}
          <motion.div
            initial={{ rotate: -25, scaleY: 0, opacity: 0 }}
            animate={{ rotate: 180, scaleY: 1, opacity: [0, 1, 1, 0] }}
            transition={{
                rotate: { duration: 2.8, ease: [0.25, 1, 0.5, 1] },
                scaleY: { duration: 0.6, ease: 'easeOut' },
                opacity: { times: [0, 0.1, 0.8, 1], duration: 2.8 }
            }}
            style={{
              position: 'absolute',
              width: 2,
              height: '150vh', // long enough to span corner to corner
              backgroundColor: '#ffffff',
              boxShadow: '0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)',
              transformOrigin: 'center center',
              zIndex: 2,
            }}
          />

          {/* Central Logo Text */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
               style={{
                 fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                 fontSize: '3.5rem',
                 fontWeight: 800,
                 letterSpacing: '-0.04em',
                 color: '#ffffff',
                 whiteSpace: 'nowrap',
                 textShadow: '0 4px 24px rgba(0,0,0,0.5)'
               }}
            >
              FitTrack
            </motion.div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

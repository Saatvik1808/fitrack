import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ClipboardList, Dumbbell, Activity, Bot, History, Settings, Download, MoreHorizontal, X, LogOut, Droplets } from 'lucide-react'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', mobile: true },
  { id: 'log', icon: ClipboardList, label: 'Log', mobile: true },
  { id: 'recovery', icon: Droplets, label: 'Recovery', mobile: true },
  { id: 'workout', icon: Dumbbell, label: 'Workout', mobile: true },
  { id: 'running', icon: Activity, label: 'Running', mobile: false },
  { id: 'ai', icon: Bot, label: 'AI Food', mobile: false },
  { id: 'history', icon: History, label: 'History', mobile: false },
  { id: 'settings', icon: Settings, label: 'Settings', mobile: false },
  { id: 'download', icon: Download, label: 'Download', mobile: false },
]

export default function Nav({ active, onChange, onLogout }) {
  const [showMore, setShowMore] = useState(false)
  const mobileNav = NAV.slice(0, 4)
  const moreNav = NAV.slice(4)

  return (
    <>
      {/* Sidebar – desktop */}
      <nav style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }} className="desktop-nav">
        <div style={{ padding: '0 0.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Fit<span style={{ color: 'var(--accent)' }}>Track</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Personal Training OS</div>
        </div>
        {NAV.map(({ id, icon: Icon, label }) => (
          <motion.button
            key={id}
            whileHover={{ x: 4, backgroundColor: active === id ? 'var(--accent)18' : 'var(--bg3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 2,
              background: active === id ? 'var(--accent)18' : 'transparent',
              color: active === id ? '#7C5CFF' : 'var(--text2)',
              fontSize: 13,
              fontWeight: active === id ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              transition: 'color 0.15s ease, background-color 0.15s ease',
              position: 'relative',
            }}
          >
            {active === id && (
              <motion.div
                layoutId="activeNav"
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                  background: 'var(--accent)', borderRadius: '0 4px 4px 0',
                }}
              />
            )}
            <Icon size={16} />
            {label}
          </motion.button>
        ))}

        <div style={{ flex: 1 }} />
        {onLogout && (
          <motion.button
            whileHover={{ x: 4, backgroundColor: 'var(--bg3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginTop: 'auto',
              background: 'transparent',
              color: 'var(--red)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
          >
            <LogOut size={16} />
            Sign out
          </motion.button>
        )}
      </nav>

      {/* Bottom bar – mobile */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 20px))', // Fallback for env
        zIndex: 1000,
        transform: 'translateZ(0)', // Force GPU acceleration (fixes iOS scroll bounce detach)
        WebkitTransform: 'translateZ(0)',
      }} className="mobile-nav fade-in">
        {mobileNav.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { onChange(id); setShowMore(false) }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active === id && !showMore ? '#7C5CFF' : '#9CA3AF',
              fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: 'transparent',
              padding: '2px 6px', flex: 1,
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 9, fontWeight: active === id && !showMore ? 600 : 400 }}>{label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: showMore ? '#7C5CFF' : '#9CA3AF',
            fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: 'transparent',
            padding: '2px 6px', flex: 1,
          }}
        >
          <MoreHorizontal size={20} />
          <span style={{ fontSize: 9, fontWeight: showMore ? 600 : 400 }}>More</span>
        </button>
      </nav>

      {/* Mobile More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mobile-nav-overlay"
            style={{
              position: 'fixed',
              bottom: 'calc(60px + env(safe-area-inset-bottom))',
              left: 12, right: 12,
              background: 'var(--bg2)',
              borderRadius: 16,
              border: '1px solid var(--border)',
              padding: 12,
              zIndex: 99,
              boxShadow: 'var(--shadow)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding: '0 4px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Menu</span>
              <button onClick={() => setShowMore(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)' }}>
                <X size={16} />
              </button>
            </div>
            {moreNav.map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onChange(id); setShowMore(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', borderRadius: 12,
                  background: active === id ? 'var(--accent)18' : 'var(--bg3)',
                  color: active === id ? 'var(--accent2)' : 'var(--text)',
                  border: 'none', fontSize: 13, fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                <Icon size={18} color={active === id ? 'var(--accent2)' : 'var(--text2)'} />
                {label}
              </motion.button>
            ))}
            {onLogout && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', borderRadius: 12,
                  background: 'var(--bg3)',
                  color: 'var(--red)',
                  border: 'none', fontSize: 13, fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                <LogOut size={18} />
                Sign out
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav, .mobile-nav-overlay { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav, .mobile-nav-overlay { display: flex !important; }
          .mobile-nav-overlay { display: grid !important; }
        }
      `}</style>
    </>
  )
}

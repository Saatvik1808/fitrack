import React from 'react'
import { LayoutDashboard, ClipboardList, Dumbbell, Activity, Bot, History, Settings } from 'lucide-react'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'log', icon: ClipboardList, label: 'Log' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'running', icon: Activity, label: 'Running' },
  { id: 'ai', icon: Bot, label: 'AI Food' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export default function Nav({ active, onChange }) {
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
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 2,
              background: active === id ? 'var(--accent)18' : 'transparent',
              color: active === id ? 'var(--accent2)' : 'var(--text2)',
              fontSize: 13,
              fontWeight: active === id ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom bar – mobile */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
        zIndex: 100,
      }} className="mobile-nav">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: active === id ? 'var(--accent2)' : 'var(--text3)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: '2px 6px',
              flex: 1,
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 9, fontWeight: active === id ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}

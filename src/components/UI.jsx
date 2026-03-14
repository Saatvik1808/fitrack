import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="modal-content-panel"
          >
            {/* Drag handle for mobile */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 100, background: 'var(--text3)', opacity: 0.3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 1.25rem' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
              <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', color: 'var(--text)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-scroll-area">
              {children}
            </div>
          </motion.div>
          <style>{`
            .modal-content-panel {
              position: relative;
              width: 100%;
              max-width: 100%;
              background: var(--bg);
              border: 1px solid var(--border);
              border-bottom: none;
              border-radius: 20px 20px 0 0;
              box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
              max-height: 85vh;
              overflow: hidden;
            }
            .modal-scroll-area {
              padding: 0 1.25rem 1.25rem;
              overflow-y: auto;
              max-height: calc(80vh - 60px);
              -webkit-overflow-scrolling: touch;
            }
            @media (min-width: 600px) {
              .modal-content-panel {
                max-width: 480px;
                border-radius: 16px;
                border-bottom: 1px solid var(--border);
                margin-bottom: 5vh;
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}

export function MotionCard({ children, className = '', style = {}, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ label, value, unit, sub, color = 'var(--accent)', icon: Icon, onClick, delay = 0 }) {
  return (
    <MotionCard onClick={onClick} delay={delay}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 2 }}>
            {value ?? '—'}
            {unit && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text2)', marginLeft: 4 }}>{unit}</span>}
          </div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{
            background: color + '18',
            borderRadius: 10,
            padding: 8,
            color,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </MotionCard>
  )
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style = {} }) {
  const styles = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red)', color: '#fff', border: 'none' },
    success: { background: 'var(--green)', color: '#fff', border: 'none' },
  }
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 14 },
    lg: { padding: '13px 24px', fontSize: 15 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{children}</h2>
      {action}
    </div>
  )
}

export function InputRow({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5, fontWeight: 500 }}>
        {label}
        {hint && <span style={{ color: 'var(--text3)', fontWeight: 400, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function Grid({ children, cols = 2, gap = 12, style = {}, className = '' }) {
  return (
    <>
      <div className={`grid-layout ${className}`} style={{ gap, ...style }}>
        {children}
      </div>
      <style>{`
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(${cols}, 1fr);
        }
        @media (max-width: 768px) {
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

export function Badge({ children, color = 'var(--accent)' }) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        background: color + '22',
        color,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 100,
        letterSpacing: '0.03em',
        display: 'inline-block',
      }}
    >
      {children}
    </motion.span>
  )
}

export function ProgressBar({ value, max = 100, color = 'var(--accent)', label, showPct = true }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--text2)' }}>
          <span>{label}</span>
          {showPct && <span style={{ fontWeight: 600, color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: pct + '%',
          background: color,
          borderRadius: 100,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{
      width: 20, height: 20,
      border: '2px solid var(--border)',
      borderTop: '2px solid var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  )
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text3)' }}>
      {Icon && <Icon size={36} style={{ marginBottom: 10, opacity: 0.4 }} />}
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  )
}

export function RangeInput({ label, value, onChange, min = 1, max = 10, color = 'var(--accent)' }) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}/{max}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          appearance: 'none',
          background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, var(--bg4) 0)`,
          borderRadius: 100,
          border: 'none',
          padding: 0,
        }}
      />
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg3)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
      overflowX: 'auto',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            background: active === tab.id ? 'var(--bg)' : 'transparent',
            color: active === tab.id ? 'var(--text)' : 'var(--text3)',
            boxShadow: active === tab.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Divider({ margin = '1rem 0' }) {
  return <div style={{ borderTop: '1px solid var(--border)', margin }} />
}

export function MacroBar({ calories, calTarget, protein, proteinTarget, carbs, fat }) {
  const items = [
    { label: 'Protein', value: protein, target: proteinTarget, color: 'var(--blue)' },
    { label: 'Carbs', value: carbs, target: 146, color: 'var(--orange)' },
    { label: 'Fat', value: fat, target: 47, color: 'var(--pink)' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>CALORIES</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{calories || 0} <span style={{ fontSize: 12, color: 'var(--text2)' }}>/ {calTarget} kcal</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>REMAINING</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: (calTarget - (calories || 0)) < 0 ? 'var(--red)' : 'var(--green)' }}>
            {calTarget - (calories || 0)} kcal
          </div>
        </div>
      </div>
      <ProgressBar value={calories || 0} max={calTarget} color={calories > calTarget ? 'var(--red)' : 'var(--green)'} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
        {items.map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value || 0}g</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>/ {item.target}g</div>
            <div style={{ height: 3, background: 'var(--bg4)', borderRadius: 100, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.min(100, ((item.value || 0) / item.target) * 100) + '%', background: item.color, borderRadius: 100 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

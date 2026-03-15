import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Key, User, Target, Trash2, AlertTriangle, Palette, Moon, Sun, Monitor, AlertCircle, Lock, LogOut, RefreshCw, Mail } from 'lucide-react'
import { Card, Btn, InputRow, SectionTitle, Divider, Grid, MotionCard } from './UI.jsx'
import { calcBMI, bmiCategory } from '../utils/calculations.js'


import { clearAllUserData } from '../hooks/useStorage.js'

export default function Settings({ profile, setProfile, theme = 'dark', setTheme = () => {}, user, onLogout }) {
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleSave() {
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function clearAllData() {
    if (!confirmClear) { setConfirmClear(true); return }
    if (user?.uid) {
      await clearAllUserData(user.uid)
      window.location.reload()
    }
  }

  const bmi = calcBMI(Number(form.currentWeight), Number(form.height))
  const bmiCat = bmiCategory(bmi)

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Settings</h2>

      {/* Account */}
      {user && (
        <MotionCard style={{ marginBottom: 14 }} delay={0}>
          <SectionTitle>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={15} /> Account
            </span>
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--border)', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent2)', border: '2px solid var(--border)' }}>
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || 'User'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
          <Grid cols={2} gap={10}>
            <Btn variant="secondary" size="sm" style={{ justifyContent: 'center' }} onClick={() => { if (onLogout) onLogout() }}>
              <LogOut size={14} /> Sign Out
            </Btn>
            <Btn variant="ghost" size="sm" style={{ justifyContent: 'center' }} onClick={() => { if (onLogout) onLogout() }}>
              <RefreshCw size={14} /> Switch Account
            </Btn>
          </Grid>
        </MotionCard>
      )}

      {/* Profile */}
      <MotionCard style={{ marginBottom: 14 }} delay={user ? 0.05 : 0}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={15} /> Profile
          </span>
        </SectionTitle>
        <InputRow label="Your Name">
          <input placeholder="Athlete" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </InputRow>
        <Grid cols={2} gap={10}>
          <InputRow label="Height" hint="cm">
            <input type="number" placeholder="173" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
          </InputRow>
          <InputRow label="Start Date">
            <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          </InputRow>
        </Grid>
      </MotionCard>

      {/* Weight targets */}
      <MotionCard style={{ marginBottom: 14 }} delay={0.05}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={15} /> Weight & Goals
          </span>
        </SectionTitle>
        <Grid cols={2} gap={10}>
          <InputRow label="Start Weight" hint="kg">
            <input type="number" step="0.1" placeholder="84" value={form.startWeight} onChange={e => setForm(p => ({ ...p, startWeight: e.target.value }))} />
          </InputRow>
          <InputRow label="Current Weight" hint="kg">
            <input type="number" step="0.1" placeholder="84" value={form.currentWeight} onChange={e => setForm(p => ({ ...p, currentWeight: e.target.value }))} />
          </InputRow>
          <InputRow label="Goal Weight" hint="kg">
            <input type="number" step="0.1" placeholder="70" value={form.goalWeight} onChange={e => setForm(p => ({ ...p, goalWeight: e.target.value }))} />
          </InputRow>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 14 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>BMI</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: bmiCat.color }}>{bmi}</div>
              <div style={{ fontSize: 11, color: bmiCat.color }}>{bmiCat.label}</div>
            </div>
          </div>
        </Grid>
      </MotionCard>

      {/* Nutrition targets */}
      <MotionCard style={{ marginBottom: 14 }} delay={0.1}>
        <SectionTitle>Daily Nutrition Targets</SectionTitle>
        <Grid cols={2} gap={10}>
          <InputRow label="Calorie Target" hint="kcal">
            <input type="number" placeholder="1650" value={form.dailyCalorieTarget} onChange={e => setForm(p => ({ ...p, dailyCalorieTarget: e.target.value }))} />
          </InputRow>
          <InputRow label="Protein Target" hint="g">
            <input type="number" placeholder="163" value={form.dailyProteinTarget} onChange={e => setForm(p => ({ ...p, dailyProteinTarget: e.target.value }))} />
          </InputRow>
        </Grid>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 8, padding: 10 }}>
          <AlertCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} /> Based on your coaching plan: 1,650 kcal/day · 163g protein · 146g carbs · 47g fat
        </div>
      </MotionCard>

      {/* Appearance */}
      <MotionCard style={{ marginBottom: 14 }} delay={0.15}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={15} /> Appearance
          </span>
        </SectionTitle>
        <Grid cols={3} gap={10}>
          {[
            { id: 'dark',   icon: Moon, label: 'Dark',   sub: 'Default' },
            { id: 'light',  icon: Sun, label: 'Light',  sub: 'Bright' },
            { id: 'system', icon: Monitor, label: 'System', sub: 'Auto' },
          ].map(opt => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(opt.id)}
              style={{
                padding: '14px 10px',
                borderRadius: 12,
                border: theme === opt.id ? '2px solid var(--accent2)' : '2px solid var(--border)',
                background: theme === opt.id ? 'var(--accent)18' : 'var(--bg3)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.18s ease',
                boxShadow: theme === opt.id ? '0 0 0 3px var(--accent)22' : 'none',
              }}
            >
              <opt.icon size={20} style={{ color: theme === opt.id ? 'var(--accent2)' : 'var(--text3)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme === opt.id ? 'var(--accent2)' : 'var(--text)' }}>{opt.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{opt.sub}</span>
            </motion.button>
          ))}
        </Grid>
      </MotionCard>

      {/* Gemini API key */}
      <MotionCard style={{ marginBottom: 14 }} delay={0.2}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Key size={15} /> Gemini API Key
          </span>
        </SectionTitle>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
          Required for AI food analysis. Get your free key at:{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style={{ color: 'var(--accent2)' }}>
            aistudio.google.com/app/apikey
          </a>
        </div>
        <InputRow label="API Key">
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="AIza..."
              value={form.geminiApiKey}
              onChange={e => setForm(p => ({ ...p, geminiApiKey: e.target.value }))}
              style={{ paddingRight: 70 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'var(--text3)',
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </InputRow>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
          <Lock size={12} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }}/> <div>Your API key is stored securely in Firestore and synced across your devices. It is only sent to Google's Gemini API during analysis.</div>
        </div>
      </MotionCard>

      <Btn onClick={handleSave} variant={saved ? 'success' : 'primary'} style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}>
        <Save size={14} /> {saved ? 'Settings saved ✓' : 'Save settings'}
      </Btn>

      <Divider />

      {/* Danger zone */}
      <MotionCard style={{ border: '1px solid var(--red)44', background: 'var(--red)08', marginTop: 14 }} delay={0.25}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--red)' }}>
            <AlertTriangle size={15} /> Danger Zone
          </span>
        </SectionTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          This will permanently delete all your logs, workouts, runs, and profile data from the cloud. This cannot be undone.
        </p>
        <Btn onClick={clearAllData} variant="danger" size="sm">
          <Trash2 size={12} /> {confirmClear ? 'Click again to CONFIRM delete' : 'Clear all cloud data'}
        </Btn>
        {confirmClear && (
          <button onClick={() => setConfirmClear(false)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text3)' }}>
            Cancel
          </button>
        )}
      </MotionCard>

      {/* App info */}
      <MotionCard style={{ marginTop: 14, background: 'var(--bg3)', textAlign: 'center' }} delay={0.3}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>FitTrack <span style={{ color: 'var(--accent)' }}>OS</span></div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Built for 84 kg → 70 kg · Your personal training system</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Data stored locally · Works offline · AI powered by Gemini</div>
      </MotionCard>
    </div>
  )
}

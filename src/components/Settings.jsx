import React, { useState } from 'react'
import { Save, Key, User, Target, Trash2, AlertTriangle, Palette } from 'lucide-react'
import { Card, Btn, InputRow, SectionTitle, Divider } from './UI.jsx'
import { calcBMI, bmiCategory } from '../utils/calculations.js'


export default function Settings({ profile, setProfile, theme = 'dark', setTheme = () => {} }) {
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleSave() {
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function clearAllData() {
    if (!confirmClear) { setConfirmClear(true); return }
    Object.keys(localStorage).filter(k => k.startsWith('fittrack_')).forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  const bmi = calcBMI(Number(form.currentWeight), Number(form.height))
  const bmiCat = bmiCategory(bmi)

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Settings</h2>

      {/* Profile */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={15} /> Profile
          </span>
        </SectionTitle>
        <InputRow label="Your Name">
          <input placeholder="Athlete" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </InputRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputRow label="Height" hint="cm">
            <input type="number" placeholder="173" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
          </InputRow>
          <InputRow label="Start Date">
            <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          </InputRow>
        </div>
      </Card>

      {/* Weight targets */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={15} /> Weight & Goals
          </span>
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
        </div>
      </Card>

      {/* Nutrition targets */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle>Daily Nutrition Targets</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputRow label="Calorie Target" hint="kcal">
            <input type="number" placeholder="1650" value={form.dailyCalorieTarget} onChange={e => setForm(p => ({ ...p, dailyCalorieTarget: e.target.value }))} />
          </InputRow>
          <InputRow label="Protein Target" hint="g">
            <input type="number" placeholder="163" value={form.dailyProteinTarget} onChange={e => setForm(p => ({ ...p, dailyProteinTarget: e.target.value }))} />
          </InputRow>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 8, padding: 10 }}>
          💡 Based on your coaching plan: 1,650 kcal/day · 163g protein · 146g carbs · 47g fat
        </div>
      </Card>

      {/* Appearance */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={15} /> Appearance
          </span>
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { id: 'dark',   emoji: '🌙', label: 'Dark',   sub: 'Default' },
            { id: 'light',  emoji: '☀️', label: 'Light',  sub: 'Bright' },
            { id: 'system', emoji: '🖥', label: 'System', sub: 'Auto' },
          ].map(opt => (
            <button
              key={opt.id}
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
              <span style={{ fontSize: 20 }}>{opt.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme === opt.id ? 'var(--accent2)' : 'var(--text)' }}>{opt.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{opt.sub}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Gemini API key */}
      <Card style={{ marginBottom: 14 }}>
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
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          🔒 Your API key is stored only in your browser's localStorage. It is never sent to any server other than Google's Gemini API.
        </div>
      </Card>

      <Btn onClick={handleSave} variant={saved ? 'success' : 'primary'} style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}>
        <Save size={14} /> {saved ? 'Settings saved ✓' : 'Save settings'}
      </Btn>

      <Divider />

      {/* Danger zone */}
      <Card style={{ border: '1px solid var(--red)44', background: 'var(--red)08', marginTop: 14 }}>
        <SectionTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--red)' }}>
            <AlertTriangle size={15} /> Danger Zone
          </span>
        </SectionTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          This will permanently delete all your logs, workouts, runs, and profile data. This cannot be undone.
        </p>
        <Btn onClick={clearAllData} variant="danger" size="sm">
          <Trash2 size={12} /> {confirmClear ? 'Click again to CONFIRM delete' : 'Clear all data'}
        </Btn>
        {confirmClear && (
          <button onClick={() => setConfirmClear(false)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text3)' }}>
            Cancel
          </button>
        )}
      </Card>

      {/* App info */}
      <Card style={{ marginTop: 14, background: 'var(--bg3)', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>FitTrack <span style={{ color: 'var(--accent)' }}>OS</span></div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Built for 84 kg → 70 kg · Your personal training system</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Data stored locally · Works offline · AI powered by Gemini</div>
      </Card>
    </div>
  )
}

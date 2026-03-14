import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card, Btn, InputRow, Tabs, SectionTitle, MacroBar, RangeInput, Divider, MotionCard, Grid } from './UI.jsx'
import { formatDateFull } from '../utils/calculations.js'

const TABS = [
  { id: 'body', label: 'Body' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'recovery', label: 'Recovery' },
]

const MOOD_OPTS = ['Terrible', 'Low', 'Okay', 'Good', 'Amazing']
const ENERGY_LABELS = ['Dead', 'Tired', 'Okay', 'Good', 'Fired up']

export default function DailyLog({ logs, setLog, today, profile }) {
  const [tab, setTab] = useState('body')
  const [date, setDate] = useState(today)
  const [saved, setSaved] = useState(false)

  const log = logs[date] || {}
  const isToday = date === today

  function update(field, value) {
    setLog(date, { [field]: value })
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function shiftDate(dir) {
    const [y, m, d] = date.split('-').map(Number)
    const nextDate = new Date(y, m - 1, d)
    nextDate.setDate(nextDate.getDate() + dir)
    
    // Format back to YYYY-MM-DD using local time, avoiding UTC shifts
    const yy = nextDate.getFullYear()
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0')
    const dd = String(nextDate.getDate()).padStart(2, '0')
    const next = `${yy}-${mm}-${dd}`
    
    if (next <= today) setDate(next)
  }

  // Meal management
  const meals = log.meals || []

  function addMeal() {
    const updated = [...meals, { id: Date.now(), name: '', calories: '', protein: '', carbs: '', fat: '' }]
    setLog(date, { meals: updated })
  }

  function updateMeal(id, field, value) {
    const updated = meals.map(m => m.id === id ? { ...m, [field]: value } : m)
    setLog(date, { meals: updated })
    // Auto-calculate totals
    const total = updated.reduce((acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    setLog(date, {
      meals: updated,
      calories: total.calories || '',
      protein: total.protein || '',
      carbs: total.carbs || '',
      fat: total.fat || '',
    })
  }

  function deleteMeal(id) {
    const updated = meals.filter(m => m.id !== id)
    setLog(date, { meals: updated })
  }

  return (
    <div className="fade-in">
      {/* Date nav */}
      <Card style={{ marginBottom: 16, padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => shiftDate(-1)} style={{ background: 'var(--bg3)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text)' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{isToday ? 'Today' : formatDateFull(date)}</div>
            {!isToday && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{date}</div>}
          </div>
          <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: 'var(--bg3)', border: 'none', borderRadius: 8, padding: 6, cursor: isToday ? 'not-allowed' : 'pointer', color: isToday ? 'var(--text3)' : 'var(--text)', opacity: isToday ? 0.4 : 1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </Card>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 14 }}>

        {/* BODY METRICS */}
        <AnimatePresence mode="wait">
        {tab === 'body' && (
          <motion.div
            key="body"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <SectionTitle>Body Metrics</SectionTitle>
              <Grid cols={2} gap={10}>
                <InputRow label="Morning Weight" hint="kg">
                  <input type="number" placeholder="84.0" step="0.1" value={log.weight || ''} onChange={e => update('weight', e.target.value)} />
                </InputRow>
                <InputRow label="Body Fat" hint="%">
                  <input type="number" placeholder="20.0" step="0.1" value={log.bodyFat || ''} onChange={e => update('bodyFat', e.target.value)} />
                </InputRow>
              </Grid>
              <Divider />
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, fontWeight: 500 }}>MEASUREMENTS (cm)</div>
              <Grid cols={2} gap={10}>
                <InputRow label="Chest">
                  <input type="number" placeholder="100" step="0.5" value={log.chest || ''} onChange={e => update('chest', e.target.value)} />
                </InputRow>
                <InputRow label="Waist">
                  <input type="number" placeholder="90" step="0.5" value={log.waist || ''} onChange={e => update('waist', e.target.value)} />
                </InputRow>
                <InputRow label="Left Arm">
                  <input type="number" placeholder="35" step="0.5" value={log.arm || ''} onChange={e => update('arm', e.target.value)} />
                </InputRow>
                <InputRow label="Left Leg">
                  <input type="number" placeholder="55" step="0.5" value={log.leg || ''} onChange={e => update('leg', e.target.value)} />
                </InputRow>
              </Grid>
              <InputRow label="Notes">
                <textarea rows={2} placeholder="How did you feel today?" value={log.bodyNotes || ''} onChange={e => update('bodyNotes', e.target.value)} style={{ resize: 'vertical' }} />
              </InputRow>
            </Card>
          </motion.div>
        )}

        {/* NUTRITION */}
        {tab === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card style={{ marginBottom: 12 }}>
              <SectionTitle>Macro Summary</SectionTitle>
              <MacroBar
                calories={Number(log.calories) || 0}
                calTarget={profile.dailyCalorieTarget}
                protein={Number(log.protein) || 0}
                proteinTarget={profile.dailyProteinTarget}
                carbs={Number(log.carbs) || 0}
                fat={Number(log.fat) || 0}
              />
            </Card>

            <Card style={{ marginBottom: 12 }}>
              <SectionTitle>Quick Entry</SectionTitle>
              <Grid cols={2} gap={10}>
                <InputRow label="Calories" hint="kcal">
                  <input type="number" placeholder="1650" value={log.calories || ''} onChange={e => update('calories', e.target.value)} />
                </InputRow>
                <InputRow label="Protein" hint="g">
                  <input type="number" placeholder="163" value={log.protein || ''} onChange={e => update('protein', e.target.value)} />
                </InputRow>
                <InputRow label="Carbs" hint="g">
                  <input type="number" placeholder="146" value={log.carbs || ''} onChange={e => update('carbs', e.target.value)} />
                </InputRow>
                <InputRow label="Fat" hint="g">
                  <input type="number" placeholder="47" value={log.fat || ''} onChange={e => update('fat', e.target.value)} />
                </InputRow>
              </Grid>
              <InputRow label="Water" hint="litres">
                <input type="number" placeholder="3.5" step="0.25" value={log.water || ''} onChange={e => update('water', e.target.value)} />
              </InputRow>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Meals</div>
                <Btn variant="secondary" size="sm" onClick={addMeal}>
                  <Plus size={12} /> Add meal
                </Btn>
              </div>
              {meals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text3)', fontSize: 13 }}>
                  No meals logged yet. Add one above.
                </div>
              )}
              {meals.map((meal, idx) => (
                <div key={meal.id} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Meal {idx + 1}</span>
                    <button onClick={() => deleteMeal(meal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input type="text" placeholder="Meal name (e.g. Chicken Rice Bowl)" value={meal.name} onChange={e => updateMeal(meal.id, 'name', e.target.value)} style={{ marginBottom: 8 }} />
                  <Grid cols={4} gap={6} className="macro-input-grid">
                    {['calories', 'protein', 'carbs', 'fat'].map(field => (
                      <div key={field}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3, textTransform: 'capitalize' }}>{field}</div>
                        <input type="number" placeholder="0" value={meal[field]} onChange={e => updateMeal(meal.id, field, e.target.value)} style={{ padding: '6px 8px', fontSize: 13 }} />
                      </div>
                    ))}
                  </Grid>
                </div>
              ))}
            </Card>
          </motion.div>
        )}

        {/* RECOVERY */}
        {tab === 'recovery' && (
          <motion.div
            key="recovery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
          <Card>
            <SectionTitle>Recovery & Wellness</SectionTitle>
            <InputRow label="Sleep Duration" hint="hours">
              <input type="number" placeholder="7.5" step="0.5" min="0" max="24" value={log.sleep || ''} onChange={e => update('sleep', e.target.value)} />
            </InputRow>
            <Divider />
            <div style={{ marginBottom: 20 }}>
              <RangeInput
                label="Energy Level"
                value={log.energy || 5}
                min={1} max={5}
                color="var(--yellow)"
                onChange={v => update('energy', v)}
              />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>
                {ENERGY_LABELS[(log.energy || 5) - 1]}
              </div>
            </div>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, marginBottom: 8 }}>Mood</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {MOOD_OPTS.map(m => (
                  <button
                    key={m}
                    onClick={() => update('mood', m)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      border: log.mood === m ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: log.mood === m ? 'var(--accent)22' : 'var(--bg3)',
                      color: log.mood === m ? 'var(--accent2)' : 'var(--text2)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            <InputRow label="Recovery notes">
              <textarea rows={3} placeholder="How are you feeling? Any soreness, stress, etc..." value={log.recoveryNotes || ''} onChange={e => update('recoveryNotes', e.target.value)} style={{ resize: 'vertical' }} />
            </InputRow>
          </Card>
          </motion.div>
        )}
        </AnimatePresence>

        <div style={{ marginTop: 16 }}>
          <Btn onClick={handleSave} variant={saved ? 'success' : 'primary'} style={{ width: '100%', justifyContent: 'center' }}>
            <Save size={14} /> {saved ? 'Saved ✓' : 'Save Log'}
          </Btn>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .macro-input-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}

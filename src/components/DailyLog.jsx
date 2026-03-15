import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card, Btn, InputRow, Tabs, SectionTitle, MacroBar, RangeInput, Divider, MotionCard, Grid } from './UI.jsx'
import { formatDateFull } from '../utils/calculations.js'

const TABS = [
  { id: 'body', label: 'Body' },
  { id: 'nutrition', label: 'Nutrition' },
]

const MOOD_OPTS = ['Terrible', 'Low', 'Okay', 'Good', 'Amazing']
const ENERGY_LABELS = ['Dead', 'Tired', 'Okay', 'Good', 'Fired up']

const MealCard = ({ meal, idx, updateMeal, deleteMeal }) => {
  const [editing, setEditing] = useState(meal.name === '')

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      {/* Background delete action */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'var(--red)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Trash2 size={24} />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.x < -40 || velocity.x < -300) {
            deleteMeal(meal.id)
          }
        }}
        onClick={(e) => {
          // Prevent tap-to-edit if they are clicking inputs or buttons
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
             setEditing(!editing)
          }
        }}
        className="glass-card"
        style={{ position: 'relative', zIndex: 10, borderRadius: 20, padding: 18, background: 'var(--bg2)', cursor: 'pointer', touchAction: 'pan-y' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: editing ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--accent)22', color: 'var(--accent)', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800 }}>MEAL {idx + 1}</div>
            {editing ? (
              <input 
                type="text" autoFocus
                placeholder="Meal name" 
                value={meal.name} 
                onChange={e => updateMeal(meal.id, 'name', e.target.value)} 
                style={{ border: 'none', background: 'none', fontSize: 16, fontWeight: 700, color: 'var(--text)', padding: 0 }} 
              />
            ) : (
              <div style={{ fontSize: 16, fontWeight: 700, color: meal.name ? 'var(--text)' : 'var(--text3)' }}>
                {meal.name || 'Unnamed Meal'}
              </div>
            )}
          </div>
          
          {!editing && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{meal.calories || 0}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 2 }}>kcal</span>
              </div>
            </div>
          )}
        </div>

        {/* Read-only Macro Summary */}
        {!editing && (
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
             <div style={{ fontSize: 12, fontWeight: 600, color: '#4DA3FF' }}>Protein: {meal.protein || 0}g</div>
             <div style={{ fontSize: 12, fontWeight: 600, color: '#FF8A3D' }}>Carbs: {meal.carbs || 0}g</div>
             <div style={{ fontSize: 12, fontWeight: 600, color: '#EC4899' }}>Fat: {meal.fat || 0}g</div>
          </div>
        )}

        {/* Edit-mode Inputs */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <Grid cols={4} gap={8} style={{ marginTop: 12 }}>
                {[
                  { field: 'calories', label: 'Cals' },
                  { field: 'protein', label: 'Prot' },
                  { field: 'carbs', label: 'Carbs' },
                  { field: 'fat', label: 'Fat' }
                ].map(f => (
                  <div key={f.field}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={meal[f.field]} 
                      onChange={e => updateMeal(meal.id, f.field, e.target.value)} 
                      style={{ padding: '8px', fontSize: 14, fontWeight: 700, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', width: '100%' }} 
                    />
                  </div>
                ))}
              </Grid>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                 <button onClick={(e) => { e.stopPropagation(); setEditing(false) }} style={{ background: 'var(--bg4)', border: 'none', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>Done</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

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

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Date Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 16, 
          background: 'var(--bg2)', padding: '6px 20px', 
          borderRadius: 100, border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <button onClick={() => shiftDate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{isToday ? 'Today' : formatDateFull(date)}</div>
          </div>
          <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: 'none', border: 'none', cursor: isToday ? 'not-allowed' : 'pointer', color: isToday ? 'var(--text3)' : 'var(--text2)', opacity: isToday ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div style={{ marginTop: 0 }}>

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
            <MotionCard className="glass-card" style={{ padding: 18 }}>
              <SectionTitle>Body Metrics</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputRow label="Weight (kg)">
                  <input type="number" placeholder="84.0" step="0.1" value={log.weight || ''} onChange={e => update('weight', e.target.value)} style={{ padding: '12px', borderRadius: 12 }} />
                </InputRow>
                <InputRow label="Body Fat (%)">
                  <input type="number" placeholder="20.0" step="0.1" value={log.bodyFat || ''} onChange={e => update('bodyFat', e.target.value)} style={{ padding: '12px', borderRadius: 12 }} />
                </InputRow>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MEASUREMENTS (cm)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Chest', field: 'chest' },
                    { label: 'Waist', field: 'waist' },
                    { label: 'Arms', field: 'arm' },
                    { label: 'Legs', field: 'leg' },
                  ].map(f => (
                    <InputRow key={f.field} label={f.label}>
                      <input type="number" placeholder="0" step="0.5" value={log[f.field] || ''} onChange={e => update(f.field, e.target.value)} style={{ padding: '12px', borderRadius: 12 }} />
                    </InputRow>
                  ))}
                </div>
              </div>

              <InputRow label="Daily Notes">
                <textarea rows={3} placeholder="How was your energy and mood today?" value={log.bodyNotes || ''} onChange={e => update('bodyNotes', e.target.value)} style={{ resize: 'none', padding: '12px', borderRadius: 12 }} />
              </InputRow>
            </MotionCard>
          </motion.div>
        )}

        {/* NUTRITION */}
        {tab === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Macro Summary Card */}
            <MotionCard className="glass-card" style={{ marginBottom: 20, padding: 18 }}>
              <MacroBar
                calories={Number(log.calories) || 0}
                calTarget={profile.dailyCalorieTarget}
                protein={Number(log.protein) || 0}
                proteinTarget={profile.dailyProteinTarget}
                carbs={Number(log.carbs) || 0}
                fat={Number(log.fat) || 0}
              />
            </MotionCard>

            <Card className="glass-card" style={{ marginBottom: 20 }}>
              <SectionTitle>Quick Entry</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Calories', field: 'calories', unit: 'kcal' },
                  { label: 'Protein', field: 'protein', unit: 'g' },
                  { label: 'Carbs', field: 'carbs', unit: 'g' },
                  { label: 'Fat', field: 'fat', unit: 'g' },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={log[f.field] || ''} 
                        onChange={e => update(f.field, e.target.value)} 
                        style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg3)', width: '100%', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text3)' }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionTitle style={{ marginBottom: 0 }}>Daily Meals</SectionTitle>
              <Btn variant="secondary" size="sm" onClick={addMeal} style={{ borderRadius: 100 }}>
                <Plus size={14} /> Add meal
              </Btn>
            </div>

            {meals.length === 0 && (
              <MotionCard style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: 20 }}>
                No meals logged for this day.
                <div style={{ fontSize: 12, marginTop: 4 }}>Tap "Add meal" to begin.</div>
              </MotionCard>
            )}

            <AnimatePresence>
            {meals.map((meal, idx) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                idx={idx} 
                updateMeal={updateMeal} 
                deleteMeal={deleteMeal} 
              />
            ))}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>

        <div style={{ 
          position: 'fixed', bottom: 85, left: 16, right: 16, 
          zIndex: 100, display: 'flex', gap: 12 
        }}>
          <Btn 
            onClick={handleSave} 
            variant={saved ? 'success' : 'primary'} 
            style={{ 
              width: '100%', borderRadius: 16, 
              padding: '16px', fontSize: 16,
              boxShadow: '0 8px 25px rgba(124, 92, 255, 0.4)'
            }}
          >
            {saved ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Saved ✓</span> : <><Save size={20} /> Save Daily Log</>}
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

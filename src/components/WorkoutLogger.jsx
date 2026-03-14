import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, ChevronUp, Dumbbell, Clock } from 'lucide-react'
import { Card, Btn, InputRow, SectionTitle, EmptyState, Badge, Grid, MotionCard } from './UI.jsx'
import { calcWorkoutVolume, formatDate, formatLocalYYYYMMDD } from '../utils/calculations.js'

const COMMON_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Barbell Row',
  'Overhead Press', 'Incline Bench', 'Leg Press', 'Romanian Deadlift',
  'Cable Row', 'Lat Pulldown', 'Dips', 'Bicep Curl', 'Tricep Pushdown',
  'Leg Curl', 'Leg Extension', 'Calf Raise', 'Face Pull', 'Arnold Press',
]

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body']

function SetRow({ set, index, onChange, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 24px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{index + 1}</span>
      <input type="number" placeholder="kg" value={set.weight || ''} onChange={e => onChange('weight', e.target.value)} style={{ padding: '7px 8px', fontSize: 13 }} />
      <input type="number" placeholder="reps" value={set.reps || ''} onChange={e => onChange('reps', e.target.value)} style={{ padding: '7px 8px', fontSize: 13 }} />
      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
        {set.weight && set.reps ? `${(set.weight * set.reps).toLocaleString()}` : '—'} kg
      </div>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}>
        <Trash2 size={12} />
      </button>
    </div>
  )
}

function ExerciseCard({ exercise, onChange, onDelete }) {
  const [open, setOpen] = useState(true)
  const volume = (exercise.sets || []).reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0)

  function addSet() {
    const lastSet = exercise.sets?.slice(-1)[0] || {}
    onChange({ ...exercise, sets: [...(exercise.sets || []), { id: Date.now(), weight: lastSet.weight || '', reps: lastSet.reps || '' }] })
  }

  function updateSet(id, field, value) {
    onChange({ ...exercise, sets: exercise.sets.map(s => s.id === id ? { ...s, [field]: value } : s) })
  }

  function deleteSet(id) {
    onChange({ ...exercise, sets: exercise.sets.filter(s => s.id !== id) })
  }

  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 12 : 0 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <input
            list="exercises-list"
            value={exercise.name || ''}
            onChange={e => onChange({ ...exercise, name: e.target.value })}
            placeholder="Exercise name..."
            style={{ background: 'var(--bg2)', fontSize: 14, fontWeight: 600 }}
          />
          <datalist id="exercises-list">
            {COMMON_EXERCISES.map(ex => <option key={ex} value={ex} />)}
          </datalist>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {volume > 0 && <Badge color="var(--accent)">{volume.toLocaleString()} kg</Badge>}
          <button onClick={() => setOpen(!open)} style={{ background: 'var(--bg2)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: 'var(--text2)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <>
          {(exercise.sets || []).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 24px', gap: 6, marginBottom: 4 }}>
                <span />
                <span style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>WEIGHT</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>REPS</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>VOL</span>
                <span />
              </div>
              {(exercise.sets || []).map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={idx}
                  onChange={(field, value) => updateSet(set.id, field, value)}
                  onDelete={() => deleteSet(set.id)}
                />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" onClick={addSet} style={{ flex: 1, justifyContent: 'center' }}>
              <Plus size={12} /> Add set
            </Btn>
          </div>
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Notes (e.g. tempo, rest time, form cues...)"
              value={exercise.notes || ''}
              onChange={e => onChange({ ...exercise, notes: e.target.value })}
              style={{ fontSize: 12 }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function WorkoutLogger({ workouts, addWorkout, deleteWorkout }) {
  const today = formatLocalYYYYMMDD()
  const [form, setForm] = useState({
    name: '',
    date: today,
    type: '',
    duration: '',
    notes: '',
    exercises: [],
  })
  const [showForm, setShowForm] = useState(false)

  function addExercise() {
    setForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { id: Date.now(), name: '', sets: [{ id: Date.now(), weight: '', reps: '' }] }]
    }))
  }

  function updateExercise(id, data) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => ex.id === id ? data : ex)
    }))
  }

  function deleteExercise(id) {
    setForm(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== id) }))
  }

  function handleSave() {
    if (!form.name && form.exercises.length === 0) return
    const totalVolume = calcWorkoutVolume(form.exercises)
    addWorkout({ ...form, totalVolume })
    setForm({ name: '', date: today, type: '', duration: '', notes: '', exercises: [] })
    setShowForm(false)
  }

  const recentWorkouts = workouts.slice(0, 10)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Workout Logger</h2>
        <Btn onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'} size="sm">
          {showForm ? 'Cancel' : <><Plus size={14} /> Log Workout</>}
        </Btn>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ overflow: 'hidden' }}
        >
        <Card style={{ marginBottom: 16 }} className="fade-in">
          <SectionTitle>New Workout</SectionTitle>
          <Grid cols={2} gap={10} style={{ marginBottom: 10 }}>
            <InputRow label="Workout Name">
              <input placeholder="Push Day, Legs, etc." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </InputRow>
            <InputRow label="Date">
              <input type="date" max={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </InputRow>
            <InputRow label="Muscle Group">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="">Select...</option>
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </InputRow>
            <InputRow label="Duration" hint="minutes">
              <input type="number" placeholder="60" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
            </InputRow>
          </Grid>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Exercises ({form.exercises.length})</span>
              <Btn variant="secondary" size="sm" onClick={addExercise}>
                <Plus size={12} /> Add exercise
              </Btn>
            </div>
            {form.exercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onChange={data => updateExercise(ex.id, data)}
                onDelete={() => deleteExercise(ex.id)}
              />
            ))}
          </div>

          <InputRow label="Workout Notes">
            <textarea rows={2} placeholder="How did it go? PRs hit? Anything to note?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </InputRow>

          {/* Summary */}
          {form.exercises.length > 0 && (
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>EXERCISES</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{form.exercises.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>TOTAL VOLUME</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{calcWorkoutVolume(form.exercises).toLocaleString()} kg</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>TOTAL SETS</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{form.exercises.reduce((s, ex) => s + (ex.sets || []).length, 0)}</div>
              </div>
            </div>
          )}

          <Btn onClick={handleSave} variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Dumbbell size={14} /> Save Workout
          </Btn>
        </Card>
        </motion.div>
      )}

      {/* Recent workouts */}
      <SectionTitle>Recent Workouts</SectionTitle>
      {recentWorkouts.length === 0 && (
        <EmptyState icon={Dumbbell} title="No workouts logged yet" sub="Hit the button above to log your first session" />
      )}
      {recentWorkouts.map((w, i) => (
        <MotionCard key={w.id} style={{ marginBottom: 10 }} delay={i * 0.05}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{w.name || 'Workout'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{formatDate(w.date)} {w.type && `· ${w.type}`}</div>
            </div>
            <button onClick={() => deleteWorkout(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            {w.totalVolume > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>VOLUME</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{w.totalVolume.toLocaleString()} kg</div>
              </div>
            )}
            {w.duration && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>DURATION</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{w.duration} min</div>
              </div>
            )}
            {w.exercises?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>EXERCISES</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{w.exercises.length}</div>
              </div>
            )}
          </div>
          {w.exercises?.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {w.exercises.slice(0, 5).map(ex => (
                <Badge key={ex.id} color="var(--bg4)">{ex.name || 'Exercise'}</Badge>
              ))}
              {w.exercises.length > 5 && <Badge color="var(--bg4)">+{w.exercises.length - 5} more</Badge>}
            </div>
          )}
        </MotionCard>
      ))}
    </div>
  )
}

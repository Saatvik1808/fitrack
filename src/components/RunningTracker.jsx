import React, { useState } from 'react'
import { Plus, Trash2, Activity } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Card, Btn, InputRow, SectionTitle, EmptyState, Badge, StatCard } from './UI.jsx'
import { calcPace, calcRunCalories, formatDate, getLast30Days } from '../utils/calculations.js'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const RUN_TYPES = ['Easy Run', 'Interval', 'Tempo', 'Long Run', 'Recovery', 'Race']

export default function RunningTracker({ runs, addRun, deleteRun, profile }) {
  const today = new Date().toISOString().split('T')[0]
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: today, distance: '', duration: '', type: 'Easy Run', notes: '',
  })

  function handleSave() {
    if (!form.distance || !form.duration) return
    const pace = calcPace(Number(form.distance), Number(form.duration))
    const calories = calcRunCalories(Number(form.distance), profile.currentWeight)
    addRun({ ...form, pace, calories })
    setForm({ date: today, distance: '', duration: '', type: 'Easy Run', notes: '' })
    setShowForm(false)
  }

  const totalKm = runs.reduce((s, r) => s + (Number(r.distance) || 0), 0)
  const totalTime = runs.reduce((s, r) => s + (Number(r.duration) || 0), 0)
  const totalCalories = runs.reduce((s, r) => s + (Number(r.calories) || 0), 0)
  const avgPaceMin = runs.length > 0 ? totalTime / totalKm : null

  // Chart
  const last30 = getLast30Days()
  const byDay = {}
  runs.forEach(r => {
    if (!byDay[r.date]) byDay[r.date] = 0
    byDay[r.date] += Number(r.distance) || 0
  })
  const chartData = {
    labels: last30.slice(-14).map(d => formatDate(d)),
    datasets: [{
      data: last30.slice(-14).map(d => byDay[d] || 0),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.4,
    }]
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Running Tracker</h2>
        <Btn onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'} size="sm">
          {showForm ? 'Cancel' : <><Plus size={14} /> Log Run</>}
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <Card>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>TOTAL KM</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{totalKm.toFixed(1)}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>RUNS</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{runs.length}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>CALS BURNED</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{totalCalories.toLocaleString()}</div>
        </Card>
      </div>

      {/* Chart */}
      {runs.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 10 }}>Distance (last 14 days)</div>
          <div style={{ height: 130 }}>
            <Line data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a24', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#9090a8', bodyColor: '#f0f0f5', padding: 8, cornerRadius: 8 } },
              scales: {
                x: { grid: { display: false }, border: { display: false }, ticks: { color: '#5a5a72', font: { size: 9 } } },
                y: { grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false }, ticks: { color: '#5a5a72', font: { size: 9 } }, beginAtZero: true },
              }
            }} />
          </div>
        </Card>
      )}

      {/* Log form */}
      {showForm && (
        <Card style={{ marginBottom: 16 }} className="fade-in">
          <SectionTitle>New Run</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <InputRow label="Date">
              <input type="date" max={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </InputRow>
            <InputRow label="Run Type">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {RUN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputRow>
            <InputRow label="Distance" hint="km">
              <input type="number" placeholder="5.0" step="0.1" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} />
            </InputRow>
            <InputRow label="Duration" hint="minutes">
              <input type="number" placeholder="30" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
            </InputRow>
          </div>

          {form.distance && form.duration && (
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>PACE</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{calcPace(Number(form.distance), Number(form.duration))}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>SPEED</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {((Number(form.distance) / Number(form.duration)) * 60).toFixed(1)} km/h
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>EST CALS</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>
                  {calcRunCalories(Number(form.distance), profile.currentWeight)} kcal
                </div>
              </div>
            </div>
          )}

          <InputRow label="Notes">
            <textarea rows={2} placeholder="How was the run? Route? How did you feel?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </InputRow>
          <Btn onClick={handleSave} variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Activity size={14} /> Save Run
          </Btn>
        </Card>
      )}

      {/* Run history */}
      <SectionTitle>Run History</SectionTitle>
      {runs.length === 0 && <EmptyState icon={Activity} title="No runs logged yet" sub="Track your first run above" />}
      {runs.map(run => (
        <Card key={run.id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {run.distance} km
                <Badge color="var(--green)" style={{ marginLeft: 8 }}>{run.type}</Badge>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{formatDate(run.date)}</div>
            </div>
            <button onClick={() => deleteRun(run.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>DURATION</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{run.duration} min</div>
            </div>
            {run.pace && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>PACE</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{run.pace}</div>
              </div>
            )}
            {run.calories && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>CALORIES</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--orange)' }}>{run.calories} kcal</div>
              </div>
            )}
          </div>
          {run.notes && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>{run.notes}</div>}
        </Card>
      ))}
    </div>
  )
}

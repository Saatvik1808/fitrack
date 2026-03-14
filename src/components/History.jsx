import React, { useState } from 'react'
import { Download, Calendar } from 'lucide-react'
import { Card, Btn, SectionTitle, Tabs } from './UI.jsx'
import { formatDate, getLast30Days, getWeekDates } from '../utils/calculations.js'
import { exportData, exportCSV } from '../hooks/useStorage.js'

const TABS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: '30 Days' },
  { id: 'all', label: 'All Data' },
]

function LogRow({ date, log }) {
  const hasData = log && Object.keys(log).length > 0
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      opacity: hasData ? 1 : 0.4,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDate(date)}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{date}</div>
      </div>
      <div>
        {hasData ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {log.weight && <Chip label="⚖️" val={`${log.weight} kg`} />}
            {log.calories && <Chip label="🔥" val={`${log.calories} kcal`} />}
            {log.protein && <Chip label="💪" val={`${log.protein}g P`} />}
            {log.sleep && <Chip label="😴" val={`${log.sleep} hr`} />}
            {log.water && <Chip label="💧" val={`${log.water} L`} />}
            {log.mood && <Chip label="" val={log.mood} />}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>No data logged</span>
        )}
      </div>
    </div>
  )
}

function Chip({ label, val }) {
  return (
    <span style={{
      background: 'var(--bg3)',
      borderRadius: 6,
      padding: '3px 8px',
      fontSize: 11,
      color: 'var(--text2)',
    }}>
      {label} {val}
    </span>
  )
}

export default function History({ logs, workouts, runs }) {
  const [tab, setTab] = useState('week')

  const weekDates = getWeekDates()
  const last30 = getLast30Days()
  const allDates = Object.keys(logs).sort().reverse()

  const dates = tab === 'week' ? weekDates.reverse() : tab === 'month' ? last30.reverse() : allDates

  // Summary stats for selected period
  const periodLogs = dates.map(d => logs[d]).filter(Boolean)
  const avgCals = periodLogs.filter(l => l.calories).length
    ? Math.round(periodLogs.reduce((s, l) => s + (Number(l.calories) || 0), 0) / periodLogs.filter(l => l.calories).length)
    : null
  const avgProtein = periodLogs.filter(l => l.protein).length
    ? Math.round(periodLogs.reduce((s, l) => s + (Number(l.protein) || 0), 0) / periodLogs.filter(l => l.protein).length)
    : null
  const totalRunKm = runs
    .filter(r => dates.includes(r.date))
    .reduce((s, r) => s + (Number(r.distance) || 0), 0)
  const totalWorkouts = workouts.filter(w => dates.includes(w.date)).length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>History</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => exportCSV(logs)}>
            <Download size={12} /> CSV
          </Btn>
          <Btn variant="secondary" size="sm" onClick={exportData}>
            <Download size={12} /> JSON
          </Btn>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Period summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '14px 0' }}>
        {[
          { label: 'Avg Cals', value: avgCals ? `${avgCals}` : '—', unit: 'kcal' },
          { label: 'Avg Protein', value: avgProtein ? `${avgProtein}g` : '—' },
          { label: 'Total KM', value: totalRunKm.toFixed(1), unit: 'km' },
          { label: 'Workouts', value: totalWorkouts },
        ].map(({ label, value, unit }) => (
          <Card key={label} style={{ padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
            {unit && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{unit}</div>}
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>Daily Logs</SectionTitle>
        {dates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', fontSize: 13 }}>
            <Calendar size={28} style={{ marginBottom: 8, opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
            No logs yet. Start logging daily!
          </div>
        )}
        {dates.map(date => (
          <LogRow key={date} date={date} log={logs[date]} />
        ))}
      </Card>

      {/* Workout history */}
      {workouts.filter(w => dates.includes(w.date)).length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <SectionTitle>Workouts in period</SectionTitle>
          {workouts.filter(w => dates.includes(w.date)).map(w => (
            <div key={w.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name || 'Workout'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{formatDate(w.date)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                {w.exercises?.length || 0} exercises · {w.totalVolume ? `${w.totalVolume.toLocaleString()} kg volume` : ''} {w.duration ? `· ${w.duration} min` : ''}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Run history */}
      {runs.filter(r => dates.includes(r.date)).length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <SectionTitle>Runs in period</SectionTitle>
          {runs.filter(r => dates.includes(r.date)).map(r => (
            <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.distance} km – {r.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{formatDate(r.date)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                {r.duration} min · {r.pace} · {r.calories} kcal
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

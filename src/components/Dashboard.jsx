import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { Target, Flame, Dumbbell, Activity, Zap, Trophy } from 'lucide-react'
import { Card, StatCard, SectionTitle, ProgressBar, Badge, Grid, MotionCard } from './UI.jsx'
import {
  calcBMI, bmiCategory, calcGoalProgress, getWeekDates, getLast30Days,
  formatDate, weeklyAvg, getStreakDays,
} from '../utils/calculations.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement
)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a24',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#9090a8',
      bodyColor: '#f0f0f5',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#5a5a72', font: { size: 10, family: 'Space Grotesk' } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      border: { display: false },
      ticks: { color: '#5a5a72', font: { size: 10, family: 'Space Grotesk' } },
    },
  },
}

export default function Dashboard({ logs, workouts, runs, profile }) {
  const today = new Date().toISOString().split('T')[0]
  const todayLog = logs[today] || {}
  const last30 = getLast30Days()
  const weekDates = getWeekDates()

  const safeWeight = profile?.currentWeight || 0
  const safeGoal = profile?.goalWeight || 0
  const safeStart = profile?.startWeight || 0
  const safeHeight = profile?.height || 0

  const bmi = safeWeight && safeHeight ? calcBMI(safeWeight, safeHeight) : 0
  const bmiCat = bmiCategory(bmi)
  const goalPct = safeGoal ? calcGoalProgress(safeWeight, safeStart, safeGoal) : 0
  const streak = getStreakDays(logs)

  // Weight trend data
  const weightData = useMemo(() => {
    const vals = last30.map(d => logs[d]?.weight || null)
    const filled = [...vals]
    let last = null
    for (let i = 0; i < filled.length; i++) {
      if (filled[i] != null) last = filled[i]
      else filled[i] = last
    }
    return {
      labels: last30.map(d => formatDate(d)),
      datasets: [{
        data: filled,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108,99,255,0.1)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
        spanGaps: true,
      }]
    }
  }, [logs, last30])

  // Weekly calorie data
  const calorieData = useMemo(() => ({
    labels: weekDates.map(d => formatDate(d)),
    datasets: [{
      data: weekDates.map(d => logs[d]?.calories || 0),
      backgroundColor: weekDates.map(d => d === today ? '#6c63ff' : '#6c63ff44'),
      borderRadius: 6,
      borderSkipped: false,
    }]
  }), [logs, weekDates, today])

  // Running distance chart
  const runData = useMemo(() => {
    const last14 = getLast30Days().slice(-14)
    const byDay = {}
    runs.forEach(r => { if (byDay[r.date] == null) byDay[r.date] = 0; byDay[r.date] += r.distance })
    return {
      labels: last14.map(d => formatDate(d)),
      datasets: [{
        data: last14.map(d => byDay[d] || 0),
        backgroundColor: '#22c55e44',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 6,
      }]
    }
  }, [runs])

  // Weekly workout volume
  const volumeData = useMemo(() => ({
    labels: weekDates.map(d => formatDate(d)),
    datasets: [{
      data: weekDates.map(d => {
        const dayWorkouts = workouts.filter(w => w.date === d)
        return dayWorkouts.reduce((t, w) => {
          return t + (w.exercises || []).reduce((s, ex) => {
            return s + (ex.sets || []).reduce((ss, set) => ss + ((set.weight || 0) * (set.reps || 0)), 0)
          }, 0)
        }, 0)
      }),
      backgroundColor: '#3b82f644',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
    }]
  }), [workouts, weekDates])

  const weeklyCalAvg = weeklyAvg(logs, 'calories')
  const weeklyProtAvg = weeklyAvg(logs, 'protein')

  const recentRuns = runs.slice(0, 3)
  const totalRunKm = runs.reduce((s, r) => s + (r.distance || 0), 0)

  return (
    <div className="fade-in">
      {/* Hero stats */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile.name}
        </h1>
      </div>

      <Grid cols={2} gap={10}>
        <StatCard
          label="Current Weight"
          value={safeWeight}
          unit="kg"
          color="var(--accent2)"
          icon={Target}
          sub={safeGoal ? `Goal: ${safeGoal} kg` : 'Set a goal'}
          delay={0.0}
        />
        <StatCard
          label="Goal Progress"
          value={goalPct}
          unit="%"
          color="var(--green)"
          icon={Trophy}
          sub={`${safeWeight && safeGoal ? Math.abs(safeWeight - safeGoal).toFixed(1) : 0} kg to go`}
          delay={0.05}
        />
        <StatCard
          label="BMI"
          value={bmi}
          color={bmiCat.color}
          icon={Activity}
          sub={bmiCat.label}
          delay={0.1}
        />
        <StatCard
          label="Log Streak"
          value={streak}
          unit="days"
          color="var(--orange)"
          icon={Zap}
          sub="Keep it up!"
          delay={0.15}
        />
      </Grid>

      {/* Goal progress bar */}
      <Card style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Weight goal: {safeStart} → {safeGoal} kg</span>
          <Badge color="var(--green)">{goalPct}% complete</Badge>
        </div>
        <ProgressBar value={goalPct} max={100} color="var(--green)" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
          <span>Start: {safeStart} kg</span>
          <span>Now: {safeWeight} kg</span>
          <span>Goal: {safeGoal} kg</span>
        </div>
      </Card>

      {/* Today's snapshot */}
      <SectionTitle style={{ marginTop: 24 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 20 }}>
          <Flame size={16} color="var(--orange)" /> Today's snapshot
        </span>
      </SectionTitle>
      <MotionCard style={{ marginTop: 8 }} delay={0.2}>
        <div className="snapshot-grid">
          {[
            { label: 'Calories', value: todayLog.calories || 0, unit: 'kcal', color: 'var(--green)', target: profile.dailyCalorieTarget },
            { label: 'Protein', value: todayLog.protein || 0, unit: 'g', color: 'var(--blue)', target: profile.dailyProteinTarget },
            { label: 'Water', value: todayLog.water || 0, unit: 'L', color: 'var(--accent)', target: 3.5 },
            { label: 'Sleep', value: todayLog.sleep || 0, unit: 'hr', color: 'var(--pink)', target: 8 },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.value >= item.target ? item.color : 'var(--text)' }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{item.unit}</div>
              <div style={{ height: 2, background: 'var(--bg4)', borderRadius: 100, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: Math.min(100, (item.value / item.target) * 100) + '%', background: item.color, borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>
      </MotionCard>

      {/* Weekly stats */}
      <Grid cols={2} gap={10} style={{ marginTop: 20 }}>
        <MotionCard delay={0.25}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Weekly avg calories</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{weeklyCalAvg || '—'}</div>
        </MotionCard>
        <MotionCard delay={0.3}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Weekly avg protein</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{weeklyProtAvg || '—'}g</div>
        </MotionCard>
        <MotionCard delay={0.35}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Total km run</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{totalRunKm.toFixed(1)}</div>
        </MotionCard>
        <MotionCard delay={0.4}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Workouts logged</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{workouts.length}</div>
        </MotionCard>
      </Grid>

      {/* Charts */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle>Weight trend (30 days)</SectionTitle>
        <Card>
          <div style={{ height: 160 }}>
            <Line data={weightData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: profile.goalWeight - 2 } } }} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14 }}>
        <SectionTitle>Daily calories (this week)</SectionTitle>
        <Card>
          <div style={{ height: 140 }}>
            <Bar data={calorieData} options={chartDefaults} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Target: {profile.dailyCalorieTarget} kcal</div>
        </Card>
      </div>

      <Grid cols={2} gap={14} style={{ marginTop: 14 }}>
        <div>
          <SectionTitle>Running (14 days)</SectionTitle>
          <Card>
            <div style={{ height: 120 }}>
              <Bar data={runData} options={chartDefaults} />
            </div>
          </Card>
        </div>
        <div>
          <SectionTitle>Workout volume</SectionTitle>
          <Card>
            <div style={{ height: 120 }}>
              <Bar data={volumeData} options={chartDefaults} />
            </div>
          </Card>
        </div>
      </Grid>
      <style>{`
        .snapshot-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .snapshot-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 10px;
          }
        }
      `}</style>
    </div>
  )
}

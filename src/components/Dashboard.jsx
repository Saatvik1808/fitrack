import React, { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Target, Flame, Dumbbell, Activity, Zap, Trophy, Moon, Info, Calendar } from 'lucide-react'
import { Card, StatCard, SectionTitle, ProgressBar, Badge, Grid, MotionCard, Modal } from './UI.jsx'
import {
  calcBMI, bmiCategory, calcGoalProgress, getWeekDates, getLast30Days,
  formatDate, weeklyAvg, getStreakDays, formatLocalYYYYMMDD
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
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  
  const today = formatLocalYYYYMMDD()
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

  // 30-day calorie data (for modal)
  const calorieData30 = useMemo(() => ({
    labels: last30.map(d => formatDate(d)),
    datasets: [{
      data: last30.map(d => logs[d]?.calories || 0),
      backgroundColor: '#6c63ff44',
      hoverBackgroundColor: '#6c63ff',
      borderRadius: 4,
    }]
  }), [logs, last30])

  // Running distance chart
  const runData = useMemo(() => {
    const last14 = last30.slice(-14)
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
  }, [runs, last30])

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

  // **NEW**: Macronutrient Doughnut (Today)
  const macroData = useMemo(() => {
    const p = todayLog.protein || 0;
    const c = todayLog.carbs || 0;
    const f = todayLog.fat || 0;
    return {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        data: [p*4, c*4, f*9], // Approx calories per macro
        backgroundColor: ['#3b82f6', '#f97316', '#ec4899'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    }
  }, [todayLog])

  // **NEW**: Sleep History (7 days)
  const sleepData = useMemo(() => ({
    labels: weekDates.map(d => formatDate(d)),
    datasets: [{
      label: 'Sleep (hrs)',
      data: weekDates.map(d => logs[d]?.sleep || 0),
      backgroundColor: '#a855f744',
      borderColor: '#a855f7',
      borderWidth: 2,
      borderRadius: 4,
    }]
  }), [logs, weekDates])

  const weeklyCalAvg = weeklyAvg(logs, 'calories')
  const weeklyProtAvg = weeklyAvg(logs, 'protein')

  const totalRunKm = runs.reduce((s, r) => s + (r.distance || 0), 0)

  // -- Modal Content Renderer -- //
  function renderAnalysisModal() {
    if (!selectedAnalysis) return null;
    
    const TitleMap = {
      weight: 'Weight History (30 Days)',
      goal: 'Goal Trajectory',
      bmi: 'BMI Breakdown',
      streak: 'Consistency Analysis',
      calories: 'Caloric Intake Trends',
      protein: 'Protein Intake Trends',
      running: 'Running Performance',
      workouts: 'Workout Volume Analysis',
      macros: 'Today\'s Macro Breakdown',
      sleep: 'Sleep Quality & Recovery'
    };

    const title = TitleMap[selectedAnalysis];

    return (
      <Modal isOpen={!!selectedAnalysis} onClose={() => setSelectedAnalysis(null)} title={title}>
        
        {selectedAnalysis === 'weight' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Your body weight history over the last 30 days. Consistent tracking provides the most accurate trend line.</p>
            <div style={{ height: 250 }}>
              <Line data={weightData} options={{...chartDefaults, ...{ scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: profile.goalWeight - 2 } } } }} />
            </div>
            <Grid cols={3} gap={10} style={{ marginTop: 20 }}>
              <div style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>START</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{safeStart}kg</div>
              </div>
              <div style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>CURRENT</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent2)' }}>{safeWeight}kg</div>
              </div>
              <div style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>GOAL</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{safeGoal}kg</div>
              </div>
            </Grid>
          </div>
        )}

        {selectedAnalysis === 'calories' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Expanded 30-day view of your caloric intake. The dashed line represents your daily target.</p>
            <div style={{ height: 250 }}>
              <Bar data={calorieData30} options={chartDefaults} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: 16, borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>DAILY TARGET</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.dailyCalorieTarget} kcal</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>30-DAY AVERAGE</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                  {Math.round(last30.reduce((s, d) => s + (Number(logs[d]?.calories) || 0), 0) / 30)} kcal
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'macros' && (
          <div>
             <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Your caloric distribution between Protein, Carbs, and Fat for today.</p>
             <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={macroData} options={{ plugins: { legend: { display: true, position: 'right', labels: { color: '#9090a8', font: { family: 'Space Grotesk' } } } } }} />
             </div>
          </div>
        )}

        {selectedAnalysis === 'sleep' && (
          <div>
             <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Your sleep duration over the last 7 days. Target is 8 hours for optimal recovery.</p>
             <div style={{ height: 200 }}>
                <Bar data={sleepData} options={chartDefaults} />
             </div>
          </div>
        )}

        {selectedAnalysis === 'bmi' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
              Body Mass Index (BMI) evaluates your weight relative to your height. It's a general indicator of health, though it doesn't account for muscle mass vs. fat.
            </p>
            <div style={{ background: 'var(--bg2)', padding: '16px', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: bmiCat.color, lineHeight: 1 }}>{bmi}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: bmiCat.color, marginBottom: 4 }}>{bmiCat.label}</div>
              </div>
              <div style={{ height: 12, borderRadius: 100, display: 'flex', overflow: 'hidden', background: 'var(--bg4)', width: '100%', position: 'relative' }}>
                <div style={{ width: '25%', background: '#3b82f6' }} title="Underweight (< 18.5)" />
                <div style={{ width: '25%', background: '#22c55e' }} title="Normal (18.5 - 24.9)" />
                <div style={{ width: '25%', background: '#f97316' }} title="Overweight (25 - 29.9)" />
                <div style={{ width: '25%', background: '#ef4444' }} title="Obese (30+)" />
                {bmi > 0 && (
                  <div style={{
                    position: 'absolute',
                    // Map BMI visually across 4 quadrants: (0-18.5), (18.5-25), (25-30), (30-40)
                    left: `${Math.min(95, Math.max(5, bmi < 18.5 ? (bmi/18.5)*25 : bmi < 25 ? 25 + ((bmi-18.5)/6.5)*25 : bmi < 30 ? 50 + ((bmi-25)/5)*25 : 75 + ((bmi-30)/10)*25))}%`,
                    top: -2, height: 16, width: 4, background: '#fff', borderRadius: 4, transform: 'translateX(-50%)',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Underweight', range: '< 18.5', color: '#3b82f6', desc: 'May indicate nutritional deficiency.' },
                { label: 'Normal weight', range: '18.5 - 24.9', color: '#22c55e', desc: 'Associated with lowest health risks.' },
                { label: 'Overweight', range: '25.0 - 29.9', color: '#f97316', desc: 'Slightly elevated health risks.' },
                { label: 'Obese', range: '30.0+', color: '#ef4444', desc: 'Increased risk of chronic conditions.' },
              ].map(cat => (
                <div key={cat.label} style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: bmiCat.label.includes(cat.label.split(' ')[0]) ? 1 : 0.4, transition: 'opacity 0.2s', background: 'var(--bg3)', padding: 10, borderRadius: 8 }}>
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                   <div>
                     <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.label} <span style={{ color: 'var(--text3)', fontWeight: 400, marginLeft: 6 }}>{cat.range}</span></div>
                     <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{cat.desc}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAnalysis === 'streak' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Your 90-day activity matrix. Any logged metric—a workout, nutrition, or body measurement—lights up a day.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'var(--orange)18', padding: 14, borderRadius: 12, color: 'var(--orange)' }}>
                <Flame size={32} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Current Streak</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{streak} <span style={{ fontSize: 16, color: 'var(--text3)', fontWeight: 500 }}>days 🔥</span></div>
              </div>
            </div>

            <div style={{ 
              background: 'var(--bg2)', padding: 16, borderRadius: 12, 
              display: 'flex', flexDirection: 'column', gap: 4,
              overflowX: 'auto', WebkitOverflowScrolling: 'touch'
            }}>
              {/* Generate 7 rows (days of week), 13 cols (~90 days) matrix */}
              {[0,1,2,3,4,5,6].map(dayIndex => (
                <div key={dayIndex} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', width: 22, textAlign: 'right', paddingRight: 4 }}>
                    {dayIndex === 1 ? 'Mon' : dayIndex === 3 ? 'Wed' : dayIndex === 5 ? 'Fri' : ''}
                  </div>
                  {Array.from({length: 13}).map((_, colIndex) => {
                    // Calculate date going backwards from today
                    const daysAgo = (12 - colIndex) * 7 + (6 - dayIndex) - (6 - new Date().getDay());
                    let opacity = 0;
                    if (daysAgo >= 0 && daysAgo < 90) {
                       const d = new Date()
                       d.setDate(d.getDate() - daysAgo)
                       const key = formatLocalYYYYMMDD(d)
                       const log = logs[key]
                       if (log && Object.keys(log).length > 0) opacity = 1;
                       else opacity = 0.08;
                    } else if (daysAgo < 0) {
                      opacity = 0; // Future
                    }

                    return (
                      <div 
                        key={colIndex} 
                        style={{ 
                          width: 14, height: 14, borderRadius: 3, 
                          background: opacity === 1 ? 'var(--orange)' : 'var(--text3)',
                          opacity: opacity,
                          transform: opacity === 1 ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: opacity === 1 ? '0 2px 4px rgba(249,115,22,0.3)' : 'none'
                        }}
                        title={daysAgo >= 0 ? `${daysAgo} days ago` : 'Future'}
                      />
                    )
                  })}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 10, color: 'var(--text3)' }}>
                Less <div style={{width:10, height:10, borderRadius:2, background:'var(--text3)', opacity:0.08}}/> 
                <div style={{width:10, height:10, borderRadius:2, background:'var(--orange)', opacity:1}}/> More
              </div>
            </div>
          </div>
        )}

        {['goal', 'protein', 'running', 'workouts'].includes(selectedAnalysis) && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Activity size={40} color="var(--accent)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Analysis generating...</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>
              This module tracks highly detailed historic aggregations for this metric. 
              Continue logging data consistently to unlock AI-driven insights on your {selectedAnalysis} trends.
            </p>
          </div>
        )}
      </Modal>
    )
  }
  // --------------------------------- //

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
          onClick={() => setSelectedAnalysis('weight')}
        />
        <StatCard
          label="Goal Progress"
          value={goalPct}
          unit="%"
          color="var(--green)"
          icon={Trophy}
          sub={`${safeWeight && safeGoal ? Math.abs(safeWeight - safeGoal).toFixed(1) : 0} kg to go`}
          delay={0.05}
          onClick={() => setSelectedAnalysis('goal')}
        />
        <StatCard
          label="BMI"
          value={bmi}
          color={bmiCat.color}
          icon={Activity}
          sub={bmiCat.label}
          delay={0.1}
          onClick={() => setSelectedAnalysis('bmi')}
        />
        <StatCard
          label="Log Streak"
          value={streak}
          unit="days"
          color="var(--orange)"
          icon={Zap}
          sub="Keep it up!"
          delay={0.15}
          onClick={() => setSelectedAnalysis('streak')}
        />
      </Grid>

      {/* Goal progress bar */}
      <Card style={{ marginTop: 14 }} onClick={() => setSelectedAnalysis('goal')} className="clickable-card">
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
      <MotionCard style={{ marginTop: 8 }} delay={0.2} onClick={() => setSelectedAnalysis('macros')}>
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
        <MotionCard delay={0.25} onClick={() => setSelectedAnalysis('calories')}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Weekly avg calories</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{weeklyCalAvg || '—'}</div>
        </MotionCard>
        <MotionCard delay={0.3} onClick={() => setSelectedAnalysis('protein')}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Weekly avg protein</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{weeklyProtAvg || '—'}g</div>
        </MotionCard>
        <MotionCard delay={0.35} onClick={() => setSelectedAnalysis('running')}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Total km run</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{totalRunKm.toFixed(1)}</div>
        </MotionCard>
        <MotionCard delay={0.4} onClick={() => setSelectedAnalysis('workouts')}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Workouts logged</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{workouts.length}</div>
        </MotionCard>
      </Grid>

      {/* Charts */}
      <div style={{ marginTop: 20 }} onClick={() => setSelectedAnalysis('weight')} className="clickable-section">
        <SectionTitle>Weight trend (30 days)</SectionTitle>
        <Card className="hover-card">
          <div style={{ height: 160 }}>
            <Line data={weightData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: profile.goalWeight - 2 } } }} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14 }} onClick={() => setSelectedAnalysis('calories')} className="clickable-section">
        <SectionTitle>Daily calories (this week)</SectionTitle>
        <Card className="hover-card">
          <div style={{ height: 140 }}>
            <Bar data={calorieData} options={chartDefaults} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Target: {profile.dailyCalorieTarget} kcal</div>
        </Card>
      </div>
      
      {/* NEW CHARTS: Sleep and Macros combined row */}
      <Grid cols={2} gap={14} style={{ marginTop: 14 }}>
        <div onClick={() => setSelectedAnalysis('macros')} className="clickable-section">
          <SectionTitle>Today's Macros</SectionTitle>
          <Card className="hover-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: 120, width: '100%', maxWidth: 120 }}>
              {(todayLog.protein || todayLog.carbs || todayLog.fat) ? (
                 <Doughnut data={macroData} options={{ plugins: { legend: { display: false } }, cutout: '75%' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 40 }}>No Data</div>
              )}
            </div>
          </Card>
        </div>
        <div onClick={() => setSelectedAnalysis('sleep')} className="clickable-section">
          <SectionTitle>Sleep Recovery</SectionTitle>
          <Card className="hover-card">
            <div style={{ height: 120 }}>
              <Bar data={sleepData} options={chartDefaults} />
            </div>
          </Card>
        </div>
      </Grid>

      <Grid cols={2} gap={14} style={{ marginTop: 14 }}>
        <div onClick={() => setSelectedAnalysis('running')} className="clickable-section">
          <SectionTitle>Running (14 days)</SectionTitle>
          <Card className="hover-card">
            <div style={{ height: 120 }}>
              <Bar data={runData} options={chartDefaults} />
            </div>
          </Card>
        </div>
        <div onClick={() => setSelectedAnalysis('workouts')} className="clickable-section">
          <SectionTitle>Workout volume</SectionTitle>
          <Card className="hover-card">
            <div style={{ height: 120 }}>
              <Bar data={volumeData} options={chartDefaults} />
            </div>
          </Card>
        </div>
      </Grid>

      {renderAnalysisModal()}

      <style>{`
        .snapshot-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          text-align: center;
        }
        .clickable-section {
          cursor: pointer;
        }
        .hover-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .clickable-section:hover .hover-card {
           transform: scale(0.99);
           border-color: var(--accent);
        }
        .clickable-card {
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .clickable-card:hover {
          transform: scale(0.99);
          border-color: var(--accent);
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

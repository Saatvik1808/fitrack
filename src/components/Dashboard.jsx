import React, { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Target, Flame, Dumbbell, Activity, Zap, Trophy, Moon, Info, Calendar, Droplets } from 'lucide-react'
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
      backgroundColor: 'rgba(13, 14, 21, 0.9)',
      borderColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      titleColor: '#9CA3AF',
      bodyColor: '#F8F9FA',
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
      titleFont: { family: 'Space Grotesk', size: 12 },
      bodyFont: { family: 'Space Grotesk', size: 14, weight: 'bold' }
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#6B7280', font: { size: 10, family: 'Space Grotesk' }, maxRotation: 0 },
    },
    y: {
      display: false, // Clean premium look, hide Y axis entirely
      grid: { display: false },
      border: { display: false },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}

export default function Dashboard({ logs, setLog, workouts, runs, profile }) {
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

  // Hydration parsing & actions
  const parseWaterAmount = (val) => {
    if (!val) return 0;
    const n = Number(val);
    if (n < 20) return n * 1000;
    return n;
  };
  const waterIntake = parseWaterAmount(todayLog.water);
  const waterGoal = parseWaterAmount(todayLog.waterGoal) || 3000;
  const waterPct = Math.min((waterIntake / waterGoal) * 100, 100) || 0;

  const handleAddWater = (amount) => {
    if (!setLog) return;
    setLog(today, { water: waterIntake + amount, waterGoal: waterGoal });
  };

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
        borderColor: '#818CF8',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
          gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#818CF8',
        pointHoverBorderColor: '#fff',
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

  // **NEW**: 30-day protein data (for modal)
  const proteinData30 = useMemo(() => ({
    labels: last30.map(d => formatDate(d)),
    datasets: [{
      data: last30.map(d => Number(logs[d]?.protein) || 0),
      backgroundColor: '#3b82f644',
      hoverBackgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  }), [logs, last30])

  // **NEW**: 30-day water data (for modal)
  const waterData30 = useMemo(() => ({
    labels: last30.map(d => formatDate(d)),
    datasets: [{
      data: last30.map(d => parseWaterAmount(logs[d]?.water) / 1000),
      backgroundColor: '#38bdf844',
      hoverBackgroundColor: '#38bdf8',
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

  const totalRunKm = runs.reduce((s, r) => s + (Number(r.distance) || 0), 0)

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
      sleep: 'Sleep Quality & Recovery',
      water: 'Hydration Trends'
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

        {selectedAnalysis === 'water' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Expanded 30-day view of your hydration. Consistent water intake is key to recovery and digestion.</p>
            <div style={{ height: 250 }}>
              <Bar data={waterData30} options={chartDefaults} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: 16, borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>DAILY TARGET</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{(waterGoal / 1000).toFixed(1)} L</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>30-DAY AVERAGE</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#38bdf8' }}>
                  {(last30.reduce((s, d) => s + parseWaterAmount(logs[d]?.water), 0) / 30 / 1000).toFixed(1)} L
                </div>
              </div>
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

        {selectedAnalysis === 'goal' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Your trajectory towards your target weight based on your selected start and goal metrics.</p>
            
            <div style={{ background: 'var(--bg2)', padding: '24px 20px', borderRadius: 16, marginBottom: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative', zIndex: 2 }}>
                
                {/* Flow Diagram - Start */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>
                    {safeStart}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: 1 }}>START</div>
                </div>

                {/* Flow Diagram - Current */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)22', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 16, fontWeight: 800, color: 'var(--accent2)', boxShadow: '0 0 20px rgba(108,99,255,0.2)' }}>
                    {safeWeight}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: 1 }}>CURRENT</div>
                </div>

                {/* Flow Diagram - Goal */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green)22', border: '2px dashed var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                    {safeGoal}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: 1 }}>GOAL</div>
                </div>
              </div>

              {/* Connecting Line behind circles */}
              <div style={{ position: 'absolute', top: 48, left: '16%', right: '16%', height: 2, background: 'var(--border)', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: 48, left: '16%', width: `${Math.max(0, Math.min(100, goalPct * 0.68))}%`, height: 2, background: 'var(--accent)', zIndex: 1, transition: 'width 1s ease-out' }} />

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
                  {Math.abs(safeStart - safeWeight).toFixed(1)} <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>kg {safeStart > safeGoal ? 'lost' : 'gained'}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                  {Math.abs(safeWeight - safeGoal).toFixed(1)} kg remaining to hit your target
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg3)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
               <Target size={24} color="var(--accent)" style={{ flexShrink: 0 }} />
               <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                 {goalPct >= 100 
                   ? "You've successfully reached your goal! It's time to set a new target in Settings or enter a maintenance phase." 
                   : "Keep logging your weight consistently to generate an AI-projected completion date based on your recent 30-day velocity."}
               </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'protein' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Expanded 30-day view of your protein intake. Hitting your protein target is critical for muscle retention and growth.</p>
            <div style={{ height: 250 }}>
              <Bar data={proteinData30} options={chartDefaults} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: 16, borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>DAILY TARGET</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.dailyProteinTarget} g</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>30-DAY AVERAGE</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>
                  {Math.round(last30.reduce((s, d) => s + (Number(logs[d]?.protein) || 0), 0) / 30)} g
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'running' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Distance accumulated over the last 14 days. Watch your mileage trends to avoid overtraining.</p>
            {runs.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg2)', borderRadius: 12 }}>
                 <Activity size={32} color="var(--text3)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                 <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)' }}>No Runs Logged</div>
                 <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Log runs in the Running tab to see analytics.</div>
               </div>
            ) : (
               <>
                 <div style={{ height: 250 }}>
                   <Bar data={runData} options={chartDefaults} />
                 </div>
                 <Grid cols={2} gap={10} style={{ marginTop: 20 }}>
                   <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12 }}>
                     <div style={{ fontSize: 11, color: 'var(--text3)' }}>TOTAL RUNS</div>
                     <div style={{ fontSize: 24, fontWeight: 700 }}>{runs.length}</div>
                   </div>
                   <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12 }}>
                     <div style={{ fontSize: 11, color: 'var(--text3)' }}>TOTAL DISTANCE</div>
                     <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{totalRunKm.toFixed(1)} <span style={{fontSize:14}}>km</span></div>
                   </div>
                 </Grid>
               </>
            )}
          </div>
        )}

        {selectedAnalysis === 'workouts' && (
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Total lifting volume (weight × reps) across your weekly workouts. Progressive overload means this trend should go up over time.</p>
            {workouts.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg2)', borderRadius: 12 }}>
                 <Dumbbell size={32} color="var(--text3)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                 <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)' }}>No Workouts Logged</div>
                 <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Log sessions in the Workout tab to track volume.</div>
               </div>
            ) : (
               <>
                 <div style={{ height: 250 }}>
                   <Bar data={volumeData} options={chartDefaults} />
                 </div>
                 <div style={{ marginTop: 20, background: 'var(--bg2)', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ background: '#3b82f633', padding: 12, borderRadius: 10, color: '#3b82f6' }}>
                     <Dumbbell size={24} />
                   </div>
                   <div>
                     <div style={{ fontSize: 11, color: 'var(--text3)' }}>7-DAY TOTAL VOLUME</div>
                     <div style={{ fontSize: 24, fontWeight: 700 }}>
                       {volumeData.datasets[0].data.reduce((a,b)=>a+b, 0).toLocaleString()} <span style={{fontSize:14, color:'var(--text3)', fontWeight:500}}>kg</span>
                     </div>
                   </div>
                 </div>
               </>
            )}
          </div>
        )}
      </Modal>
    )
  }
  // --------------------------------- //

  return (
    <div className="fade-in">
      {/* Hero stats */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #fff, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            <br/>{profile.name}
          </h1>
        </div>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--orange)18', padding: '8px 14px', borderRadius: 100, border: '1px solid var(--orange)44', boxShadow: 'var(--glow-orange)' }}>
            <Flame size={16} color="var(--orange)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>{streak} Day Streak</span>
          </div>
        )}
      </div>

      {/* Main Goal Circular Progress */}
      <MotionCard delay={0.1} onClick={() => setSelectedAnalysis('goal')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Background Track */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="110" cy="110" r="96" fill="none" stroke="var(--bg4)" strokeWidth="16" />
            <circle cx="110" cy="110" r="96" fill="none" stroke="var(--green)" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 96}`} strokeDashoffset={`${2 * Math.PI * 96 * (1 - (goalPct / 100))}`} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.4))' }} />
          </svg>
          
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>CURRENT</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{safeWeight}</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500, marginTop: 4 }}>kg</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 32, padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>START</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text2)' }}>{safeStart} kg</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>REMAINING</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{Math.abs(safeWeight - safeGoal).toFixed(1)} kg</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>GOAL</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{safeGoal} kg</div>
          </div>
        </div>
      </MotionCard>

      {/* Today's snapshot & Water Dashboard */}
      <SectionTitle style={{ marginTop: 24 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 20 }}>
          <Flame size={16} color="var(--orange)" /> Daily Overview
        </span>
      </SectionTitle>

      <Grid cols={2} gap={16} style={{ marginTop: 16 }}>
        <MotionCard delay={0.2} onClick={() => setSelectedAnalysis('macros')} className="clickable-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, textAlign: 'center' }}>
            {[
              { label: 'Calories', value: todayLog.calories || 0, unit: 'kcal', color: 'var(--green)', target: profile.dailyCalorieTarget },
              { label: 'Protein', value: todayLog.protein || 0, unit: 'g', color: 'var(--blue)', target: profile.dailyProteinTarget },
              { label: 'Carbs', value: todayLog.carbs || 0, unit: 'g', color: 'var(--orange)', target: 200 }, // Carbs target placeholder
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

        <MotionCard delay={0.25} className="glass-card" style={{ background: 'linear-gradient(145deg, var(--bg2) 0%, rgba(56, 189, 248, 0.05) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} onClick={() => setSelectedAnalysis('water')} className="clickable-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Droplets size={16} color="var(--blue)" />
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>HYDRATION</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
                {(waterIntake / 1000).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>L</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                {waterPct.toFixed(0)}% of {(waterGoal / 1000).toFixed(1)}L
              </div>
            </div>

            <div style={{ 
              width: 50, height: 76, borderRadius: '8px 8px 16px 16px', 
              border: '2px solid rgba(56, 189, 248, 0.3)', 
              position: 'relative', overflow: 'hidden',
              background: 'rgba(56, 189, 248, 0.05)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, top: `${100 - waterPct}%`,
                background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.8) 0%, rgba(56, 189, 248, 0.9) 100%)',
                boxShadow: '0 -4px 12px rgba(56, 189, 248, 0.4)',
                transition: 'top 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <div style={{ position: 'absolute', top: -4, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
             <button onClick={() => handleAddWater(250)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
               +250ml
             </button>
             <button onClick={() => handleAddWater(500)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
               +500ml
             </button>
          </div>
        </MotionCard>
      </Grid>

      {/* Unified Activity Summary */}
      <SectionTitle style={{ marginTop: 24 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          <Activity size={16} color="var(--accent)" /> Activity Summary
        </span>
      </SectionTitle>

      <MotionCard delay={0.3} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
           <div onClick={() => setSelectedAnalysis('calories')} className="clickable-card" style={{ padding: 12, background: 'var(--bg3)', borderRadius: 12 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--orange)' }}>
               <Flame size={14} /> <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>AVG CALS</span>
             </div>
             <div style={{ fontSize: 24, fontWeight: 800 }}>{weeklyCalAvg ? weeklyCalAvg.toLocaleString() : '—'}<span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginLeft: 4 }}>kcal</span></div>
           </div>

           <div onClick={() => setSelectedAnalysis('protein')} className="clickable-card" style={{ padding: 12, background: 'var(--bg3)', borderRadius: 12 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--blue)' }}>
               <Target size={14} /> <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>AVG PROTEIN</span>
             </div>
             <div style={{ fontSize: 24, fontWeight: 800 }}>{weeklyProtAvg || '—'}<span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginLeft: 4 }}>g</span></div>
           </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
           <div onClick={() => setSelectedAnalysis('running')} className="clickable-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green)22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
               <Activity size={20} />
             </div>
             <div>
               <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>DISTANCE</div>
               <div style={{ fontSize: 18, fontWeight: 700 }}>{totalRunKm.toFixed(1)} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>km</span></div>
             </div>
           </div>

           <div onClick={() => setSelectedAnalysis('workouts')} className="clickable-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
               <Dumbbell size={20} />
             </div>
             <div>
               <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>WORKOUTS</div>
               <div style={{ fontSize: 18, fontWeight: 700 }}>{workouts.length} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>logs</span></div>
             </div>
           </div>
        </div>
      </MotionCard>

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
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .clickable-section {
          cursor: pointer;
          transition: transform var(--transition);
        }
        .clickable-section:active {
          transform: scale(0.98);
        }
        .hover-card {
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .clickable-section:hover .hover-card {
           border-color: rgba(255,255,255,0.15);
           box-shadow: var(--shadow);
        }
      `}</style>
    </div>
  )
}

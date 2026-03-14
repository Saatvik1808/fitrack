import React, { useState } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './components/Dashboard.jsx'
import DailyLog from './components/DailyLog.jsx'
import WorkoutLogger from './components/WorkoutLogger.jsx'
import RunningTracker from './components/RunningTracker.jsx'
import AIFoodAnalyzer from './components/AIFoodAnalyzer.jsx'
import History from './components/History.jsx'
import Settings from './components/Settings.jsx'
import { useProfile, useDailyLogs, useWorkouts, useRuns } from './hooks/useStorage.js'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useProfile()
  const { logs, setLog, getLog, getTodayLog, today } = useDailyLogs()
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const { runs, addRun, deleteRun } = useRuns()

  function handleAddFoodToLog(nutrition) {
    const todayLog = getTodayLog()
    setLog(today, {
      calories: (Number(todayLog.calories) || 0) + Number(nutrition.calories || 0),
      protein: (Number(todayLog.protein) || 0) + Number(nutrition.protein || 0),
      carbs: (Number(todayLog.carbs) || 0) + Number(nutrition.carbs || 0),
      fat: (Number(todayLog.fat) || 0) + Number(nutrition.fat || 0),
    })
    setPage('log')
  }

  const pages = {
    dashboard: <Dashboard logs={logs} workouts={workouts} runs={runs} profile={profile} />,
    log: <DailyLog logs={logs} setLog={setLog} today={today} profile={profile} />,
    workout: <WorkoutLogger workouts={workouts} addWorkout={addWorkout} deleteWorkout={deleteWorkout} />,
    running: <RunningTracker runs={runs} addRun={addRun} deleteRun={deleteRun} profile={profile} />,
    ai: <AIFoodAnalyzer onAddToLog={handleAddFoodToLog} apiKey={profile.geminiApiKey} />,
    history: <History logs={logs} workouts={workouts} runs={runs} />,
    settings: <Settings profile={profile} setProfile={setProfile} />,
  }

  return (
    <div style={{ minHeight: '100dvh' }}>
      <Nav active={page} onChange={setPage} />

      {/* Main content */}
      <main style={{
        marginLeft: 'var(--sidebar-width, 220px)',
        padding: '1.5rem 1.25rem',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        maxWidth: 700,
      }}>
        {pages[page]}
      </main>

      <style>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
    </div>
  )
}

"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import Nav from '@/components/Nav.jsx'
import Dashboard from '@/components/Dashboard.jsx'
import DailyLog from '@/components/DailyLog.jsx'
import WorkoutLogger from '@/components/WorkoutLogger.jsx'
import RunningTracker from '@/components/RunningTracker.jsx'
import AIFoodAnalyzer from '@/components/AIFoodAnalyzer.jsx'
import History from '@/components/History.jsx'
import Settings from '@/components/Settings.jsx'
import AppDownload from '@/components/AppDownload.jsx'
import { useProfile, useDailyLogs, useWorkouts, useRuns } from '@/hooks/useStorage.js'
import { useTheme } from '@/hooks/useTheme.js'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useProfile()
  const { logs, setLog, getLog, getTodayLog, today } = useDailyLogs()
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const { runs, addRun, deleteRun } = useRuns()
  const [theme, setTheme] = useTheme()

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

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  const pages = {
    dashboard: <Dashboard logs={logs} workouts={workouts} runs={runs} profile={profile} />,
    log: <DailyLog logs={logs} setLog={setLog} today={today} profile={profile} />,
    workout: <WorkoutLogger workouts={workouts} addWorkout={addWorkout} deleteWorkout={deleteWorkout} />,
    running: <RunningTracker runs={runs} addRun={addRun} deleteRun={deleteRun} profile={profile} />,
    ai: <AIFoodAnalyzer onAddToLog={handleAddFoodToLog} apiKey={profile.geminiApiKey} />,
    history: <History logs={logs} workouts={workouts} runs={runs} />,
    settings: <Settings profile={profile} setProfile={setProfile} theme={theme} setTheme={setTheme} />,
    download: <AppDownload />,
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      <Nav active={page} onChange={setPage} />

      {/* Main content */}
      <main style={{
        marginLeft: 'var(--sidebar-width, 220px)',
        padding: '1.5rem 1.25rem',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
        width: '100%',
        maxWidth: 768,
        margin: '0 auto',
        minHeight: '100dvh',
        boxSizing: 'border-box'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {pages[page]}
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important;
            padding-top: calc(2rem + env(safe-area-inset-top)) !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

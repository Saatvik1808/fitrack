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
import RecoveryTracker from '@/components/RecoveryTracker.jsx'
import AIFoodAnalyzer from '@/components/AIFoodAnalyzer.jsx'
import History from '@/components/History.jsx'
import Settings from '@/components/Settings.jsx'
import AppDownload from '@/components/AppDownload.jsx'
import { useProfile, useDailyLogs, useWorkouts, useRuns, useSettings } from '@/hooks/useStorage.js'
import { useTheme } from '@/hooks/useTheme.js'
import { LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const [page, setPage] = useState('dashboard')
  
  // Pass userId and email to hooks for data isolation and migration
  const [profile, setProfile, loadingProfile] = useProfile(user?.uid, user?.email)
  const { logs, setLog, getLog, getTodayLog, today } = useDailyLogs(user?.uid)
  const { workouts, addWorkout, deleteWorkout } = useWorkouts(user?.uid)
  const { runs, addRun, deleteRun } = useRuns(user?.uid)
  const [theme, setTheme] = useTheme()
  const [settings, setSettings] = useSettings(user?.uid)

  // Sync settings theme to local theme hook
  useEffect(() => {
    if (settings?.theme && settings.theme !== theme) {
      setTheme(settings.theme)
    }
  }, [settings?.theme])

  // Sync local theme changes back to settings
  useEffect(() => {
    if (theme && settings?.theme && theme !== settings.theme) {
      setSettings({ ...settings, theme })
    }
  }, [theme])

  function handleAddFoodToLog(nutrition) {
    const todayLog = getTodayLog()
    const currentMeals = todayLog.meals || []
    
    const newMeal = {
      id: Date.now(),
      name: nutrition.foodName || 'AI Logged Food',
      calories: nutrition.calories || 0,
      protein: nutrition.protein || 0,
      carbs: nutrition.carbs || 0,
      fat: nutrition.fat || 0,
    }
    
    const updatedMeals = [...currentMeals, newMeal]
    
    // Auto-calculate totals from meal list
    const totals = updatedMeals.reduce((acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    setLog(today, {
      meals: updatedMeals,
      calories: totals.calories || '',
      protein: totals.protein || '',
      carbs: totals.carbs || '',
      fat: totals.fat || '',
    })
    setPage('log')
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch(err) {
      console.error(err)
    }
  }

  // Check if profile is completely empty
  useEffect(() => {
    if (!loading && user && !loadingProfile && profile && !profile.currentWeight) {
      router.push('/onboarding')
    }
  }, [user, loading, profile, loadingProfile, router])

  // Show loading while checking auth or waiting for sync
  if (loading || loadingProfile || !user || (!profile?.currentWeight && !window?.location?.search?.includes('bypass=true'))) {
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

  // Developer bypass injects a dummy profile so the UI can mount without Firebase connectivity
  const effectiveProfile = profile?.currentWeight ? profile : {
    name: 'Demo User',
    currentWeight: 75,
    goalWeight: 70,
    dailyCalorieTarget: 2000,
    dailyProteinTarget: 150,
  };

  const pages = {
    dashboard: <Dashboard logs={logs} setLog={setLog} workouts={workouts} runs={runs} profile={effectiveProfile} />,
    log: <DailyLog logs={logs} setLog={setLog} today={today} profile={effectiveProfile} />,
    recovery: <RecoveryTracker logs={logs} setLog={setLog} today={today} />,
    workout: <WorkoutLogger workouts={workouts} addWorkout={addWorkout} deleteWorkout={deleteWorkout} />,
    running: <RunningTracker runs={runs} addRun={addRun} deleteRun={deleteRun} profile={effectiveProfile} />,
    ai: <AIFoodAnalyzer onAddToLog={handleAddFoodToLog} apiKey={effectiveProfile.geminiApiKey} />,
    history: <History logs={logs} workouts={workouts} runs={runs} />,
    settings: <Settings profile={profile} setProfile={setProfile} theme={theme} setTheme={setTheme} user={user} onLogout={handleLogout} />,
    download: <AppDownload />,
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      <Nav active={page} onChange={setPage} onLogout={handleLogout} />

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
        boxSizing: 'border-box',
        position: 'relative'
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

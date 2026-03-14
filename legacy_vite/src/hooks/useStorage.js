import { useState, useEffect, useCallback } from 'react'

const KEYS = {
  LOGS: 'fittrack_logs',
  WORKOUTS: 'fittrack_workouts',
  RUNS: 'fittrack_runs',
  PROFILE: 'fittrack_profile',
  SETTINGS: 'fittrack_settings',
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function useProfile() {
  const [profile, setProfileState] = useState(() => load(KEYS.PROFILE, {
    name: 'Athlete',
    currentWeight: 84,
    goalWeight: 70,
    height: 173,
    startWeight: 84,
    startDate: getToday(),
    dailyCalorieTarget: 1650,
    dailyProteinTarget: 163,
    geminiApiKey: '',
  }))

  const setProfile = useCallback((updater) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      save(KEYS.PROFILE, next)
      return next
    })
  }, [])

  return [profile, setProfile]
}

export function useDailyLogs() {
  const [logs, setLogsState] = useState(() => load(KEYS.LOGS, {}))

  const setLog = useCallback((date, updater) => {
    setLogsState(prev => {
      const current = prev[date] || {}
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      const newLogs = { ...prev, [date]: next }
      save(KEYS.LOGS, newLogs)
      return newLogs
    })
  }, [])

  const getLog = useCallback((date) => logs[date] || {}, [logs])
  const getTodayLog = useCallback(() => getLog(getToday()), [getLog])

  return { logs, setLog, getLog, getTodayLog, today: getToday() }
}

export function useWorkouts() {
  const [workouts, setWorkoutsState] = useState(() => load(KEYS.WORKOUTS, []))

  const addWorkout = useCallback((workout) => {
    setWorkoutsState(prev => {
      const next = [{ ...workout, id: Date.now(), date: workout.date || getToday() }, ...prev]
      save(KEYS.WORKOUTS, next)
      return next
    })
  }, [])

  const deleteWorkout = useCallback((id) => {
    setWorkoutsState(prev => {
      const next = prev.filter(w => w.id !== id)
      save(KEYS.WORKOUTS, next)
      return next
    })
  }, [])

  return { workouts, addWorkout, deleteWorkout }
}

export function useRuns() {
  const [runs, setRunsState] = useState(() => load(KEYS.RUNS, []))

  const addRun = useCallback((run) => {
    setRunsState(prev => {
      const next = [{ ...run, id: Date.now(), date: run.date || getToday() }, ...prev]
      save(KEYS.RUNS, next)
      return next
    })
  }, [])

  const deleteRun = useCallback((id) => {
    setRunsState(prev => {
      const next = prev.filter(r => r.id !== id)
      save(KEYS.RUNS, next)
      return next
    })
  }, [])

  return { runs, addRun, deleteRun }
}

export function exportData() {
  const data = {
    profile: load(KEYS.PROFILE, {}),
    logs: load(KEYS.LOGS, {}),
    workouts: load(KEYS.WORKOUTS, []),
    runs: load(KEYS.RUNS, []),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fittrack-export-${getToday()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(logs) {
  const rows = [['Date', 'Weight', 'Calories', 'Protein', 'Carbs', 'Fat', 'Water', 'Sleep', 'Energy', 'Mood']]
  Object.entries(logs).sort().forEach(([date, log]) => {
    rows.push([
      date,
      log.weight || '',
      log.calories || '',
      log.protein || '',
      log.carbs || '',
      log.fat || '',
      log.water || '',
      log.sleep || '',
      log.energy || '',
      log.mood || '',
    ])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fittrack-logs-${getToday()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

// Migration emails — existing localStorage data belongs to these users
const SAATVIK_EMAILS = [
  'saatvik.shrivastava08@bricknbolt.com',
  'saatvik.shrivastava08@gmail.com'
]

const BASE_KEYS = {
  LOGS: 'fittrack_logs',
  WORKOUTS: 'fittrack_workouts',
  RUNS: 'fittrack_runs',
  PROFILE: 'fittrack_profile',
  SETTINGS: 'fittrack_settings',
}

function userKeys(userId) {
  return {
    LOGS: `fittrack_${userId}_logs`,
    WORKOUTS: `fittrack_${userId}_workouts`,
    RUNS: `fittrack_${userId}_runs`,
    PROFILE: `fittrack_${userId}_profile`,
    SETTINGS: `fittrack_${userId}_settings`,
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getDefaultProfile(userEmail) {
  if (userEmail && SAATVIK_EMAILS.includes(userEmail)) {
    return {
      name: 'Saatvik',
      currentWeight: 84,
      goalWeight: 70,
      height: 173,
      startWeight: 84,
      startDate: getToday(),
      dailyCalorieTarget: 1650,
      dailyProteinTarget: 163,
      geminiApiKey: '',
    }
  }
  return {
    name: '',
    currentWeight: '',
    goalWeight: '',
    height: '',
    startWeight: '',
    startDate: getToday(),
    dailyCalorieTarget: '',
    dailyProteinTarget: '',
    geminiApiKey: '',
  }
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value, userId, collectionName) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  
  // Sync to Firestore in the background if db is available
  if (userId && db && collectionName) {
    const docRef = doc(db, 'users', userId, 'data', collectionName)
    setDoc(docRef, { data: value }, { merge: true }).catch(err => console.error("Firestore sync error:", err))
  }
}

// Fetch from Firestore on mount
async function fetchFromDb(userId, collectionName, key, setState) {
  if (!userId || !db) return
  try {
    const docRef = doc(db, 'users', userId, 'data', collectionName)
    const snap = await getDoc(docRef)
    if (snap.exists() && snap.data().data) {
      const remoteData = snap.data().data
      setState(remoteData)
      try { localStorage.setItem(key, JSON.stringify(remoteData)) } catch {}
    }
  } catch (err) {
    console.error("Firestore fetch error:", err)
  }
}

// Migrate original unscoped data to user-scoped keys (runs once per key)
function migrateIfNeeded(userId, userEmail) {
  if (!SAATVIK_EMAILS.includes(userEmail)) return
  const keys = userKeys(userId)
  Object.entries(BASE_KEYS).forEach(([name, oldKey]) => {
    const newKey = keys[name]
    // Only migrate if old data exists and new key doesn't
    if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey))
      // Also push migrated data to DB immediately
      try {
        const data = JSON.parse(localStorage.getItem(oldKey))
        save(newKey, data, userId, name)
      } catch {}
    }
  })
}

export function useProfile(userId, userEmail) {
  // Run migration on mount
  useEffect(() => {
    if (userId && userEmail) migrateIfNeeded(userId, userEmail)
  }, [userId, userEmail])

  const key = userId ? userKeys(userId).PROFILE : BASE_KEYS.PROFILE

  const [profile, setProfileState] = useState(() => load(key, getDefaultProfile(userEmail)))

  // Re-load when userId changes and fetch from DB
  useEffect(() => {
    if (userId) {
      const k = userKeys(userId).PROFILE
      setProfileState(load(k, getDefaultProfile(userEmail)))
      fetchFromDb(userId, 'PROFILE', k, setProfileState)
    }
  }, [userId, userEmail])

  const setProfile = useCallback((updater) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      save(userId ? userKeys(userId).PROFILE : BASE_KEYS.PROFILE, next, userId, 'PROFILE')
      return next
    })
  }, [userId])

  return [profile, setProfile]
}

export function useDailyLogs(userId) {
  const key = userId ? userKeys(userId).LOGS : BASE_KEYS.LOGS
  const [logs, setLogsState] = useState(() => load(key, {}))

  useEffect(() => {
    if (userId) {
      const k = userKeys(userId).LOGS
      setLogsState(load(k, {}))
      fetchFromDb(userId, 'LOGS', k, setLogsState)
    }
  }, [userId])

  const setLog = useCallback((date, updater) => {
    setLogsState(prev => {
      const current = prev[date] || {}
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      const newLogs = { ...prev, [date]: next }
      save(userId ? userKeys(userId).LOGS : BASE_KEYS.LOGS, newLogs, userId, 'LOGS')
      return newLogs
    })
  }, [userId])

  const getLog = useCallback((date) => logs[date] || {}, [logs])
  const getTodayLog = useCallback(() => getLog(getToday()), [getLog])

  return { logs, setLog, getLog, getTodayLog, today: getToday() }
}

export function useWorkouts(userId) {
  const key = userId ? userKeys(userId).WORKOUTS : BASE_KEYS.WORKOUTS
  const [workouts, setWorkoutsState] = useState(() => load(key, []))

  useEffect(() => {
    if (userId) {
      const k = userKeys(userId).WORKOUTS
      setWorkoutsState(load(k, []))
      fetchFromDb(userId, 'WORKOUTS', k, setWorkoutsState)
    }
  }, [userId])

  const addWorkout = useCallback((workout) => {
    setWorkoutsState(prev => {
      const next = [{ ...workout, id: Date.now(), date: workout.date || getToday() }, ...prev]
      save(userId ? userKeys(userId).WORKOUTS : BASE_KEYS.WORKOUTS, next, userId, 'WORKOUTS')
      return next
    })
  }, [userId])

  const deleteWorkout = useCallback((id) => {
    setWorkoutsState(prev => {
      const next = prev.filter(w => w.id !== id)
      save(userId ? userKeys(userId).WORKOUTS : BASE_KEYS.WORKOUTS, next, userId, 'WORKOUTS')
      return next
    })
  }, [userId])

  return { workouts, addWorkout, deleteWorkout }
}

export function useRuns(userId) {
  const key = userId ? userKeys(userId).RUNS : BASE_KEYS.RUNS
  const [runs, setRunsState] = useState(() => load(key, []))

  useEffect(() => {
    if (userId) {
      const k = userKeys(userId).RUNS
      setRunsState(load(k, []))
      fetchFromDb(userId, 'RUNS', k, setRunsState)
    }
  }, [userId])

  const addRun = useCallback((run) => {
    setRunsState(prev => {
      const next = [{ ...run, id: Date.now(), date: run.date || getToday() }, ...prev]
      save(userId ? userKeys(userId).RUNS : BASE_KEYS.RUNS, next, userId, 'RUNS')
      return next
    })
  }, [userId])

  const deleteRun = useCallback((id) => {
    setRunsState(prev => {
      const next = prev.filter(r => r.id !== id)
      save(userId ? userKeys(userId).RUNS : BASE_KEYS.RUNS, next, userId, 'RUNS')
      return next
    })
  }, [userId])

  return { runs, addRun, deleteRun }
}

export function exportData(userId) {
  const keys = userId ? userKeys(userId) : BASE_KEYS
  const data = {
    profile: load(keys.PROFILE, {}),
    logs: load(keys.LOGS, {}),
    workouts: load(keys.WORKOUTS, []),
    runs: load(keys.RUNS, []),
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

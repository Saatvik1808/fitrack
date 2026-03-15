import { useState, useEffect, useCallback } from 'react'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { formatLocalYYYYMMDD } from '../utils/calculations.js'

function getToday() {
  return formatLocalYYYYMMDD()
}

function getDefaultProfile() {
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

// Background save helper (no local storage)
const dbTimeouts = {}
function saveToDb(userId, collectionName, value) {
  if (!userId || !db || !collectionName) return

  if (dbTimeouts[collectionName]) {
    clearTimeout(dbTimeouts[collectionName])
  }
  
  dbTimeouts[collectionName] = setTimeout(() => {
    const docRef = doc(db, 'users', userId, 'data', collectionName)
    setDoc(docRef, { data: value }, { merge: true }).catch(err => console.error("Firestore sync error:", err))
  }, 1000)
}

export function useProfile(userId, userEmail) {
  const [profile, setProfileState] = useState(getDefaultProfile())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId || !db) return

    const docRef = doc(db, 'users', userId, 'data', 'PROFILE')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().data) {
        setProfileState(snap.data().data)
      } else {
        // Init if empty
        const initial = getDefaultProfile()
        setProfileState(initial)
        setDoc(docRef, { data: initial }, { merge: true })
      }
    })

    return () => unsubscribe()
  }, [userId])

  const setProfile = useCallback((updater) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (isMounted) saveToDb(userId, 'PROFILE', next)
      return next
    })
  }, [userId, isMounted])

  return [profile, setProfile]
}

export function useDailyLogs(userId) {
  const [logs, setLogsState] = useState({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId || !db) return

    const docRef = doc(db, 'users', userId, 'data', 'LOGS')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().data) {
        setLogsState(snap.data().data)
      } else {
        setLogsState({})
      }
    })

    return () => unsubscribe()
  }, [userId])

  const setLog = useCallback((date, updater) => {
    setLogsState(prev => {
      const current = prev[date] || {}
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      const newLogs = { ...prev, [date]: next }
      if (isMounted) saveToDb(userId, 'LOGS', newLogs)
      return newLogs
    })
  }, [userId, isMounted])

  const getLog = useCallback((date) => logs[date] || {}, [logs])
  const getTodayLog = useCallback(() => getLog(getToday()), [getLog])

  return { logs, setLog, getLog, getTodayLog, today: getToday(), isMounted }
}

export function useWorkouts(userId) {
  const [workouts, setWorkoutsState] = useState([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId || !db) return

    const docRef = doc(db, 'users', userId, 'data', 'WORKOUTS')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().data) {
        setWorkoutsState(snap.data().data)
      } else {
        setWorkoutsState([])
      }
    })

    return () => unsubscribe()
  }, [userId])

  const addWorkout = useCallback((workout) => {
    setWorkoutsState(prev => {
      const next = [{ ...workout, id: Date.now(), date: workout.date || getToday() }, ...prev]
      if (isMounted) saveToDb(userId, 'WORKOUTS', next)
      return next
    })
  }, [userId, isMounted])

  const deleteWorkout = useCallback((id) => {
    setWorkoutsState(prev => {
      const next = prev.filter(w => w.id !== id)
      if (isMounted) saveToDb(userId, 'WORKOUTS', next)
      return next
    })
  }, [userId, isMounted])

  return { workouts, addWorkout, deleteWorkout, isMounted }
}

export function useRuns(userId) {
  const [runs, setRunsState] = useState([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId || !db) return

    const docRef = doc(db, 'users', userId, 'data', 'RUNS')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().data) {
        setRunsState(snap.data().data)
      } else {
        setRunsState([])
      }
    })

    return () => unsubscribe()
  }, [userId])

  const addRun = useCallback((run) => {
    setRunsState(prev => {
      const next = [{ ...run, id: Date.now(), date: run.date || getToday() }, ...prev]
      if (isMounted) saveToDb(userId, 'RUNS', next)
      return next
    })
  }, [userId, isMounted])

  const deleteRun = useCallback((id) => {
    setRunsState(prev => {
      const next = prev.filter(r => r.id !== id)
      if (isMounted) saveToDb(userId, 'RUNS', next)
      return next
    })
  }, [userId, isMounted])

  return { runs, addRun, deleteRun, isMounted }
}

export function useSettings(userId) {
  const [settings, setSettingsState] = useState({ theme: 'dark' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId || !db) return

    const docRef = doc(db, 'users', userId, 'data', 'SETTINGS')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().data) {
        setSettingsState(snap.data().data)
      } else {
        const initial = { theme: 'dark' }
        setSettingsState(initial)
        setDoc(docRef, { data: initial }, { merge: true })
      }
    })

    return () => unsubscribe()
  }, [userId])

  const setSettings = useCallback((updater) => {
    setSettingsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (isMounted) saveToDb(userId, 'SETTINGS', next)
      return next
    })
  }, [userId, isMounted])

  return [settings, setSettings]
}

export async function clearAllUserData(userId) {
  if (!userId || !db) return
  const collections = ['PROFILE', 'LOGS', 'WORKOUTS', 'RUNS', 'SETTINGS']
  for (const coll of collections) {
    const docRef = doc(db, 'users', userId, 'data', coll)
    await setDoc(docRef, { data: null }, { merge: true })
  }
}

export async function exportData(userId) {
  if (!userId || !db) {
    alert("Must be logged in to export data.")
    return
  }

  try {
    const data = {
      profile: {},
      logs: {},
      workouts: [],
      runs: [],
      exportedAt: formatLocalYYYYMMDD() + 'T' + new Date().toTimeString().split(' ')[0],
    }

    const collections = ['PROFILE', 'LOGS', 'WORKOUTS', 'RUNS']
    for (const coll of collections) {
      const docRef = doc(db, 'users', userId, 'data', coll)
      const snap = await getDoc(docRef)
      if (snap.exists() && snap.data().data) {
        if (coll === 'PROFILE') data.profile = snap.data().data
        if (coll === 'LOGS') data.logs = snap.data().data
        if (coll === 'WORKOUTS') data.workouts = snap.data().data
        if (coll === 'RUNS') data.runs = snap.data().data
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fittrack-export-${getToday()}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Failed to export data from DB:", error)
    alert("Export failed.")
  }
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

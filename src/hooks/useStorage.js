import { useState, useEffect, useCallback } from 'react'
import { formatLocalYYYYMMDD } from '../utils/calculations.js'
import { auth } from '@/lib/firebase/config'

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

async function fetchApiData(collectionName) {
  if (!auth.currentUser) return null;
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`/api/data?collection=${collectionName}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
    return await res.json();
  }
  return null;
}

const dbTimeouts = {}
function saveToApi(collectionName, value) {
  if (!auth.currentUser || !collectionName) return

  if (dbTimeouts[collectionName]) {
    clearTimeout(dbTimeouts[collectionName])
  }
  
  dbTimeouts[collectionName] = setTimeout(async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ collectionName, data: value })
      });
    } catch (err) {
      console.error("API sync error:", err)
    }
  }, 1000)
}

export function useProfile(userId, userEmail) {
  const [profile, setProfileState] = useState(getDefaultProfile())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('PROFILE').then(data => {
      if (data) {
        setProfileState(data)
      } else {
        const initial = getDefaultProfile()
        setProfileState(initial)
        saveToApi('PROFILE', initial)
      }
    })
  }, [userId])

  const setProfile = useCallback((updater) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (isMounted) saveToApi('PROFILE', next)
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
    if (!userId) return

    fetchApiData('LOGS').then(data => {
      if (data) setLogsState(data)
    })
  }, [userId])

  const setLog = useCallback((date, updater) => {
    setLogsState(prev => {
      const current = prev[date] || {}
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      const newLogs = { ...prev, [date]: next }
      if (isMounted) saveToApi('LOGS', newLogs)
      return newLogs
    })
  }, [isMounted])

  const getLog = useCallback((date) => logs[date] || {}, [logs])
  const getTodayLog = useCallback(() => getLog(getToday()), [getLog])

  return { logs, setLog, getLog, getTodayLog, today: getToday(), isMounted }
}

export function useWorkouts(userId) {
  const [workouts, setWorkoutsState] = useState([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('WORKOUTS').then(data => {
      if (data) setWorkoutsState(data)
    })
  }, [userId])

  const addWorkout = useCallback((workout) => {
    setWorkoutsState(prev => {
      const next = [{ ...workout, id: Date.now(), date: workout.date || getToday() }, ...prev]
      if (isMounted) saveToApi('WORKOUTS', next)
      return next
    })
  }, [isMounted])

  const deleteWorkout = useCallback((id) => {
    setWorkoutsState(prev => {
      const next = prev.filter(w => w.id !== id)
      if (isMounted) saveToApi('WORKOUTS', next)
      return next
    })
  }, [isMounted])

  return { workouts, addWorkout, deleteWorkout, isMounted }
}

export function useRuns(userId) {
  const [runs, setRunsState] = useState([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('RUNS').then(data => {
      if (data) setRunsState(data)
    })
  }, [userId])

  const addRun = useCallback((run) => {
    setRunsState(prev => {
      const next = [{ ...run, id: Date.now(), date: run.date || getToday() }, ...prev]
      if (isMounted) saveToApi('RUNS', next)
      return next
    })
  }, [isMounted])

  const deleteRun = useCallback((id) => {
    setRunsState(prev => {
      const next = prev.filter(r => r.id !== id)
      if (isMounted) saveToApi('RUNS', next)
      return next
    })
  }, [isMounted])

  return { runs, addRun, deleteRun, isMounted }
}

export function useSettings(userId) {
  const [settings, setSettingsState] = useState({ theme: 'dark' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('SETTINGS').then(data => {
      if (data) {
        setSettingsState(data)
      } else {
        saveToApi('SETTINGS', { theme: 'dark' })
      }
    })
  }, [userId])

  const setSettings = useCallback((updater) => {
    setSettingsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (isMounted) saveToApi('SETTINGS', next)
      return next
    })
  }, [isMounted])

  return [settings, setSettings]
}

export async function clearAllUserData(userId) {
  if (!userId) return
  const collections = ['PROFILE', 'LOGS', 'WORKOUTS', 'RUNS', 'SETTINGS']
  for (const coll of collections) {
    saveToApi(coll, null)
  }
}

export async function exportData(userId) {
  if (!userId || !auth.currentUser) {
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
      const collData = await fetchApiData(coll)
      if (collData) {
        if (coll === 'PROFILE') data.profile = collData
        if (coll === 'LOGS') data.logs = collData
        if (coll === 'WORKOUTS') data.workouts = collData
        if (coll === 'RUNS') data.runs = collData
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

import { useState, useEffect, useCallback, useRef } from 'react'
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
  if (!auth || !auth.currentUser) return null;
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`/api/data?collection=${collectionName}&t=${Date.now()}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    cache: 'no-store'
  });
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`API returned ${res.status}`);
}

const dbTimeouts = {}
export async function saveToApi(collectionName, value, immediate = false) {
  if (!auth || !auth.currentUser || !collectionName) return

  const executeSave = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ collectionName, data: value }),
        cache: 'no-store'
      });
    } catch (err) {
      console.error("API sync error:", err)
    }
  };

  if (immediate) {
    if (dbTimeouts[collectionName]) clearTimeout(dbTimeouts[collectionName]);
    return await executeSave();
  }

  if (dbTimeouts[collectionName]) {
    clearTimeout(dbTimeouts[collectionName])
  }
  
  dbTimeouts[collectionName] = setTimeout(executeSave, 1000)
}

export function useProfile(userId, userEmail) {
  const [profile, setProfileState] = useState(getDefaultProfile())
  const profileRef = useRef(profile)
  const [isMounted, setIsMounted] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) {
      setLoadingProfile(false)
      return
    }

    setLoadingProfile(true)
    fetchApiData('PROFILE')
      .then(data => {
        if (data) {
          setProfileState(data)
          profileRef.current = data
        } else {
          const initial = getDefaultProfile()
          setProfileState(initial)
          profileRef.current = initial
          saveToApi('PROFILE', initial)
        }
        setLoadingProfile(false)
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        setLoadingProfile(false);
      })
  }, [userId])

  const setProfile = useCallback(async (updater, options = { immediate: false }) => {
    const prev = profileRef.current;
    const nextValue = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    
    profileRef.current = nextValue;
    setProfileState(nextValue)
    
    if (isMounted && nextValue) {
      if (options.immediate) {
        await saveToApi('PROFILE', nextValue, true);
      } else {
        saveToApi('PROFILE', nextValue);
      }
    }
    return nextValue;
  }, [isMounted])

  return [profile, setProfile, loadingProfile]
}

export function useDailyLogs(userId) {
  const [logs, setLogsState] = useState({})
  const logsRef = useRef({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('LOGS')
      .then(data => {
        if (data) {
          setLogsState(data)
          logsRef.current = data
        }
      })
      .catch(err => console.error("Logs fetch error:", err))
  }, [userId])

  const setLog = useCallback((date, updater) => {
    const prev = logsRef.current;
    const current = prev[date] || {}
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
    const newLogs = { ...prev, [date]: next }
    
    logsRef.current = newLogs;
    setLogsState(newLogs);
    
    if (isMounted) saveToApi('LOGS', newLogs)
    return newLogs
  }, [isMounted])

  const getLog = useCallback((date) => logs[date] || {}, [logs])
  const getTodayLog = useCallback(() => getLog(getToday()), [getLog])

  return { logs, setLog, getLog, getTodayLog, today: getToday(), isMounted }
}

export function useWorkouts(userId) {
  const [workouts, setWorkoutsState] = useState([])
  const workoutsRef = useRef([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('WORKOUTS')
      .then(data => {
        if (data) {
          setWorkoutsState(data)
          workoutsRef.current = data
        }
      })
      .catch(err => console.error("Workouts fetch error:", err))
  }, [userId])

  const addWorkout = useCallback((workout) => {
    const prev = workoutsRef.current;
    const next = [{ ...workout, id: Date.now(), date: workout.date || getToday() }, ...prev]
    workoutsRef.current = next;
    setWorkoutsState(next);
    if (isMounted) saveToApi('WORKOUTS', next)
    return next
  }, [isMounted])

  const deleteWorkout = useCallback((id) => {
    const prev = workoutsRef.current;
    const next = prev.filter(w => w.id !== id)
    workoutsRef.current = next;
    setWorkoutsState(next);
    if (isMounted) saveToApi('WORKOUTS', next)
    return next
  }, [isMounted])

  return { workouts, addWorkout, deleteWorkout, isMounted }
}

export function useRuns(userId) {
  const [runs, setRunsState] = useState([])
  const runsRef = useRef([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('RUNS')
      .then(data => {
        if (data) {
          setRunsState(data)
          runsRef.current = data
        }
      })
      .catch(err => console.error("Runs fetch error:", err))
  }, [userId])

  const addRun = useCallback((run) => {
    const prev = runsRef.current;
    const next = [{ ...run, id: Date.now(), date: run.date || getToday() }, ...prev]
    runsRef.current = next;
    setRunsState(next);
    if (isMounted) saveToApi('RUNS', next)
    return next
  }, [isMounted])

  const deleteRun = useCallback((id) => {
    const prev = runsRef.current;
    const next = prev.filter(r => r.id !== id)
    runsRef.current = next;
    setRunsState(next);
    if (isMounted) saveToApi('RUNS', next)
    return next
  }, [isMounted])

  return { runs, addRun, deleteRun, isMounted }
}

export function useSettings(userId) {
  const [settings, setSettingsState] = useState({ theme: 'dark' })
  const settingsRef = useRef({ theme: 'dark' })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!userId) return

    fetchApiData('SETTINGS')
      .then(data => {
        if (data) {
          setSettingsState(data)
          settingsRef.current = data
        } else {
          const initial = { theme: 'dark' }
          setSettingsState(initial)
          settingsRef.current = initial
          saveToApi('SETTINGS', initial)
        }
      })
      .catch(err => console.error("Settings fetch error:", err));
  }, [userId])

  const setSettings = useCallback((updater) => {
    const prev = settingsRef.current;
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    settingsRef.current = next;
    setSettingsState(next);
    if (isMounted) saveToApi('SETTINGS', next)
    return next
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
  if (!userId || !auth || !auth.currentUser) {
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

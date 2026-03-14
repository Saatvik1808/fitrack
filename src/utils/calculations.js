export function formatLocalYYYYMMDD(d = new Date()) {
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function calcBMI(weightKg, heightCm) {
  const h = heightCm / 100
  return +(weightKg / (h * h)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' }
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' }
  if (bmi < 30) return { label: 'Overweight', color: '#f97316' }
  return { label: 'Obese', color: '#ef4444' }
}

export function calcGoalProgress(current, start, goal) {
  if (start === goal) return 100
  const progress = ((start - current) / (start - goal)) * 100
  return Math.min(100, Math.max(0, +progress.toFixed(1)))
}

export function calcPace(distanceKm, durationMinutes) {
  if (!distanceKm || !durationMinutes) return null
  const pace = durationMinutes / distanceKm
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')} /km`
}

export function calcRunCalories(distanceKm, weightKg) {
  // MET ≈ 8 for moderate running, calories = MET × weight × hours
  return Math.round(distanceKm * weightKg * 0.9)
}

export function calcWorkoutVolume(exercises) {
  return exercises.reduce((total, ex) => {
    const exVolume = (ex.sets || []).reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0)
    return total + exVolume
  }, 0)
}

export function getWeekDates() {
  const today = new Date()
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(formatLocalYYYYMMDD(d))
  }
  return dates
}

export function getLast30Days() {
  const today = new Date()
  const dates = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(formatLocalYYYYMMDD(d))
  }
  return dates
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function weeklyAvg(logs, key) {
  const dates = getWeekDates()
  const values = dates.map(d => logs[d]?.[key]).filter(v => v != null && v !== '')
  if (!values.length) return null
  return +(values.reduce((a, b) => a + Number(b), 0) / values.length).toFixed(1)
}

export function kgToLbs(kg) { return +(kg * 2.20462).toFixed(1) }
export function cmToInch(cm) { return +(cm / 2.54).toFixed(1) }

export function getStreakDays(logs) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = formatLocalYYYYMMDD(d)
    const log = logs[key]
    if (log && Object.keys(log).length > 0) streak++
    else if (i > 0) break
  }
  return streak
}

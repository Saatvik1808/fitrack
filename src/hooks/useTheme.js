import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  // We'll keep theme in localStorage for instant boot but sync it from useSettings in Dashboard
  const [theme, setThemeState] = useState('dark')

  const applyTheme = useCallback((t) => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const effectiveDark = t === 'dark' || (t === 'system' && prefersDark)
    if (effectiveDark) {
      root.classList.remove('theme-light')
    } else {
      root.classList.add('theme-light')
    }
  }, [])

  useEffect(() => {
    // Initial load from storage for flickering prevention
    const saved = localStorage.getItem('fittrack_theme') || 'dark'
    setThemeState(saved)
  }, [])

  useEffect(() => {
    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, applyTheme])

  const setTheme = useCallback((t) => {
    localStorage.setItem('fittrack_theme', t)
    setThemeState(t)
  }, [])

  return [theme, setTheme]
}

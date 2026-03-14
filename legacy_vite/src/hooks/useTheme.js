import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'fittrack_theme'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark'
    } catch {
      return 'dark'
    }
  })

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
    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, applyTheme])

  const setTheme = useCallback((t) => {
    try { localStorage.setItem(THEME_KEY, t) } catch {}
    setThemeState(t)
  }, [])

  return [theme, setTheme]
}

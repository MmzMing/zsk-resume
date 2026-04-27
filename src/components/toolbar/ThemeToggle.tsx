import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasConsent } from '@/store/consentStore'

const THEME_KEY = 'zsk-resume-theme'

function getStoredTheme(): boolean {
  try {
    if (hasConsent()) {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored !== null) return stored === 'dark'
    }
  } catch {
    // localStorage not available
  }
  // Default to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => getStoredTheme())

  useEffect(() => {
    applyTheme(dark)
    try {
      if (hasConsent()) {
        localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
      }
    } catch {
      // Ignore storage errors
    }
  }, [dark])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setDark(!dark)}
      title={dark ? '切换亮色主题' : '切换暗色主题'}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

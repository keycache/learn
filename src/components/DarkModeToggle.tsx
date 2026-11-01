import { useState, useEffect, useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark'
  })

  useEffect(() => {
    // Apply dark mode on mount
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const newIsDark = !prev
      const html = document.documentElement
      
      console.log('Toggling dark mode:', newIsDark)
      
      if (newIsDark) {
        html.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        console.log('Dark mode ON, class list:', html.className)
      } else {
        html.classList.remove('dark')
        localStorage.setItem('theme', 'light')
        console.log('Dark mode OFF, class list:', html.className)
      }
      
      return newIsDark
    })
  }, [])

  return (
    <Button
      onClick={toggleDarkMode}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleDarkMode()
        }
      }}
      variant="ghost"
      size="icon"
      className="rounded-full cursor-pointer hover:bg-muted dark:hover:bg-muted"
      aria-label="Toggle dark mode"
      type="button"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  )
}



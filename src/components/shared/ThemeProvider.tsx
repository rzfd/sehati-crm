"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme:    Theme
  setTheme: (t: Theme) => void
  resolved: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return theme === "dark" ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  // Init: read from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null
      if (stored === "light" || stored === "dark" || stored === "system") {
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setThemeState(stored)
      }
    } catch {}
  }, [])

  // Apply class on <html>
  useEffect(() => {
    const r = resolveTheme(theme)
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setResolved(r)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", r === "dark")
    }
  }, [theme])

  // System theme change listener
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const r = mq.matches ? "dark" : "light"
      setResolved(r)
      document.documentElement.classList.toggle("dark", r === "dark")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    try { localStorage.setItem("theme", t) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider")
  return ctx
}

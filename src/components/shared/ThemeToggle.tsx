"use client"

import { useTheme } from "./ThemeProvider"
import { Tooltip } from "./Tooltip"

export function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme()

  function cycle() {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    setTheme(next)
  }

  const label = theme === "system" ? `System (${resolved})` : theme === "dark" ? "Dark" : "Light"

  return (
    <Tooltip content={`Theme: ${label} — klik untuk ganti`} side="right">
      <button
        onClick={cycle}
        aria-label="Toggle theme"
        className="size-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-teal-500 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {theme === "light" && <SunIcon />}
        {theme === "dark"  && <MoonIcon />}
        {theme === "system" && <SystemIcon />}
      </button>
    </Tooltip>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-4">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="3" y="4" width="18" height="14" rx="2"/>
      <path d="M8 21h8M12 18v3"/>
    </svg>
  )
}

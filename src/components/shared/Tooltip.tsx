"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: ReactNode
  content:  ReactNode
  side?:    "top" | "bottom" | "left" | "right"
  delay?:   number
}

// Lightweight tooltip — no portals, no a11y popover. Cocok untuk hint sederhana.
// Untuk yang lebih kompleks pakai Radix UI Tooltip.
export function Tooltip({ children, content, side = "top", delay = 200 }: TooltipProps) {
  const [show, setShow]   = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function open() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(true), delay)
  }
  function close() {
    if (timer.current) clearTimeout(timer.current)
    setShow(false)
  }

  const sideClass = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full    left-1/2 -translate-x-1/2 mt-1.5",
    left:   "right-full  top-1/2 -translate-y-1/2 mr-1.5",
    right:  "left-full   top-1/2 -translate-y-1/2 ml-1.5",
  }[side]

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 rounded-md bg-neutral-800 dark:bg-neutral-700 text-white text-[11px] font-medium shadow-md whitespace-nowrap pointer-events-none",
            sideClass,
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}

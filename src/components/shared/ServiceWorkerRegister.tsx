"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return  // skip in dev, sw bisa cache stale builds
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[sw] register failed:", err)
    })
  }, [])

  return null
}

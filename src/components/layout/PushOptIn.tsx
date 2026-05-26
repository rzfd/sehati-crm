"use client"

import { useEffect, useState } from "react"

// VAPID public key di-inline saat build (NEXT_PUBLIC_). Kalau kosong, opt-in disembunyikan.
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  const buf = new ArrayBuffer(raw.length)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

type State = "hidden" | "prompt" | "working" | "done"

// Tombol aktivasi Web Push (di dalam dropdown notifikasi). Hanya tampil kalau
// browser mendukung + VAPID diset + izin belum granted. SW di-register di produksi.
export function PushOptIn() {
  const [state, setState] = useState<State>("hidden")

  useEffect(() => {
    if (!VAPID || typeof window === "undefined") return
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (Notification.permission === "denied") return
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setState(Notification.permission === "granted" ? "done" : "prompt")
  }, [])

  async function enable() {
    setState("working")
    try {
      const perm = await Notification.requestPermission()
      if (perm !== "granted") { setState("prompt"); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID!),
      })
      await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(sub),
      })
      setState("done")
    } catch {
      setState("prompt")
    }
  }

  if (state === "hidden" || state === "done") return null

  return (
    <div className="px-4 py-2.5 border-b border-border-soft bg-primary-soft/40">
      <button
        onClick={enable}
        disabled={state === "working"}
        className="w-full text-left text-body-sm text-primary font-medium flex items-center gap-2 disabled:opacity-60"
      >
        <span className="material-symbols-rounded text-[18px]">notifications_active</span>
        {state === "working" ? "Mengaktifkan…" : "Aktifkan notifikasi di perangkat ini"}
      </button>
    </div>
  )
}

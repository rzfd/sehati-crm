"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { toast } from "@/lib/toast"
import { Logo } from "@/components/shared/Logo"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const { loading, patient } = useCurrentUser()

  const [step, setStep]   = useState<Step>(1)
  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob]     = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setName(patient.name ?? "")
    setPhone(patient.phone ?? "")
    setDob(patient.date_of_birth ?? "")
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [patient])

  useEffect(() => {
    if (!loading && patient && !patient.is_new) router.replace("/home")
  }, [loading, patient, router])

  async function complete() {
    if (!name.trim()) { setError("Nama wajib."); setStep(1); return }
    if (!phone.trim()) { setError("Nomor HP wajib."); setStep(2); return }

    setSaving(true); setError(null)
    try {
      const res = await fetch("/api/patient/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone,
          date_of_birth: dob || undefined,
          complete_onboarding: true,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Gagal menyimpan.")
        return
      }
      toast.success("Profil disimpan!", "Selamat datang di Sehati 🎉")
      router.replace("/home")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-body-md text-ink-muted">Memuat profil…</div>
  }
  if (!patient) {
    return (
      <div className="p-6 text-body-md text-ink-muted">
        Sesi tidak ditemukan. <a href="/login" className="text-primary underline">Login</a>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="p-4 flex items-center justify-between">
        <Logo size={28} withText variant="sage" />
        <span className="text-body-sm text-ink-muted">Langkah {step}/3</span>
      </header>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-4">
        {step === 1 && (
          <Pane
            emoji="👋"
            title="Halo, siapa nama Anda?"
            description="Nama lengkap untuk identifikasi data medis."
          >
            <input
              className="input text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mis. Sari Dewi"
              autoFocus
            />
          </Pane>
        )}
        {step === 2 && (
          <Pane
            emoji="📱"
            title="Nomor HP yang bisa dihubungi"
            description="Kami pakai untuk konfirmasi booking & info darurat."
          >
            <input
              className="input text-lg"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              autoFocus
            />
          </Pane>
        )}
        {step === 3 && (
          <Pane
            emoji="🎂"
            title="Tanggal lahir (opsional)"
            description="Membantu dokter memberikan saran usia-sesuai."
          >
            <input
              className="input text-lg"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              autoFocus
            />
          </Pane>
        )}

        {error && (
          <p className="text-body-sm text-danger bg-danger-soft rounded-lg px-3 py-2 mt-4">{error}</p>
        )}
      </main>

      <footer className="p-4 flex gap-2">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="btn-secondary flex-1"
            disabled={saving}
          >
            ← Kembali
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !name.trim()) { setError("Nama wajib."); return }
              if (step === 2 && !phone.trim()) { setError("Nomor HP wajib."); return }
              setError(null)
              setStep((s) => (s + 1) as Step)
            }}
            className="btn-primary flex-1"
          >
            Lanjut →
          </button>
        ) : (
          <button
            onClick={complete}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? "Menyimpan…" : "Selesai 🎉"}
          </button>
        )}
      </footer>
    </div>
  )
}

function Pane({ emoji, title, description, children }: {
  emoji: string; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="card p-6 space-y-4">
      <div className="text-5xl text-center">{emoji}</div>
      <div className="text-center">
        <h2 className={cn("text-headline-md text-ink")}>{title}</h2>
        <p className="text-body-md text-ink-muted mt-1">{description}</p>
      </div>
      <div className="pt-2">{children}</div>
    </div>
  )
}

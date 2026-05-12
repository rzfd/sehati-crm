"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Factor {
  id:           string
  friendly_name?: string
  factor_type:  string
  status:       string
  created_at:   string
}

// MFA via Supabase Auth TOTP. Admin/staff bisa enroll authenticator app.
export default function SecurityPage() {
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // Enrollment flow state
  const [enrollData, setEnrollData] = useState<{ id: string; qr: string; uri: string; secret: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [verifying, setVerifying]   = useState(false)
  const [friendlyName, setFriendlyName] = useState("Authenticator")

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) setError(error.message)
    else setFactors(data?.all ?? [])
    setLoading(false)
  }, [])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [load])

  async function startEnroll() {
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType:  "totp",
      friendlyName,
    })
    if (error) { setError(error.message); return }
    if (data) {
      setEnrollData({
        id:     data.id,
        qr:     data.totp.qr_code,
        uri:    data.totp.uri,
        secret: data.totp.secret,
      })
    }
  }

  async function verifyEnroll() {
    if (!enrollData || !verifyCode) return
    setVerifying(true); setError(null)
    const supabase = createClient()
    const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.id })
    if (chErr || !challenge) {
      setError(chErr?.message ?? "Gagal challenge.")
      setVerifying(false)
      return
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId:    enrollData.id,
      challengeId: challenge.id,
      code:        verifyCode,
    })
    if (vErr) {
      setError(vErr.message)
    } else {
      setEnrollData(null)
      setVerifyCode("")
      load()
    }
    setVerifying(false)
  }

  async function unenroll(factorId: string) {
    if (!confirm("Hapus authenticator ini? Akun jadi tidak terproteksi MFA.")) return
    const supabase = createClient()
    await supabase.auth.mfa.unenroll({ factorId })
    load()
  }

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-medium text-gray-700">Keamanan akun</h1>
        <p className="text-sm text-gray-500">Aktifkan 2FA (TOTP) dengan Google Authenticator / Authy / 1Password.</p>
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Memuat…</p>
      ) : factors.length > 0 ? (
        <div className="card p-4 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Factor aktif</p>
          {factors.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-medium text-gray-700">{f.friendly_name || f.factor_type}</p>
                <p className="text-[10px] text-gray-400">{f.factor_type} · {f.status}</p>
              </div>
              <button onClick={() => unenroll(f.id)} className="text-xs text-red-500 hover:text-red-700">
                Hapus
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
          ⚠ Akun belum dilindungi 2FA. Aktifkan sekarang untuk keamanan tambahan.
        </p>
      )}

      {/* Enrollment */}
      {!enrollData ? (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Aktifkan authenticator baru</p>
          <input
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            placeholder="Nama (mis. Google Authenticator)"
            className="input"
          />
          <button onClick={startEnroll} className="btn-purple w-full justify-center">
            Mulai enrollment
          </button>
        </div>
      ) : (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Scan QR di authenticator app</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrollData.qr} alt="MFA QR" className="size-48 mx-auto bg-white p-2 rounded-md" />
          <p className="text-[10px] text-gray-500 text-center font-mono break-all">{enrollData.secret}</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kode 6 digit dari authenticator</label>
            <input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="input text-center font-mono text-lg tracking-widest"
              placeholder="••••••"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEnrollData(null)} className="btn-secondary flex-1 justify-center">Batal</button>
            <button onClick={verifyEnroll} disabled={verifying || verifyCode.length !== 6} className="btn-purple flex-1 justify-center">
              {verifying ? "Verifikasi…" : "Verifikasi"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import webpush from "web-push"
import { createServiceClient } from "@/lib/supabase/service"

// VAPID keys: generate via `npx web-push generate-vapid-keys`.
const PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY
const PRIVATE = process.env.VAPID_PRIVATE_KEY
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@sehati.app"

let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  if (!PUBLIC || !PRIVATE) return false
  webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE)
  configured = true
  return true
}

export interface PushPayload {
  title: string
  body:  string
  url:   string
}

interface Sub { id: string; endpoint: string; p256dh: string; auth: string }

async function sendToSubs(subs: Sub[], payload: PushPayload): Promise<void> {
  if (subs.length === 0) return
  const supabase = createServiceClient()
  const body = JSON.stringify(payload)
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body)
      } catch (err: unknown) {
        const code = (err as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) await supabase.from("push_subscriptions").delete().eq("id", s.id)
        else console.error("[push] send failed:", code ?? err)
      }
    }),
  )
}

// Kirim push ke semua subscription satu pasien. No-op kalau VAPID belum diset.
export async function dispatchPush(patientId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return
  const supabase = createServiceClient()
  const { data: subs } = await supabase
    .from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("patient_id", patientId)
  await sendToSubs((subs ?? []) as Sub[], payload)
}

// Broadcast: kirim push ke subscription banyak pasien sekaligus.
export async function dispatchPushMany(patientIds: string[], payload: PushPayload): Promise<void> {
  if (!ensureConfigured() || patientIds.length === 0) return
  const supabase = createServiceClient()
  const { data: subs } = await supabase
    .from("push_subscriptions").select("id, endpoint, p256dh, auth").in("patient_id", patientIds)
  await sendToSubs((subs ?? []) as Sub[], payload)
}

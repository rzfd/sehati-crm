/**
 * Setup akun admin pertama
 * Run: npm run setup-admin
 */

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../src/types/database"

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ADMIN_EMAIL    = "admin@sehati.id"
const ADMIN_PASSWORD = "Admin1234!"
const ADMIN_NAME     = "Super Admin"

async function setupAdmin() {
  console.log("🔧 Setup admin account...\n")

  // 1. Ambil clinic pertama
  const { data: clinic, error: ce } = await supabase
    .from("clinics").select("id, name").limit(1).single()
  if (ce) throw new Error(`Clinic tidak ditemukan. Jalankan 'npm run seed' dulu.\n${ce.message}`)
  console.log(`✅ Clinic: ${clinic.name} (${clinic.id})`)

  // 2. Buat auth user via admin API
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email:          ADMIN_EMAIL,
    password:       ADMIN_PASSWORD,
    email_confirm:  true,
  })
  if (authErr && !authErr.message.includes("already been registered")) {
    throw new Error(`Auth user error: ${authErr.message}`)
  }

  let userId: string
  if (authErr?.message.includes("already been registered")) {
    // User sudah ada — ambil user ID-nya
    const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
    if (listErr) throw new Error(listErr.message)
    const existing = users.find((u) => u.email === ADMIN_EMAIL)
    if (!existing) throw new Error("User ada tapi tidak bisa ditemukan")
    userId = existing.id
    console.log(`ℹ️  Auth user sudah ada (${ADMIN_EMAIL})`)
  } else {
    userId = authData.user!.id
    console.log(`✅ Auth user dibuat: ${ADMIN_EMAIL}`)
  }

  // 3. Cek apakah staff_member sudah ada untuk user ini
  const { data: existing } = await supabase
    .from("staff_members").select("id, name").eq("user_id", userId).maybeSingle()

  if (existing) {
    console.log(`ℹ️  Staff member sudah terhubung: ${existing.name}`)
  } else {
    // Coba link ke staff_member yang belum punya user_id
    const { data: unlinked } = await supabase
      .from("staff_members")
      .select("id")
      .eq("clinic_id", clinic.id)
      .eq("role", "admin")
      .is("user_id", null)
      .limit(1)
      .maybeSingle()

    if (unlinked) {
      await supabase.from("staff_members").update({ user_id: userId }).eq("id", unlinked.id)
      console.log(`✅ User dihubungkan ke staff admin yang sudah ada`)
    } else {
      // Buat staff_member baru
      const { error: se } = await supabase.from("staff_members").insert({
        user_id:   userId,
        clinic_id: clinic.id,
        name:      ADMIN_NAME,
        role:      "admin",
      })
      if (se) throw new Error(`Staff member error: ${se.message}`)
      console.log(`✅ Staff member admin dibuat: ${ADMIN_NAME}`)
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Admin account siap!

   Email    : ${ADMIN_EMAIL}
   Password : ${ADMIN_PASSWORD}
   Role     : admin

   Login di: http://localhost:3000/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

setupAdmin().catch((err) => { console.error("❌ Error:", err.message); process.exit(1) })

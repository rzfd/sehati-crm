import fs from "fs"
import path from "path"
import { Client } from "pg"

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

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations")

async function migrate() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL tidak ada di .env.local")

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log("🔌 Terhubung ke database")

  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz default now()
    )
  `)

  const { rows: applied } = await client.query<{ filename: string }>(
    "select filename from schema_migrations"
  )
  const appliedSet = new Set(applied.map((r) => r.filename))

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  let skipped = 0
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏭️  Skipping ${file} (already applied)`)
      skipped++
      continue
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8")
    console.log(`⏳ Running ${file}...`)
    await client.query("BEGIN")
    try {
      await client.query(sql)
      await client.query("insert into schema_migrations (filename) values ($1)", [file])
      await client.query("COMMIT")
      console.log(`✅ ${file}`)
    } catch (err: unknown) {
      await client.query("ROLLBACK")
      const msg = err instanceof Error ? err.message : String(err)
      // already exists errors mean migration ran before without tracking
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        await client.query("insert into schema_migrations (filename) values ($1) on conflict do nothing", [file])
        console.log(`⚠️  ${file} — objects already exist, marked as applied`)
        skipped++
      } else {
        throw err
      }
    }
  }

  await client.end()
  console.log(`\n🎉 Migrations selesai! (${files.length - skipped} applied, ${skipped} skipped)`)
}

migrate().catch((err) => { console.error("❌ Migration error:", err.message); process.exit(1) })

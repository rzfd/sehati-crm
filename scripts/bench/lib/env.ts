// Load .env.local ke process.env (sama seperti scripts/test-pipeline.ts).
import fs from "fs"
import path from "path"

export function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
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

export const arg = (name: string, fallback?: string): string | undefined => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  if (hit) return hit.split("=").slice(1).join("=")
  return process.env[name.toUpperCase().replace(/-/g, "_")] ?? fallback
}
export const argNum = (name: string, fallback: number): number => {
  const v = arg(name)
  const n = v == null ? NaN : Number(v)
  return Number.isFinite(n) ? n : fallback
}
export const sleep = (msx: number) => new Promise((r) => setTimeout(r, msx))

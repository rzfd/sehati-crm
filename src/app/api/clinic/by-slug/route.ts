import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// GET /api/clinic/by-slug?c=slug — resolver publik untuk halaman registrasi pasien
// (menampilkan nama klinik + validasi slug). Tidak butuh login.
export async function GET(req: Request) {
  const c = new URL(req.url).searchParams.get("c")
  if (!c) return NextResponse.json({ error: "slug wajib" }, { status: 400 })
  const service = createServiceClient()
  const { data } = await service.from("clinics").select("name, slug").eq("slug", c).maybeSingle()
  if (!data) return NextResponse.json({ error: "Klinik tidak ditemukan." }, { status: 404 })
  return NextResponse.json(data)
}

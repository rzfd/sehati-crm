import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

const PUBLIC_PATHS = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let public paths through (still refresh session)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return updateSession(request)
  }

  // Refresh session cookies
  const response = await updateSession(request)

  // Check auth
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

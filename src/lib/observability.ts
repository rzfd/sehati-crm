// Observability scaffold. Default: log ke console.
// Plug Sentry: install @sentry/nextjs + Sentry.init(); ganti captureError body.
//
// Pakai di server dan client. Tidak crash kalau Sentry belum diinstall.

interface ErrorContext {
  route?:   string
  user_id?: string
  extra?:   Record<string, unknown>
}

let initialized = false
let sentry: { captureException: (e: unknown, ctx?: unknown) => void } | null = null

async function lazyInitSentry() {
  if (initialized) return
  initialized = true
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  try {
    // Optional dependency — install @sentry/nextjs untuk aktifkan
    const mod = await import("@sentry/nextjs" as string).catch(() => null) as unknown as {
      init?: (opts: Record<string, unknown>) => void
      captureException?: (e: unknown, ctx?: unknown) => void
    } | null
    if (!mod || !mod.init || !mod.captureException) return
    mod.init({
      dsn:               process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate:  0.1,
      environment:       process.env.NODE_ENV,
    })
    sentry = { captureException: mod.captureException }
  } catch {
    // Optional — kalau gagal, fall back ke console
  }
}

export async function captureError(error: unknown, context?: ErrorContext) {
  await lazyInitSentry()
  const msg = error instanceof Error ? error.message : String(error)
  console.error("[capture]", msg, context ?? {})
  if (sentry) {
    try { sentry.captureException(error, { extra: context }) } catch {}
  }
}

// Wrap async handler untuk auto-capture
export function withErrorCapture<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context?: ErrorContext,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args)
    } catch (err) {
      await captureError(err, context)
      throw err
    }
  }
}

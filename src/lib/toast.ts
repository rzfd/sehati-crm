// Centralized toast helpers — wrap sonner with Sehati-branded styling.
import { toast as sonner } from "sonner"

export const toast = {
  success: (msg: string, description?: string) =>
    sonner.success(msg, { description, duration: 3500 }),
  error: (msg: string, description?: string) =>
    sonner.error(msg, { description, duration: 5000 }),
  info: (msg: string, description?: string) =>
    sonner(msg, { description, duration: 3500 }),
  loading: (msg: string) => sonner.loading(msg),
  dismiss: (id?: string | number) => sonner.dismiss(id),
  // Confirm dialog (promise-based) — replace native `confirm()`
  async confirm(opts: { title: string; description?: string; confirmLabel?: string; cancelLabel?: string }): Promise<boolean> {
    return new Promise((resolve) => {
      sonner(opts.title, {
        description: opts.description,
        duration:    Infinity,
        action: {
          label: opts.confirmLabel ?? "Konfirmasi",
          onClick: () => resolve(true),
        },
        cancel: {
          label: opts.cancelLabel ?? "Batal",
          onClick: () => resolve(false),
        },
        onDismiss: () => resolve(false),
      })
    })
  },
}

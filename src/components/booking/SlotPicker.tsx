"use client"

import { cn } from "@/lib/utils"

interface SlotPickerProps {
  slots:    string[]
  selected: string | null
  onSelect: (slot: string) => void
  loading?: boolean
}

// Slot string format dari API: "HH:MM:SS". Tampilkan sebagai HH:MM.
export function SlotPicker({ slots, selected, onSelect, loading }: SlotPickerProps) {
  if (loading) {
    return <p className="text-body-md text-ink-dim">Memuat slot…</p>
  }
  if (slots.length === 0) {
    return <p className="text-body-md text-ink-muted">Tidak ada slot tersedia di hari ini.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isActive = selected === slot
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={cn(
              "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-ink border-border hover:border-primary/40",
            )}
          >
            {slot.slice(0, 5)}
          </button>
        )
      })}
    </div>
  )
}

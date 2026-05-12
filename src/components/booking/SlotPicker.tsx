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
    return <p className="text-sm text-gray-400">Memuat slot…</p>
  }
  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">Tidak ada slot tersedia di hari ini.</p>
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
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-teal-400 text-white border-teal-500"
                : "bg-white text-gray-700 border-black/[0.12] hover:border-teal-400 hover:bg-teal-50/30",
            )}
          >
            {slot.slice(0, 5)}
          </button>
        )
      })}
    </div>
  )
}

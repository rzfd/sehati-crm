import { Badge } from "@/components/ui/badge"

type KBStatus = "draft" | "published" | "archived"
type BookingStatus = "pending" | "confirmed" | "completed" | "no_show" | "cancelled"
type ConversationStatus = "open" | "resolved" | "archived"
type DocumentStatus = "processing" | "ready" | "error"

type PillVariant = "teal" | "blue" | "amber" | "red" | "purple" | "pink" | "gray"

const KB_LABEL: Record<KBStatus, { text: string; variant: PillVariant }> = {
  draft:     { text: "Draft",     variant: "amber" },
  published: { text: "Published", variant: "teal"  },
  archived:  { text: "Archived",  variant: "gray"  },
}

const BOOKING_LABEL: Record<BookingStatus, { text: string; variant: PillVariant }> = {
  pending:   { text: "Menunggu",  variant: "amber" },
  confirmed: { text: "Terjadwal", variant: "blue"  },
  completed: { text: "Selesai",   variant: "teal"  },
  no_show:   { text: "No-show",   variant: "red"   },
  cancelled: { text: "Batal",     variant: "gray"  },
}

const CONV_LABEL: Record<ConversationStatus, { text: string; variant: PillVariant }> = {
  open:     { text: "Aktif",   variant: "teal" },
  resolved: { text: "Selesai", variant: "blue" },
  archived: { text: "Arsip",   variant: "gray" },
}

const DOC_LABEL: Record<DocumentStatus, { text: string; variant: PillVariant }> = {
  processing: { text: "Memproses", variant: "amber" },
  ready:      { text: "Siap",      variant: "teal"  },
  error:      { text: "Error",     variant: "red"   },
}

interface StatusPillProps {
  type:   "kb" | "booking" | "conversation" | "document"
  status: string
}

export function StatusPill({ type, status }: StatusPillProps) {
  const map =
    type === "kb"          ? KB_LABEL :
    type === "booking"     ? BOOKING_LABEL :
    type === "conversation"? CONV_LABEL :
                             DOC_LABEL
  const conf = (map as Record<string, { text: string; variant: PillVariant }>)[status]
  if (!conf) return <Badge variant="gray">{status}</Badge>
  return <Badge variant={conf.variant}>{conf.text}</Badge>
}

import { cn } from "@/lib/utils"
import type { SenderType } from "@/lib/constants"

interface ChatBubbleProps {
  senderType: SenderType
  content:    string
  senderName?: string
  timestamp?: string
  // Untuk staff role pink (asisten dokter)
  staffRole?: "asdok" | "default"
}

const VARIANT: Record<string, { cls: string; align: "left" | "right"; label?: string }> = {
  patient: { cls: "bubble-patient", align: "right" },
  ai_bot:  { cls: "bubble-ai",      align: "left", label: "Asisten AI" },
  staff:   { cls: "bubble-staff",   align: "left" },
  asdok:   { cls: "bubble-asdok",   align: "left", label: "Asisten Dokter" },
}

export function ChatBubble({ senderType, content, senderName, timestamp, staffRole }: ChatBubbleProps) {
  const key = senderType === "staff" && staffRole === "asdok" ? "asdok" : senderType
  const variant = VARIANT[key] ?? VARIANT.patient

  return (
    <div className={cn("flex flex-col gap-0.5", variant.align === "right" ? "items-end" : "items-start")}>
      {(variant.label || senderName) && (
        <span className="text-[10px] text-gray-400 px-1">
          {variant.label ?? senderName}
        </span>
      )}
      <div className={variant.cls}>
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
      {timestamp && (
        <span className="text-[10px] text-gray-400 px-1">{timestamp}</span>
      )}
    </div>
  )
}

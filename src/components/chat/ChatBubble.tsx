import { cn } from "@/lib/utils"
import type { SenderType } from "@/lib/constants"

interface ChatBubbleProps {
  senderType: SenderType
  content:    string
  senderName?: string
  timestamp?: string
  staffRole?: "asdok" | "default"
  isRead?:    boolean   // hanya relevan untuk patient bubble — tampilkan ✓✓
  pending?:   boolean   // optimistic state
}

const VARIANT: Record<string, { cls: string; align: "left" | "right"; label?: string }> = {
  patient: { cls: "bubble-patient", align: "right" },
  ai_bot:  { cls: "bubble-ai",      align: "left", label: "Asisten AI" },
  staff:   { cls: "bubble-staff",   align: "left" },
  asdok:   { cls: "bubble-asdok",   align: "left", label: "Asisten Dokter" },
}

export function ChatBubble({ senderType, content, senderName, timestamp, staffRole, isRead, pending }: ChatBubbleProps) {
  const key = senderType === "staff" && staffRole === "asdok" ? "asdok" : senderType
  const variant = VARIANT[key] ?? VARIANT.patient
  const isPatient = senderType === "patient"

  return (
    <div className={cn("flex flex-col gap-0.5 group", variant.align === "right" ? "items-end" : "items-start")}>
      {(variant.label || senderName) && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 flex items-center gap-1">
          {variant.label === "Asisten AI" && (
            <span className="inline-flex size-1.5 rounded-full bg-teal-400" aria-hidden />
          )}
          {variant.label ?? senderName}
        </span>
      )}
      <div className={cn(
        variant.cls,
        "transition-all shadow-sm",
        pending && "opacity-60",
      )}>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
      </div>
      {timestamp && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 flex items-center gap-1">
          {timestamp}
          {isPatient && !pending && (
            <span
              className={cn(
                "inline-flex items-center transition-colors",
                isRead ? "text-teal-500" : "text-gray-400 dark:text-gray-500",
              )}
              aria-label={isRead ? "Dibaca" : "Terkirim"}
            >
              <ReadIcon double={Boolean(isRead)} />
            </span>
          )}
          {pending && (
            <span className="text-gray-400 dark:text-gray-500" aria-label="Mengirim">
              <svg viewBox="0 0 16 16" className="size-3 inline" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4l3 1.5" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </span>
      )}
    </div>
  )
}

function ReadIcon({ double }: { double: boolean }) {
  return (
    <svg viewBox="0 0 18 12" fill="none" className="size-3.5">
      <path d="M1 6 L5 10 L11 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {double && (
        <path d="M5 6 L9 10 L17 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      )}
    </svg>
  )
}

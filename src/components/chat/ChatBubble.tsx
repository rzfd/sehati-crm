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

// Sand & Sage rule: patient = left-aligned, everyone else (AI / staff / asdok)
// = right-aligned. Konsisten untuk chat pasien maupun inbox staff.
const VARIANT: Record<string, { cls: string; align: "left" | "right"; label?: string; ai?: boolean }> = {
  patient: { cls: "bubble-patient", align: "left" },
  ai_bot:  { cls: "bubble-ai",      align: "right", label: "Asisten AI", ai: true },
  staff:   { cls: "bubble-staff",   align: "right" },
  asdok:   { cls: "bubble-asdok",   align: "right", label: "Asisten Dokter" },
}

export function ChatBubble({ senderType, content, senderName, timestamp, staffRole, isRead, pending }: ChatBubbleProps) {
  const key = senderType === "staff" && staffRole === "asdok" ? "asdok" : senderType
  const variant = VARIANT[key] ?? VARIANT.patient
  const isPatient = senderType === "patient"

  return (
    <div className={cn("flex flex-col gap-1 group max-w-[85%]", variant.align === "right" ? "items-end self-end" : "items-start self-start")}>
      {(variant.label || senderName) && (
        <span className={cn(
          "flex items-center gap-1 px-1",
          variant.ai
            ? "eyebrow text-primary"
            : "text-eyebrow uppercase tracking-[0.05em] font-bold text-tertiary",
        )}>
          {variant.ai && (
            <span className="material-symbols-rounded filled text-[14px]" aria-hidden>auto_awesome</span>
          )}
          {variant.label ?? senderName}
        </span>
      )}
      <div className={cn(variant.cls, "transition-all", pending && "opacity-60")}>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
      </div>
      {timestamp && (
        <span className="text-caption text-ink-dim px-1 flex items-center gap-1">
          {timestamp}
          {isPatient && !pending && (
            <span
              className={cn("inline-flex items-center transition-colors", isRead ? "text-primary" : "text-ink-dim")}
              aria-label={isRead ? "Dibaca" : "Terkirim"}
            >
              <ReadIcon double={Boolean(isRead)} />
            </span>
          )}
          {pending && (
            <span className="text-ink-dim" aria-label="Mengirim">
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

export function TypingIndicator({ label = "Asisten AI sedang mengetik" }: { label?: string }) {
  return (
    <div className="flex flex-col items-end gap-1 self-end max-w-[85%]">
      <span className="eyebrow text-primary px-1 flex items-center gap-1">
        <span className="material-symbols-rounded filled text-[14px]" aria-hidden>auto_awesome</span>
        {label}
      </span>
      <div className="bubble-ai inline-flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  )
}

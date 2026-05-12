export function TypingIndicator({ label = "Asisten AI sedang mengetik" }: { label?: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-[10px] text-gray-400 px-1">{label}</span>
      <div className="bubble-ai inline-flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-teal-400 animate-bounce" />
      </div>
    </div>
  )
}

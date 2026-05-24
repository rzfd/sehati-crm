"use client"

import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSend:     (text: string) => void | Promise<void>
  disabled?:  boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = "Tulis pesan…" }: ChatInputProps) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [text])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await onSend(trimmed)
      setText("")
    } finally {
      setSending(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-surface border-t border-border">
      <button
        type="button"
        aria-label="Lampiran"
        className="text-ink-muted hover:text-primary transition-transform active:scale-90 pb-1.5"
      >
        <span className="material-symbols-rounded text-[26px]">add_circle</span>
      </button>
      <div className="flex-1 flex items-end bg-surface-alt border border-border rounded-2xl px-4 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={disabled || sending}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent border-none py-1 text-body-md text-ink placeholder:text-ink-dim focus:outline-none focus:ring-0"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || sending || !text.trim()}
        aria-label="Kirim pesan"
        className="size-10 shrink-0 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        <span className="material-symbols-rounded filled text-[20px]">{sending ? "more_horiz" : "send"}</span>
      </button>
    </div>
  )
}

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
    <div className="flex items-end gap-2 p-3 bg-white border-t border-black/[0.08]">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
        disabled={disabled || sending}
        placeholder={placeholder}
        className="flex-1 resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
      />
      <button onClick={handleSend} disabled={disabled || sending || !text.trim()} className="btn-primary">
        {sending ? "..." : "Kirim"}
      </button>
    </div>
  )
}

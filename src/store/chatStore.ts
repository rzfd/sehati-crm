import { create } from "zustand"
import type { Message } from "@/types/database"

interface ChatState {
  conversationId: string | null
  messages:       Message[]
  isTyping:       boolean
  setConversation: (id: string | null) => void
  setMessages:     (messages: Message[]) => void
  appendMessage:   (message: Message) => void
  setTyping:       (typing: boolean) => void
  reset:           () => void
}

// Lightweight client-side chat state. useRealtimeChat menangani subscription;
// store ini dipakai komponen yang butuh akses cross-component (mis. typing indicator).
export const useChatStore = create<ChatState>((set) => ({
  conversationId: null,
  messages:       [],
  isTyping:       false,
  setConversation: (id) => set({ conversationId: id, messages: [] }),
  setMessages:     (messages) => set({ messages }),
  appendMessage:   (message) => set((s) => ({ messages: [...s.messages, message] })),
  setTyping:       (isTyping) => set({ isTyping }),
  reset:           () => set({ conversationId: null, messages: [], isTyping: false }),
}))

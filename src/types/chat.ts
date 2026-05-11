// types/chat.ts — Chat UI & realtime types

import type { Conversation, Message, Patient, StaffMember, Doctor } from "./database"

// ── Message with enriched sender info ────────────────────
export interface MessageWithSender extends Message {
  patient?: Pick<Patient, "id" | "name" | "is_new"> | null
  staff?:   Pick<StaffMember, "id" | "name" | "role" | "avatar_url"> | null
}

// ── Conversation list item (inbox) ────────────────────────
export interface ConversationListItem extends Conversation {
  patient:       Pick<Patient, "id" | "name" | "phone" | "is_new" | "tags">
  last_message:  Pick<Message, "content" | "sender_type" | "created_at"> | null
  unread_count:  number
  assigned_staff?: Pick<StaffMember, "id" | "name" | "role"> | null
  routed_doctor?:  Pick<Doctor, "id" | "name" | "specialty"> | null
}

// ── Full conversation view ────────────────────────────────
export interface ConversationDetail extends Conversation {
  patient:  Patient
  messages: MessageWithSender[]
  assigned_staff?: StaffMember | null
  routed_doctor?:  Doctor | null
}

// ── AI metadata stored in messages.ai_metadata ────────────
export interface AIMessageMetadata {
  action:      "auto_reply" | "escalate" | "booking_request"
  category?:   string
  confidence?: number
  kb_sources?: KBSource[]
  urgency?:    number
}

export interface KBSource {
  id:          string
  source_type: "qa_pair" | "document_chunk"
  similarity:  number
  preview:     string
}

// ── Chat store state ──────────────────────────────────────
export interface ChatState {
  conversationId: string | null
  messages:       MessageWithSender[]
  isLoading:      boolean
  isTyping:       boolean
}

// ── Inbox store state ─────────────────────────────────────
export interface InboxState {
  conversations:     ConversationListItem[]
  activeId:          string | null
  filter:            "all" | "open" | "urgent" | "mine"
  isLoading:         boolean
}

import { create } from "zustand"

export type InboxFilter = "all" | "open" | "urgent" | "mine" | "ai_handled"

interface InboxState {
  activeId: string | null
  filter:   InboxFilter
  setActive: (id: string | null) => void
  setFilter: (f: InboxFilter) => void
}

export const useInboxStore = create<InboxState>((set) => ({
  activeId: null,
  filter:   "all",
  setActive: (id) => set({ activeId: id }),
  setFilter: (f) => set({ filter: f, activeId: null }),
}))

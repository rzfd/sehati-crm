import { create } from "zustand"

export type InboxFilter = "all" | "open" | "urgent" | "mine" | "ai_handled"

interface InboxState {
  activeId:       string | null
  filter:         InboxFilter
  refreshNonce:   number  // increment untuk trigger useInbox refetch
  setActive:      (id: string | null) => void
  setFilter:      (f: InboxFilter) => void
  triggerRefresh: () => void
}

export const useInboxStore = create<InboxState>((set) => ({
  activeId:     null,
  filter:       "all",
  refreshNonce: 0,
  setActive: (id) => set({ activeId: id }),
  setFilter: (f) => set({ filter: f, activeId: null }),
  triggerRefresh: () => set((s) => ({ refreshNonce: s.refreshNonce + 1 })),
}))

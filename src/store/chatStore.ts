import { create } from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  isPanelOpen: boolean;
  isLoading: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isPanelOpen: false,
  isLoading: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));

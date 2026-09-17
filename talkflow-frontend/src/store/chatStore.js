import { create } from "zustand";

export const useChatStore = create((set) => ({
  unreadCounts: {},

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => {
      const updatedCounts = { ...state.unreadCounts };

      delete updatedCounts[conversationId];

      return {
        unreadCounts: updatedCounts,
      };
    }),
}));

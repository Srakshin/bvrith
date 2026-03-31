import { useCallback } from 'react';

export const useLocalStorage = () => {
  // Get userId from localStorage (set by auth system)
  const userId = localStorage.getItem("user_id") || "anonymous";
  const chatStorageKey = `studia_chat_${userId}`;

  const saveMessages = useCallback((messages) => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey]);

  const loadMessages = useCallback(() => {
    const saved = localStorage.getItem(chatStorageKey);
    return saved ? JSON.parse(saved) : [];
  }, [chatStorageKey]);

  const clearMessages = useCallback(() => {
    localStorage.removeItem(chatStorageKey);
  }, [chatStorageKey]);

  return {
    saveMessages,
    loadMessages,
    clearMessages
  };
};
"use client"

import { useState, useEffect, useCallback } from "react"

interface Message {
  id: string
  type: "user" | "bot" | "bot-complex" | "typing"
  text: string
  subText?: string
  isSuccess?: boolean
  details?: string[]
  timestamp: Date
}

const CHAT_HISTORY_KEY = "super-agent-chat-history"
const MAX_MESSAGES = 1000 // Limit stored messages to prevent localStorage bloat

export function useChatStorage(initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load chat history from localStorage
  const loadChatHistory = useCallback((): Message[] => {
    if (typeof window === "undefined") return initialMessages

    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Convert timestamp strings back to Date objects and validate structure
        const validMessages = parsed
          .filter((msg: any) => msg.id && msg.type && msg.text && msg.timestamp)
          .map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          .slice(-MAX_MESSAGES) // Keep only the most recent messages

        return validMessages.length > 0 ? validMessages : initialMessages
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
      // Clear corrupted data
      localStorage.removeItem(CHAT_HISTORY_KEY)
    }
    return initialMessages
  }, [initialMessages])

  // Save chat history to localStorage
  const saveChatHistory = useCallback((messagesToSave: Message[]) => {
    if (typeof window === "undefined") return

    try {
      // Filter out typing indicators and limit message count
      const filteredMessages = messagesToSave.filter((msg) => msg.type !== "typing").slice(-MAX_MESSAGES)

      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filteredMessages))
    } catch (error) {
      console.error("Failed to save chat history:", error)
      // If localStorage is full, try to clear old data and retry
      if (error instanceof DOMException && error.code === 22) {
        try {
          localStorage.removeItem(CHAT_HISTORY_KEY)
          const reducedMessages = messagesToSave.slice(-50) // Keep only last 50 messages
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(reducedMessages))
        } catch (retryError) {
          console.error("Failed to save reduced chat history:", retryError)
        }
      }
    }
  }, [])

  // Initialize chat history on mount
  useEffect(() => {
    const history = loadChatHistory()
    setMessages(history)
    setIsInitialized(true)
  }, [loadChatHistory])

  // Save chat history whenever messages change (but not on initial load)
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages, isInitialized, saveChatHistory])

  // Clear chat history
  const clearChatHistory = useCallback(() => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all chat history? This action cannot be undone.",
    )
    if (confirmClear) {
      setMessages(initialMessages)
      localStorage.removeItem(CHAT_HISTORY_KEY)
    }
  }, [initialMessages])

  // Export chat history as JSON
  const exportChatHistory = useCallback(() => {
    const dataStr = JSON.stringify(
      messages.filter((m) => m.type !== "typing"),
      null,
      2,
    )
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [messages])

  // Get storage usage info
  const getStorageInfo = useCallback(() => {
    if (typeof window === "undefined") return { used: 0, total: 0, percentage: 0 }

    try {
      const used = new Blob([localStorage.getItem(CHAT_HISTORY_KEY) || ""]).size
      const total = 5 * 1024 * 1024 // 5MB typical localStorage limit
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100),
        messageCount: messages.filter((m) => m.type !== "typing").length,
      }
    } catch {
      return { used: 0, total: 0, percentage: 0, messageCount: 0 }
    }
  }, [messages])

  return {
    messages,
    setMessages,
    isInitialized,
    clearChatHistory,
    exportChatHistory,
    getStorageInfo,
  }
}

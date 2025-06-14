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

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  createdAt: Date
  lastActivity: Date
  isActive: boolean
}

const CHAT_SESSIONS_KEY = "super-agent-chat-sessions"
const ACTIVE_SESSION_KEY = "super-agent-active-session"
const MAX_SESSIONS = 20
const MAX_MESSAGES_PER_SESSION = 500

export function useChatSessions(initialMessages: Message[]) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Generate a unique session name
  const generateSessionName = useCallback((existingSessions: ChatSession[]): string => {
    const now = new Date()
    const baseNames = [
      "Planning Session",
      "Research Chat",
      "General Discussion",
      "Task Management",
      "Creative Session",
      "Problem Solving",
      "Quick Chat",
      "Work Session",
    ]

    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)]
    const timeStamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    let sessionName = `${baseName} - ${timeStamp}`

    // Ensure uniqueness
    let counter = 1
    while (existingSessions.some((s) => s.name === sessionName)) {
      sessionName = `${baseName} - ${timeStamp} (${counter})`
      counter++
    }

    return sessionName
  }, [])

  // Load sessions from localStorage
  const loadSessions = useCallback((): { sessions: ChatSession[]; activeId: string } => {
    if (typeof window === "undefined") {
      const defaultSession: ChatSession = {
        id: "default",
        name: "Main Session",
        messages: initialMessages,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      }
      return { sessions: [defaultSession], activeId: "default" }
    }

    try {
      const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY)
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY)

      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
        }))

        // Validate sessions and remove corrupted ones
        const validSessions = parsed.filter((session) => session.id && session.name && Array.isArray(session.messages))

        if (validSessions.length > 0) {
          const activeId =
            savedActiveId && validSessions.some((s) => s.id === savedActiveId) ? savedActiveId : validSessions[0].id

          return { sessions: validSessions, activeId }
        }
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error)
      localStorage.removeItem(CHAT_SESSIONS_KEY)
      localStorage.removeItem(ACTIVE_SESSION_KEY)
    }

    // Create default session if none exist
    const defaultSession: ChatSession = {
      id: "default",
      name: "Main Session",
      messages: initialMessages,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    }
    return { sessions: [defaultSession], activeId: "default" }
  }, [initialMessages])

  // Save sessions to localStorage
  const saveSessions = useCallback((sessionsToSave: ChatSession[], activeId: string) => {
    if (typeof window === "undefined") return

    try {
      // Filter out typing indicators and limit messages per session
      const cleanedSessions = sessionsToSave.map((session) => ({
        ...session,
        messages: session.messages.filter((msg) => msg.type !== "typing").slice(-MAX_MESSAGES_PER_SESSION),
      }))

      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(cleanedSessions))
      localStorage.setItem(ACTIVE_SESSION_KEY, activeId)
    } catch (error) {
      console.error("Failed to save chat sessions:", error)

      // If storage is full, try to save with reduced data
      if (error instanceof DOMException && error.code === 22) {
        try {
          const reducedSessions = sessionsToSave.slice(-5).map((session) => ({
            ...session,
            messages: session.messages.slice(-50),
          }))
          localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(reducedSessions))
          localStorage.setItem(ACTIVE_SESSION_KEY, activeId)
        } catch (retryError) {
          console.error("Failed to save reduced sessions:", retryError)
        }
      }
    }
  }, [])

  // Initialize sessions on mount
  useEffect(() => {
    const { sessions: loadedSessions, activeId } = loadSessions()
    setSessions(loadedSessions)
    setActiveSessionId(activeId)
    setIsInitialized(true)
  }, [loadSessions])

  // Save sessions whenever they change
  useEffect(() => {
    if (isInitialized && sessions.length > 0) {
      saveSessions(sessions, activeSessionId)
    }
  }, [sessions, activeSessionId, isInitialized, saveSessions])

  // Get current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Create new session
  const createSession = useCallback(
    (name?: string) => {
      const newSession: ChatSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || generateSessionName(sessions),
        messages: initialMessages,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: false,
      }

      setSessions((prev) => {
        // Limit total number of sessions
        const updatedSessions = prev.length >= MAX_SESSIONS ? [...prev.slice(1), newSession] : [...prev, newSession]

        return updatedSessions.map((s) => ({ ...s, isActive: false }))
      })

      setActiveSessionId(newSession.id)
      return newSession.id
    },
    [sessions, generateSessionName, initialMessages],
  )

  // Switch to session
  const switchToSession = useCallback(
    (sessionId: string) => {
      if (sessions.some((s) => s.id === sessionId)) {
        setActiveSessionId(sessionId)
        setSessions((prev) =>
          prev.map((s) => ({
            ...s,
            isActive: s.id === sessionId,
            lastActivity: s.id === sessionId ? new Date() : s.lastActivity,
          })),
        )
      }
    },
    [sessions],
  )

  // Update session messages
  const updateSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, messages, lastActivity: new Date() } : session)),
    )
  }, [])

  // Rename session
  const renameSession = useCallback((sessionId: string, newName: string) => {
    if (newName.trim() === "") return false

    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, name: newName.trim() } : session)),
    )
    return true
  }, [])

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      if (sessions.length <= 1) return false // Don't delete the last session

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId)
        return filtered
      })

      // If deleting active session, switch to the first remaining session
      if (sessionId === activeSessionId && sessions.length > 1) {
        const remainingSession = sessions.find((s) => s.id !== sessionId)
        if (remainingSession) {
          setActiveSessionId(remainingSession.id)
        }
      }

      return true
    },
    [sessions, activeSessionId],
  )

  // Duplicate session
  const duplicateSession = useCallback(
    (sessionId: string) => {
      const sessionToDuplicate = sessions.find((s) => s.id === sessionId)
      if (!sessionToDuplicate) return null

      const duplicatedSession: ChatSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${sessionToDuplicate.name} (Copy)`,
        messages: [...sessionToDuplicate.messages],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: false,
      }

      setSessions((prev) => {
        const updatedSessions =
          prev.length >= MAX_SESSIONS ? [...prev.slice(1), duplicatedSession] : [...prev, duplicatedSession]

        return updatedSessions.map((s) => ({ ...s, isActive: false }))
      })

      setActiveSessionId(duplicatedSession.id)
      return duplicatedSession.id
    },
    [sessions],
  )

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    const defaultSession: ChatSession = {
      id: "default",
      name: "Main Session",
      messages: initialMessages,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    }

    setSessions([defaultSession])
    setActiveSessionId("default")
    localStorage.removeItem(CHAT_SESSIONS_KEY)
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  }, [initialMessages])

  // Export all sessions
  const exportAllSessions = useCallback(() => {
    const exportData = {
      sessions: sessions.map((session) => ({
        ...session,
        messages: session.messages.filter((m) => m.type !== "typing"),
      })),
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `chat-sessions-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [sessions])

  return {
    sessions,
    activeSession,
    activeSessionId,
    isInitialized,
    createSession,
    switchToSession,
    updateSessionMessages,
    renameSession,
    deleteSession,
    duplicateSession,
    clearAllSessions,
    exportAllSessions,
  }
}

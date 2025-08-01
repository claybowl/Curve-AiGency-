"use client"

import { useState, useEffect, useCallback } from "react"

// Define types for settings - these should match the structures in your settings components
interface AgentConfig {
  id: string
  name: string
  enabled: boolean
  n8nWorkflowTag: string // This might be useful for UI, but not sent to backend
  // Add other agent properties as needed
  [key: string]: any
}

interface SystemSettingsConfig {
  // Define system settings properties
  [key: string]: any
}

export function useSettings() {
  const [agentSettings, setAgentSettings] = useState<AgentConfig[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>({})
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  const loadSettings = useCallback(() => {
    try {
      const savedAgentSettings = localStorage.getItem("agent-settings")
      if (savedAgentSettings) {
        setAgentSettings(JSON.parse(savedAgentSettings))
      }

      const savedSystemSettings = localStorage.getItem("system-settings")
      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings))
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    } finally {
      setIsSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadSettings()
      // Optional: Listen for storage events to update if settings are changed in another tab
      window.addEventListener("storage", loadSettings)
      return () => {
        window.removeEventListener("storage", loadSettings)
      }
    }
  }, [loadSettings])

  return { agentSettings, systemSettings, isSettingsLoaded }
}

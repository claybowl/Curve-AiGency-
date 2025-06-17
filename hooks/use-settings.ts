"use client"

import { useState, useEffect, useCallback } from "react"

// Define types for settings - these should match the structures in your settings components
interface AgentConfig {
  id: string
  name: string
  enabled: boolean
  llmProvider: string
  model: string
  systemPrompt: string
  temperature: number
  // Add other agent properties as needed
  [key: string]: any
}

interface LLMProviderConfig {
  id: string
  name: string
  enabled: boolean
  defaultModel: string
  // Add other provider properties as needed
  [key: string]: any
}

export function useSettings() {
  const [agentSettings, setAgentSettings] = useState<AgentConfig[]>([])
  const [llmProviderSettings, setLlmProviderSettings] = useState<LLMProviderConfig[]>([])
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  const loadSettings = useCallback(() => {
    try {
      const savedAgentSettings = localStorage.getItem("agent-settings")
      if (savedAgentSettings) {
        setAgentSettings(JSON.parse(savedAgentSettings))
      }

      const savedLlmProviderSettings = localStorage.getItem("llm-provider-settings")
      if (savedLlmProviderSettings) {
        setLlmProviderSettings(JSON.parse(savedLlmProviderSettings))
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    } finally {
      setIsSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
    // Optional: Listen for storage events to update if settings are changed in another tab
    window.addEventListener("storage", loadSettings)
    return () => {
      window.removeEventListener("storage", loadSettings)
    }
  }, [loadSettings])

  return { agentSettings, llmProviderSettings, isSettingsLoaded }
}

"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useSettings } from "@/hooks/use-settings"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Paperclip,
  Mic,
  Send,
  Bot,
  UserCircle2,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Download,
  Trash2,
  Users,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import CollaborationWorkspace from "@/components/collaboration-workspace"
import { generateInterAgentConversation } from "@/utils/inter-agent-conversations"
import { cn } from "@/lib/utils"
import { FixedSizeList as List } from "react-window"

interface Message {
  id: string
  type: "user" | "bot" | "bot-complex" | "typing" | "handoff" | "collaboration" | "collaboration-update" | "crew_update"
  text: string
  subText?: string
  isSuccess?: boolean
  details?: string[]
  timestamp: Date
  agentName?: string
  crewUpdateData?: {
    agentRole?: string
    taskDescription?: string
    outputSummary?: string
    fullOutput?: string
    isCollapsed?: boolean
  }
  handoffData?: {
    fromAgent: string
    toAgent: string
    reason: string
    note?: string
  }
  collaborationData?: {
    id: string
    agents: string[]
    task: string
    status: "starting" | "in-progress" | "completed"
    progress?: number
  }
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  createdAt: Date
  lastActivity: Date
  isActive: boolean
  currentAgent?: string
  activeCollaborations?: string[]
}

interface Agent {
  name: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  capabilities: string[]
  specialties: string[]
  performance: {
    successRate: number
    avgResponseTime: string
    tasksCompleted: number
    rating: number
  }
  status: "active" | "busy" | "idle"
  examples: string[]
}

interface CollaborationTask {
  id: string
  description: string
  requiredAgents: string[]
  estimatedTime: string
  complexity: "low" | "medium" | "high"
}

// ... (other interfaces remain the same) ...
interface HandoffReason {
  reason: string
  description: string
  suggestedAgents: string[]
}

interface AgentConsoleProps {
  sessions: ChatSession[]
  activeSessionId: string
  onUpdateSessionMessages: (sessionId: string, messages: Message[]) => void
  availableAgents: Agent[]
}

interface InterAgentMessage {
  id: string
  fromAgent: string
  toAgent?: string
  message: string
  timestamp: Date
  type: "coordination" | "question" | "update" | "suggestion" | "completion"
  priority: "low" | "normal" | "high"
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    text: "Hello! I'm your Enhanced Super Agent. How can I assist you today?",
    subText: "System initialized with safety protocols active",
    timestamp: new Date(Date.now() - 300000),
  },
]

const OutputLine = ({ index, style, data }: { index: number; style: React.CSSProperties; data: string[] }) => (
  <div style={style} className="text-xs whitespace-pre text-slate-700 dark:text-slate-300 px-1">
    {data[index]}
  </div>
)

export default function AgentConsole({
  sessions,
  activeSessionId,
  onUpdateSessionMessages,
  availableAgents,
}: AgentConsoleProps) {
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false) // Restored
  const [activeCollaborations, setActiveCollaborations] = useState<Map<string, any>>(new Map()) // Restored
  const [interAgentMessages, setInterAgentMessages] = useState<Map<string, InterAgentMessage[]>>(new Map()) // Restored
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const { agentSettings, llmProviderSettings, systemSettings, isSettingsLoaded } = useSettings() // Use our settings hook

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const currentMessages = activeSession?.messages || [] // Renamed to avoid conflict with hook
  const currentAgent = availableAgents.find((agent) => agent.name === activeSession?.currentAgent)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: "smooth" })
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, scrollToBottom])

  const addMessage = useCallback(
    (message: Message) => {
      if (!activeSession) return
      const updatedMessages = [...currentMessages, message]
      onUpdateSessionMessages(activeSessionId, updatedMessages)
    },
    [activeSession, currentMessages, activeSessionId, onUpdateSessionMessages],
  )

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      if (!activeSession) return
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates, timestamp: new Date() } : msg,
      )
      onUpdateSessionMessages(activeSessionId, updatedMessages)
    },
    [activeSession, currentMessages, activeSessionId, onUpdateSessionMessages],
  )

  const toggleCrewUpdateCollapse = useCallback(
    (messageId: string) => {
      if (!activeSession) return
      const updatedMessages = currentMessages.map((msg) => {
        if (msg.id === messageId && msg.crewUpdateData) {
          return {
            ...msg,
            crewUpdateData: {
              ...msg.crewUpdateData,
              isCollapsed: !msg.crewUpdateData.isCollapsed,
            },
          }
        }
        return msg
      })
      onUpdateSessionMessages(activeSessionId, updatedMessages)
    },
    [activeSession, currentMessages, activeSessionId, onUpdateSessionMessages],
  )

  const simulateInterAgentCommunication = useCallback(
    (collaborationId: string, agents: Agent[], task: CollaborationTask) => {
      const conversation = generateInterAgentConversation(task.id, agents, collaborationId)
      conversation.forEach((message, index) => {
        setTimeout(() => {
          setInterAgentMessages((prev) => {
            const existing = prev.get(collaborationId) || []
            const updated = [...existing, message]
            return new Map(prev.set(collaborationId, updated))
          })
        }, index * 2000)
      })
    },
    [],
  )

  const handleStartCollaboration = useCallback(
    (selectedAgents: Agent[], task: CollaborationTask, instructions: string) => {
      if (!activeSession) return
      const collaborationId = `collab-${Date.now()}`
      const collaborationMessage: Message = {
        id: Date.now().toString() + "-collaboration",
        type: "collaboration",
        text: `Multi-agent collaboration started: ${task.description}`,
        subText: `${selectedAgents.length} agents working together: ${selectedAgents.map((a) => a.name).join(", ")}`,
        timestamp: new Date(),
        collaborationData: {
          id: collaborationId,
          agents: selectedAgents.map((a) => a.name),
          task: task.description,
          status: "starting",
          progress: 0,
        },
      }
      addMessage(collaborationMessage)
      const steps = [
        { agent: selectedAgents[0], description: "Initial analysis and planning", duration: 2000 },
        { agent: selectedAgents[1], description: "Detailed research and data gathering", duration: 3000 },
        ...(selectedAgents[2]
          ? [{ agent: selectedAgents[2], description: "Synthesis and final recommendations", duration: 2500 }]
          : []),
      ]
      let currentStep = 0
      const updateProgress = () => {
        if (currentStep < steps.length) {
          const step = steps[currentStep]
          const progressMessage: Message = {
            id: Date.now().toString() + `-progress-${currentStep}`,
            type: "collaboration-update",
            text: `[${step.agent.name}] ${step.description}...`,
            timestamp: new Date(),
            agentName: step.agent.name,
            collaborationData: {
              id: collaborationId,
              agents: selectedAgents.map((a) => a.name),
              task: task.description,
              status: "in-progress",
              progress: ((currentStep + 1) / steps.length) * 100,
            },
          }
          addMessage(progressMessage)
          currentStep++
          setTimeout(updateProgress, step.duration)
        } else {
          const completionMessage: Message = {
            id: Date.now().toString() + "-collaboration-complete",
            type: "collaboration",
            text: "Collaboration completed successfully!",
            subText: "All agents have contributed their expertise to provide comprehensive results.",
            isSuccess: true,
            details: [
              "Research phase completed with comprehensive data",
              "Analysis performed with statistical insights",
              "Recommendations synthesized from all perspectives",
              "Final deliverables ready for review",
            ],
            timestamp: new Date(),
            collaborationData: {
              id: collaborationId,
              agents: selectedAgents.map((a) => a.name),
              task: task.description,
              status: "completed",
              progress: 100,
            },
          }
          addMessage(completionMessage)
        }
      }
      setTimeout(updateProgress, 1000)
      simulateInterAgentCommunication(collaborationId, selectedAgents, task)
    },
    [activeSession, addMessage, simulateInterAgentCommunication],
  )

  const _handleSendMessage = async (crewConfig?: {
    type: string
    involved_agents?: string[]
    task_description?: string
  }) => {
    const currentInputText = inputValue.trim() // Renamed to avoid conflict
    if (currentInputText === "" && !crewConfig) return
    if (isSending || !activeSession || !isSettingsLoaded) {
      // Check if settings are loaded
      if (!isSettingsLoaded) {
        toast({
          title: "Settings not loaded",
          description: "Please wait for settings to load or check configuration.",
          variant: "destructive",
        })
      }
      return
    }

    setIsSending(true)
    const userMessageText = crewConfig?.task_description || currentInputText

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      type: "user",
      text: userMessageText,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    if (!crewConfig) {
      setInputValue("")
    }

    const botMessageId = Date.now().toString() + "-crew"
    let accumulatedBotText = ""

    const initialBotMessage: Message = {
      id: botMessageId,
      type: "crew_update",
      text: "🚀 AI Crew is initializing...",
      timestamp: new Date(),
      agentName: "CrewAI Orchestrator",
      subText: "Waiting for updates from the crew...",
      crewUpdateData: { isCollapsed: true },
    }
    addMessage(initialBotMessage)
    scrollToBottom()

    try {
      const requestBody = {
        prompt: userMessageText,
        type: crewConfig?.type || "general_query",
        involved_agents: crewConfig?.involved_agents,
        task_description: crewConfig?.task_description || userMessageText,
        crew_config: {
          // Send settings to backend
          agents: agentSettings,
          providers: llmProviderSettings,
          system: systemSettings,
        },
      }

      const response = await fetch("/api/crew", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok || !response.body) {
        const errorText = response.ok ? "Response body is null" : await response.text()
        throw new Error(`Server error: ${response.status} ${errorText}`)
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ""

      // eslint-disable-next-line no-constant-identifier
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += value
        let eolIndex
        while ((eolIndex = buffer.indexOf("\n\n")) >= 0) {
          const messageChunk = buffer.substring(0, eolIndex)
          buffer = buffer.substring(eolIndex + 2)

          if (messageChunk.startsWith("data: ")) {
            const jsonData = messageChunk.substring("data: ".length)
            try {
              const eventData = JSON.parse(jsonData)
              let newText = accumulatedBotText
              let newSubText = ""
              let crewUpdatePayload: Partial<Message["crewUpdateData"]> = { isCollapsed: true }

              const existingMessage = currentMessages.find((m) => m.id === botMessageId)
              if (existingMessage?.crewUpdateData?.fullOutput && eventData.type !== "task_update") {
                crewUpdatePayload.fullOutput = existingMessage.crewUpdateData.fullOutput
              }
              if (existingMessage?.crewUpdateData?.isCollapsed !== undefined && eventData.type !== "task_update") {
                crewUpdatePayload.isCollapsed = existingMessage.crewUpdateData.isCollapsed
              }

              switch (eventData.type) {
                case "status_update":
                  newSubText = `Status: ${eventData.data.message}`
                  newText = `${eventData.data.message}\n${accumulatedBotText || "Processing..."}`
                  crewUpdatePayload.agentRole = "Crew Orchestrator"
                  break
                case "task_update":
                  const taskUpdate = eventData.data
                  crewUpdatePayload = {
                    agentRole: taskUpdate.agent_role,
                    taskDescription: taskUpdate.task_description,
                    outputSummary: taskUpdate.output_summary,
                    fullOutput: taskUpdate.full_output,
                    isCollapsed: existingMessage?.crewUpdateData?.isCollapsed ?? true,
                  }
                  newText += `\n\n**${taskUpdate.agent_role} completed task:**\n*${taskUpdate.task_description.substring(0, 70)}...*\n${taskUpdate.output_summary}`
                  newSubText = `Task by ${taskUpdate.agent_role} finished.`
                  break
                case "final_result":
                  newText += `\n\n**🏁 Final Result:**\n${eventData.data.result}`
                  newSubText = `Crew finished: ${eventData.data.crew_details?.agents_used?.join(", ") || "N/A"}.`
                  crewUpdatePayload.agentRole = "Crew Orchestrator"
                  crewUpdatePayload.outputSummary = eventData.data.result
                  break
                case "error":
                  newText += `\n\n**⚠️ Error:** ${eventData.data.message}`
                  newSubText = "An error occurred with the AI Crew."
                  crewUpdatePayload.agentRole = "Crew Orchestrator"
                  break
                case "stream_end":
                  newSubText = eventData.data.message || "Processing complete."
                  if (accumulatedBotText === "") newText = "Processing complete."
                  crewUpdatePayload.agentRole = "Crew Orchestrator"
                  crewUpdatePayload.outputSummary = eventData.data.result
                  break
              }
              accumulatedBotText = newText
              updateMessage(botMessageId, {
                text: accumulatedBotText,
                subText: newSubText,
                crewUpdateData: {
                  ...(currentMessages.find((m) => m.id === botMessageId)?.crewUpdateData || {}),
                  ...crewUpdatePayload,
                },
              })
              scrollToBottom()

              if (eventData.type === "stream_end" || eventData.type === "error") {
                await reader.cancel()
                return
              }
            } catch (e) {
              console.error("Error parsing SSE JSON data:", e, "Raw data:", jsonData)
              updateMessage(botMessageId, {
                text: accumulatedBotText + `\n[Stream Parse Error]`,
                subText: "Error processing stream data.",
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming Fetch Error:", error)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Unknown connection error.",
        variant: "destructive",
      })
      updateMessage(botMessageId, {
        text: `Connection Error: ${error instanceof Error ? error.message : "Unknown connection error."}`,
        subText: "Failed to connect to AI Crew.",
      })
    } finally {
      setIsSending(false)
      setTimeout(scrollToBottom, 100)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleSendMessage = useCallback(_handleSendMessage, [
    inputValue,
    isSending,
    activeSession,
    addMessage,
    updateMessage,
    scrollToBottom,
    currentMessages,
    isSettingsLoaded, // Added dependencies
    agentSettings,
    llmProviderSettings,
    systemSettings,
    toast,
  ])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const clearCurrentSession = useCallback(() => {
    if (!activeSession) return
    const confirmClear = window.confirm(
      `Are you sure you want to clear all messages in "${activeSession.name}"? This action cannot be undone.`,
    )
    if (confirmClear) {
      onUpdateSessionMessages(activeSessionId, initialMessages)
    }
  }, [activeSession, activeSessionId, onUpdateSessionMessages])

  const exportCurrentSession = useCallback(() => {
    if (!activeSession) return
    const exportData = {
      session: {
        ...activeSession,
        messages: currentMessages.filter((m) => m.type !== "typing"),
      },
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${activeSession.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [activeSession, currentMessages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!activeSession) {
    return (
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-850 p-4 md:p-6 overflow-hidden min-w-[600px]">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex items-center justify-center border dark:border-slate-700">
          <div className="text-center">
            <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No Active Session</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a new session to start chatting.</p>
          </div>
        </div>
      </section>
    )
  }

  const outputLinesCache = new Map<string, string[]>()

  return (
    <>
      <section className="flex-1 flex flex-col bg-background p-4 md:p-6 overflow-hidden min-w-[600px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Agent Console</h2>
          {currentAgent && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className={`p-1.5 rounded ${currentAgent.bgColor}`}>
                <currentAgent.icon className={`h-3 w-3 ${currentAgent.color}`} />
              </div>
              <span>Active Agent: {currentAgent.name}</span>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex flex-col overflow-hidden border dark:border-slate-700">
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
            <div className="flex items-center gap-4">
              <h3 className="font-medium text-slate-800 dark:text-slate-100">{activeSession.name}</h3>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {currentMessages.filter((m) => m.type !== "typing").length} messages
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCurrentSession} className="gap-2">
                  <Download className="h-4 w-4" /> Export Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearCurrentSession} className="gap-2 text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4" /> Clear Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {currentMessages.map((msg) => {
                const getOutputLines = (fullOutput: string | undefined): string[] => {
                  if (!fullOutput) return []
                  if (outputLinesCache.has(msg.id)) {
                    return outputLinesCache.get(msg.id)!
                  }
                  const lines = fullOutput.split("\n")
                  outputLinesCache.set(msg.id, lines)
                  return lines
                }

                const outputLines = useMemo(
                  () => getOutputLines(msg.crewUpdateData?.fullOutput),
                  [msg.crewUpdateData?.fullOutput, msg.id],
                )

                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                    {msg.type !== "user" && (
                      <div
                        className={cn(
                          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white mt-1",
                          msg.type === "crew_update"
                            ? "bg-purple-500 dark:bg-purple-600"
                            : "bg-indigo-500 dark:bg-indigo-600",
                        )}
                      >
                        {msg.type === "typing" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : msg.type === "crew_update" ? (
                          <Sparkles size={18} />
                        ) : msg.type === "handoff" ? (
                          <ArrowRight size={16} />
                        ) : msg.type === "collaboration" || msg.type === "collaboration-update" ? (
                          <Users size={16} />
                        ) : (
                          <Bot size={18} />
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-xl max-w-[80%] text-sm relative group",
                        msg.type === "user"
                          ? "bg-indigo-500 text-white rounded-br-none"
                          : msg.type === "crew_update"
                            ? "bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-bl-none"
                            : msg.type === "typing"
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-bl-none animate-pulse"
                              : msg.type === "handoff"
                                ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-bl-none"
                                : msg.type === "collaboration" || msg.type === "collaboration-update"
                                  ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-bl-none"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none",
                      )}
                    >
                      {msg.type === "crew_update" && msg.crewUpdateData?.agentRole && (
                        <div className="mb-1 text-xs font-medium text-purple-700 dark:text-purple-400">
                          <Info size={12} className="inline mr-1" />
                          {msg.crewUpdateData.agentRole}
                          {msg.crewUpdateData.taskDescription && (
                            <span className="text-slate-500 dark:text-slate-400 font-normal">
                              {" "}
                              (Task: {msg.crewUpdateData.taskDescription.substring(0, 40)}...)
                            </span>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.type === "crew_update" && msg.crewUpdateData?.fullOutput && (
                        <div className="mt-2 border-t border-purple-200 dark:border-purple-700 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCrewUpdateCollapse(msg.id)}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50 w-full justify-start px-2 py-1"
                            aria-expanded={!msg.crewUpdateData.isCollapsed}
                            aria-controls={`full-output-${msg.id}`}
                          >
                            {msg.crewUpdateData.isCollapsed ? (
                              <ChevronRight size={14} className="mr-1" />
                            ) : (
                              <ChevronDown size={14} className="mr-1" />
                            )}
                            {msg.crewUpdateData.isCollapsed ? "Show Full Output" : "Hide Full Output"}
                          </Button>
                          {!msg.crewUpdateData.isCollapsed && (
                            <div
                              id={`full-output-${msg.id}`}
                              className="mt-1 w-full rounded-md border bg-purple-25 dark:bg-purple-900/20 p-0.5 overflow-hidden"
                              style={{ height: "192px" }}
                            >
                              {outputLines.length > 0 ? (
                                <List
                                  height={192}
                                  itemCount={outputLines.length}
                                  itemSize={18}
                                  width="100%"
                                  itemData={outputLines}
                                  className="custom-scrollbar"
                                >
                                  {OutputLine}
                                </List>
                              ) : (
                                <p className="p-2 text-xs text-slate-500 dark:text-slate-400">
                                  No detailed output available.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {msg.subText && !msg.isSuccess && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{msg.subText}</p>
                      )}
                      {msg.isSuccess && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 size={16} /> <p className="font-medium text-xs">{msg.subText}</p>
                          </div>
                          {msg.details && (
                            <ul className="list-disc list-inside text-xs text-green-600 dark:text-green-300 mt-1 space-y-0.5 pl-1">
                              {msg.details.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      {msg.type !== "typing" && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatTime(msg.timestamp)}
                          {msg.agentName && <span className="ml-2">• {msg.agentName}</span>}
                        </div>
                      )}
                    </div>
                    {msg.type === "user" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mt-1">
                        <UserCircle2 size={20} />
                      </div>
                    )}
                  </div>
                )
              })}
              {Array.from(interAgentMessages.entries()).map(([collabId, collabMsgs]) => {
                const collabMsg = currentMessages.find(
                  (m) => m.collaborationData?.id === collabId && m.type === "collaboration",
                )
                if (!collabMsg?.collaborationData) return null
                const collabAgents = availableAgents.filter((a) => collabMsg.collaborationData!.agents.includes(a.name))
                const currentProgress = Math.min((collabMsgs.length / 8) * 100, 100)
                const mockSteps = collabAgents.map((agent, index) => ({
                  id: `step-${collabId}-${index}`,
                  agentName: agent.name,
                  description: `${agent.name} ${agent.specialties[0].toLowerCase()}`,
                  status: "pending" as const,
                  progress: 0,
                  estimatedTime: "2-3 min",
                }))
                return (
                  <div key={collabId} className="my-6">
                    <CollaborationWorkspace
                      collaborationId={collabId}
                      agents={collabAgents}
                      steps={mockSteps}
                      overallProgress={currentProgress}
                      estimatedCompletion="8-12 min"
                      interAgentMessages={collabMsgs}
                    />
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask the AI Crew... (e.g., Draft a marketing plan for a new SaaS product)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending || !isSettingsLoaded} // Disable if settings not loaded
                className="pr-28 pl-4 py-3 h-12 text-sm dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                  disabled={isSending}
                >
                  <Paperclip size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                  disabled={isSending}
                >
                  <Mic size={18} />
                </Button>
                <Button
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 w-9 h-9 disabled:opacity-50"
                  onClick={() => handleSendMessage()}
                  disabled={isSending || inputValue.trim() === "" || !isSettingsLoaded} // Disable if settings not loaded
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
            {isSending && (
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 size={12} className="animate-spin" />
                <span>AI Crew is processing your request...</span>
              </div>
            )}
            {!isSettingsLoaded && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 dark:text-amber-500">
                <Loader2 size={12} className="animate-spin" />
                <span>Loading settings... Please wait.</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

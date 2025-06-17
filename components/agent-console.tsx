"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
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
  AlertTriangle,
  HelpCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import CollaborationWorkspace from "@/components/collaboration-workspace"
import { generateInterAgentConversation } from "@/utils/inter-agent-conversations"
import { cn } from "@/lib/utils"
import { FixedSizeList as List } from "react-window"

interface Message {
  id: string
  type:
    | "user"
    | "bot"
    | "bot-complex"
    | "typing"
    | "handoff"
    | "collaboration"
    | "collaboration-update"
    | "crew_update"
    | "warning"
    | "troubleshooting"
  text: string
  subText?: string
  isSuccess?: boolean
  details?: any // Can be an object or array from n8n
  timestamp: Date
  agentName?: string
  troubleshooting?: string[]
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
    text: "Hello! I'm your Enhanced Super Agent, now connected to n8n. How can I assist you today?",
    subText: "System initialized and connected to n8n integration point.",
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

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const currentMessages = activeSession?.messages || [] // Renamed to avoid conflict with hook
  const currentAgent = availableAgents.find((agent) => agent.name === activeSession?.currentAgent)
  const currentAgentInfo = availableAgents.find((agent) => agent.name === activeSession?.currentAgent)

  const outputLinesCache = useRef(new Map<string, string[]>())
  const outputLines = useMemo(() => {
    const lastMessage = currentMessages[currentMessages.length - 1]
    if (lastMessage?.type === "crew_update" && lastMessage.crewUpdateData?.fullOutput) {
      const fullOutput = lastMessage.crewUpdateData.fullOutput
      if (outputLinesCache.current.has(fullOutput)) {
        return outputLinesCache.current.get(fullOutput)!
      }
      const lines = fullOutput.split("\n")
      outputLinesCache.current.set(fullOutput, lines)
      return lines
    }
    return []
  }, [currentMessages])

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

  const handleSendMessage = async () => {
    const currentInputText = inputValue.trim()
    if (currentInputText === "" || isSending || !activeSession) return

    setIsSending(true)
    setInputValue("")

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      type: "user",
      text: currentInputText,
      timestamp: new Date(),
    }

    const newMessages = [...currentMessages, userMessage]
    onUpdateSessionMessages(activeSessionId, newMessages)

    const typingMessage: Message = {
      id: Date.now().toString() + "-typing",
      type: "typing",
      text: `Agent is thinking...`,
      timestamp: new Date(),
      agentName: "n8n Agent",
    }
    onUpdateSessionMessages(activeSessionId, [...newMessages, typingMessage])
    scrollToBottom()

    // Map frontend messages to the format expected by the backend
    const payloadMessages = newMessages
      .filter((msg) => msg.type === "user" || msg.type === "bot" || msg.type === "bot-complex")
      .map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }))

    try {
      const response = await fetch("/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          userId: "user_01", // Static user ID as per design
          messages: payloadMessages,
        }),
      })

      // Remove typing indicator
      const messagesWithoutTyping = newMessages.filter((m) => m.id !== typingMessage.id)
      onUpdateSessionMessages(activeSessionId, messagesWithoutTyping)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "An unknown error occurred with the n8n service.")
      }

      const data = await response.json()

      // Handle warning if present
      if (data.warning) {
        const warningMessage: Message = {
          id: Date.now().toString() + "-warning",
          type: "warning",
          text: data.warning,
          timestamp: new Date(),
          agentName: "System",
        }
        onUpdateSessionMessages(activeSessionId, [...messagesWithoutTyping, warningMessage])
      }

      // Handle troubleshooting info if present
      if (data.troubleshooting && data.troubleshooting.length > 0) {
        const troubleshootingMessage: Message = {
          id: Date.now().toString() + "-troubleshooting",
          type: "troubleshooting",
          text: "Here are some steps to fix this issue:",
          troubleshooting: data.troubleshooting,
          timestamp: new Date(),
          agentName: "System",
        }
        const currentSessionMessages = sessions.find((s) => s.id === activeSessionId)?.messages || []
        onUpdateSessionMessages(activeSessionId, [...currentSessionMessages, troubleshootingMessage])
      }

      // Handle the response - either from data.response or fallback
      const responseText = data.response || "Received a response from the agent, but it was not in the expected format."

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        type: "bot",
        text: responseText,
        subText: `Response from n8n Agent`,
        timestamp: new Date(),
        agentName: "n8n Agent",
      }

      // Add the bot message after any warning/troubleshooting
      const currentSessionMessages = sessions.find((s) => s.id === activeSessionId)?.messages || []
      onUpdateSessionMessages(activeSessionId, [...currentSessionMessages, botMessage])
    } catch (error) {
      console.error("Error sending message to n8n:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Error Connecting to Agent",
        description: errorMessage,
        variant: "destructive",
      })

      // Remove typing indicator and add error message
      const finalMessages = newMessages.filter((m) => m.id !== typingMessage.id)
      const errorMessageBot: Message = {
        id: Date.now().toString() + "-error",
        type: "bot",
        text: `Sorry, I encountered an error: ${errorMessage}`,
        subText: "Please check the connection to the n8n service and try again.",
        timestamp: new Date(),
      }
      onUpdateSessionMessages(activeSessionId, [...finalMessages, errorMessageBot])
    } finally {
      setIsSending(false)
      setTimeout(() => inputRef.current?.focus(), 100)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

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

  return (
    <section className="flex-1 flex flex-col bg-background p-4 md:p-6 overflow-hidden min-w-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Agent Console</h2>
        {currentAgentInfo && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className={`p-1.5 rounded ${currentAgentInfo.bgColor}`}>
              <currentAgentInfo.icon className={`h-3 w-3 ${currentAgentInfo.color}`} />
            </div>
            <span>Active Agent: {currentAgentInfo.name}</span>
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
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                {msg.type !== "user" && (
                  <div
                    className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white mt-1",
                      msg.type === "warning"
                        ? "bg-amber-500 dark:bg-amber-600"
                        : msg.type === "troubleshooting"
                          ? "bg-blue-500 dark:bg-blue-600"
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
                    ) : msg.type === "warning" ? (
                      <AlertTriangle size={16} />
                    ) : msg.type === "troubleshooting" ? (
                      <HelpCircle size={16} />
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
                              : msg.type === "warning"
                                ? "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-bl-none"
                                : msg.type === "troubleshooting"
                                  ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-bl-none"
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

                  {msg.type === "warning" && (
                    <div className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                      <AlertTriangle size={12} className="inline mr-1" />
                      Configuration Warning
                    </div>
                  )}

                  {msg.type === "troubleshooting" && (
                    <div className="mb-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                      <HelpCircle size={12} className="inline mr-1" />
                      Troubleshooting Steps
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.troubleshooting && msg.troubleshooting.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                      <ul className="list-decimal list-inside text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        {msg.troubleshooting.map((step, i) => (
                          <li key={i} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
            ))}
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
              placeholder="Ask the n8n-powered agent..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="pr-28 pl-4 py-3 h-12 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 w-9 h-9"
                onClick={handleSendMessage}
                disabled={isSending || inputValue.trim() === ""}
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

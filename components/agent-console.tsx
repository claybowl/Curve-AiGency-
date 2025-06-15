"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AgentHandoffDialog from "@/components/agent-handoff-dialog"
import AgentCollaborationDialog from "@/components/agent-collaboration-dialog"
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
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import CollaborationWorkspace from "@/components/collaboration-workspace"
import { generateInterAgentConversation } from "@/utils/inter-agent-conversations"

interface Message {
  id: string
  type: "user" | "bot" | "bot-complex" | "typing" | "handoff" | "collaboration" | "collaboration-update"
  text: string
  subText?: string
  isSuccess?: boolean
  details?: string[]
  timestamp: Date
  agentName?: string
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

// Collaboration detection patterns
const collaborationPatterns = [
  {
    keywords: ["comprehensive", "full", "complete", "end-to-end", "detailed", "thorough"],
    task: {
      id: "comprehensive-analysis",
      description: "Comprehensive analysis and planning with multiple specialized perspectives",
      requiredAgents: ["Research Agent", "Data Analysis"],
      estimatedTime: "15-20 min",
      complexity: "high" as const,
    },
  },
  {
    keywords: ["marketing", "campaign", "promotion", "launch", "brand"],
    task: {
      id: "marketing-campaign",
      description: "Complete marketing campaign development from research to content creation",
      requiredAgents: ["Research Agent", "Web Agent"],
      estimatedTime: "12-15 min",
      complexity: "medium" as const,
    },
  },
  {
    keywords: ["event", "conference", "meeting", "workshop", "seminar"],
    task: {
      id: "event-planning",
      description: "Full event planning with logistics, content, and promotional materials",
      requiredAgents: ["Planner Agent", "Web Agent"],
      estimatedTime: "10-12 min",
      complexity: "medium" as const,
    },
  },
  {
    keywords: ["business", "strategy", "plan", "proposal", "presentation"],
    task: {
      id: "business-strategy",
      description: "Business strategy development with research, analysis, and presentation",
      requiredAgents: ["Research Agent", "Data Analysis", "Content Synthesis"],
      estimatedTime: "18-25 min",
      complexity: "high" as const,
    },
  },
  {
    keywords: ["product", "development", "design", "prototype", "innovation"],
    task: {
      id: "product-development",
      description: "Product development process from research to marketing materials",
      requiredAgents: ["Research Agent", "Data Analysis", "Web Agent"],
      estimatedTime: "20-25 min",
      complexity: "high" as const,
    },
  },
]

// Detect if collaboration is needed
const detectCollaborationNeed = (message: string): CollaborationTask | null => {
  const lowerMessage = message.toLowerCase()

  for (const pattern of collaborationPatterns) {
    if (pattern.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return pattern.task
    }
  }

  return null
}

// Handoff detection patterns (existing)
const handoffPatterns = [
  {
    keywords: ["video", "animation", "movie", "film", "visual", "graphics"],
    reason: "Video Content Creation",
    description:
      "This request involves video or visual content creation which requires specialized video production capabilities.",
    suggestedAgents: ["Video Agent"],
  },
  {
    keywords: ["data", "analyze", "statistics", "chart", "graph", "metrics", "dashboard"],
    reason: "Data Analysis Required",
    description:
      "This task involves data analysis, statistics, or visualization which requires specialized analytical capabilities.",
    suggestedAgents: ["Data Analysis"],
  },
  {
    keywords: ["research", "study", "investigate", "find information", "academic", "literature"],
    reason: "Research Expertise Needed",
    description: "This request requires deep research capabilities and information gathering expertise.",
    suggestedAgents: ["Research Agent"],
  },
  {
    keywords: ["call", "phone", "reservation", "book", "appointment", "contact"],
    reason: "Phone Communication Required",
    description:
      "This task involves making phone calls or handling reservations which requires phone communication capabilities.",
    suggestedAgents: ["Phone Agent"],
  },
  {
    keywords: ["plan", "itinerary", "schedule", "organize", "event", "trip"],
    reason: "Planning Expertise Required",
    description:
      "This request involves detailed planning and organization which requires specialized planning capabilities.",
    suggestedAgents: ["Planner Agent"],
  },
  {
    keywords: ["website", "blog", "content", "write", "copy", "social media"],
    reason: "Web Content Creation",
    description:
      "This task involves web content creation or writing which requires specialized content creation capabilities.",
    suggestedAgents: ["Web Agent"],
  },
  {
    keywords: ["summarize", "report", "synthesis", "compile", "document"],
    reason: "Content Synthesis Required",
    description:
      "This request involves summarizing or synthesizing content which requires specialized synthesis capabilities.",
    suggestedAgents: ["Content Synthesis"],
  },
]

// Detect if a handoff is needed based on user message
const detectHandoffNeed = (message: string, currentAgent?: string): HandoffReason | null => {
  const lowerMessage = message.toLowerCase()

  for (const pattern of handoffPatterns) {
    if (pattern.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      // Don't suggest handoff if already talking to the suggested agent
      if (currentAgent && pattern.suggestedAgents.includes(currentAgent)) {
        continue
      }
      return pattern
    }
  }

  return null
}

// Simulated agent responses with handoff and collaboration detection
const getAgentResponse = (
  userMessage: string,
  currentAgent?: string,
): { messages: Message[]; handoffNeeded?: HandoffReason; collaborationNeeded?: CollaborationTask } => {
  const lowerMessage = userMessage.toLowerCase()
  const responses: Message[] = []

  // Check if collaboration is needed first (higher priority)
  const collaborationNeeded = detectCollaborationNeed(userMessage)
  if (collaborationNeeded) {
    responses.push({
      id: Date.now().toString() + "-collaboration-suggestion",
      type: "bot",
      text: `This looks like a complex task that would benefit from multiple agents working together. I can coordinate with ${collaborationNeeded.requiredAgents.join(", ")} to provide you with comprehensive results.`,
      subText: "Click 'Start Collaboration' to begin multi-agent coordination",
      timestamp: new Date(),
      agentName: currentAgent,
    })

    return { messages: responses, collaborationNeeded }
  }

  // Check if handoff is needed
  const handoffNeeded = detectHandoffNeed(userMessage, currentAgent)
  if (handoffNeeded) {
    responses.push({
      id: Date.now().toString() + "-handoff-suggestion",
      type: "bot",
      text: `I notice this request involves ${handoffNeeded.reason.toLowerCase()}. While I can try to help, I think you'd get better results from our ${handoffNeeded.suggestedAgents[0]}. Would you like me to transfer this conversation?`,
      subText: "Click 'Transfer Conversation' to connect with a specialized agent",
      timestamp: new Date(),
      agentName: currentAgent,
    })

    return { messages: responses, handoffNeeded }
  }

  // Regular responses based on keywords
  if (lowerMessage.includes("trip") || lowerMessage.includes("travel") || lowerMessage.includes("plan")) {
    responses.push({
      id: Date.now().toString() + "-planning",
      type: "bot-complex",
      text:
        currentAgent === "Planner Agent"
          ? "[PlannerAgent] Creating detailed itinerary...\n[ResearchAgent] Finding best attractions and restaurants..."
          : "I'll help you with basic planning, but for detailed itineraries, our Planner Agent would be more suitable.",
      timestamp: new Date(),
      agentName: currentAgent,
    })
  } else if (
    lowerMessage.includes("reservation") ||
    lowerMessage.includes("book") ||
    lowerMessage.includes("restaurant")
  ) {
    responses.push({
      id: Date.now().toString() + "-booking",
      type: "bot-complex",
      text:
        currentAgent === "Phone Agent"
          ? "[PhoneAgent] Calling restaurant for reservation...\n[DataAgent] Checking availability and preferences..."
          : "I can provide guidance on reservations, but our Phone Agent can actually make the calls for you.",
      timestamp: new Date(),
      agentName: currentAgent,
    })
  } else if (lowerMessage.includes("research") || lowerMessage.includes("analyze") || lowerMessage.includes("find")) {
    responses.push({
      id: Date.now().toString() + "-research",
      type: "bot",
      text:
        currentAgent === "Research Agent"
          ? "[ResearchAgent] Conducting comprehensive research on your topic. This may take a moment..."
          : "I can do basic research, but our Research Agent has access to more comprehensive databases and analysis tools.",
      timestamp: new Date(),
      agentName: currentAgent,
    })
  } else {
    responses.push({
      id: Date.now().toString() + "-general",
      type: "bot",
      text: "I understand your request. Let me process that for you and provide the best assistance possible.",
      timestamp: new Date(),
      agentName: currentAgent,
    })
  }

  return { messages: responses }
}

export default function AgentConsole({
  sessions,
  activeSessionId,
  onUpdateSessionMessages,
  availableAgents,
}: AgentConsoleProps) {
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showHandoffDialog, setShowHandoffDialog] = useState(false)
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false)
  const [pendingHandoff, setPendingHandoff] = useState<{
    reason: HandoffReason
    context: string
    currentAgent: Agent
  } | null>(null)
  const [pendingCollaboration, setPendingCollaboration] = useState<{
    task: CollaborationTask
    context: string
  } | null>(null)
  const [activeCollaborations, setActiveCollaborations] = useState<Map<string, any>>(new Map())
  const [interAgentMessages, setInterAgentMessages] = useState<Map<string, InterAgentMessage[]>>(new Map())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages || []
  const currentAgent = availableAgents.find((agent) => agent.name === activeSession?.currentAgent)

  // Auto-scroll to bottom when new messages arrive
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
  }, [messages, scrollToBottom])

  // Add message to chat
  const addMessage = useCallback(
    (message: Message) => {
      if (!activeSession) return

      const updatedMessages = [...messages, message]
      onUpdateSessionMessages(activeSessionId, updatedMessages)
    },
    [activeSession, messages, activeSessionId, onUpdateSessionMessages],
  )

  // Update messages
  const updateMessages = useCallback(
    (newMessages: Message[]) => {
      if (!activeSession) return
      onUpdateSessionMessages(activeSessionId, newMessages)
    },
    [activeSession, activeSessionId, onUpdateSessionMessages],
  )

  const simulateInterAgentCommunication = useCallback(
    (collaborationId: string, agents: Agent[], task: CollaborationTask) => {
      // Generate conversation based on task type
      const conversation = generateInterAgentConversation(task.id, agents, collaborationId)

      // Simulate real-time message delivery
      conversation.forEach((message, index) => {
        setTimeout(() => {
          setInterAgentMessages((prev) => {
            const existing = prev.get(collaborationId) || []
            const updated = [...existing, message]
            return new Map(prev.set(collaborationId, updated))
          })
        }, index * 2000) // 2 second intervals
      })
    },
    [],
  )

  // Handle collaboration start
  const handleStartCollaboration = useCallback(
    (selectedAgents: Agent[], task: CollaborationTask, instructions: string) => {
      if (!activeSession || !pendingCollaboration) return

      const collaborationId = `collab-${Date.now()}`

      // Add collaboration start message
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

      // Simulate collaboration progress
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
          // Collaboration completed
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
      setPendingCollaboration(null)

      // Start inter-agent communication simulation
      simulateInterAgentCommunication(collaborationId, selectedAgents, task)
    },
    [activeSession, pendingCollaboration, addMessage, simulateInterAgentCommunication],
  )

  // Handle handoff confirmation
  const handleConfirmHandoff = useCallback(
    (targetAgent: Agent, handoffNote: string) => {
      if (!activeSession || !pendingHandoff) return

      // Add handoff message
      const handoffMessage: Message = {
        id: Date.now().toString() + "-handoff",
        type: "handoff",
        text: `Conversation transferred to ${targetAgent.name}`,
        subText: handoffNote || `Specialized in ${targetAgent.specialties[0]}`,
        timestamp: new Date(),
        handoffData: {
          fromAgent: pendingHandoff.currentAgent.name,
          toAgent: targetAgent.name,
          reason: pendingHandoff.reason.reason,
          note: handoffNote,
        },
      }

      // Add welcome message from new agent
      const welcomeMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: `Hello! I'm the ${targetAgent.name}. I've been briefed on your request and I'm ready to help with ${pendingHandoff.reason.reason.toLowerCase()}.`,
        subText: `Specialized in ${targetAgent.specialties[0]}`,
        timestamp: new Date(),
        agentName: targetAgent.name,
      }

      const updatedMessages = [...messages, handoffMessage, welcomeMessage]
      onUpdateSessionMessages(activeSessionId, updatedMessages)

      setPendingHandoff(null)
    },
    [activeSession, pendingHandoff, messages, activeSessionId, onUpdateSessionMessages],
  )

  // Add typing indicator
  const addTypingIndicator = useCallback(() => {
    if (!activeSession) return

    const typingMessage: Message = {
      id: "typing-indicator",
      type: "typing",
      text: "Agent is thinking...",
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, typingMessage]
    updateMessages(updatedMessages)
    setIsTyping(true)
  }, [activeSession, messages, updateMessages])

  // Remove typing indicator
  const removeTypingIndicator = useCallback(() => {
    if (!activeSession) return

    const filteredMessages = messages.filter((msg) => msg.id !== "typing-indicator")
    updateMessages(filteredMessages)
    setIsTyping(false)
  }, [activeSession, messages, updateMessages])

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === "" || isSending || !activeSession) return

    setIsSending(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
    }

    // Add user message
    addMessage(userMessage)
    const messageText = inputValue.trim()
    setInputValue("")

    // Show typing indicator after a short delay
    setTimeout(() => {
      addTypingIndicator()
    }, 500)

    // Get agent responses with handoff and collaboration detection
    const {
      messages: responses,
      handoffNeeded,
      collaborationNeeded,
    } = getAgentResponse(messageText, activeSession.currentAgent)

    // Add first response after typing delay
    setTimeout(
      () => {
        removeTypingIndicator()
        if (responses[0]) {
          addMessage(responses[0])

          // If collaboration is needed, prepare the collaboration dialog
          if (collaborationNeeded) {
            setPendingCollaboration({
              task: collaborationNeeded,
              context: messageText,
            })
            setShowCollaborationDialog(true)
          }
          // If handoff is needed, prepare the handoff dialog
          else if (handoffNeeded && currentAgent) {
            setPendingHandoff({
              reason: handoffNeeded,
              context: messageText,
              currentAgent: currentAgent,
            })
            setShowHandoffDialog(true)
          }
        }
        setIsSending(false)

        // Add success response for complex operations
        if (responses[0]?.type === "bot-complex" && !handoffNeeded && !collaborationNeeded) {
          setTimeout(() => {
            const successMessage: Message = {
              id: Date.now().toString() + "-success",
              type: "bot-complex",
              text: messageText.toLowerCase().includes("trip")
                ? "Trip planning completed successfully!"
                : "Task completed successfully!",
              isSuccess: true,
              subText: messageText.toLowerCase().includes("trip")
                ? "Your comprehensive travel plan is ready."
                : "Your request has been processed.",
              details: messageText.toLowerCase().includes("trip")
                ? [
                    "5-day itinerary with top attractions",
                    "Restaurant recommendations with dietary preferences",
                    "Booking confirmations and contact details",
                  ]
                : messageText.toLowerCase().includes("reservation")
                  ? [
                      "Table for 4 people confirmed",
                      "Window seating as requested",
                      "Special dietary requirements noted",
                    ]
                  : ["Task completed with all requirements", "Results are ready for review"],
              timestamp: new Date(),
              agentName: activeSession.currentAgent,
            }
            addMessage(successMessage)
          }, 2000)
        }
      },
      1500 + Math.random() * 1000,
    )

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [inputValue, isSending, activeSession, addMessage, addTypingIndicator, removeTypingIndicator, currentAgent])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    if (!activeSession) return

    const confirmClear = window.confirm(
      `Are you sure you want to clear all messages in "${activeSession.name}"? This action cannot be undone.`,
    )
    if (confirmClear) {
      updateMessages(initialMessages)
    }
  }, [activeSession, updateMessages])

  // Export current session
  const exportCurrentSession = useCallback(() => {
    if (!activeSession) return

    const exportData = {
      session: {
        ...activeSession,
        messages: activeSession.messages.filter((m) => m.type !== "typing"),
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
  }, [activeSession])

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!activeSession) {
    return (
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-850 p-4 md:p-6 overflow-hidden">
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
    <>
      <section className="flex-1 flex flex-col bg-background p-4 md:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Agent Console</h2>
          {currentAgent && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className={`p-1.5 rounded ${currentAgent.bgColor}`}>
                <currentAgent.icon className={`h-3 w-3 ${currentAgent.color}`} />
              </div>
              <span>Current: {currentAgent.name}</span>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex flex-col overflow-hidden border dark:border-slate-700">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
            <div className="flex items-center gap-4">
              <h3 className="font-medium text-slate-800 dark:text-slate-100">{activeSession.name}</h3>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {messages.filter((m) => m.type !== "typing").length} messages
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
                  <Download className="h-4 w-4" />
                  Export This Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearCurrentSession} className="gap-2 text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4" />
                  Clear This Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {/* Regular message display */}
                  <div className={`flex items-start gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                    {msg.type !== "user" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-white mt-1">
                        {msg.type === "typing" ? (
                          <Loader2 size={16} className="animate-spin" />
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
                      className={`p-3 rounded-xl max-w-[80%] text-sm relative group
                    ${
                      msg.type === "user"
                        ? "bg-indigo-500 text-white rounded-br-none"
                        : msg.type === "typing"
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-bl-none animate-pulse"
                          : msg.type === "handoff"
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-bl-none"
                            : msg.type === "collaboration" || msg.type === "collaboration-update"
                              ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-bl-none"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
                    }`}
                    >
                      {msg.type === "handoff" && msg.handoffData && (
                        <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                          <ArrowRight size={16} />
                          <span className="font-medium text-xs">
                            {msg.handoffData.fromAgent} → {msg.handoffData.toAgent}
                          </span>
                        </div>
                      )}

                      {(msg.type === "collaboration" || msg.type === "collaboration-update") &&
                        msg.collaborationData && (
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400">
                            <Users size={16} />
                            <span className="font-medium text-xs">{msg.collaborationData.agents.join(" + ")}</span>
                            {msg.collaborationData.progress !== undefined && (
                              <span className="text-xs">({Math.round(msg.collaborationData.progress)}%)</span>
                            )}
                          </div>
                        )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.subText && !msg.isSuccess && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{msg.subText}</p>
                      )}
                      {msg.isSuccess && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 size={16} />
                            <p className="font-medium text-xs">{msg.subText}</p>
                          </div>
                          {msg.details && (
                            <ul className="list-disc list-inside text-xs text-green-600 dark:text-green-300 mt-1 space-y-0.5 pl-1">
                              {msg.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
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
                </div>
              ))}
              {/* Render collaboration workspaces for active collaborations */}
              {Array.from(interAgentMessages.entries()).map(([collabId, messages]) => {
                const collaborationMessage = activeSession.messages.find(
                  (msg) => msg.collaborationData?.id === collabId && msg.type === "collaboration",
                )

                if (!collaborationMessage?.collaborationData) return null

                const collabAgents = availableAgents.filter((agent) =>
                  collaborationMessage.collaborationData!.agents.includes(agent.name),
                )

                // Calculate dynamic progress based on messages
                const totalExpectedMessages = 8 // Average conversation length
                const currentProgress = Math.min((messages.length / totalExpectedMessages) * 100, 100)

                const mockSteps = collabAgents.map((agent, index) => {
                  const agentMessages = messages.filter((msg) => msg.fromAgent === agent.name)
                  const hasCompleted = agentMessages.some((msg) => msg.type === "completion")
                  const isActive = agentMessages.length > 0 && !hasCompleted

                  return {
                    id: `step-${collabId}-${index}`,
                    agentName: agent.name,
                    description: `${agent.name} ${agent.specialties[0].toLowerCase()}`,
                    status: hasCompleted ? "completed" : isActive ? "in-progress" : ("pending" as const),
                    progress: hasCompleted ? 100 : isActive ? Math.min(agentMessages.length * 25, 90) : 0,
                    estimatedTime: "2-3 min",
                  }
                })

                return (
                  <div key={collabId} className="my-6">
                    <CollaborationWorkspace
                      collaborationId={collabId}
                      agents={collabAgents}
                      steps={mockSteps}
                      overallProgress={currentProgress}
                      estimatedCompletion="8-12 min"
                      interAgentMessages={messages}
                    />
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Try: Create a comprehensive marketing strategy, or Plan a complete business proposal..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
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
                  onClick={handleSendMessage}
                  disabled={isSending || inputValue.trim() === ""}
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
            {isTyping && (
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 size={12} className="animate-spin" />
                <span>Agent is processing your request...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Handoff Dialog */}
      {pendingHandoff && (
        <AgentHandoffDialog
          isOpen={showHandoffDialog}
          onClose={() => {
            setShowHandoffDialog(false)
            setPendingHandoff(null)
          }}
          currentAgent={pendingHandoff.currentAgent}
          availableAgents={availableAgents}
          handoffReason={pendingHandoff.reason}
          conversationContext={pendingHandoff.context}
          onConfirmHandoff={handleConfirmHandoff}
        />
      )}

      {/* Collaboration Dialog */}
      {pendingCollaboration && (
        <AgentCollaborationDialog
          isOpen={showCollaborationDialog}
          onClose={() => {
            setShowCollaborationDialog(false)
            setPendingCollaboration(null)
          }}
          availableAgents={availableAgents}
          suggestedTask={pendingCollaboration.task}
          conversationContext={pendingCollaboration.context}
          onStartCollaboration={handleStartCollaboration}
        />
      )}
    </>
  )
}

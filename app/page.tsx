"use client"

import { useChatSessions } from "@/hooks/use-chat-sessions"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import CompactSessionManager from "@/components/compact-session-manager"
import AgentConsole from "@/components/agent-console"
import AgentStatusPanel from "@/components/agent-status-panel"
import { ListChecks, Phone, Video, Search, BarChart3, Globe, FileText } from "lucide-react"

const initialMessages = [
  {
    id: "1",
    type: "bot" as const,
    text: "Hello! I'm your Enhanced Super Agent. How can I assist you today?",
    subText: "System initialized with safety protocols active",
    timestamp: new Date(Date.now() - 300000),
  },
]

const availableAgents = [
  {
    name: "Planner Agent",
    description: "Creates detailed plans and itineraries",
    icon: ListChecks,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    capabilities: ["Trip Planning", "Event Organization", "Schedule Management", "Resource Allocation"],
    specialties: [
      "Multi-destination travel itineraries",
      "Budget-conscious planning",
      "Group coordination and logistics",
      "Time-sensitive scheduling",
    ],
    performance: {
      successRate: 94,
      avgResponseTime: "2.3s",
      tasksCompleted: 1247,
      rating: 4.8,
    },
    status: "active" as const,
    examples: [
      "Plan a 7-day trip to Japan for 2 people with a $3000 budget",
      "Create a wedding timeline for 150 guests",
      "Organize a corporate retreat for 50 employees",
      "Plan a family reunion with activities for all ages",
    ],
  },
  {
    name: "Phone Agent",
    description: "Makes calls and handles reservations",
    icon: Phone,
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    capabilities: ["Restaurant Reservations", "Appointment Booking", "Customer Service", "Information Gathering"],
    specialties: [
      "Fine dining reservations",
      "Medical appointment scheduling",
      "Service provider coordination",
      "Follow-up communications",
    ],
    performance: {
      successRate: 89,
      avgResponseTime: "45s",
      tasksCompleted: 892,
      rating: 4.6,
    },
    status: "active" as const,
    examples: [
      "Book a table for 4 at a highly-rated Italian restaurant tonight",
      "Schedule a dentist appointment for next week",
      "Call to confirm my hotel reservation",
      "Make a reservation at a pet-friendly restaurant",
    ],
  },
  {
    name: "Video Agent",
    description: "Generates video content",
    icon: Video,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    capabilities: ["Video Creation", "Script Writing", "Storyboarding", "Animation"],
    specialties: [
      "Educational content creation",
      "Marketing video production",
      "Social media content",
      "Presentation videos",
    ],
    performance: {
      successRate: 91,
      avgResponseTime: "3.7s",
      tasksCompleted: 634,
      rating: 4.7,
    },
    status: "busy" as const,
    examples: [
      "Create a 60-second product demo video",
      "Generate an educational video about climate change",
      "Make a social media video for our new product launch",
      "Create an animated explainer video for our service",
    ],
  },
  {
    name: "Research Agent",
    description: "Performs deep research on topics",
    icon: Search,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    capabilities: ["Market Research", "Academic Research", "Competitive Analysis", "Data Collection"],
    specialties: [
      "Industry trend analysis",
      "Scientific literature review",
      "Market opportunity assessment",
      "Fact-checking and verification",
    ],
    performance: {
      successRate: 96,
      avgResponseTime: "4.1s",
      tasksCompleted: 1089,
      rating: 4.9,
    },
    status: "active" as const,
    examples: [
      "Research the latest trends in artificial intelligence",
      "Analyze the competitive landscape for electric vehicles",
      "Find the best practices for remote team management",
      "Research sustainable packaging solutions for e-commerce",
    ],
  },
  {
    name: "Data Analysis",
    description: "Analyzes datasets and statistics",
    icon: BarChart3,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    capabilities: ["Statistical Analysis", "Data Visualization", "Predictive Modeling", "Report Generation"],
    specialties: [
      "Sales performance analysis",
      "Customer behavior insights",
      "Financial forecasting",
      "A/B testing evaluation",
    ],
    performance: {
      successRate: 93,
      avgResponseTime: "3.2s",
      tasksCompleted: 756,
      rating: 4.7,
    },
    status: "active" as const,
    examples: [
      "Analyze our sales data to identify growth opportunities",
      "Create a dashboard for website traffic metrics",
      "Predict customer churn based on usage patterns",
      "Analyze the effectiveness of our marketing campaigns",
    ],
  },
  {
    name: "Web Agent",
    description: "Creates web content",
    icon: Globe,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    capabilities: ["Content Creation", "SEO Optimization", "Web Development", "Social Media"],
    specialties: [
      "Blog post writing",
      "Landing page optimization",
      "Social media content",
      "Email marketing campaigns",
    ],
    performance: {
      successRate: 88,
      avgResponseTime: "2.8s",
      tasksCompleted: 923,
      rating: 4.5,
    },
    status: "idle" as const,
    examples: [
      "Write a blog post about sustainable living tips",
      "Create compelling copy for our new product page",
      "Generate social media posts for our upcoming event",
      "Write an email newsletter for our subscribers",
    ],
  },
  {
    name: "Content Synthesis",
    description: "Creates summaries and reports",
    icon: FileText,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    capabilities: ["Document Summarization", "Report Writing", "Content Curation", "Information Synthesis"],
    specialties: [
      "Executive summary creation",
      "Research report compilation",
      "Meeting notes synthesis",
      "Multi-source content aggregation",
    ],
    performance: {
      successRate: 95,
      avgResponseTime: "2.1s",
      tasksCompleted: 1156,
      rating: 4.8,
    },
    status: "active" as const,
    examples: [
      "Summarize this 50-page research report into key insights",
      "Create an executive summary of our quarterly performance",
      "Synthesize feedback from multiple customer interviews",
      "Generate a comprehensive project status report",
    ],
  },
]

export default function WorkbenchPage() {
  const {
    sessions,
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
  } = useChatSessions(initialMessages)

  const handleStartAgentConversation = (agent: any, prompt?: string) => {
    // Create a new session with agent-specific name
    const sessionName = prompt ? `${agent.name}: ${prompt.substring(0, 30)}...` : `${agent.name} Session`

    const newSessionId = createSession(sessionName)

    // If a prompt was provided, add it as the first user message
    if (prompt && newSessionId) {
      setTimeout(() => {
        const activeSession =
          sessions.find((s) => s.id === newSessionId) || sessions.find((s) => s.name === sessionName)

        if (activeSession) {
          const userMessage = {
            id: Date.now().toString(),
            type: "user" as const,
            text: prompt,
            timestamp: new Date(),
          }

          const agentResponse = {
            id: (Date.now() + 1).toString(),
            type: "bot" as const,
            text: `Hello! I'm the ${agent.name}. I'll help you with: ${prompt}`,
            subText: `Specialized in ${agent.specialties[0]}`,
            timestamp: new Date(),
            agentName: agent.name,
          }

          const newMessages = [...activeSession.messages, userMessage, agentResponse]
          updateSessionMessages(activeSession.id, newMessages)
        }
      }, 100)
    }
  }

  if (!isInitialized) {
    return (
      <>
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading workspace...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar onStartAgentConversation={handleStartAgentConversation} />
        <CompactSessionManager
          sessions={sessions}
          activeSessionId={activeSessionId}
          onCreateSession={createSession}
          onSwitchSession={switchToSession}
          onRenameSession={renameSession}
          onDeleteSession={deleteSession}
          onDuplicateSession={duplicateSession}
          onClearAllSessions={clearAllSessions}
          onExportAllSessions={exportAllSessions}
        />
        <AgentConsole
          sessions={sessions}
          activeSessionId={activeSessionId}
          onUpdateSessionMessages={updateSessionMessages}
          availableAgents={availableAgents}
        />
        <AgentStatusPanel />
      </main>
    </>
  )
}

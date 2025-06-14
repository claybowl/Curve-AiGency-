"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import AgentInfoDialog from "@/components/agent-info-dialog"
import {
  ListChecks,
  Phone,
  Video,
  Search,
  BarChart3,
  Globe,
  FileText,
  Plane,
  Film,
  FileSpreadsheet,
  Microscope,
  Info,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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

interface QuickAction {
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

interface SidebarProps {
  onStartAgentConversation?: (agent: Agent, prompt?: string) => void
}

const agents: Agent[] = [
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
    status: "active",
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
    status: "active",
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
    status: "busy",
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
    status: "active",
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
    status: "active",
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
    status: "idle",
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
    status: "active",
    examples: [
      "Summarize this 50-page research report into key insights",
      "Create an executive summary of our quarterly performance",
      "Synthesize feedback from multiple customer interviews",
      "Generate a comprehensive project status report",
    ],
  },
]

const quickActions: QuickAction[] = [
  {
    name: "Plan Trip",
    icon: Plane,
    color: "text-indigo-700",
    bgColor: "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40",
  },
  {
    name: "Research",
    icon: Microscope,
    color: "text-blue-700",
    bgColor: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40",
  },
  {
    name: "Create Video",
    icon: Film,
    color: "text-purple-700",
    bgColor: "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40",
  },
  {
    name: "Analyze Data",
    icon: FileSpreadsheet,
    color: "text-green-700",
    bgColor: "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40",
  },
]

export default function Sidebar({ onStartAgentConversation }: SidebarProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAgentDialog, setShowAgentDialog] = useState(false)

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowAgentDialog(true)
  }

  const handleStartConversation = (agent: Agent, prompt?: string) => {
    if (onStartAgentConversation) {
      onStartAgentConversation(agent, prompt)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-400"
      case "busy":
        return "bg-yellow-400"
      case "idle":
        return "bg-slate-400"
      default:
        return "bg-slate-400"
    }
  }

  return (
    <>
      <aside className="w-80 border-r bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-2">Available Agents</h2>
            <div className="space-y-2">
              {agents.map((agent) => (
                <Card
                  key={agent.name}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02] group"
                  onClick={() => handleAgentClick(agent)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${agent.bgColor} transition-colors`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{agent.name}</p>
                        <Info className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                        {agent.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                          <span className="text-xs text-slate-400 capitalize">{agent.status}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>{agent.performance.successRate}%</span>
                          <span>•</span>
                          <span>{agent.performance.tasksCompleted} tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  variant="outline"
                  size="sm"
                  className={`justify-start gap-2 h-auto py-3 px-3 border-0 ${action.bgColor} transition-all duration-200 hover:scale-105 shadow-sm`}
                >
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  <span className={`text-xs font-medium ${action.color}`}>{action.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>

      <AgentInfoDialog
        agent={selectedAgent}
        isOpen={showAgentDialog}
        onClose={() => setShowAgentDialog(false)}
        onStartConversation={handleStartConversation}
      />
    </>
  )
}

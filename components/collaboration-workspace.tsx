"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import InterAgentChat from "@/components/inter-agent-chat"
import { Users, Clock, CheckCircle2, Loader2, AlertCircle, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Agent {
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

interface CollaborationStep {
  id: string
  agentName: string
  description: string
  status: "pending" | "in-progress" | "completed" | "blocked"
  progress: number
  estimatedTime: string
  dependencies?: string[]
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

interface CollaborationWorkspaceProps {
  collaborationId: string
  agents: Agent[]
  steps: CollaborationStep[]
  overallProgress: number
  estimatedCompletion: string
  interAgentMessages: InterAgentMessage[]
  onUpdateProgress?: (stepId: string, progress: number) => void
}

export default function CollaborationWorkspace({
  collaborationId,
  agents,
  steps,
  overallProgress,
  estimatedCompletion,
  interAgentMessages,
  onUpdateProgress,
}: CollaborationWorkspaceProps) {
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [activeStep, setActiveStep] = useState<string | null>(null)

  // Track the currently active step
  useEffect(() => {
    const inProgressStep = steps.find((step) => step.status === "in-progress")
    setActiveStep(inProgressStep?.id || null)
  }, [steps])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "blocked":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    }
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const inProgressSteps = steps.filter((step) => step.status === "in-progress").length

  return (
    <div className="space-y-4">
      {/* Main Collaboration Progress */}
      <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="font-medium text-slate-800 dark:text-slate-100">Multi-Agent Collaboration</h3>
              <Badge variant="outline" className="text-xs">
                {agents.length} agents
              </Badge>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">ETA: {estimatedCompletion}</div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-300">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>
                {completedSteps}/{steps.length} steps completed
              </span>
              <span>{inProgressSteps} in progress</span>
            </div>
          </div>

          {/* Agent Avatars */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-600 dark:text-slate-300 mr-2">Active Agents:</span>
            {agents.map((agent) => {
              const isActive = steps.some((step) => step.agentName === agent.name && step.status === "in-progress")
              return (
                <div
                  key={agent.name}
                  className={`p-1.5 rounded-lg ${agent.bgColor} flex items-center gap-1 ${
                    isActive ? "ring-2 ring-indigo-400 animate-pulse" : ""
                  }`}
                >
                  <agent.icon className={`h-3 w-3 ${agent.color}`} />
                  <span className={`text-xs font-medium ${agent.color}`}>{agent.name.split(" ")[0]}</span>
                  {isActive && <Zap className="h-2 w-2 text-indigo-500" />}
                </div>
              )
            })}
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const agent = agents.find((a) => a.name === step.agentName)
              const isActive = step.id === activeStep

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? "border-indigo-300 bg-indigo-100 dark:border-indigo-600 dark:bg-indigo-900/30"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {agent && (
                      <div className={`p-1 rounded ${agent.bgColor}`}>
                        <agent.icon className={`h-3 w-3 ${agent.color}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {step.description}
                        </span>
                        <Badge className={`${getStatusColor(step.status)} text-xs px-1.5 py-0`}>
                          {step.status.replace("-", " ")}
                        </Badge>
                        {isActive && <Zap className="h-3 w-3 text-indigo-500 animate-pulse" />}
                      </div>
                      {step.status === "in-progress" && (
                        <div className="mt-1">
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{step.estimatedTime}</span>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inter-Agent Communication */}
      <InterAgentChat
        collaborationId={collaborationId}
        agents={agents}
        messages={interAgentMessages}
        isCollapsed={isChatCollapsed}
        onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
      />
    </div>
  )
}

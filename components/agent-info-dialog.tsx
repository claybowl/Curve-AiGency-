"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Zap, Clock, CheckCircle2, TrendingUp, Star, Activity } from "lucide-react"
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

interface AgentInfoDialogProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onStartConversation: (agent: Agent, prompt?: string) => void
}

export default function AgentInfoDialog({ agent, isOpen, onClose, onStartConversation }: AgentInfoDialogProps) {
  const [selectedExample, setSelectedExample] = useState<string>("")

  if (!agent) return null

  const handleStartConversation = (prompt?: string) => {
    onStartConversation(agent, prompt)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "busy":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "idle":
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-3 w-3" />
      case "busy":
        return <Activity className="h-3 w-3 animate-pulse" />
      case "idle":
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${agent.bgColor}`}>
              <agent.icon className={`h-8 w-8 ${agent.color}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                {agent.name}
                <Badge className={`${getStatusColor(agent.status)} border-0`}>
                  {getStatusIcon(agent.status)}
                  <span className="ml-1 capitalize">{agent.status}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-base mt-1">{agent.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Performance Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                  <span className="font-medium">{agent.performance.successRate}%</span>
                </div>
                <Progress value={agent.performance.successRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{agent.performance.rating}</span>
                  </div>
                </div>
                <Progress value={(agent.performance.rating / 5) * 100} className="h-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Avg Response:</span>
                <span className="font-medium">{agent.performance.avgResponseTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Tasks Completed:</span>
                <span className="font-medium">{agent.performance.tasksCompleted}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Capabilities */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Core Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((capability, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Specialties</h3>
            <div className="grid grid-cols-1 gap-2">
              {agent.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-indigo-500" />
                  <span className="text-slate-600 dark:text-slate-300">{specialty}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Example Prompts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Try These Examples</h3>
            <div className="space-y-2">
              {agent.examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedExample(example)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                    selectedExample === example
                      ? "border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/30"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{example}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleStartConversation()} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
            {selectedExample && (
              <Button onClick={() => handleStartConversation(selectedExample)} variant="outline" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Try Selected Example
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

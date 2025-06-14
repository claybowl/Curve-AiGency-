"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Zap, CheckCircle2, Clock } from "lucide-react"
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

interface CollaborationTask {
  id: string
  description: string
  requiredAgents: string[]
  estimatedTime: string
  complexity: "low" | "medium" | "high"
}

interface AgentCollaborationDialogProps {
  isOpen: boolean
  onClose: () => void
  availableAgents: Agent[]
  suggestedTask: CollaborationTask
  conversationContext: string
  onStartCollaboration: (selectedAgents: Agent[], task: CollaborationTask, instructions: string) => void
}

export default function AgentCollaborationDialog({
  isOpen,
  onClose,
  availableAgents,
  suggestedTask,
  conversationContext,
  onStartCollaboration,
}: AgentCollaborationDialogProps) {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([])
  const [collaborationInstructions, setCollaborationInstructions] = useState("")

  const requiredAgents = availableAgents.filter((agent) => suggestedTask.requiredAgents.includes(agent.name))
  const optionalAgents = availableAgents.filter((agent) => !suggestedTask.requiredAgents.includes(agent.name))

  const handleAgentToggle = (agent: Agent, checked: boolean) => {
    if (checked) {
      setSelectedAgents((prev) => [...prev, agent])
    } else {
      setSelectedAgents((prev) => prev.filter((a) => a.name !== agent.name))
    }
  }

  const handleStartCollaboration = () => {
    const allSelectedAgents = [...requiredAgents, ...selectedAgents.filter((a) => !requiredAgents.includes(a))]
    onStartCollaboration(allSelectedAgents, suggestedTask, collaborationInstructions)
    onClose()
    setSelectedAgents([])
    setCollaborationInstructions("")
  }

  const handleCancel = () => {
    onClose()
    setSelectedAgents([])
    setCollaborationInstructions("")
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    }
  }

  const totalAgents = requiredAgents.length + selectedAgents.filter((a) => !requiredAgents.includes(a)).length

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Multi-Agent Collaboration
          </DialogTitle>
          <DialogDescription>
            This complex task can be handled more effectively by multiple agents working together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Task Overview */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-indigo-800 dark:text-indigo-200">Collaboration Task</h3>
              <div className="flex items-center gap-2">
                <Badge className={getComplexityColor(suggestedTask.complexity)}>
                  {suggestedTask.complexity} complexity
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {suggestedTask.estimatedTime}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">{suggestedTask.description}</p>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">
              <strong>Context:</strong> "{conversationContext}"
            </div>
          </div>

          {/* Required Agents */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-500" />
              Required Agents ({requiredAgents.length})
            </h3>
            <div className="grid gap-3">
              {requiredAgents.map((agent) => (
                <Card key={agent.name} className="border-indigo-200 dark:border-indigo-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg ${agent.bgColor}`}>
                        <agent.icon className={`h-5 w-5 ${agent.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-800 dark:text-slate-100">{agent.name}</h4>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          >
                            Required
                          </Badge>
                          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{agent.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>Success Rate: {agent.performance.successRate}%</span>
                          <span>Avg Response: {agent.performance.avgResponseTime}</span>
                          <span className="capitalize">Status: {agent.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Optional Agents */}
          {optionalAgents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Additional Agents (Optional)
              </h3>
              <div className="grid gap-2">
                {optionalAgents.map((agent) => {
                  const isSelected = selectedAgents.some((a) => a.name === agent.name)
                  return (
                    <Card
                      key={agent.name}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "hover:shadow-sm"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleAgentToggle(agent, checked as boolean)}
                          />
                          <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                            <agent.icon className={`h-4 w-4 ${agent.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-slate-800 dark:text-slate-100">{agent.name}</h4>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{agent.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Collaboration Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Collaboration Summary</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>Total Agents: {totalAgents}</span>
              <span>•</span>
              <span>Estimated Time: {suggestedTask.estimatedTime}</span>
              <span>•</span>
              <span className="capitalize">Complexity: {suggestedTask.complexity}</span>
            </div>
          </div>

          {/* Collaboration Instructions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Collaboration Instructions (Optional)
            </h3>
            <Textarea
              placeholder="Add specific instructions for how the agents should work together..."
              value={collaborationInstructions}
              onChange={(e) => setCollaborationInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel Collaboration
            </Button>
            <Button onClick={handleStartCollaboration} className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Start Collaboration ({totalAgents} agents)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, CheckCircle2, Users, Zap } from "lucide-react"
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

interface HandoffReason {
  reason: string
  description: string
  suggestedAgents: string[]
}

interface AgentHandoffDialogProps {
  isOpen: boolean
  onClose: () => void
  currentAgent: Agent
  availableAgents: Agent[]
  handoffReason: HandoffReason
  conversationContext: string
  onConfirmHandoff: (targetAgent: Agent, handoffNote: string) => void
}

export default function AgentHandoffDialog({
  isOpen,
  onClose,
  currentAgent,
  availableAgents,
  handoffReason,
  conversationContext,
  onConfirmHandoff,
}: AgentHandoffDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [handoffNote, setHandoffNote] = useState("")

  const suggestedAgents = availableAgents.filter((agent) => handoffReason.suggestedAgents.includes(agent.name))

  const otherAgents = availableAgents.filter(
    (agent) => !handoffReason.suggestedAgents.includes(agent.name) && agent.name !== currentAgent.name,
  )

  const handleConfirm = () => {
    if (selectedAgent) {
      onConfirmHandoff(selectedAgent, handoffNote)
      onClose()
      setSelectedAgent(null)
      setHandoffNote("")
    }
  }

  const handleCancel = () => {
    onClose()
    setSelectedAgent(null)
    setHandoffNote("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Agent Handoff Required
          </DialogTitle>
          <DialogDescription>
            The {currentAgent.name} has identified that this task would be better handled by a specialized agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Handoff Reason */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <currentAgent.icon className={`h-5 w-5 ${currentAgent.color}`} />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Handoff Reason: {handoffReason.reason}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">{handoffReason.description}</p>
              </div>
            </div>
          </div>

          {/* Conversation Context */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Conversation Context</h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{conversationContext}"</p>
            </div>
          </div>

          {/* Suggested Agents */}
          {suggestedAgents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-500" />
                Recommended Agents
              </h3>
              <div className="grid gap-3">
                {suggestedAgents.map((agent) => (
                  <Card
                    key={agent.name}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAgent?.name === agent.name
                        ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "hover:shadow-md hover:scale-[1.02]"
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
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
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Recommended
                            </Badge>
                            {selectedAgent?.name === agent.name && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{agent.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>Success Rate: {agent.performance.successRate}%</span>
                            <span>Avg Response: {agent.performance.avgResponseTime}</span>
                            <span>Status: {agent.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Available Agents */}
          {otherAgents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Other Available Agents</h3>
              <div className="grid gap-2">
                {otherAgents.map((agent) => (
                  <Card
                    key={agent.name}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAgent?.name === agent.name
                        ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                          <agent.icon className={`h-4 w-4 ${agent.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm text-slate-800 dark:text-slate-100">{agent.name}</h4>
                            {selectedAgent?.name === agent.name && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{agent.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Handoff Note */}
          {selectedAgent && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Handoff Note (Optional)</h3>
              <Textarea
                placeholder={`Add any additional context for the ${selectedAgent.name}...`}
                value={handoffNote}
                onChange={(e) => setHandoffNote(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel Handoff
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAgent} className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Transfer to {selectedAgent?.name || "Selected Agent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

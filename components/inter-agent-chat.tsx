"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, ChevronDown, ChevronUp, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Agent {
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

interface InterAgentMessage {
  id: string
  fromAgent: string
  toAgent?: string // undefined means broadcast to all
  message: string
  timestamp: Date
  type: "coordination" | "question" | "update" | "suggestion" | "completion"
  priority: "low" | "normal" | "high"
}

interface InterAgentChatProps {
  collaborationId: string
  agents: Agent[]
  messages: InterAgentMessage[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function InterAgentChat({
  collaborationId,
  agents,
  messages,
  isCollapsed = false,
  onToggleCollapse,
}: InterAgentChatProps) {
  const [newMessages, setNewMessages] = useState<string[]>([])

  // Simulate new message notifications
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      setNewMessages((prev) => [...prev, latestMessage.id])

      // Remove notification after 3 seconds
      setTimeout(() => {
        setNewMessages((prev) => prev.filter((id) => id !== latestMessage.id))
      }, 3000)
    }
  }, [messages])

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "coordination":
        return "🤝"
      case "question":
        return "❓"
      case "update":
        return "📊"
      case "suggestion":
        return "💡"
      case "completion":
        return "✅"
      default:
        return "💬"
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "coordination":
        return "text-blue-600 dark:text-blue-400"
      case "question":
        return "text-yellow-600 dark:text-yellow-400"
      case "update":
        return "text-green-600 dark:text-green-400"
      case "suggestion":
        return "text-purple-600 dark:text-purple-400"
      case "completion":
        return "text-emerald-600 dark:text-emerald-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs px-1.5 py-0">
            High
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            Normal
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getAgentInfo = (agentName: string) => {
    return agents.find((agent) => agent.name === agentName)
  }

  if (isCollapsed) {
    return (
      <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-sm">Agent Communication</CardTitle>
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {messages.length} messages
                </Badge>
              )}
              {newMessages.length > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {newMessages.length} new
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onToggleCollapse}>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-sm">Agent Communication</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {agents.length} agents
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onToggleCollapse}>
            <ChevronUp className="h-3 w-3" />
          </Button>
        </div>

        {/* Active Agents */}
        <div className="flex items-center gap-1 mt-2">
          {agents.map((agent) => {
            const agentInfo = getAgentInfo(agent.name)
            return (
              <div key={agent.name} className={`flex items-center gap-1 px-2 py-1 rounded-md ${agent.bgColor}`}>
                <agent.icon className={`h-3 w-3 ${agent.color}`} />
                <span className={`text-xs font-medium ${agent.color}`}>{agent.name.split(" ")[0]}</span>
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Agents will communicate here during collaboration
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const fromAgent = getAgentInfo(msg.fromAgent)
                const isNewMessage = newMessages.includes(msg.id)

                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isNewMessage
                        ? "border-indigo-300 bg-indigo-100 dark:border-indigo-600 dark:bg-indigo-900/30 animate-pulse"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {fromAgent && (
                          <div className={`p-1 rounded ${fromAgent.bgColor}`}>
                            <fromAgent.icon className={`h-3 w-3 ${fromAgent.color}`} />
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{msg.fromAgent}</span>
                        {msg.toAgent && (
                          <>
                            <span className="text-xs text-slate-400">→</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">{msg.toAgent}</span>
                          </>
                        )}
                        {!msg.toAgent && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            All Agents
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${getMessageTypeColor(msg.type)}`}>
                          {getMessageTypeIcon(msg.type)}
                        </span>
                        {getPriorityBadge(msg.priority)}
                      </div>
                    </div>

                    {/* Message Content */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">{msg.message}</p>

                    {/* Message Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {msg.type.replace("-", " ")}
                      </span>
                      <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Quick Stats */}
        {messages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{messages.length} messages exchanged</span>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span>Active coordination</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

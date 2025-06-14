"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageSquare, MoreHorizontal, Edit2, Copy, Trash2, Download, Clock } from "lucide-react"

interface ChatSession {
  id: string
  name: string
  messages: any[]
  createdAt: Date
  lastActivity: Date
  isActive: boolean
}

interface SessionManagerProps {
  sessions: ChatSession[]
  activeSessionId: string
  onCreateSession: (name?: string) => void
  onSwitchSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, newName: string) => boolean
  onDeleteSession: (sessionId: string) => boolean
  onDuplicateSession: (sessionId: string) => string | null
  onClearAllSessions: () => void
  onExportAllSessions: () => void
}

export default function SessionManager({
  sessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onRenameSession,
  onDeleteSession,
  onDuplicateSession,
  onClearAllSessions,
  onExportAllSessions,
}: SessionManagerProps) {
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")

  const handleRename = (sessionId: string, currentName: string) => {
    setIsRenaming(sessionId)
    setRenameValue(currentName)
  }

  const confirmRename = (sessionId: string) => {
    if (onRenameSession(sessionId, renameValue)) {
      setIsRenaming(null)
      setRenameValue("")
    }
  }

  const cancelRename = () => {
    setIsRenaming(null)
    setRenameValue("")
  }

  const handleCreateSession = () => {
    onCreateSession(newSessionName.trim() || undefined)
    setNewSessionName("")
    setShowCreateDialog(false)
  }

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    if (window.confirm(`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`)) {
      onDeleteSession(sessionId)
    }
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all chat sessions? This action cannot be undone.")) {
      onClearAllSessions()
    }
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  )

  return (
    <div className="w-80 border-r bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Chat Sessions</h2>
          <div className="flex items-center gap-1">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>
                    Give your new chat session a name, or leave blank for an auto-generated name.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Session name (optional)"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateSession()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>Create Session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportAllSessions} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export All Sessions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearAll} className="gap-2 text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4" />
                  Clear All Sessions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                session.id === activeSessionId
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
              onClick={() => onSwitchSession(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {isRenaming === session.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") confirmRename(session.id)
                          if (e.key === "Escape") cancelRename()
                        }}
                        onBlur={() => confirmRename(session.id)}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                          {session.name}
                        </h3>
                        {session.id === activeSessionId && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.messages.filter((m) => m.type !== "typing").length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(session.lastActivity)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {!isRenaming && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(session.id, session.name)} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateSession(session.id)} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteSession(session.id, session.name)}
                        className="gap-2 text-red-600 dark:text-red-400"
                        disabled={sessions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

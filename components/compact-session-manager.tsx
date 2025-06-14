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
import { Plus, MessageSquare, MoreHorizontal, Edit2, Copy, Trash2, Download, ChevronDown } from "lucide-react"

interface ChatSession {
  id: string
  name: string
  messages: any[]
  createdAt: Date
  lastActivity: Date
  isActive: boolean
}

interface CompactSessionManagerProps {
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

export default function CompactSessionManager({
  sessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onRenameSession,
  onDeleteSession,
  onDuplicateSession,
  onClearAllSessions,
  onExportAllSessions,
}: CompactSessionManagerProps) {
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

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

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  )

  return (
    <div className="w-64 border-r bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col">
      {/* Compact Header */}
      <div className="p-3 border-b dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Sessions</h2>
          <div className="flex items-center gap-1">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0">
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
                <Button variant="outline" size="sm" className="h-6 w-6 p-0">
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

        {/* Active Session Display */}
        <div
          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare className="h-3 w-3 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
              {activeSession?.name || "No Session"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
              {sessions.length}
            </Badge>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {/* Expandable Sessions List */}
      {isExpanded && (
        <ScrollArea className="flex-1 max-h-48">
          <div className="p-2 space-y-1">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-2 rounded-md cursor-pointer transition-colors text-sm ${
                  session.id === activeSessionId
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
                onClick={() => {
                  onSwitchSession(session.id)
                  setIsExpanded(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {isRenaming === session.id ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") confirmRename(session.id)
                            if (e.key === "Escape") cancelRename()
                          }}
                          onBlur={() => confirmRename(session.id)}
                          className="h-6 text-xs"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs">
                          {session.name}
                        </span>
                        {session.id === activeSessionId && (
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isRenaming && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
      )}
    </div>
  )
}

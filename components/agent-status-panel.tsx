"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock3, PanelRightOpen, PanelLeftOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemMetric {
  name: string
  value: number
  total?: number
  unit: string
  status?: "Active" | "Warning" | "Error"
}

interface ActivityItem {
  id: string
  description: string
  time: string
  status: "completed" | "processing" | "failed"
  icon: LucideIcon
}

const systemMetrics: SystemMetric[] = [
  { name: "CPU Usage", value: 24, unit: "%", status: "Active" },
  { name: "Memory", value: 1.2, total: 4, unit: "GB" },
]

const recentActivities: ActivityItem[] = [
  {
    id: "act1",
    description: "Trip planning completed",
    time: "2 minutes ago",
    status: "completed",
    icon: CheckCircle2,
  },
  { id: "act2", description: "Restaurant reservation", time: "5 minutes ago", status: "completed", icon: CheckCircle2 },
  { id: "act3", description: "Processing request", time: "Just now", status: "processing", icon: Clock3 },
]

export default function AgentStatusPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "border-l bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-12" : "w-96 p-4 md:p-6",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-3 z-10 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border dark:border-slate-700 rounded-md",
          isCollapsed ? "right-2" : "-left-5 transform -translate-x-0",
        )}
        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelRightOpen size={18} />}
      </Button>

      {!isCollapsed && (
        <>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Agent Status</h2>
          <ScrollArea className="flex-1 -mx-4 md:-mx-6 px-4 md:px-6">
            <Card className="mb-6 dark:bg-slate-850 dark:border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {systemMetrics.map((metric) => (
                  <div key={metric.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        {metric.status && (
                          <Badge
                            variant={metric.status === "Active" ? "default" : "destructive"}
                            className={`text-xs px-1.5 py-0.5 ${
                              metric.status === "Active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {metric.status}
                          </Badge>
                        )}
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {metric.total
                            ? `${metric.value}${metric.unit}/${metric.total}${metric.unit}`
                            : `${metric.value}${metric.unit}`}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={metric.total ? (metric.value / metric.total) * 100 : metric.value}
                      className="h-2 [&>div]:bg-indigo-500 dark:[&>div]:bg-indigo-400"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-850 dark:border-slate-700">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-300">
                  {recentActivities.length} tasks
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center 
                      ${
                        activity.status === "completed"
                          ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                          : activity.status === "processing"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                            : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                      }`}
                    >
                      <activity.icon size={12} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{activity.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </ScrollArea>
        </>
      )}
    </aside>
  )
}

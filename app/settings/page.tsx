"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Bot, Zap, Shield, Database, TestTube } from "lucide-react"
import { useRouter } from "next/navigation"
import AgentSettings from "@/components/settings/agent-settings"
import LLMProviderSettings from "@/components/settings/llm-provider-settings"
import SystemSettings from "@/components/settings/system-settings"
import SecuritySettings from "@/components/settings/security-settings"
import DataSettings from "@/components/settings/data-settings"
import N8NConnectionTest from "@/components/settings/n8n-connection-test"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("agents")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Workbench
              </Button>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="llm" className="gap-2">
              <Zap className="h-4 w-4" />
              LLM Providers
            </TabsTrigger>
            <TabsTrigger value="integration" className="gap-2">
              <TestTube className="h-4 w-4" />
              Integration
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Configure individual agents, assign LLM providers, and customize their behavior.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="llm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>LLM Provider Settings</CardTitle>
                <CardDescription>
                  Configure API keys, endpoints, and settings for different LLM providers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LLMProviderSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <N8NConnectionTest />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  General system settings, performance tuning, and workspace preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Security settings, privacy controls, and access management.</CardDescription>
              </CardHeader>
              <CardContent>
                <SecuritySettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Data storage, backup, export, and retention settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

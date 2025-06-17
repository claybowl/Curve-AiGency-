"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ListChecks,
  Phone,
  Search,
  Settings,
  Brain,
  Zap,
  MessageSquare,
  Save,
  AlertTriangle,
  Link2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { agentConfigSchema } from "@/lib/validation"
import { FormError, FormErrorSummary } from "@/components/ui/form-error"
import { toast } from "sonner"

interface AgentConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  enabled: boolean
  n8nWorkflowTag: string // New field for n8n integration
  llmProvider: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  capabilities: string[]
  specialties: string[]
  responseStyle: "professional" | "casual" | "technical" | "creative"
  maxConcurrentTasks: number
  timeoutSeconds: number
  retryAttempts: number
  customInstructions: string
  collaborationPreferences: {
    preferredPartners: string[]
    communicationStyle: "direct" | "collaborative" | "supportive"
    handoffThreshold: number
  }
}

const defaultAgents: AgentConfig[] = [
  {
    id: "planner",
    name: "Planner Agent",
    description: "Creates detailed plans and itineraries",
    icon: ListChecks,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    enabled: true,
    n8nWorkflowTag: "planner_agent_workflow", // Example tag
    llmProvider: "openai",
    model: "gpt-4o",
    systemPrompt:
      "You are a professional planning agent specialized in creating detailed, actionable plans and itineraries. Focus on practical solutions, time management, and resource optimization.",
    temperature: 0.3,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    capabilities: ["Trip Planning", "Event Organization", "Schedule Management", "Resource Allocation"],
    specialties: [
      "Multi-destination travel itineraries",
      "Budget-conscious planning",
      "Group coordination and logistics",
      "Time-sensitive scheduling",
    ],
    responseStyle: "professional",
    maxConcurrentTasks: 3,
    timeoutSeconds: 60,
    retryAttempts: 3,
    customInstructions: "Always provide step-by-step plans with timelines and budget considerations.",
    collaborationPreferences: {
      preferredPartners: ["Research Agent", "Phone Agent"],
      communicationStyle: "collaborative",
      handoffThreshold: 0.7,
    },
  },
  {
    id: "phone",
    name: "Phone Agent",
    description: "Makes calls and handles reservations",
    icon: Phone,
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    enabled: true,
    n8nWorkflowTag: "phone_agent_workflow", // Example tag
    llmProvider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    systemPrompt:
      "You are a phone communication specialist. Handle calls, reservations, and appointments with professionalism and attention to detail.",
    temperature: 0.2,
    maxTokens: 1500,
    topP: 0.8,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    capabilities: ["Restaurant Reservations", "Appointment Booking", "Customer Service", "Information Gathering"],
    specialties: [
      "Fine dining reservations",
      "Medical appointment scheduling",
      "Service provider coordination",
      "Follow-up communications",
    ],
    responseStyle: "professional",
    maxConcurrentTasks: 2,
    timeoutSeconds: 45,
    retryAttempts: 2,
    customInstructions: "Always confirm details and provide confirmation numbers when available.",
    collaborationPreferences: {
      preferredPartners: ["Planner Agent"],
      communicationStyle: "direct",
      handoffThreshold: 0.8,
    },
  },
  {
    id: "research",
    name: "Research Agent",
    description: "Performs deep research on topics",
    icon: Search,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    enabled: true,
    n8nWorkflowTag: "research_agent_workflow", // Example tag
    llmProvider: "google",
    model: "gemini-1.5-pro",
    systemPrompt:
      "You are a research specialist focused on gathering comprehensive, accurate information from multiple sources. Provide well-sourced, analytical insights.",
    temperature: 0.4,
    maxTokens: 3000,
    topP: 0.9,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1,
    capabilities: ["Market Research", "Academic Research", "Competitive Analysis", "Data Collection"],
    specialties: [
      "Industry trend analysis",
      "Scientific literature review",
      "Market opportunity assessment",
      "Fact-checking and verification",
    ],
    responseStyle: "technical",
    maxConcurrentTasks: 4,
    timeoutSeconds: 90,
    retryAttempts: 3,
    customInstructions: "Always cite sources and provide confidence levels for findings.",
    collaborationPreferences: {
      preferredPartners: ["Data Analysis", "Content Synthesis"],
      communicationStyle: "supportive",
      handoffThreshold: 0.6,
    },
  },
]

export default function AgentSettings() {
  const [agents, setAgents] = useState<AgentConfig[]>(defaultAgents)
  const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgents[0].id)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({})
  const [availableProviders] = useState([
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"] },
    { id: "google", name: "Google AI", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
  ])

  const currentAgent = agents.find((agent) => agent.id === selectedAgent) || agents[0]

  const { errors, isValidating, hasErrors, validateForm, validateSingleField, getFieldError, clearErrors } =
    useFormValidation({
      schema: agentConfigSchema,
      validateOnChange: true,
    })

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("agent-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAgents(parsed)
      } catch (error) {
        console.error("Failed to load agent settings:", error)
        toast.error("Failed to load agent settings")
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (updatedAgents: AgentConfig[]) => {
    try {
      setAgents(updatedAgents)
      localStorage.setItem("agent-settings", JSON.stringify(updatedAgents))
      toast.success("Agent settings saved successfully")
    } catch (error) {
      console.error("Failed to save agent settings:", error)
      toast.error("Failed to save agent settings")
    }
  }

  const validateAndUpdateAgent = (agentId: string, updates: Partial<AgentConfig>) => {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    const updatedAgent = { ...agent, ...updates }
    const result = validateForm(updatedAgent)

    if (result.success) {
      const updated = agents.map((a) => (a.id === agentId ? updatedAgent : a))
      setAgents(updated)
      setHasUnsavedChanges({ ...hasUnsavedChanges, [agentId]: true })
      clearErrors()
    }
  }

  const saveAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    const result = validateForm(agent)
    if (result.success) {
      saveSettings(agents)
      setHasUnsavedChanges({ ...hasUnsavedChanges, [agentId]: false })
      toast.success(`${agent.name} settings saved`)
    } else {
      toast.error("Please fix validation errors before saving")
    }
  }

  const getProviderModels = (providerId: string) => {
    const provider = availableProviders.find((p) => p.id === providerId)
    return provider?.models || []
  }

  const handleFieldChange = (field: string, value: any) => {
    validateSingleField(field, value)
    validateAndUpdateAgent(currentAgent.id, { [field]: value })
  }

  const handleNestedFieldChange = (parentField: string, field: string, value: any) => {
    const currentValue = (currentAgent as any)[parentField]
    const updatedValue = { ...currentValue, [field]: value }
    validateSingleField(`${parentField}.${field}`, value)
    validateAndUpdateAgent(currentAgent.id, { [parentField]: updatedValue })
  }

  const handleArrayFieldChange = (field: string, value: string[]) => {
    validateSingleField(field, value)
    validateAndUpdateAgent(currentAgent.id, { [field]: value })
  }

  const addToArray = (field: string, value: string) => {
    const currentArray = (currentAgent as any)[field] as string[]
    if (value.trim() && !currentArray.includes(value.trim())) {
      const updated = [...currentArray, value.trim()]
      handleArrayFieldChange(field, updated)
    }
  }

  const removeFromArray = (field: string, index: number) => {
    const currentArray = (currentAgent as any)[field] as string[]
    const updated = currentArray.filter((_, i) => i !== index)
    handleArrayFieldChange(field, updated)
  }

  return (
    <div className="space-y-6">
      {/* Error Summary */}
      {hasErrors && <FormErrorSummary errors={errors} />}

      {/* Agent Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedAgent === agent.id
                ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                : "hover:shadow-md"
            } ${hasUnsavedChanges[agent.id] ? "ring-2 ring-yellow-200 dark:ring-yellow-800" : ""}`}
            onClick={() => setSelectedAgent(agent.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${agent.bgColor}`}>
                  <agent.icon className={`h-5 w-5 ${agent.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100">{agent.name}</h3>
                    {agent.enabled ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                    {hasUnsavedChanges[agent.id] && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unsaved
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{agent.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{agent.llmProvider}</span>
                    <span>•</span>
                    <span>{agent.model}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${currentAgent.bgColor}`}>
                <currentAgent.icon className={`h-5 w-5 ${currentAgent.color}`} />
              </div>
              <div>
                <CardTitle>{currentAgent.name} Configuration</CardTitle>
                <CardDescription>Configure LLM provider, behavior, and collaboration settings</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges[currentAgent.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveAgent(currentAgent.id)}
                  disabled={isValidating || hasErrors}
                  className="gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save Changes
                </Button>
              )}
              <Switch
                checked={currentAgent.enabled}
                onCheckedChange={(enabled) => handleFieldChange("enabled", enabled)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="llm" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="integration" className="gap-2">
                <Link2 className="h-4 w-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="llm" className="gap-2">
                <Brain className="h-4 w-4" />
                LLM
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-2">
                <Settings className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="gap-2">
                <Zap className="h-4 w-4" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="integration" className="space-y-6">
              <CardTitle>n8n Integration</CardTitle>
              <CardDescription>Connect this agent to a specific n8n workflow using a unique tag.</CardDescription>
              <div className="space-y-2">
                <Label htmlFor="n8n-workflow-tag">n8n Workflow Tag *</Label>
                <Input
                  id="n8n-workflow-tag"
                  value={currentAgent.n8nWorkflowTag}
                  onChange={(e) => handleFieldChange("n8nWorkflowTag", e.target.value)}
                  placeholder="e.g., research_agent_prod"
                />
                <FormError error={getFieldError("n8nWorkflowTag")} />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This tag is sent to your n8n webhook to identify which agent logic to execute.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="llm" className="space-y-6">
              {/* LLM Provider Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="llm-provider">LLM Provider *</Label>
                  <Select
                    value={currentAgent.llmProvider}
                    onValueChange={(value) => {
                      const models = getProviderModels(value)
                      handleFieldChange("llmProvider", value)
                      handleFieldChange("model", models[0] || "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError error={getFieldError("llmProvider")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Select value={currentAgent.model} onValueChange={(value) => handleFieldChange("model", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getProviderModels(currentAgent.llmProvider).map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError error={getFieldError("model")} />
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt *</Label>
                <Textarea
                  id="system-prompt"
                  value={currentAgent.systemPrompt}
                  onChange={(e) => handleFieldChange("systemPrompt", e.target.value)}
                  rows={4}
                  placeholder="Define the agent's role and behavior..."
                />
                <FormError error={getFieldError("systemPrompt")} />
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentAgent.systemPrompt.length}/2000 characters
                </div>
              </div>

              {/* Model Parameters */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 dark:text-slate-100">Model Parameters</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Temperature</Label>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{currentAgent.temperature}</span>
                    </div>
                    <Slider
                      value={[currentAgent.temperature]}
                      onValueChange={([value]) => handleFieldChange("temperature", value)}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <FormError error={getFieldError("temperature")} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Controls randomness (0 = deterministic, 2 = very creative)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Top P</Label>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{currentAgent.topP}</span>
                    </div>
                    <Slider
                      value={[currentAgent.topP]}
                      onValueChange={([value]) => handleFieldChange("topP", value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <FormError error={getFieldError("topP")} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Controls diversity via nucleus sampling
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens *</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      value={currentAgent.maxTokens}
                      onChange={(e) => handleFieldChange("maxTokens", Number.parseInt(e.target.value) || 0)}
                      min={1}
                      max={8000}
                    />
                    <FormError error={getFieldError("maxTokens")} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Frequency Penalty</Label>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentAgent.frequencyPenalty}
                      </span>
                    </div>
                    <Slider
                      value={[currentAgent.frequencyPenalty]}
                      onValueChange={([value]) => handleFieldChange("frequencyPenalty", value)}
                      max={2}
                      min={-2}
                      step={0.1}
                      className="w-full"
                    />
                    <FormError error={getFieldError("frequencyPenalty")} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
              {/* Response Style */}
              <div className="space-y-2">
                <Label>Response Style *</Label>
                <Select
                  value={currentAgent.responseStyle}
                  onValueChange={(value: any) => handleFieldChange("responseStyle", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                <FormError error={getFieldError("responseStyle")} />
              </div>

              {/* Performance Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-concurrent">Max Concurrent Tasks *</Label>
                  <Input
                    id="max-concurrent"
                    type="number"
                    value={currentAgent.maxConcurrentTasks}
                    onChange={(e) => handleFieldChange("maxConcurrentTasks", Number.parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                  />
                  <FormError error={getFieldError("maxConcurrentTasks")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds) *</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={currentAgent.timeoutSeconds}
                    onChange={(e) => handleFieldChange("timeoutSeconds", Number.parseInt(e.target.value) || 30)}
                    min={10}
                    max={300}
                  />
                  <FormError error={getFieldError("timeoutSeconds")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts *</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    value={currentAgent.retryAttempts}
                    onChange={(e) => handleFieldChange("retryAttempts", Number.parseInt(e.target.value) || 1)}
                    min={1}
                    max={5}
                  />
                  <FormError error={getFieldError("retryAttempts")} />
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <Textarea
                  id="custom-instructions"
                  value={currentAgent.customInstructions}
                  onChange={(e) => handleFieldChange("customInstructions", e.target.value)}
                  rows={3}
                  placeholder="Additional instructions for this agent..."
                />
                <FormError error={getFieldError("customInstructions")} />
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentAgent.customInstructions.length}/500 characters
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              {/* Capabilities */}
              <div className="space-y-2">
                <Label>Core Capabilities *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentAgent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability}
                      <button
                        onClick={() => removeFromArray("capabilities", index)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add capability..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addToArray("capabilities", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        addToArray("capabilities", input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <FormError error={getFieldError("capabilities")} />
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label>Specialties *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentAgent.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                      <button
                        onClick={() => removeFromArray("specialties", index)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add specialty..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addToArray("specialties", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        addToArray("specialties", input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <FormError error={getFieldError("specialties")} />
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-6">
              {/* Preferred Partners */}
              <div className="space-y-2">
                <Label>Preferred Collaboration Partners</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentAgent.collaborationPreferences.preferredPartners.map((partner, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {partner}
                      <button
                        onClick={() => {
                          const updated = currentAgent.collaborationPreferences.preferredPartners.filter(
                            (_, i) => i !== index,
                          )
                          handleNestedFieldChange("collaborationPreferences", "preferredPartners", updated)
                        }}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => {
                    if (!currentAgent.collaborationPreferences.preferredPartners.includes(value)) {
                      const updated = [...currentAgent.collaborationPreferences.preferredPartners, value]
                      handleNestedFieldChange("collaborationPreferences", "preferredPartners", updated)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add preferred partner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents
                      .filter((a) => a.id !== currentAgent.id)
                      .map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormError error={getFieldError("collaborationPreferences.preferredPartners")} />
              </div>

              {/* Communication Style */}
              <div className="space-y-2">
                <Label>Communication Style *</Label>
                <Select
                  value={currentAgent.collaborationPreferences.communicationStyle}
                  onValueChange={(value: any) =>
                    handleNestedFieldChange("collaborationPreferences", "communicationStyle", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                  </SelectContent>
                </Select>
                <FormError error={getFieldError("collaborationPreferences.communicationStyle")} />
              </div>

              {/* Handoff Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Handoff Threshold *</Label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {currentAgent.collaborationPreferences.handoffThreshold}
                  </span>
                </div>
                <Slider
                  value={[currentAgent.collaborationPreferences.handoffThreshold]}
                  onValueChange={([value]) =>
                    handleNestedFieldChange("collaborationPreferences", "handoffThreshold", value)
                  }
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <FormError error={getFieldError("collaborationPreferences.handoffThreshold")} />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confidence threshold for suggesting handoffs (0 = never, 1 = always)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

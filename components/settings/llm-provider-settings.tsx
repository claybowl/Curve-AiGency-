"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Plus, Trash2, TestTube, Save } from "lucide-react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { llmProviderSchema } from "@/lib/validation"
import { FormError, FormErrorSummary } from "@/components/ui/form-error"
import { toast } from "sonner"

interface LLMProvider {
  id: string
  name: string
  type: "openai" | "anthropic" | "google" | "azure" | "local" | "custom"
  apiKey: string
  endpoint?: string
  models: string[]
  defaultModel: string
  enabled: boolean
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
  customHeaders?: Record<string, string>
  description?: string
}

const defaultProviders: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    type: "openai",
    apiKey: "",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o",
    enabled: false,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 150000,
    },
    description: "OpenAI's GPT models including GPT-4 and GPT-3.5",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    type: "anthropic",
    apiKey: "",
    endpoint: "https://api.anthropic.com/v1",
    models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    defaultModel: "claude-3-5-sonnet-20241022",
    enabled: false,
    rateLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
    },
    description: "Anthropic's Claude models for advanced reasoning",
  },
  {
    id: "google",
    name: "Google AI",
    type: "google",
    apiKey: "",
    endpoint: "https://generativelanguage.googleapis.com/v1",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
    defaultModel: "gemini-1.5-pro",
    enabled: false,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 120000,
    },
    description: "Google's Gemini models for multimodal AI",
  },
]

export default function LLMProviderSettings() {
  const [providers, setProviders] = useState<LLMProvider[]>(defaultProviders)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({})

  const { errors, isValidating, hasErrors, validateForm, validateSingleField, getFieldError, clearErrors } =
    useFormValidation({
      schema: llmProviderSchema,
      validateOnChange: true,
    })

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("llm-provider-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProviders(parsed)
      } catch (error) {
        console.error("Failed to load LLM provider settings:", error)
        toast.error("Failed to load provider settings")
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (updatedProviders: LLMProvider[]) => {
    try {
      setProviders(updatedProviders)
      localStorage.setItem("llm-provider-settings", JSON.stringify(updatedProviders))
      toast.success("Provider settings saved successfully")
    } catch (error) {
      console.error("Failed to save provider settings:", error)
      toast.error("Failed to save provider settings")
    }
  }

  const validateAndUpdateProvider = (id: string, updates: Partial<LLMProvider>) => {
    const provider = providers.find((p) => p.id === id)
    if (!provider) return

    const updatedProvider = { ...provider, ...updates }
    const result = validateForm(updatedProvider)

    if (result.success) {
      const updated = providers.map((p) => (p.id === id ? updatedProvider : p))
      setProviders(updated)
      setHasUnsavedChanges({ ...hasUnsavedChanges, [id]: true })
      clearErrors()
    }
  }

  const saveProvider = (id: string) => {
    const provider = providers.find((p) => p.id === id)
    if (!provider) return

    const result = validateForm(provider)
    if (result.success) {
      saveSettings(providers)
      setHasUnsavedChanges({ ...hasUnsavedChanges, [id]: false })
      setEditingProvider(null)
    } else {
      toast.error("Please fix validation errors before saving")
    }
  }

  const addCustomProvider = () => {
    const newProvider: LLMProvider = {
      id: `custom-${Date.now()}`,
      name: "Custom Provider",
      type: "custom",
      apiKey: "",
      endpoint: "",
      models: ["custom-model"],
      defaultModel: "custom-model",
      enabled: false,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 100000,
      },
      description: "Custom LLM provider",
    }
    setProviders([...providers, newProvider])
    setEditingProvider(newProvider.id)
    setHasUnsavedChanges({ ...hasUnsavedChanges, [newProvider.id]: true })
  }

  const removeProvider = (id: string) => {
    if (window.confirm("Are you sure you want to remove this provider?")) {
      const updated = providers.filter((provider) => provider.id !== id)
      saveSettings(updated)
      const newUnsavedChanges = { ...hasUnsavedChanges }
      delete newUnsavedChanges[id]
      setHasUnsavedChanges(newUnsavedChanges)
    }
  }

  const testConnection = async (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return

    // Validate provider before testing
    const result = validateForm(provider)
    if (!result.success) {
      toast.error("Please fix validation errors before testing connection")
      return
    }

    setTestingProvider(providerId)

    try {
      // Simulate API test - in real implementation, this would make an actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (!provider.apiKey) {
        throw new Error("API key is required")
      }

      if (provider.endpoint && !provider.endpoint.startsWith("https://")) {
        throw new Error("Endpoint must use HTTPS")
      }

      setTestResults({
        ...testResults,
        [providerId]: { success: true, message: "Connection successful" },
      })
      toast.success(`${provider.name} connection test successful`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed"
      setTestResults({
        ...testResults,
        [providerId]: { success: false, message: errorMessage },
      })
      toast.error(`${provider.name} connection test failed: ${errorMessage}`)
    } finally {
      setTestingProvider(null)
    }
  }

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys({
      ...showApiKeys,
      [providerId]: !showApiKeys[providerId],
    })
  }

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "openai":
        return "🤖"
      case "anthropic":
        return "🧠"
      case "google":
        return "🔍"
      case "azure":
        return "☁️"
      case "local":
        return "💻"
      default:
        return "⚙️"
    }
  }

  const handleFieldChange = (providerId: string, field: string, value: any) => {
    validateSingleField(`${field}`, value)
    validateAndUpdateProvider(providerId, { [field]: value })
  }

  const handleModelsChange = (providerId: string, modelsText: string) => {
    const models = modelsText.split("\n").filter(Boolean)
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return

    validateSingleField("models", models)
    validateAndUpdateProvider(providerId, {
      models,
      defaultModel: models.includes(provider.defaultModel) ? provider.defaultModel : models[0] || "",
    })
  }

  const handleRateLimitChange = (providerId: string, field: "requestsPerMinute" | "tokensPerMinute", value: number) => {
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return

    validateSingleField(`rateLimits.${field}`, value)
    validateAndUpdateProvider(providerId, {
      rateLimits: {
        ...provider.rateLimits,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Error Summary */}
      {hasErrors && <FormErrorSummary errors={errors} />}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">LLM Providers</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure and manage your LLM provider connections
          </p>
        </div>
        <Button onClick={addCustomProvider} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Provider
        </Button>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`${provider.enabled ? "ring-2 ring-green-200 dark:ring-green-800" : ""} ${
              hasUnsavedChanges[provider.id] ? "ring-2 ring-yellow-200 dark:ring-yellow-800" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(provider.type)}</span>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {editingProvider === provider.id ? (
                        <div className="space-y-1">
                          <Input
                            value={provider.name}
                            onChange={(e) => handleFieldChange(provider.id, "name", e.target.value)}
                            className="font-semibold"
                            placeholder="Provider name"
                          />
                          <FormError error={getFieldError("name")} />
                        </div>
                      ) : (
                        provider.name
                      )}
                      {provider.enabled && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Active
                        </Badge>
                      )}
                      {hasUnsavedChanges[provider.id] && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Unsaved
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingProvider === provider.id ? (
                        <div className="space-y-1">
                          <Textarea
                            value={provider.description || ""}
                            onChange={(e) => handleFieldChange(provider.id, "description", e.target.value)}
                            placeholder="Provider description"
                            rows={2}
                          />
                          <FormError error={getFieldError("description")} />
                        </div>
                      ) : (
                        provider.description
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges[provider.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveProvider(provider.id)}
                      disabled={isValidating}
                      className="gap-1"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                  )}
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={(enabled) => handleFieldChange(provider.id, "enabled", enabled)}
                  />
                  {provider.type === "custom" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProvider(provider.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-api-key`}>API Key *</Label>
                  <div className="relative">
                    <Input
                      id={`${provider.id}-api-key`}
                      type={showApiKeys[provider.id] ? "text" : "password"}
                      value={provider.apiKey}
                      onChange={(e) => handleFieldChange(provider.id, "apiKey", e.target.value)}
                      placeholder="Enter API key..."
                      className="pr-10"
                      onFocus={() => setEditingProvider(provider.id)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                    >
                      {showApiKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormError error={getFieldError("apiKey")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-endpoint`}>API Endpoint</Label>
                  <Input
                    id={`${provider.id}-endpoint`}
                    value={provider.endpoint || ""}
                    onChange={(e) => handleFieldChange(provider.id, "endpoint", e.target.value)}
                    placeholder="https://api.example.com/v1"
                    onFocus={() => setEditingProvider(provider.id)}
                  />
                  <FormError error={getFieldError("endpoint")} />
                </div>
              </div>

              {/* Model Configuration */}
              <div className="space-y-2">
                <Label>Available Models *</Label>
                <div className="flex flex-wrap gap-2">
                  {provider.models.map((model) => (
                    <Badge
                      key={model}
                      variant={model === provider.defaultModel ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleFieldChange(provider.id, "defaultModel", model)}
                    >
                      {model}
                      {model === provider.defaultModel && " (default)"}
                    </Badge>
                  ))}
                </div>
                <Textarea
                  placeholder="Add models (one per line)"
                  value={provider.models.join("\n")}
                  onChange={(e) => handleModelsChange(provider.id, e.target.value)}
                  className="mt-2"
                  rows={3}
                  onFocus={() => setEditingProvider(provider.id)}
                />
                <FormError error={getFieldError("models")} />
              </div>

              {/* Rate Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-rpm`}>Requests per Minute *</Label>
                  <Input
                    id={`${provider.id}-rpm`}
                    type="number"
                    value={provider.rateLimits.requestsPerMinute}
                    onChange={(e) =>
                      handleRateLimitChange(provider.id, "requestsPerMinute", Number.parseInt(e.target.value) || 0)
                    }
                    min={1}
                    max={1000}
                    onFocus={() => setEditingProvider(provider.id)}
                  />
                  <FormError error={getFieldError("rateLimits.requestsPerMinute")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-tpm`}>Tokens per Minute *</Label>
                  <Input
                    id={`${provider.id}-tpm`}
                    type="number"
                    value={provider.rateLimits.tokensPerMinute}
                    onChange={(e) =>
                      handleRateLimitChange(provider.id, "tokensPerMinute", Number.parseInt(e.target.value) || 0)
                    }
                    min={1000}
                    max={1000000}
                    onFocus={() => setEditingProvider(provider.id)}
                  />
                  <FormError error={getFieldError("rateLimits.tokensPerMinute")} />
                </div>
              </div>

              {/* Test Connection */}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(provider.id)}
                    disabled={testingProvider === provider.id || !provider.apiKey || hasErrors}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {testingProvider === provider.id ? "Testing..." : "Test Connection"}
                  </Button>
                  {testResults[provider.id] && (
                    <div className="flex items-center gap-1">
                      {testResults[provider.id].success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${testResults[provider.id].success ? "text-green-600" : "text-red-600"}`}
                      >
                        {testResults[provider.id].message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global LLM Settings</CardTitle>
          <CardDescription>Settings that apply to all LLM providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-timeout">Request Timeout (seconds)</Label>
              <Input id="default-timeout" type="number" defaultValue="30" placeholder="30" min={5} max={300} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-retries">Max Retries</Label>
              <Input id="max-retries" type="number" defaultValue="3" placeholder="3" min={1} max={10} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-fallback">Enable Provider Fallback</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically switch to backup providers if primary fails
              </p>
            </div>
            <Switch id="enable-fallback" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="log-requests">Log API Requests</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep logs of API requests for debugging (excludes sensitive data)
              </p>
            </div>
            <Switch id="log-requests" />
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Current usage across all providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">1,247</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Requests Today</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">89.2K</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Tokens Used</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">$12.45</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Estimated Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

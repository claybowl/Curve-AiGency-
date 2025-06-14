import { z } from "zod"

// Base validation schemas
export const apiKeySchema = z.string().min(1, "API key is required").min(10, "API key must be at least 10 characters")

export const urlSchema = z.string().url("Must be a valid URL").or(z.literal(""))

export const positiveNumberSchema = z.number().min(0, "Must be a positive number")

export const rangeSchema = (min: number, max: number, fieldName: string) =>
  z.number().min(min, `${fieldName} must be at least ${min}`).max(max, `${fieldName} must be at most ${max}`)

// LLM Provider validation
export const llmProviderSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
  name: z.string().min(1, "Provider name is required").max(50, "Provider name must be less than 50 characters"),
  type: z.enum(["openai", "anthropic", "google", "azure", "local", "custom"]),
  apiKey: apiKeySchema,
  endpoint: urlSchema,
  models: z.array(z.string().min(1, "Model name cannot be empty")).min(1, "At least one model is required"),
  defaultModel: z.string().min(1, "Default model is required"),
  enabled: z.boolean(),
  rateLimits: z.object({
    requestsPerMinute: rangeSchema(1, 1000, "Requests per minute"),
    tokensPerMinute: rangeSchema(1000, 1000000, "Tokens per minute"),
  }),
  customHeaders: z.record(z.string()).optional(),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
})

// Agent configuration validation
export const agentConfigSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  name: z.string().min(1, "Agent name is required").max(50, "Agent name must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
  enabled: z.boolean(),
  llmProvider: z.string().min(1, "LLM provider is required"),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z
    .string()
    .min(10, "System prompt must be at least 10 characters")
    .max(2000, "System prompt must be less than 2000 characters"),
  temperature: rangeSchema(0, 2, "Temperature"),
  maxTokens: rangeSchema(1, 8000, "Max tokens"),
  topP: rangeSchema(0, 1, "Top P"),
  frequencyPenalty: rangeSchema(-2, 2, "Frequency penalty"),
  presencePenalty: rangeSchema(-2, 2, "Presence penalty"),
  capabilities: z.array(z.string().min(1, "Capability cannot be empty")).min(1, "At least one capability is required"),
  specialties: z.array(z.string().min(1, "Specialty cannot be empty")).min(1, "At least one specialty is required"),
  responseStyle: z.enum(["professional", "casual", "technical", "creative"]),
  maxConcurrentTasks: rangeSchema(1, 10, "Max concurrent tasks"),
  timeoutSeconds: rangeSchema(10, 300, "Timeout"),
  retryAttempts: rangeSchema(1, 5, "Retry attempts"),
  customInstructions: z.string().max(500, "Custom instructions must be less than 500 characters"),
  collaborationPreferences: z.object({
    preferredPartners: z.array(z.string()),
    communicationStyle: z.enum(["direct", "collaborative", "supportive"]),
    handoffThreshold: rangeSchema(0, 1, "Handoff threshold"),
  }),
})

// System settings validation
export const systemSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  compactMode: z.boolean(),
  showAgentAvatars: z.boolean(),
  animatedTransitions: z.boolean(),
  maxConcurrentSessions: rangeSchema(5, 50, "Max concurrent sessions"),
  messagesPerSession: rangeSchema(50, 2000, "Messages per session"),
  cacheSize: rangeSchema(50, 500, "Cache size"),
  preloadModels: z.boolean(),
  backgroundProcessing: z.boolean(),
  autoSave: z.boolean(),
  saveInterval: rangeSchema(10, 300, "Save interval"),
  backupFrequency: z.enum(["hourly", "daily", "weekly", "never"]),
  autoCleanup: z.boolean(),
  retentionDays: rangeSchema(7, 365, "Retention days"),
  notifications: z.boolean(),
  notificationSound: z.enum(["none", "subtle", "standard", "prominent"]),
})

// Security settings validation
export const securitySettingsSchema = z.object({
  encryptLocalStorage: z.boolean(),
  encryptApiCommunications: z.boolean(),
  encryptionAlgorithm: z.enum(["aes-256", "aes-128", "chacha20"]),
  showApiKeys: z.boolean(),
  autoClearClipboard: z.boolean(),
  keyRotationDays: rangeSchema(30, 365, "Key rotation days"),
  validateApiKeys: z.boolean(),
  autoSessionTimeout: z.boolean(),
  timeoutDuration: rangeSchema(5, 480, "Timeout duration"),
  timeoutAction: z.enum(["clear-keys", "clear-all", "lock-app"]),
  secureStorage: z.boolean(),
  analyticsCollection: z.boolean(),
  errorReporting: z.boolean(),
  conversationLogging: z.boolean(),
  shareUsageData: z.boolean(),
  auditLogging: z.boolean(),
  complianceMode: z.enum(["standard", "gdpr", "hipaa", "sox"]),
  dataRetentionLimits: z.boolean(),
  auditRetentionDays: rangeSchema(30, 2555, "Audit retention days"),
})

// Data settings validation
export const dataSettingsSchema = z.object({
  autoBackup: z.boolean(),
  backupFrequency: z.enum(["hourly", "daily", "weekly", "manual"]),
  backupRetentionDays: rangeSchema(1, 365, "Backup retention days"),
  cloudSync: z.boolean(),
  cloudProvider: z.enum(["none", "google-drive", "dropbox", "onedrive", "icloud"]),
  exportFormat: z.enum(["json", "csv", "markdown", "pdf"]),
  includeSensitiveData: z.boolean(),
  compressExports: z.boolean(),
  conversationRetentionDays: rangeSchema(1, 365, "Conversation retention days"),
  logRetentionDays: rangeSchema(1, 90, "Log retention days"),
  sessionRetentionDays: rangeSchema(1, 30, "Session retention days"),
  tempRetentionHours: rangeSchema(1, 168, "Temporary file retention hours"),
  autoDeleteExpired: z.boolean(),
  warnBeforeDeletion: z.boolean(),
})

// Validation result type
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ["Validation failed"] } }
  }
}

// Field validation helpers
export function validateField<T>(schema: z.ZodSchema<T>, value: unknown): { isValid: boolean; error?: string } {
  try {
    schema.parse(value)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || "Invalid value" }
    }
    return { isValid: false, error: "Validation failed" }
  }
}

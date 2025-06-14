"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Monitor, Moon, Sun, Palette, Zap, Clock, HardDrive, Save, AlertTriangle } from "lucide-react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { systemSettingsSchema } from "@/lib/validation"
import { FormError, FormErrorSummary } from "@/components/ui/form-error"
import { toast } from "sonner"

interface SystemSettings {
  theme: "light" | "dark" | "system"
  compactMode: boolean
  showAgentAvatars: boolean
  animatedTransitions: boolean
  maxConcurrentSessions: number
  messagesPerSession: number
  cacheSize: number
  preloadModels: boolean
  backgroundProcessing: boolean
  autoSave: boolean
  saveInterval: number
  backupFrequency: "hourly" | "daily" | "weekly" | "never"
  autoCleanup: boolean
  retentionDays: number
  notifications: boolean
  notificationSound: "none" | "subtle" | "standard" | "prominent"
}

const defaultSettings: SystemSettings = {
  theme: "light",
  compactMode: false,
  showAgentAvatars: true,
  animatedTransitions: true,
  maxConcurrentSessions: 20,
  messagesPerSession: 500,
  cacheSize: 100,
  preloadModels: true,
  backgroundProcessing: true,
  autoSave: true,
  saveInterval: 30,
  backupFrequency: "daily",
  autoCleanup: true,
  retentionDays: 90,
  notifications: true,
  notificationSound: "subtle",
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { errors, isValidating, hasErrors, validateForm, validateSingleField, getFieldError, clearErrors } =
    useFormValidation({
      schema: systemSettingsSchema,
      validateOnChange: true,
    })

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("system-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to load system settings:", error)
        toast.error("Failed to load system settings")
      }
    }
  }, [])

  const handleFieldChange = (field: string, value: any) => {
    validateSingleField(field, value)
    setSettings((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const saveSettings = () => {
    const result = validateForm(settings)
    if (result.success) {
      try {
        localStorage.setItem("system-settings", JSON.stringify(settings))
        setHasUnsavedChanges(false)
        clearErrors()
        toast.success("System settings saved successfully")
      } catch (error) {
        console.error("Failed to save system settings:", error)
        toast.error("Failed to save system settings")
      }
    } else {
      toast.error("Please fix validation errors before saving")
    }
  }

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all system settings to defaults?")) {
      setSettings(defaultSettings)
      setHasUnsavedChanges(true)
      clearErrors()
      toast.success("Settings reset to defaults")
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Summary */}
      {hasErrors && <FormErrorSummary errors={errors} />}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">System Configuration</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">General system settings and performance tuning</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isValidating || hasErrors} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={settings.theme} onValueChange={(value: any) => handleFieldChange("theme", value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormError error={getFieldError("theme")} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reduce spacing and padding for more content</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleFieldChange("compactMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Agent Avatars</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Display agent icons in conversations</p>
            </div>
            <Switch
              checked={settings.showAgentAvatars}
              onCheckedChange={(checked) => handleFieldChange("showAgentAvatars", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Animated Transitions</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enable smooth animations and transitions</p>
            </div>
            <Switch
              checked={settings.animatedTransitions}
              onCheckedChange={(checked) => handleFieldChange("animatedTransitions", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>Optimize system performance and resource usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Max Concurrent Sessions</Label>
              <span className="text-sm text-slate-600 dark:text-slate-400">{settings.maxConcurrentSessions}</span>
            </div>
            <Slider
              value={[settings.maxConcurrentSessions]}
              onValueChange={([value]) => handleFieldChange("maxConcurrentSessions", value)}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
            <FormError error={getFieldError("maxConcurrentSessions")} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maximum number of chat sessions to keep in memory
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="message-limit">Messages per Session</Label>
              <Input
                id="message-limit"
                type="number"
                value={settings.messagesPerSession}
                onChange={(e) => handleFieldChange("messagesPerSession", Number.parseInt(e.target.value) || 50)}
                min={50}
                max={2000}
              />
              <FormError error={getFieldError("messagesPerSession")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cache-size">Cache Size (MB)</Label>
              <Input
                id="cache-size"
                type="number"
                value={settings.cacheSize}
                onChange={(e) => handleFieldChange("cacheSize", Number.parseInt(e.target.value) || 50)}
                min={50}
                max={500}
              />
              <FormError error={getFieldError("cacheSize")} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Preload Agent Models</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Keep frequently used models in memory</p>
            </div>
            <Switch
              checked={settings.preloadModels}
              onCheckedChange={(checked) => handleFieldChange("preloadModels", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Background Processing</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Process tasks in background for better responsiveness
              </p>
            </div>
            <Switch
              checked={settings.backgroundProcessing}
              onCheckedChange={(checked) => handleFieldChange("backgroundProcessing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Save & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Auto-Save & Backup
          </CardTitle>
          <CardDescription>Configure automatic saving and backup settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Save Conversations</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically save conversations as you type</p>
            </div>
            <Switch checked={settings.autoSave} onCheckedChange={(checked) => handleFieldChange("autoSave", checked)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="save-interval">Save Interval (seconds)</Label>
              <Input
                id="save-interval"
                type="number"
                value={settings.saveInterval}
                onChange={(e) => handleFieldChange("saveInterval", Number.parseInt(e.target.value) || 10)}
                min={10}
                max={300}
                disabled={!settings.autoSave}
              />
              <FormError error={getFieldError("saveInterval")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select
                value={settings.backupFrequency}
                onValueChange={(value: any) => handleFieldChange("backupFrequency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <FormError error={getFieldError("backupFrequency")} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Cleanup Old Data</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically remove old conversations and logs
              </p>
            </div>
            <Switch
              checked={settings.autoCleanup}
              onCheckedChange={(checked) => handleFieldChange("autoCleanup", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention-days">Data Retention (days)</Label>
            <Input
              id="retention-days"
              type="number"
              value={settings.retentionDays}
              onChange={(e) => handleFieldChange("retentionDays", Number.parseInt(e.target.value) || 7)}
              min={7}
              max={365}
              disabled={!settings.autoCleanup}
            />
            <FormError error={getFieldError("retentionDays")} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Notifications</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications for important events</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => handleFieldChange("notifications", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Sound</Label>
            <Select
              value={settings.notificationSound}
              onValueChange={(value: any) => handleFieldChange("notificationSound", value)}
              disabled={!settings.notifications}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="subtle">Subtle</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="prominent">Prominent</SelectItem>
              </SelectContent>
            </Select>
            <FormError error={getFieldError("notificationSound")} />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status and resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">v0.2.1</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Version</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">45.2 MB</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Storage Used</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Agents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

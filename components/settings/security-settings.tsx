"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, Eye, EyeOff, Lock, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function SecuritySettings() {
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [auditLogging, setAuditLogging] = useState(false)

  return (
    <div className="space-y-6">
      {/* Data Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Data Encryption
          </CardTitle>
          <CardDescription>Configure encryption settings for sensitive data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Encrypt Local Storage</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Encrypt conversations and settings stored locally
              </p>
            </div>
            <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Encrypt API Communications</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Use TLS encryption for all API requests</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Encryption Algorithm</Label>
            <Select defaultValue="aes-256">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aes-256">AES-256</SelectItem>
                <SelectItem value="aes-128">AES-128</SelectItem>
                <SelectItem value="chacha20">ChaCha20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {encryptionEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Encryption is enabled. Your data is protected with industry-standard encryption.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Security
          </CardTitle>
          <CardDescription>Manage how API keys are stored and accessed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show API Keys</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Display API keys in plain text (for debugging)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showApiKeys} onCheckedChange={setShowApiKeys} />
              {showApiKeys ? <Eye className="h-4 w-4 text-slate-400" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Clear Clipboard</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clear clipboard after copying sensitive data</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-rotation">Key Rotation Reminder (days)</Label>
            <Input id="key-rotation" type="number" defaultValue="90" min={30} max={365} />
            <p className="text-xs text-slate-500 dark:text-slate-400">Remind to rotate API keys every N days</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Validate API Keys</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Test API keys before saving</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Security
          </CardTitle>
          <CardDescription>Configure session timeout and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Session Timeout</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically clear sensitive data after inactivity
              </p>
            </div>
            <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout-duration">Timeout Duration (minutes)</Label>
              <Input
                id="timeout-duration"
                type="number"
                defaultValue="30"
                min={5}
                max={480}
                disabled={!sessionTimeout}
              />
            </div>

            <div className="space-y-2">
              <Label>Timeout Action</Label>
              <Select defaultValue="clear-keys" disabled={!sessionTimeout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear-keys">Clear API Keys</SelectItem>
                  <SelectItem value="clear-all">Clear All Data</SelectItem>
                  <SelectItem value="lock-app">Lock Application</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Secure Browser Storage</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Use secure storage mechanisms when available</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>Control what data is collected and how it's used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Collection</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Collect anonymous usage statistics</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Error Reporting</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Send error reports to help improve the application
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Conversation Logging</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Log conversations for debugging (stored locally only)
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Share Usage Data</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Share anonymized usage patterns with LLM providers
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Audit & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Audit & Compliance
          </CardTitle>
          <CardDescription>Configure audit logging and compliance features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Audit Logging</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Log all security-related events</p>
            </div>
            <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
          </div>

          <div className="space-y-2">
            <Label>Compliance Mode</Label>
            <Select defaultValue="standard">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="gdpr">GDPR Compliant</SelectItem>
                <SelectItem value="hipaa">HIPAA Compliant</SelectItem>
                <SelectItem value="sox">SOX Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Data Retention Limits</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enforce automatic data deletion policies</p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
            <Input id="audit-retention" type="number" defaultValue="365" min={30} max={2555} disabled={!auditLogging} />
          </div>

          {auditLogging && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Audit logging is enabled. All security events will be recorded.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Current security configuration overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Encryption Active</div>
                <div className="text-sm text-green-600 dark:text-green-400">Data is encrypted</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Secure Storage</div>
                <div className="text-sm text-green-600 dark:text-green-400">Using secure mechanisms</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800 dark:text-yellow-200">API Keys Visible</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Consider hiding for security</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Shield className="h-5 w-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">Session Timeout</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">30 minutes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

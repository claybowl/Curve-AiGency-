"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  Cloud,
  Archive,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react"

export default function DataSettings() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [cloudSync, setCloudSync] = useState(false)
  const [compressionEnabled, setCompressionEnabled] = useState(true)

  const handleExportData = () => {
    // Simulate data export
    console.log("Exporting data...")
  }

  const handleImportData = () => {
    // Simulate data import
    console.log("Importing data...")
  }

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      console.log("Clearing all data...")
    }
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>Current storage usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Local Storage Used</span>
              <span>45.2 MB / 100 MB</span>
            </div>
            <Progress value={45.2} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">1,247</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Messages</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">23</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Sessions</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Agents</div>
            </div>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Storage usage is within normal limits. Consider enabling compression to save space.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Backup & Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Backup & Sync
          </CardTitle>
          <CardDescription>Configure automatic backups and cloud synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Backup</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically backup data to local storage</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select defaultValue="daily" disabled={!autoBackup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-retention">Keep Backups (days)</Label>
              <Input id="backup-retention" type="number" defaultValue="30" min={1} max={365} disabled={!autoBackup} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Cloud Synchronization</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sync data across devices (requires cloud provider)
              </p>
            </div>
            <Switch checked={cloudSync} onCheckedChange={setCloudSync} />
          </div>

          <div className="space-y-2">
            <Label>Cloud Provider</Label>
            <Select defaultValue="none" disabled={!cloudSync}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Provider</SelectItem>
                <SelectItem value="google-drive">Google Drive</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="onedrive">OneDrive</SelectItem>
                <SelectItem value="icloud">iCloud</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cloudSync && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cloud sync is enabled but not configured. Please select a provider and authenticate.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Import, export, and manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} className="gap-2">
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="outline" onClick={handleImportData} className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select defaultValue="json">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Sensitive Data</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Include API keys and other sensitive information in exports
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compress Exports</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">Compress exported files to save space</p>
            </div>
            <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-red-600 dark:text-red-400">Danger Zone</Label>
            <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will permanently delete all conversations, settings, and agent configurations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>Configure how long different types of data are kept</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conversation-retention">Conversations (days)</Label>
              <Input id="conversation-retention" type="number" defaultValue="90" min={1} max={365} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-retention">System Logs (days)</Label>
              <Input id="log-retention" type="number" defaultValue="30" min={1} max={90} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-retention">Inactive Sessions (days)</Label>
              <Input id="session-retention" type="number" defaultValue="7" min={1} max={30} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp-retention">Temporary Files (hours)</Label>
              <Input id="temp-retention" type="number" defaultValue="24" min={1} max={168} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Delete Expired Data</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically remove data that exceeds retention periods
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Warn Before Deletion</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Show warning before automatically deleting data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Data Activity
          </CardTitle>
          <CardDescription>Recent data operations and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Data Export</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Exported 23 sessions</div>
                </div>
              </div>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Auto Backup</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Backup completed successfully</div>
                </div>
              </div>
              <Badge variant="secondary">1 day ago</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-red-600" />
                <div>
                  <div className="font-medium text-sm">Data Cleanup</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Removed 5 expired sessions</div>
                </div>
              </div>
              <Badge variant="secondary">3 days ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

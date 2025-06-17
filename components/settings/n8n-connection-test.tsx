"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TestTube, CheckCircle2, XCircle, Clock, Loader2, Wifi, WifiOff, Shield, ShieldOff, Globe } from "lucide-react"
import { toast } from "sonner"

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: string
  response?: string
  responseTime?: number
  webhookUrl?: string
  hasApiKey?: boolean
}

export default function N8NConnectionTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null)

  const testConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/n8n/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      setTestResult(result)
      setLastTestTime(new Date())

      if (result.success) {
        toast.success("n8n connection test successful!")
      } else {
        toast.error("n8n connection test failed")
      }
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Failed to reach the test endpoint",
      }
      setTestResult(errorResult)
      setLastTestTime(new Date())
      toast.error("Connection test failed")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600"
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          n8n Webhook Connection Test
        </CardTitle>
        <CardDescription>Test the connection to your n8n webhook to ensure proper integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Connection Status</h3>
            <p className="text-sm text-muted-foreground">
              {lastTestTime ? `Last tested: ${lastTestTime.toLocaleString()}` : "Not tested yet"}
            </p>
          </div>
          <Button onClick={testConnection} disabled={isTestingConnection} className="gap-2">
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            <Separator />

            {/* Status Overview */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResult.success)}
                <div>
                  <h4 className={`font-medium ${getStatusColor(testResult.success)}`}>
                    {testResult.success ? "Connection Successful" : "Connection Failed"}
                  </h4>
                  <p className="text-sm text-muted-foreground">{testResult.message || testResult.error}</p>
                </div>
              </div>
              {testResult.responseTime && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {testResult.responseTime}ms
                </Badge>
              )}
            </div>

            {/* Connection Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Globe className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Webhook URL</p>
                  <p className="text-sm font-mono truncate">
                    {testResult.webhookUrl
                      ? testResult.webhookUrl.length > 30
                        ? `${testResult.webhookUrl.substring(0, 30)}...`
                        : testResult.webhookUrl
                      : "Not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {testResult.hasApiKey ? (
                  <Shield className="h-4 w-4 text-green-600" />
                ) : (
                  <ShieldOff className="h-4 w-4 text-yellow-600" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">API Key</p>
                  <p className="text-sm">{testResult.hasApiKey ? "Configured" : "Not configured"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {testResult.success ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm">{testResult.success ? "Connected" : "Disconnected"}</p>
                </div>
              </div>
            </div>

            {/* Response Details */}
            {testResult.success && testResult.response && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Response:</strong> {testResult.response}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Details */}
            {!testResult.success && testResult.details && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error Details:</strong> {testResult.details}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="space-y-3">
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Troubleshooting</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Ensure your n8n webhook URL is correctly set in environment variables</p>
              <p>• Verify your n8n workflow is active and listening for webhooks</p>
              <p>
                • Check that your n8n workflow returns the expected JSON format: <code>{"{ response: '...' }"}</code>
              </p>
              <p>• If using an API key, make sure it matches what your n8n workflow expects</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

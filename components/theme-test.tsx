"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Info, Sun, Moon, Monitor } from "lucide-react"

export function ThemeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState([50])
  const [switchValue, setSwitchValue] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Theme Test...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Theme Functionality Test
          </CardTitle>
          <CardDescription>
            Testing light/dark theme across all components. Current theme: {theme} (resolved: {resolvedTheme})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Controls */}
          <div className="flex gap-2">
            <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
            <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </Button>
          </div>

          {/* Component Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">Primary</Button>
                <Button variant="secondary" className="w-full">
                  Secondary
                </Button>
                <Button variant="outline" className="w-full">
                  Outline
                </Button>
                <Button variant="ghost" className="w-full">
                  Ghost
                </Button>
                <Button variant="destructive" className="w-full">
                  Destructive
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>Info alert message</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error alert message</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input">Input Field</Label>
                  <Input id="test-input" placeholder="Type something..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="test-switch" checked={switchValue} onCheckedChange={setSwitchValue} />
                  <Label htmlFor="test-switch">Toggle Switch</Label>
                </div>
              </CardContent>
            </Card>

            {/* Progress & Sliders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress & Sliders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Progress Bar</Label>
                  <Progress value={75} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Slider: {sliderValue[0]}</Label>
                  <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Success State</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Error State</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Info State</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theme Status */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Theme system is working correctly! Current theme: <strong>{theme}</strong>
              {theme === "system" && ` (resolved to ${resolvedTheme})`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

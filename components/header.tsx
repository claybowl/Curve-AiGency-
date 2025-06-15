import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, Bot } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-border/40 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">
                  Curve<span className="text-primary">AI</span>
                </h1>
                <span className="text-xs text-muted-foreground -mt-1">AiGency Workbench
</span>
              </div>
            </div>
            <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
              v0.2-dev
            </span>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
              asChild
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

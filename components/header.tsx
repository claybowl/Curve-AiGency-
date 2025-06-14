import { Button } from "@/components/ui/button"
import { Cog, HelpCircle, Bot } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Enhanced Super Agent</h1>
        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
          v0.2-dev
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link href="/settings">
            <Cog className="h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </div>
    </header>
  )
}

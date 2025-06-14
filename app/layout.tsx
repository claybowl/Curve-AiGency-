import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have a theme provider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Enhanced Super Agent Workbench",
  description: "Advanced AI agent management and interaction platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}

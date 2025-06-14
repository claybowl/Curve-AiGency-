import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormErrorProps {
  error?: string
  className?: string
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null

  return (
    <div className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className || ""}`}>
      <div className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, string[]>
  className?: string
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([, messages]) => messages.length > 0)

  if (errorEntries.length === 0) return null

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Please fix the following errors:</div>
        <ul className="list-disc list-inside space-y-1">
          {errorEntries.map(([field, messages]) => (
            <li key={field} className="text-sm">
              <span className="font-medium capitalize">{field.replace(/([A-Z])/g, " $1").toLowerCase()}:</span>{" "}
              {messages[0]}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

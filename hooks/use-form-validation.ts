"use client"

import { useState, useCallback } from "react"
import { z } from "zod"
import { validateData, validateField, type ValidationResult } from "@/lib/validation"

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onValidSubmit?: (data: T) => void | Promise<void>
  validateOnChange?: boolean
}

export function useFormValidation<T>({ schema, onValidSubmit, validateOnChange = true }: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  const validateForm = useCallback(
    (data: unknown): ValidationResult<T> => {
      const result = validateData(schema, data)
      setErrors(result.errors || {})
      setHasValidated(true)
      return result
    },
    [schema],
  )

  const validateSingleField = useCallback(
    (fieldPath: string, value: unknown) => {
      if (!validateOnChange && !hasValidated) return

      try {
        // Get the field schema from the main schema
        const fieldSchema = getFieldSchema(schema, fieldPath)
        if (fieldSchema) {
          const result = validateField(fieldSchema, value)
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (result.isValid) {
              delete newErrors[fieldPath]
            } else {
              newErrors[fieldPath] = [result.error || "Invalid value"]
            }
            return newErrors
          })
        }
      } catch (error) {
        // If we can't validate the field individually, skip it
      }
    },
    [schema, validateOnChange, hasValidated],
  )

  const handleSubmit = useCallback(
    async (data: unknown) => {
      setIsValidating(true)
      try {
        const result = validateForm(data)
        if (result.success && result.data && onValidSubmit) {
          await onValidSubmit(result.data)
        }
        return result
      } finally {
        setIsValidating(false)
      }
    },
    [validateForm, onValidSubmit],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setHasValidated(false)
  }, [])

  const getFieldError = useCallback(
    (fieldPath: string): string | undefined => {
      return errors[fieldPath]?.[0]
    },
    [errors],
  )

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    isValidating,
    hasValidated,
    hasErrors,
    validateForm,
    validateSingleField,
    handleSubmit,
    clearErrors,
    getFieldError,
  }
}

// Helper function to extract field schema from main schema
function getFieldSchema(schema: z.ZodSchema<any>, fieldPath: string): z.ZodSchema<any> | null {
  try {
    const pathParts = fieldPath.split(".")
    let currentSchema = schema

    for (const part of pathParts) {
      if (currentSchema instanceof z.ZodObject) {
        const shape = currentSchema.shape
        currentSchema = shape[part]
      } else if (currentSchema instanceof z.ZodArray) {
        // For array indices, get the element schema
        if (!isNaN(Number(part))) {
          currentSchema = currentSchema.element
        } else {
          return null
        }
      } else {
        return null
      }
    }

    return currentSchema || null
  } catch {
    return null
  }
}

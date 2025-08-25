import { z } from 'zod'

import { VALIDATION_RULES } from '../constants/api'
import type { ValidationResult } from '../types/token'

export const swapFormSchema = z.object({
  fromToken: z.string().min(1, 'Please select a token to swap from'),
  toToken: z.string().min(1, 'Please select a token to swap to'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Please enter a valid amount')
    .refine(val => {
      const num = parseFloat(val)
      return num >= VALIDATION_RULES.MIN_AMOUNT
    }, `Minimum amount is ${VALIDATION_RULES.MIN_AMOUNT}`)
    .refine(val => {
      const num = parseFloat(val)
      return num <= VALIDATION_RULES.MAX_AMOUNT
    }, `Maximum amount is ${VALIDATION_RULES.MAX_AMOUNT.toLocaleString()}`)
    .refine(val => {
      const decimalPart = val.split('.')[1]
      return !decimalPart || decimalPart.length <= VALIDATION_RULES.MAX_DECIMALS
    }, `Maximum ${VALIDATION_RULES.MAX_DECIMALS} decimal places allowed`),
})

export function validateSwapForm(data: {
  fromToken: string
  toToken: string
  amount: string
}): ValidationResult {
  try {
    swapFormSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      for (const err of error.issues) {
        const field = String(err.path[0])
        errors[field] = err.message
      }
      return { isValid: false, errors }
    }

    return {
      isValid: false,
      errors: { general: 'Validation failed' },
    }
  }
}

export function validateAmount(amount: string): {
  isValid: boolean
  error?: string
} {
  if (!amount) {
    return { isValid: false, error: 'Amount is required' }
  }

  const num = parseFloat(amount)

  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Please enter a valid amount' }
  }

  if (num < VALIDATION_RULES.MIN_AMOUNT) {
    return {
      isValid: false,
      error: `Minimum amount is ${VALIDATION_RULES.MIN_AMOUNT}`,
    }
  }

  if (num > VALIDATION_RULES.MAX_AMOUNT) {
    return {
      isValid: false,
      error: `Maximum amount is ${VALIDATION_RULES.MAX_AMOUNT.toLocaleString()}`,
    }
  }

  const decimalPart = amount.split('.')[1]
  if (decimalPart && decimalPart.length > VALIDATION_RULES.MAX_DECIMALS) {
    return {
      isValid: false,
      error: `Maximum ${VALIDATION_RULES.MAX_DECIMALS} decimal places allowed`,
    }
  }

  return { isValid: true }
}

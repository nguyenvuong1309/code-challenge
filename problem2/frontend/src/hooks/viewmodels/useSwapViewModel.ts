import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'

import { tokenService } from '../../lib/api/tokenService'
import { ANIMATION_DURATION } from '../../lib/constants/api'
import type {
  Token,
  SwapState,
  SwapRequest,
  SwapResult,
} from '../../lib/types/token'
import { validateAmount } from '../../lib/utils/validation'
import { useTokens } from '../api/useTokens'
import { useDebounce } from '../utils/useDebounce'

interface UseSwapViewModelReturn extends SwapState {
  // Computed values
  isValid: boolean
  estimatedOutput: string
  exchangeRateFormatted: string

  // Actions
  setFromToken: (token: Token) => void
  setToToken: (token: Token) => void
  setFromAmount: (amount: string) => void
  swapTokens: () => void
  executeSwap: () => Promise<void>
  clearErrors: () => void

  // Data
  tokens: Token[]
  tokensLoading: boolean
  tokensError: string | null
  retryLoadTokens: () => void
}

export function useSwapViewModel(): UseSwapViewModelReturn {
  const {
    data: tokens = [],
    isLoading: tokensLoading,
    error: tokensQueryError,
    refetch,
  } = useTokens()

  const [state, setState] = useState<SwapState>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
    exchangeRate: 0,
    isLoading: false,
    isSwapping: false,
    errors: {},
  })

  // Debounce amount input for better UX
  const debouncedAmount = useDebounce(state.fromAmount, 300)

  // Calculate exchange rate and output amount
  useEffect(() => {
    if (state.fromToken && state.toToken && debouncedAmount) {
      const rate = tokenService.calculateExchangeRate(
        state.fromToken,
        state.toToken
      )
      const outputAmount = (parseFloat(debouncedAmount) * rate).toString()

      setState(prev => ({
        ...prev,
        exchangeRate: rate,
        toAmount: outputAmount,
      }))
    } else {
      setState(prev => ({
        ...prev,
        exchangeRate: 0,
        toAmount: '',
      }))
    }
  }, [state.fromToken, state.toToken, debouncedAmount])

  // Validate amount on change
  useEffect(() => {
    if (state.fromAmount) {
      const validation = validateAmount(state.fromAmount)
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          amount: validation.isValid ? undefined : validation.error,
        },
      }))
    } else {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          amount: undefined,
        },
      }))
    }
  }, [state.fromAmount])

  // Computed values
  const isValid = useMemo(() => {
    return Boolean(
      state.fromToken &&
        state.toToken &&
        state.fromAmount &&
        parseFloat(state.fromAmount) > 0 &&
        !state.errors.amount &&
        !state.isSwapping
    )
  }, [
    state.fromToken,
    state.toToken,
    state.fromAmount,
    state.errors.amount,
    state.isSwapping,
  ])

  const estimatedOutput = useMemo(() => {
    if (!state.toAmount || !state.toToken) return '0.000000'
    const formatted = parseFloat(state.toAmount).toFixed(6)
    return formatted
  }, [state.toAmount, state.toToken])

  const exchangeRateFormatted = useMemo(() => {
    if (!state.fromToken || !state.toToken || !state.exchangeRate) return ''
    return `1 ${state.fromToken.symbol} = ${state.exchangeRate.toFixed(6)} ${state.toToken.symbol}`
  }, [state.fromToken, state.toToken, state.exchangeRate])

  // Actions
  const setFromToken = useCallback((token: Token) => {
    setState(prev => ({
      ...prev,
      fromToken: token,
      errors: { ...prev.errors, fromToken: undefined },
    }))
  }, [])

  const setToToken = useCallback((token: Token) => {
    setState(prev => ({
      ...prev,
      toToken: token,
      errors: { ...prev.errors, toToken: undefined },
    }))
  }, [])

  const setFromAmount = useCallback((amount: string) => {
    setState(prev => ({
      ...prev,
      fromAmount: amount,
    }))
  }, [])

  const swapTokens = useCallback(() => {
    setState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }))
  }, [])

  const executeSwap = useCallback(async (): Promise<void> => {
    if (!isValid || !state.fromToken || !state.toToken) return

    setState(prev => ({ ...prev, isSwapping: true }))

    try {
      // Simulate API call with loading delay
      await new Promise(resolve =>
        setTimeout(resolve, ANIMATION_DURATION.SWAP_SIMULATION)
      )

      // Mock swap logic - in real app this would call backend
      const swapRequest: SwapRequest = {
        fromToken: state.fromToken,
        toToken: state.toToken,
        amount: parseFloat(state.fromAmount),
      }

      // Use swapRequest in simulation (in real app would send to API)
      console.log('Swap request:', swapRequest)

      // Simulate successful swap
      const result: SwapResult = {
        success: true,
        message: 'Swap completed successfully!',
        transactionHash: `0x${Math.random().toString(16).substr(2, 8)}`,
      }

      if (result.success) {
        toast.success(result.message ?? 'Swap successful!')

        // Reset form
        setState(prev => ({
          ...prev,
          fromAmount: '',
          toAmount: '',
          exchangeRate: 0,
          isSwapping: false,
          errors: {},
        }))
      } else {
        throw new Error(result.message ?? 'Swap failed')
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message ?? 'Swap failed. Please try again.'

      toast.error(errorMessage)
      setState(prev => ({
        ...prev,
        isSwapping: false,
        errors: { ...prev.errors, general: errorMessage },
      }))
    }
  }, [isValid, state.fromToken, state.toToken, state.fromAmount])

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }))
  }, [])

  const retryLoadTokens = useCallback(() => {
    void refetch()
  }, [refetch])

  // Error handling for tokens
  const tokensError = tokensQueryError
    ? (tokensQueryError.message ?? 'Failed to load tokens')
    : null

  return {
    // State
    ...state,

    // Computed
    isValid,
    estimatedOutput,
    exchangeRateFormatted,

    // Actions
    setFromToken,
    setToToken,
    setFromAmount,
    swapTokens,
    executeSwap,
    clearErrors,

    // Data
    tokens,
    tokensLoading,
    tokensError,
    retryLoadTokens,
  }
}

export interface TokenPriceData {
  currency: string
  date: string
  price: number
}

export interface Token {
  symbol: string
  price: number
  iconUrl: string
}

export interface SwapRequest {
  fromToken: Token
  toToken: Token
  amount: number
}

export interface SwapResult {
  success: boolean
  message?: string
  transactionHash?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface SwapState {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
  toAmount: string
  exchangeRate: number
  isLoading: boolean
  isSwapping: boolean
  errors: Record<string, string | undefined>
}

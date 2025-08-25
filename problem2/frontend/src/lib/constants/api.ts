export const API_ENDPOINTS = {
  PRICES: 'https://interview.switcheo.com/prices.json',
  TOKEN_ICON: (symbol: string) =>
    `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`,
} as const

export const RETRY_CONFIG = {
  attempts: 3,
  delays: [1000, 2000, 4000], // 1s, 2s, 4s
  shouldRetry: (error: { status?: number }) => {
    // Retry on network errors, not on client errors (4xx)
    return !error.status || error.status >= 500
  },
}

export const VALIDATION_RULES = {
  MIN_AMOUNT: 0.001,
  MAX_AMOUNT: 10000000,
  MAX_DECIMALS: 8,
} as const

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SWAP_SIMULATION: 2500,
} as const

import axios, { AxiosError } from 'axios'

import { API_ENDPOINTS, RETRY_CONFIG } from '../constants/api'
import type { ApiError, RetryConfig } from '../types/error'
import type { TokenPriceData, Token } from '../types/token'

class TokenService {
  private cache: Token[] | null = null
  private cacheTimestamp = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private createApiError(error: AxiosError | Error): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message:
          (error.response?.data as { message?: string })?.message ??
          error.message ??
          'API request failed',
        code: error.code,
        status: error.response?.status,
      }
    }

    return {
      message: error.message ?? 'Unknown error occurred',
    }
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    config: RetryConfig = RETRY_CONFIG
  ): Promise<T> {
    let lastError: ApiError | undefined

    for (let attempt = 0; attempt < config.attempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = this.createApiError(error as AxiosError)

        if (attempt === config.attempts - 1) {
          throw new Error(lastError.message)
        }

        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          throw new Error(lastError.message)
        }

        await this.delay(config.delays[attempt])
      }
    }

    if (lastError) {
      throw new Error(lastError.message)
    }
    throw new Error('Request failed')
  }

  async fetchTokenPrices(): Promise<Token[]> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache
    }

    const tokens = await this.retryRequest(async () => {
      const response = await axios.get<TokenPriceData[]>(API_ENDPOINTS.PRICES, {
        timeout: 10000,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format')
      }

      return response.data
        .map(
          (item): Token => ({
            symbol: item.currency,
            price: item.price,
            iconUrl: API_ENDPOINTS.TOKEN_ICON(item.currency),
          })
        )
        .sort((a, b) => a.symbol.localeCompare(b.symbol)) // Sort alphabetically
    })

    // Update cache
    this.cache = tokens
    this.cacheTimestamp = Date.now()

    return tokens
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    const tokens = await this.fetchTokenPrices()
    return tokens.find(token => token.symbol === symbol) ?? null
  }

  calculateExchangeRate(fromToken: Token, toToken: Token): number {
    if (!fromToken || !toToken) return 0
    return fromToken.price / toToken.price
  }

  // Clear cache - useful for testing or force refresh
  clearCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
  }
}

export const tokenService = new TokenService()

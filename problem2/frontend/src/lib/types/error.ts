export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface RetryConfig {
  attempts: number
  delays: number[]
  shouldRetry?: (error: ApiError) => boolean
}

export interface NetworkError extends ApiError {
  isNetworkError: true
  canRetry: boolean
}

export interface ValidationError {
  field: string
  message: string
}

export interface ErrorState {
  hasError: boolean
  error: ApiError | null
  retryCount: number
}

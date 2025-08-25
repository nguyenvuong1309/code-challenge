import { useQuery } from '@tanstack/react-query'

import { tokenService } from '../../lib/api/tokenService'
import type { Token } from '../../lib/types/token'

export function useTokens() {
  return useQuery<Token[]>({
    queryKey: ['tokens'],
    queryFn: () => tokenService.fetchTokenPrices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Only retry network errors, not client errors
      const errorWithStatus = error as { status?: number }
      if (
        errorWithStatus?.status &&
        errorWithStatus.status >= 400 &&
        errorWithStatus.status < 500
      ) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

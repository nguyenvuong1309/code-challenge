export function formatNumber(
  value: number | string,
  options: {
    decimals?: number
    compact?: boolean
    currency?: string
  } = {}
): string {
  const { decimals = 6, compact = false, currency } = options
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '0'

  if (compact && num >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    ...(currency && {
      style: 'currency',
      currency,
    }),
  })

  return formatter.format(num)
}

export function formatTokenAmount(
  amount: number | string,
  symbol?: string
): string {
  const formatted = formatNumber(amount, { decimals: 6 })
  return symbol ? `${formatted} ${symbol}` : formatted
}

export function formatPrice(price: number | string, currency = 'USD'): string {
  return formatNumber(price, { decimals: 2, currency })
}

export function formatExchangeRate(
  rate: number,
  fromSymbol: string,
  toSymbol: string
): string {
  const formatted = formatNumber(rate, { decimals: 6 })
  return `1 ${fromSymbol} = ${formatted} ${toSymbol}`
}

export function truncateDecimals(value: string, maxDecimals: number): string {
  if (!value.includes('.')) return value

  const [integerPart, decimalPart] = value.split('.')

  if (decimalPart.length <= maxDecimals) return value

  return `${integerPart}.${decimalPart.slice(0, maxDecimals)}`
}

// Clean input to remove invalid characters for numeric input
export function cleanNumericInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  let cleaned = value.replace(/[^\d.]/g, '')

  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`
  }

  // Remove leading zeros (except for 0.)
  if (
    cleaned.startsWith('00') ||
    (cleaned.startsWith('0') && cleaned[1] !== '.' && cleaned.length > 1)
  ) {
    cleaned = cleaned.replace(/^0+/, '')
    if (cleaned.startsWith('.')) {
      cleaned = `0${cleaned}`
    }
  }

  return cleaned || '0'
}

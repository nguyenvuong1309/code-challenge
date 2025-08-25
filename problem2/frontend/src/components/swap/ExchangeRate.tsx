import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import React from 'react'

import type { Token } from '../../lib/types/token'
import { cn } from '../../lib/utils/cn'

interface ExchangeRateProps {
  fromToken: Token | null
  toToken: Token | null
  rate: number
  className?: string
}

export const ExchangeRate: React.FC<ExchangeRateProps> = ({
  fromToken,
  toToken,
  rate,
  className,
}) => {
  if (!fromToken || !toToken || rate === 0) {
    return null
  }

  const formattedRate = rate.toFixed(6)
  const rateText = `1 ${fromToken.symbol} = ${formattedRate} ${toToken.symbol}`

  // Mock trend for visual appeal (in real app would come from historical data)
  const mockTrend = Math.random() > 0.5 ? 'up' : 'down'
  const mockChange = (Math.random() * 2).toFixed(2)

  return (
    <AnimatePresence>
      <motion.div
        key={`${fromToken.symbol}-${toToken.symbol}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10',
          className
        )}
      >
        <div className='flex items-center gap-2'>
          <motion.div
            className='flex items-center gap-1 text-sm font-medium text-white'
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span>{rateText}</span>
          </motion.div>
        </div>

        <motion.div
          className='flex items-center gap-1 text-xs'
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {mockTrend === 'up' ? (
            <TrendingUp className='w-3 h-3 text-green-500' />
          ) : (
            <TrendingDown className='w-3 h-3 text-red-500' />
          )}
          <span
            className={cn(
              'font-medium',
              mockTrend === 'up' ? 'text-green-500' : 'text-red-500'
            )}
          >
            {mockTrend === 'up' ? '+' : '-'}
            {mockChange}%
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

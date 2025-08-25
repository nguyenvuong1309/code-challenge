import { motion } from 'framer-motion'
import React from 'react'

import { VALIDATION_RULES } from '../../lib/constants/api'
import type { Token } from '../../lib/types/token'
import { cn } from '../../lib/utils/cn'
import { cleanNumericInput, truncateDecimals } from '../../lib/utils/formatting'
import { Input } from '../ui/input'

interface AmountInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  token: Token | null
  error?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
  label?: string
}

export const AmountInput: React.FC<AmountInputProps> = ({
  id,
  value,
  onChange,
  token,
  error,
  placeholder = '0.0',
  disabled = false,
  readOnly = false,
  className,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return

    let inputValue = e.target.value

    // Clean the input to only allow valid numeric characters
    inputValue = cleanNumericInput(inputValue)

    // Truncate to max decimals
    inputValue = truncateDecimals(inputValue, VALIDATION_RULES.MAX_DECIMALS)

    onChange(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].includes(e.keyCode) ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return
    }

    // Ensure that it is a number or decimal point and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 190 &&
      e.keyCode !== 110
    ) {
      e.preventDefault()
    }
  }

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 30 }}
    >
      {label && (
        <label className='text-sm font-semibold text-white/80 tracking-wide'>
          {label}
        </label>
      )}

      <div className='relative group'>
        <Input
          id={id}
          type='text'
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          error={error}
          className={cn(
            'text-xl font-semibold h-14 pr-24 bg-transparent border-white/10',
            'text-white placeholder:text-white/40',
            'focus:border-white/30 focus:ring-2 focus:ring-white/10',
            'transition-all duration-300 rounded-xl',
            readOnly && 'bg-white/5 cursor-default text-white/70',
            error && 'border-red-400/50 focus:border-red-400/60',
            'hover:border-white/20'
          )}
        />

        {token && (
          <motion.div
            className={cn(
              'absolute right-4 top-1/2 transform -translate-y-1/2',
              'flex items-center gap-2 pointer-events-none'
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className='text-sm font-bold text-white/60 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm'>
              {token.symbol}
            </span>
          </motion.div>
        )}

        {!readOnly && value && token && parseFloat(value) > 0 && (
          <motion.div
            className='absolute right-4 top-full mt-2'
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className='bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10'>
              <span className='text-xs font-medium text-white/70'>
                ≈ $
                {(parseFloat(value) * token.price).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                USD
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {readOnly && (
        <motion.div
          className='text-sm text-white/50 flex items-center gap-2 ml-1'
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className='w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse'></div>
          <span className='font-medium'>Estimated output</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          className='text-sm text-red-300 flex items-center gap-2 ml-1'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <svg
            className='w-4 h-4 flex-shrink-0'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  )
}

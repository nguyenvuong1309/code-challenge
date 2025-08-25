import { motion } from 'framer-motion'
import React from 'react'

import { useSwapViewModel } from '../../hooks/viewmodels/useSwapViewModel'
import { NetworkError } from '../error/NetworkError'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

import { AmountInput } from './AmountInput'
import { ExchangeRate } from './ExchangeRate'
import { SwapArrow } from './SwapArrow'
import { SwapButton } from './SwapButton'
import { TokenSelector } from './TokenSelector'

const LoadingSkeleton = () => (
  <div className='space-y-8'>
    {/* From Section */}
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse'></div>
        <Skeleton className='h-5 w-20 bg-white/20 rounded-md' />
      </div>
      <div className='bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl'>
        <div className='flex gap-4'>
          <Skeleton className='h-14 w-44 bg-gradient-to-r from-white/10 to-white/5 rounded-xl' />
          <Skeleton className='h-14 flex-1 bg-gradient-to-r from-white/10 to-white/5 rounded-xl' />
        </div>
      </div>
    </div>

    {/* Swap Arrow */}
    <div className='flex justify-center -my-3 relative z-10'>
      <div className='bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-2 rounded-full shadow-2xl'>
        <Skeleton className='h-12 w-12 rounded-full bg-white/30' />
      </div>
    </div>

    {/* To Section */}
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse'></div>
        <Skeleton className='h-5 w-16 bg-white/20 rounded-md' />
      </div>
      <div className='bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl'>
        <div className='flex gap-4'>
          <Skeleton className='h-14 w-44 bg-gradient-to-r from-white/10 to-white/5 rounded-xl' />
          <Skeleton className='h-14 flex-1 bg-gradient-to-r from-white/10 to-white/5 rounded-xl' />
        </div>
      </div>
    </div>

    {/* Button */}
    <Skeleton className='h-16 w-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-xl' />
  </div>
)

export const SwapForm: React.FC = () => {
  const {
    // State
    fromToken,
    toToken,
    fromAmount,
    isSwapping,
    errors,

    // Computed
    isValid,
    estimatedOutput,
    exchangeRate,

    // Actions
    setFromToken,
    setToToken,
    setFromAmount,
    swapTokens,
    executeSwap,

    // Data
    tokens,
    tokensLoading,
    tokensError,
    retryLoadTokens,
  } = useSwapViewModel()

  // Show network error if tokens failed to load
  if (tokensError && !tokensLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='bg-red-500/10 backdrop-blur-xl border border-red-400/30 rounded-3xl p-8'>
          <NetworkError onRetry={retryLoadTokens} message={tokensError} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: 0.6,
        }}
        className='w-full max-w-lg'
      >
        <Card 
          className='border border-neon-cyan/20 rounded-organic overflow-hidden relative'
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 34, 0.9) 0%, rgba(26, 26, 29, 0.95) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: `
              8px 8px 16px rgba(10, 10, 11, 0.8),
              -8px -8px 16px rgba(42, 42, 47, 0.3),
              0 0 40px rgba(0, 245, 255, 0.1),
              inset 1px 1px 2px rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {/* Header with animated logo */}
          <CardHeader className='text-center pb-8 pt-8'>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
              className='mb-6'
            >
              <div className='relative'>
                <motion.div
                  className='w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30'
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    className='w-10 h-10 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2.5}
                      d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                    />
                  </svg>
                </motion.div>
                <div className='absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse'></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle 
                className='text-4xl font-bold mb-3'
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #00F5FF 30%, #8A2BE2 60%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Inter Variable, system-ui, sans-serif',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 30px rgba(0, 245, 255, 0.3)',
                }}
              >
                <motion.span
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #00F5FF 25%, #8A2BE2 50%, #FFD700 75%, #ffffff 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Token Exchange
                </motion.span>
              </CardTitle>
              <motion.p 
                className='text-base font-medium tracking-wide'
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(0,245,255,0.6) 50%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Inter Variable, system-ui, sans-serif',
                  fontWeight: '500',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                Swap tokens instantly with zero hassle
                <motion.span
                  className="inline-block ml-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 2,
                  }}
                >
                  ✨
                </motion.span>
              </motion.p>
            </motion.div>
          </CardHeader>

          <CardContent className='px-8 pb-8'>
            {tokensLoading ? (
              <LoadingSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='space-y-6'
              >
                {/* From Token Section */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  className='space-y-4'
                >
                  <div className='flex items-center gap-3'>
                    <motion.div 
                      className='w-3 h-3 rounded-full'
                      style={{
                        background: 'linear-gradient(45deg, #10B981, #00F5FF)',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 10px rgba(16, 185, 129, 0.5)',
                          '0 0 20px rgba(0, 245, 255, 0.8)',
                          '0 0 10px rgba(16, 185, 129, 0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <label
                      htmlFor='from-amount'
                      className='text-base font-bold tracking-wide'
                      style={{
                        background: 'linear-gradient(90deg, #ffffff 0%, #00F5FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Inter Variable, system-ui, sans-serif',
                        fontWeight: '700',
                      }}
                    >
                      You Pay
                    </label>
                  </div>
                  <div className='relative group'>
                    <motion.div 
                      className='absolute -inset-1 rounded-liquid opacity-30 group-hover:opacity-50 transition duration-300'
                      style={{
                        background: 'linear-gradient(45deg, rgba(0, 245, 255, 0.3), rgba(16, 185, 129, 0.3))',
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div 
                      className='relative backdrop-blur-xl rounded-liquid p-6 border border-neon-cyan/20'
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 34, 0.8) 0%, rgba(37, 37, 41, 0.6) 100%)',
                        boxShadow: `
                          inset 6px 6px 12px rgba(10, 10, 11, 0.6),
                          inset -6px -6px 12px rgba(42, 42, 47, 0.2),
                          0 0 20px rgba(0, 245, 255, 0.1)
                        `,
                      }}
                    >
                      <div className='flex gap-4'>
                        <TokenSelector
                          value={fromToken}
                          onChange={setFromToken}
                          tokens={tokens}
                          placeholder='Select token'
                          className='w-44'
                        />
                        <AmountInput
                          id='from-amount'
                          value={fromAmount}
                          onChange={setFromAmount}
                          token={fromToken}
                          error={errors.amount}
                          placeholder='0.0'
                          className='flex-1'
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Swap Arrow */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                  className='flex justify-center -my-3 relative z-10'
                >
                  <div className='relative'>
                    <div className='absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur opacity-40 animate-pulse'></div>
                    <div className='relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-2 rounded-full shadow-2xl'>
                      <SwapArrow
                        onClick={swapTokens}
                        disabled={!fromToken || !toToken}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Exchange Rate */}
                {fromToken && toToken && exchangeRate > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className='px-2'
                  >
                    <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-3 border border-white/5'>
                      <ExchangeRate
                        fromToken={fromToken}
                        toToken={toToken}
                        rate={exchangeRate}
                      />
                    </div>
                  </motion.div>
                )}

                {/* To Token Section */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                  className='space-y-4'
                >
                  <div className='flex items-center gap-3'>
                    <motion.div 
                      className='w-3 h-3 rounded-full'
                      style={{
                        background: 'linear-gradient(45deg, #8A2BE2, #FF6B6B)',
                        boxShadow: '0 0 10px rgba(138, 43, 226, 0.5)',
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 10px rgba(138, 43, 226, 0.5)',
                          '0 0 20px rgba(255, 107, 107, 0.8)',
                          '0 0 10px rgba(138, 43, 226, 0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                    <label
                      htmlFor='to-amount'
                      className='text-base font-bold tracking-wide'
                      style={{
                        background: 'linear-gradient(90deg, #ffffff 0%, #8A2BE2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Inter Variable, system-ui, sans-serif',
                        fontWeight: '700',
                      }}
                    >
                      You Receive
                    </label>
                  </div>
                  <div className='relative group'>
                    <motion.div 
                      className='absolute -inset-1 rounded-liquid opacity-30 group-hover:opacity-50 transition duration-300'
                      style={{
                        background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.3), rgba(255, 107, 107, 0.3))',
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                    <div 
                      className='relative backdrop-blur-xl rounded-liquid p-6 border border-neon-purple/20'
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 34, 0.8) 0%, rgba(37, 37, 41, 0.6) 100%)',
                        boxShadow: `
                          inset 6px 6px 12px rgba(10, 10, 11, 0.6),
                          inset -6px -6px 12px rgba(42, 42, 47, 0.2),
                          0 0 20px rgba(138, 43, 226, 0.1)
                        `,
                      }}
                    >
                      <div className='flex gap-4'>
                        <TokenSelector
                          value={toToken}
                          onChange={setToToken}
                          tokens={tokens}
                          placeholder='Select token'
                          className='w-44'
                        />
                        <AmountInput
                          id='to-amount'
                          value={estimatedOutput}
                          onChange={() => {
                            // Read-only - do nothing
                          }}
                          token={toToken}
                          readOnly
                          placeholder='0.0'
                          className='flex-1'
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Error Display */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className='relative'
                  >
                    <div className='absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur opacity-50'></div>
                    <div className='relative p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-sm text-red-200 text-center backdrop-blur-xl'>
                      <div className='flex items-center justify-center gap-3'>
                        <svg
                          className='w-5 h-5 text-red-400'
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
                        <span className='font-medium'>{errors.general}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Swap Button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0, type: 'spring', stiffness: 200 }}
                  className='pt-2'
                >
                  <SwapButton
                    onClick={() => {
                      void executeSwap()
                    }}
                    disabled={!isValid}
                    loading={isSwapping}
                  />
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

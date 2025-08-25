import { motion } from 'framer-motion'
import React from 'react'

import { cn } from '../../lib/utils/cn'
import { Button } from '../ui/button'

interface SwapButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const SwapButton: React.FC<SwapButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  className,
}) => {
  const getButtonText = () => {
    if (loading) return 'Swapping...'
    if (disabled) return 'Enter amount'
    return 'Confirm Swap'
  }

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className='relative group'>
        {/* Multi-layer Holographic Glow System */}
        {!disabled && !loading && (
          <>
            {/* Outer aurora glow */}
            <motion.div 
              className='absolute -inset-2 rounded-organic blur-xl opacity-50'
              style={{
                background: 'linear-gradient(45deg, #00F5FF, #8A2BE2, #FFD700, #00F5FF)',
                backgroundSize: '400% 400%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Inner glow ring */}
            <motion.div 
              className='absolute -inset-1 rounded-liquid blur-lg opacity-60'
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.4), rgba(138,43,226,0.4), rgba(255,215,0,0.4))',
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </>
        )}

        <Button
          onClick={onClick}
          disabled={disabled}
          loading={loading}
          size='lg'
          className={cn(
            'relative w-full text-lg font-bold h-16 rounded-liquid overflow-hidden border-0',
            'bg-neo-dark-surface shadow-neo-outset',
            'transition-all duration-300 transform',
            // Liquid morphing animation class
            !disabled && !loading && 'animate-liquid-morph',
            loading && 'cursor-wait opacity-90',
            disabled && 'cursor-not-allowed opacity-60 shadow-neo-inset'
          )}
          style={{
            background: disabled 
              ? 'linear-gradient(135deg, #2A2A2F 0%, #1E1E22 100%)'
              : loading
                ? 'linear-gradient(135deg, rgba(0,245,255,0.3) 0%, rgba(138,43,226,0.3) 50%, rgba(255,215,0,0.3) 100%)'
                : 'linear-gradient(135deg, #00F5FF 0%, #8A2BE2 50%, #FFD700 100%)',
            boxShadow: disabled
              ? 'inset 8px 8px 16px rgba(10, 10, 11, 0.8), inset -8px -8px 16px rgba(42, 42, 47, 0.3)'
              : '8px 8px 16px rgba(10, 10, 11, 0.8), -8px -8px 16px rgba(42, 42, 47, 0.3), 0 0 30px rgba(0, 245, 255, 0.3)',
          }}
          whileHover={!disabled && !loading ? {
            scale: 1.02,
            y: -2,
            boxShadow: '12px 12px 24px rgba(10, 10, 11, 0.9), -12px -12px 24px rgba(42, 42, 47, 0.4), 0 0 40px rgba(0, 245, 255, 0.4)',
          } : {}}
          whileTap={!disabled && !loading ? {
            scale: 0.98,
            y: 0,
            boxShadow: 'inset 6px 6px 12px rgba(10, 10, 11, 0.7), inset -6px -6px 12px rgba(42, 42, 47, 0.3)',
          } : {}}
        >
          {/* Cyberpunk Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '12px 12px',
              }}
            />
          </div>

          {/* Holographic shine effect */}
          {!disabled && !loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}

          <motion.div
            className='relative z-10 flex items-center justify-center gap-3'
            key={getButtonText()}
            initial={{ opacity: 0, x: loading ? -20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading && (
              <motion.div
                className="relative flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                {/* Custom loading spinner with neon effects */}
                <div className="w-5 h-5 border-2 border-white/20 rounded-full">
                  <div 
                    className="w-full h-full border-2 border-transparent border-t-neon-cyan rounded-full"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))' }}
                  />
                </div>
                
                {/* Spinning particles */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-neon-gold rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 120}deg) translateX(10px) translateY(-50%)`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}

            <span 
              className='tracking-wide text-white font-bold drop-shadow-lg'
              style={{ 
                textShadow: disabled 
                  ? 'none' 
                  : '0 0 8px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Inter Variable, system-ui, sans-serif',
              }}
            >
              {getButtonText()}
            </span>

            {!disabled && !loading && (
              <motion.div
                className="relative"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.svg
                  className='w-5 h-5 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))' }}
                  whileHover={{
                    x: 3,
                    transition: { type: 'spring', stiffness: 400 }
                  }}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2.5}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </motion.svg>
                
                {/* Trailing particles for arrow */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-neon-cyan rounded-full"
                    style={{
                      left: `${-8 - i * 4}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scale: [0.5, 1, 0.5],
                      x: [0, 15, 30],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Success ripple effect */}
          {!disabled && !loading && (
            <motion.div
              className="absolute inset-0 rounded-liquid border-2 border-neon-gold opacity-0 pointer-events-none"
              animate={{
                scale: [1, 1.2, 1.5],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1,
              }}
            />
          )}
        </Button>
      </div>

      {!disabled && !loading && (
        <motion.div
          className='text-center text-sm text-white/50 mt-4 flex items-center justify-center gap-2'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className='flex items-center gap-1'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
            <span className='font-medium'>Secure</span>
          </div>
          <span>•</span>
          <div className='flex items-center gap-1'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
              />
            </svg>
            <span>No fees</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

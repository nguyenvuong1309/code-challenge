import { motion } from 'framer-motion'
import React from 'react'

import { cn } from '../../lib/utils/cn'

interface SwapArrowProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export const SwapArrow: React.FC<SwapArrowProps> = ({
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex justify-center', className)}>
      <motion.button
        type='button'
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative p-4 bg-neo-dark-surface rounded-liquid shadow-neo-outset border border-neon-cyan/20',
          'hover:shadow-neon-glow focus:outline-none focus:ring-2 focus:ring-neon-cyan/40',
          'transition-all duration-300 group overflow-hidden',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        whileHover={
          !disabled
            ? {
                scale: 1.05,
                boxShadow: '0 0 30px rgba(0, 245, 255, 0.4), 0 0 60px rgba(0, 245, 255, 0.2)',
                transition: { type: 'spring', stiffness: 400, damping: 20 },
              }
            : {}
        }
        whileTap={
          !disabled
            ? {
                scale: 0.95,
                boxShadow: 'inset 6px 6px 12px rgba(10, 10, 11, 0.7), inset -6px -6px 12px rgba(42, 42, 47, 0.3)',
                transition: { type: 'spring', stiffness: 600, damping: 25 },
              }
            : {}
        }
      >
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
            }}
          />
        </div>

        {/* Multi-layer Neon Glow Rings */}
        <motion.div
          className='absolute -inset-2 rounded-liquid'
          style={{
            background: 'linear-gradient(45deg, rgba(0, 245, 255, 0.3), rgba(138, 43, 226, 0.3), rgba(255, 215, 0, 0.3))',
            filter: 'blur(8px)',
          }}
          animate={
            !disabled
              ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [0, 180, 360],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />

        {/* Secondary Glow Layer */}
        <motion.div
          className='absolute -inset-1 rounded-liquid bg-gradient-to-r from-neon-cyan/40 via-neon-purple/40 to-neon-gold/40 blur-md'
          animate={
            !disabled
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.9, 0.5],
                  rotate: [360, 180, 0],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* Holographic Border Effect */}
        <motion.div
          className="absolute inset-0 rounded-liquid border border-transparent"
          style={{
            background: 'linear-gradient(45deg, #00F5FF, #8A2BE2, #FFD700, #00F5FF) border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'subtract',
            maskComposite: 'subtract',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />

        {/* Main Icon Container */}
        <motion.div
          className='relative z-20 flex items-center justify-center w-8 h-8'
          animate={
            !disabled
              ? {
                  rotateY: [0, 180, 360],
                }
              : {}
          }
          whileHover={
            !disabled
              ? {
                  rotateY: 180,
                  transition: { duration: 0.6, type: 'spring', stiffness: 200 },
                }
              : {}
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        >
          {/* Premium Multi-Layer Arrow Icon */}
          <svg
            className='w-7 h-7 text-neon-cyan group-hover:text-white transition-colors duration-300 drop-shadow-lg'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))' }}
          >
            {/* Animated Path Layers */}
            <motion.path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M7 16l5-5 5 5M7 8l5-5 5 5'
              className="opacity-60"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
            />
            <motion.path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 7h8m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut', delay: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Floating Particles */}
        {!disabled && Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full"
            style={{
              left: `${30 + i * 20}%`,
              top: `${40 + i * 10}%`,
            }}
            animate={{
              x: [0, 10, -5, 15, 0],
              y: [0, -8, 5, -12, 0],
              opacity: [0.4, 0.8, 0.3, 0.9, 0.4],
              scale: [0.8, 1.2, 0.6, 1.4, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Inner Liquid Pulse Effect */}
        {!disabled && (
          <motion.div
            className='absolute inset-3 rounded-liquid bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-gold/20'
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.8, 0.2],
              borderRadius: ['20px', '30px 10px 25px 15px', '15px 25px 20px 30px', '20px'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Success Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-liquid border-2 border-neon-cyan opacity-0"
          animate={!disabled ? {
            scale: [1, 1.5, 2],
            opacity: [0, 0.6, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 1,
          }}
        />
      </motion.button>
    </div>
  )
}

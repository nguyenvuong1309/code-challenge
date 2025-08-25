import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, AlertCircle } from 'lucide-react'
import React, { useState, useMemo } from 'react'

import type { Token } from '../../lib/types/token'
import { cn } from '../../lib/utils/cn'

interface TokenIconProps {
  token: Token
  size?: 'sm' | 'md' | 'lg'
}

const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 'md' }) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  if (imageError) {
    return (
      <motion.div
        className={cn(
          'rounded-full relative overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-neon-glow',
          sizeClasses[size]
        )}
        style={{
          background: 'linear-gradient(135deg, #00F5FF 0%, #8A2BE2 50%, #FFD700 100%)',
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
            `,
            backgroundSize: '4px 4px',
            backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
          }}
          animate={{
            backgroundPosition: [
              '0 0, 0 2px, 2px -2px, -2px 0px',
              '4px 4px, 4px 6px, 6px 2px, 2px 4px'
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Glowing border */}
        <div className="absolute inset-0 rounded-full border border-white/30 shadow-inner" />
        
        {/* Token symbol */}
        <span className="relative z-10 font-bold tracking-wider drop-shadow-lg">
          {token.symbol.slice(0, 2)}
        </span>

        {/* Particle effects */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${20 + i * 40}%`,
              top: `${25 + i * 30}%`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.9, 0.3],
              x: [0, 3, 0],
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn('relative', sizeClasses[size])}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <img
        src={token.iconUrl}
        alt={token.symbol}
        className={cn('rounded-full shadow-depth-1', sizeClasses[size])}
        onError={() => setImageError(true)}
      />
      {/* Subtle glow effect for real token icons */}
      <div className="absolute inset-0 rounded-full shadow-neon-glow opacity-20" />
    </motion.div>
  )
}

interface TokenSelectorProps {
  value: Token | null
  onChange: (token: Token) => void
  tokens: Token[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  value,
  onChange,
  tokens,
  placeholder = 'Select token',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens
    return tokens.filter(token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tokens, searchQuery])

  const handleSelect = (token: Token) => {
    onChange(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={cn('relative', className)}>
      <motion.button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-4 bg-neo-dark-surface/80 backdrop-blur-xl',
          'border border-neon-cyan/20 rounded-neo text-sm text-white shadow-neo-inset',
          'hover:bg-neo-dark-surface hover:shadow-neon-glow hover:border-neon-cyan/40',
          'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:shadow-neon-glow',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
          'relative overflow-hidden group',
          isOpen && 'ring-2 ring-neon-cyan/50 bg-neo-dark-surface shadow-neon-glow border-neon-cyan/60'
        )}
        whileHover={!disabled ? { 
          scale: 1.02, 
          y: -2,
          boxShadow: '0 0 25px rgba(0, 245, 255, 0.3), 0 0 50px rgba(0, 245, 255, 0.1)',
        } : {}}
        whileTap={!disabled ? { 
          scale: 0.98,
          boxShadow: 'inset 6px 6px 12px rgba(10, 10, 11, 0.7), inset -6px -6px 12px rgba(42, 42, 47, 0.3)',
        } : {}}
      >
        {value ? (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <TokenIcon token={value} size='md' />
            </motion.div>
            <div className='flex-1 text-left'>
              <span className='font-bold text-white text-base'>
                {value.symbol}
              </span>
              <div className='text-xs text-white/60 font-medium'>
                ${value.price.toFixed(4)}
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center gap-2'>
            <motion.div 
              className='w-6 h-6 rounded-full relative overflow-hidden flex items-center justify-center shadow-neo-inset'
              style={{
                background: 'linear-gradient(135deg, rgba(42, 42, 47, 1) 0%, rgba(30, 30, 34, 1) 100%)',
              }}
              animate={{
                boxShadow: [
                  'inset 3px 3px 6px rgba(10, 10, 11, 0.6), inset -3px -3px 6px rgba(42, 42, 47, 0.3)',
                  'inset 4px 4px 8px rgba(10, 10, 11, 0.8), inset -4px -4px 8px rgba(42, 42, 47, 0.4)',
                  'inset 3px 3px 6px rgba(10, 10, 11, 0.6), inset -3px -3px 6px rgba(42, 42, 47, 0.3)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Cyberpunk grid pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 245, 255, 0.3) 0.5px, transparent 0.5px),
                    linear-gradient(90deg, rgba(0, 245, 255, 0.3) 0.5px, transparent 0.5px)
                  `,
                  backgroundSize: '3px 3px',
                }}
              />
              
              <motion.svg
                className='w-3.5 h-3.5 text-neon-cyan/80'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.5))' }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M12 4v16m8-8H4'
                />
              </motion.svg>
              
              {/* Pulsing dot indicator */}
              <motion.div
                className="absolute top-0.5 right-0.5 w-1 h-1 bg-neon-gold rounded-full"
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
            <span className='text-white/70 font-medium tracking-wide'>{placeholder}</span>
          </div>
        )}
        {/* Cyberpunk scanning line effect */}
        {!disabled && (
          <motion.div
            className="absolute left-0 top-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-0"
            animate={{
              opacity: [0, 1, 0],
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <motion.div
          className='ml-auto relative'
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-sm"
            animate={isOpen ? {
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <ChevronDown 
            className='w-4 h-4 text-neon-cyan/90 relative z-10' 
            style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))' }}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className='absolute top-full mt-2 w-full bg-neo-dark-container/95 backdrop-blur-3xl border border-neon-cyan/30 rounded-liquid shadow-depth-3 z-50 max-h-72 overflow-hidden'
            style={{
              boxShadow: '0 0 40px rgba(0, 245, 255, 0.2), 0 8px 32px rgba(10, 10, 11, 0.8)',
            }}
          >
            {/* Search Input */}
            <div className='p-4 border-b border-white/10'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60' />
                <input
                  type='text'
                  placeholder='Search tokens...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300'
                />
              </div>
            </div>

            {/* Token List */}
            <div className='max-h-44 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20'>
              {filteredTokens.length > 0 ? (
                <div className='py-2'>
                  {filteredTokens.map((token, index) => (
                    <motion.button
                      key={token.symbol}
                      type='button'
                      onClick={() => handleSelect(token)}
                      className='w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left transition-all duration-200 text-white group'
                      initial={{ opacity: 0, x: -15 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 300,
                        },
                      }}
                      whileHover={{
                        x: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TokenIcon token={token} size='md' />
                      </motion.div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <span className='font-bold text-white group-hover:text-cyan-100 transition-colors'>
                              {token.symbol}
                            </span>
                            <div className='text-xs text-white/60 font-medium'>
                              {token.symbol.length > 3
                                ? `${token.symbol.substring(0, 12)}...`
                                : token.symbol}
                            </div>
                          </div>
                          <div className='text-right'>
                            <span className='text-sm font-semibold text-white/80 group-hover:text-cyan-200 transition-colors'>
                              ${token.price.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  className='p-6 text-center'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AlertCircle className='w-10 h-10 text-white/40 mx-auto mb-3' />
                  <p className='text-sm text-white/60 font-medium'>
                    No tokens found matching
                  </p>
                  <p className='text-sm text-cyan-300 font-bold'>
                    "{searchQuery}"
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setIsOpen(false)
            }
          }}
          role='button'
          tabIndex={0}
          aria-label='Close token selector'
        />
      )}
    </div>
  )
}

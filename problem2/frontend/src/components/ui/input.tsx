import { motion } from 'framer-motion'
import * as React from 'react'

import { cn } from '../../lib/utils/cn'

type SafeHTMLInputAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onTransitionEnd'
  | 'transition'
>

export interface InputProps extends SafeHTMLInputAttributes {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className='relative'>
        <motion.input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-red-400/50 ring-red-400/20',
            className
          )}
          ref={ref}
          whileFocus={{
            scale: 1.01,
            transition: {
              type: 'spring' as const,
              stiffness: 300,
              damping: 30,
            },
          }}
          animate={
            error
              ? {
                  x: [0, -5, 5, -3, 3, 0],
                  transition: { duration: 0.4 },
                }
              : {}
          }
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='mt-2 text-sm text-red-400 flex items-center gap-1'
          >
            <svg
              className='w-3 h-3'
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
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/utils/cn'

import { buttonVariants } from './button-variants'

// Safe props that don't conflict with Framer Motion
type SafeHTMLButtonAttributes = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onTransitionEnd'
  | 'transition'
>

export interface ButtonProps
  extends SafeHTMLButtonAttributes,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : motion.button

    const motionProps = asChild
      ? {}
      : {
          whileHover: !loading && !disabled ? { scale: 1.02 } : {},
          whileTap: !loading && !disabled ? { scale: 0.98 } : {},
          transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
        }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading ?? disabled}
        {...motionProps}
        {...props}
      >
        <AnimatePresence mode='wait'>
          {loading ? (
            <motion.div
              key='loading'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex items-center'
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className='mr-2'
              >
                <Loader2 className='h-4 w-4' />
              </motion.div>
              {typeof children === 'string' ? 'Processing...' : children}
            </motion.div>
          ) : (
            <motion.div
              key='children'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }
export { buttonVariants } from './button-variants'

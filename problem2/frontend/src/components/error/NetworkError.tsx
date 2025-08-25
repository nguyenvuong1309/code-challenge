import { motion } from 'framer-motion'
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import React from 'react'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface NetworkErrorProps {
  onRetry: () => void
  isRetrying?: boolean
  message?: string
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  isRetrying = false,
  message = 'Unable to load token data. Please check your connection and try again.',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className='w-full max-w-md mx-auto'
    >
      <Card className='border-destructive/20'>
        <CardHeader className='text-center pb-2'>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className='mx-auto mb-4'
          >
            <div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center'>
              <WifiOff className='w-8 h-8 text-destructive' />
            </div>
          </motion.div>

          <CardTitle className='text-destructive text-lg'>
            Connection Error
          </CardTitle>
        </CardHeader>

        <CardContent className='text-center space-y-4'>
          <motion.p
            className='text-sm text-muted-foreground leading-relaxed'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='space-y-2'
          >
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className='w-full'
              variant='outline'
              size='lg'
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>

            <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
              <AlertCircle className='w-3 h-3' />
              <span>Check your internet connection</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

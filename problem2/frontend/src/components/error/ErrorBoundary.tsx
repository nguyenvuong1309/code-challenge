import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import React, { Component, type ReactNode } from 'react'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Log errors for debugging in development
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card className='w-full max-w-md'>
              <CardHeader className='text-center pb-2'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className='mx-auto mb-4'
                >
                  <div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center'>
                    <AlertTriangle className='w-8 h-8 text-destructive' />
                  </div>
                </motion.div>
                <CardTitle className='text-destructive'>
                  Something went wrong
                </CardTitle>
              </CardHeader>

              <CardContent className='text-center space-y-4'>
                <motion.p
                  className='text-sm text-muted-foreground'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {this.state.error?.message ??
                    'An unexpected error occurred while loading the application.'}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={this.handleRetry}
                    className='w-full'
                    variant='outline'
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    Try Again
                  </Button>
                </motion.div>

                <motion.p
                  className='text-xs text-muted-foreground'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  If the problem persists, please refresh the page or contact
                  support.
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

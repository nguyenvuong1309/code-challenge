import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ErrorBoundary } from './components/error/ErrorBoundary'
import { SwapForm } from './components/swap/SwapForm'
import { motion } from 'framer-motion'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Only retry network errors, not client errors
        const errorWithStatus = error as { status?: number }
        if (
          errorWithStatus?.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className='min-h-screen relative overflow-hidden bg-neo-dark-base'>
          {/* Liquid Neomorphism + Cyberpunk Background System */}
          <div className='absolute inset-0 bg-gradient-to-br from-neo-dark-base via-neo-dark-elevated to-neo-dark-container'>
            {/* Cyberpunk Grid Matrix */}
            <div
              className='absolute inset-0 opacity-10'
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 245, 255, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 245, 255, 0.3) 1px, transparent 1px),
                  linear-gradient(rgba(138, 43, 226, 0.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(138, 43, 226, 0.2) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
                backgroundPosition: '0 0, 0 0, 0 0, 0 0',
              }}
            >
              {/* Animated grid flow */}
              <motion.div
                className='absolute inset-0'
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, transparent 40%, rgba(0, 245, 255, 0.1) 50%, transparent 60%)
                  `,
                  backgroundSize: '200px 200px',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Enhanced Aurora Orbs with Neomorphic Style */}
            <div className='absolute inset-0 opacity-40'>
              <motion.div
                className='absolute top-0 left-1/4 w-96 h-96 rounded-full filter blur-3xl'
                style={{
                  background:
                    'radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, rgba(0, 245, 255, 0.1) 70%, transparent 100%)',
                }}
                animate={{
                  x: [0, 100, -50, 0],
                  y: [0, -50, 50, 0],
                  scale: [1, 1.2, 0.8, 1],
                  opacity: [0.3, 0.6, 0.4, 0.3],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className='absolute top-1/3 right-1/4 w-80 h-80 rounded-full filter blur-3xl'
                style={{
                  background:
                    'radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0.1) 70%, transparent 100%)',
                }}
                animate={{
                  x: [0, -80, 60, 0],
                  y: [0, 60, -40, 0],
                  scale: [1, 0.9, 1.3, 1],
                  opacity: [0.4, 0.7, 0.3, 0.4],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className='absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full filter blur-3xl'
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 70%, transparent 100%)',
                }}
                animate={{
                  x: [0, 120, -80, 0],
                  y: [0, -80, 40, 0],
                  scale: [1, 1.4, 0.9, 1],
                  opacity: [0.2, 0.5, 0.8, 0.2],
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Advanced Floating Particle System */}
            <div className='absolute inset-0'>
              {/* Neon Cyan Particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`cyan-${i}`}
                  className='absolute bg-neon-cyan rounded-full shadow-neon-glow'
                  style={{
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [
                      0,
                      Math.random() * 200 - 100,
                      Math.random() * 200 - 100,
                      0,
                    ],
                    y: [
                      0,
                      Math.random() * 200 - 100,
                      Math.random() * 200 - 100,
                      0,
                    ],
                    opacity: [0.3, 0.8, 0.2, 0.6],
                    scale: [0.5, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 5,
                  }}
                />
              ))}

              {/* Purple Particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`purple-${i}`}
                  className='absolute bg-neon-purple rounded-full shadow-neon-glow-purple'
                  style={{
                    width: `${Math.random() * 3 + 1.5}px`,
                    height: `${Math.random() * 3 + 1.5}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [
                      0,
                      Math.random() * 150 - 75,
                      Math.random() * 150 - 75,
                      0,
                    ],
                    y: [
                      0,
                      Math.random() * 150 - 75,
                      Math.random() * 150 - 75,
                      0,
                    ],
                    opacity: [0.4, 0.9, 0.1, 0.7],
                    scale: [0.6, 1.4, 0.7, 1.1],
                  }}
                  transition={{
                    duration: Math.random() * 12 + 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 3,
                  }}
                />
              ))}

              {/* Gold Particles */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={`gold-${i}`}
                  className='absolute bg-neon-gold rounded-full shadow-neon-glow-gold'
                  style={{
                    width: `${Math.random() * 2.5 + 1}px`,
                    height: `${Math.random() * 2.5 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [
                      0,
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                      0,
                    ],
                    y: [
                      0,
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                      0,
                    ],
                    opacity: [0.2, 0.7, 0.3, 0.8],
                    scale: [0.8, 1.6, 0.5, 1.2],
                  }}
                  transition={{
                    duration: Math.random() * 8 + 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 4,
                  }}
                />
              ))}

              {/* Geometric Shapes */}
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={`shape-${i}`}
                  className='absolute border border-neon-cyan/30'
                  style={{
                    width: `${Math.random() * 20 + 10}px`,
                    height: `${Math.random() * 20 + 10}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: 'rotate(45deg)',
                  }}
                  animate={{
                    rotate: [45, 225, 405],
                    scale: [0.5, 1.2, 0.8, 1],
                    opacity: [0.1, 0.4, 0.2, 0.3],
                    x: [0, Math.random() * 300 - 150],
                    y: [0, Math.random() * 300 - 150],
                  }}
                  transition={{
                    duration: Math.random() * 20 + 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: Math.random() * 8,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className='relative z-10'>
            <SwapForm />
          </div>
        </div>

        {/* Enhanced Toast Notifications */}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

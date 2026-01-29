'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full p-8 text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an error while loading this component. Please try refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Page</span>
          </Button>
        </motion.div>
      )
    }

    return this.props.children
  }
}

'use client'

import React from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  /** If true, renders a compact inline error instead of full-page */
  inline?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    if (this.props.inline) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
          <p className="text-sm text-rose-300 flex-1">Something went wrong loading this section.</p>
          <button
            onClick={this.reset}
            className="text-xs text-rose-400 hover:text-rose-300 underline transition-colors"
          >
            Retry
          </button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-rose-400" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-[var(--text-1)] font-semibold text-lg mb-2">Something went wrong</h2>
          <p className="text-[var(--text-3)] text-sm mb-1">
            An unexpected error occurred. The error has been logged.
          </p>
          {this.state.error?.message && (
            <p className="text-[var(--text-4)] text-xs font-mono mt-2 break-all">
              {this.state.error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)]
                       text-[var(--text-2)] text-sm font-medium hover:bg-[var(--bg-muted)] transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ai-glow)] border border-[var(--ai-border)]
                       text-[var(--ai-color)] text-sm font-medium hover:bg-[var(--ai-glow)] transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }
}

/** Convenience wrapper for async page-level error catching */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

/** Inline widget-level error boundary */
export function WidgetErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary inline>{children}</ErrorBoundary>
}

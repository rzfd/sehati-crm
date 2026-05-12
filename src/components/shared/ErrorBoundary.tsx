"use client"

import { Component, type ReactNode } from "react"

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

// Generic error boundary untuk wrap area kritis (chat, inbox, dashboard).
// Untuk error boundary di Next.js App Router, gunakan error.tsx — ini complement.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[ErrorBoundary]", error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="card p-6 m-4">
          <p className="text-sm font-medium text-red-500 mb-1">Terjadi kesalahan</p>
          <p className="text-xs text-gray-500 mb-3">{this.state.error.message}</p>
          <button onClick={this.reset} className="btn-secondary text-xs">Coba lagi</button>
        </div>
      )
    }
    return this.props.children
  }
}

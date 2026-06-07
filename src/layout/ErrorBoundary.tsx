import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** Label shown in the fallback (e.g. the panel name). */
  label?: string
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Catches render errors from a subtree so one broken panel shows an inline
 * message instead of unmounting the whole app (a blank screen).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Panel error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 12 }}>
          <div className="tag tag-red" style={{ display: 'block', padding: '6px 10px', marginBottom: 8 }}>
            {this.props.label ? `“${this.props.label}” panel hit an error` : 'This panel hit an error'}
          </div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </div>
          <button className="btn btn-sm" onClick={() => this.setState({ error: null })}>
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

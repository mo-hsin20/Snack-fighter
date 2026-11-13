import { Component } from 'react'

// If any screen crashes, show a friendly message instead of a blank page.
// Error boundaries must be class components – React has no hook for this.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Snack Fighter crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="container text-center my-5" role="alert">
        <h1 className="arcade-title display-title">GAME OVER</h1>
        <p>Something went wrong on this screen.</p>
        <a className="btn btn-warning" href="./" onClick={() => this.setState({ error: null })}>Restart</a>
      </div>
    )
  }
}

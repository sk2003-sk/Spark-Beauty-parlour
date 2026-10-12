import { Component } from 'react';

// Shows a friendly screen instead of a blank page if something crashes
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="w empty">
        <h2>Something went wrong</h2>
        <p className="mu">Please refresh the page and try again.</p>
        <button className="btn" onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }
}

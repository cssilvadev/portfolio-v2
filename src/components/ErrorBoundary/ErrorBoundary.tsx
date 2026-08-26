import { Component, type ErrorInfo, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-crash-screen">
          <div className="app-crash-card">
            <span className="app-crash-badge">Runtime Error</span>
            <h1>Something broke while rendering the page</h1>
            <p>{this.state.error.message}</p>
            <p className="app-crash-hint">
              If you are running this locally, make sure you have a <code>.env</code> file
              with <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> set
              (see <code>.env.example</code>), then restart the dev server.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

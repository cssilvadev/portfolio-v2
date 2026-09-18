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
              If you are running this locally, check the terminal error and restart the dev server
              after fixing the reported issue.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

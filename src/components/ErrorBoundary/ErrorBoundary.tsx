import { Component, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // Error messages/stacks can contain private input, URLs or session details.
    console.error("The page could not be rendered.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-crash-screen">
          <div className="app-crash-card">
            <span className="app-crash-badge">Portfolio</span>
            <h1>This page could not be displayed</h1>
            <p className="app-crash-hint">
              Please reload the page. No internal error details are displayed here.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

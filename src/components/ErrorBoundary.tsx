import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Namasté Gien]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h1>Something went wrong</h1>
          <p className="muted">Une erreur est survenue. Rechargez la page.</p>
          <button type="button" className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => window.location.assign("/")}>
            Accueil / Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

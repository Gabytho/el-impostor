import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 20,
            color: "#f87171",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          <h2>Algo se rompió</h2>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => {
              this.setState({ error: null });
              location.hash = "#/";
            }}
            style={{ marginTop: 20, padding: 12 }}
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { Component, ReactNode } from "react";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={wrapper}>
          <p style={msg}>3D rendering failed. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const wrapper: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#070714",
};

const msg: React.CSSProperties = {
  color: "#f87171",
  fontFamily: "system-ui, sans-serif",
  fontSize: "1rem",
};

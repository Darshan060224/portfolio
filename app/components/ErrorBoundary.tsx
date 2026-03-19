"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0A0F1C",
            color: "#00E5FF",
            fontFamily: "monospace",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#FF4444" }}>
            3D Scene Failed to Load
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#8892B0", maxWidth: "500px", lineHeight: 1.6 }}>
            Your browser may not support WebGL or the 3D engine encountered an error.
            Try refreshing the page or using a different browser.
          </p>
          <pre
            style={{
              marginTop: "1rem",
              fontSize: "0.7rem",
              color: "#FF444488",
              maxWidth: "600px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

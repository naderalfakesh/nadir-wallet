import React from "react";

interface CameraErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

// VisionCamera hooks throw during render when the native module is absent.
export class CameraErrorBoundary extends React.Component<
  CameraErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

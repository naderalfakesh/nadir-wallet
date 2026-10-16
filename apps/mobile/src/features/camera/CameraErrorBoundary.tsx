import React from "react";

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * VisionCamera's hooks read its native module during render, so a build
 * without it throws before any screen-level check can run. This keeps that
 * failure inside the camera screen instead of taking down the app.
 */
export class CameraErrorBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

import { Component, type ErrorInfo, type ReactNode } from "react";

/** Any WebGL runtime failure (context loss, unsupported GPU) → silent CSS fallback. */
export default class GlBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFail?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: Error, _info: ErrorInfo) {
    if (!/WebGL|GPU|context/i.test(String(err))) console.error(err);
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

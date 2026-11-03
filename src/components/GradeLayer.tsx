import { Suspense, lazy } from "react";
import { REDUCE } from "../lib/motion";
import GlBoundary from "./GlBoundary";

const GradeFrame = lazy(() => import("../r3f/GradeFrame"));

/** WebGL grade when available; graded CSS still otherwise (VM/verify path keeps DOM honest). */
export default function GradeLayer({ reveal, webgl }: { reveal: number; webgl: boolean }) {
  const css = (
    <>
      <div className="grade__layer grade__layer--log" />
      <div
        className="grade__layer grade__layer--final"
        style={{ clipPath: `inset(0 0 0 ${reveal * 100}%)` }}
      />
    </>
  );
  if (!webgl || REDUCE) return css;
  return (
    <GlBoundary fallback={css}>
      <Suspense fallback={<div className="grade__layer grade__layer--log" />}>
        <GradeFrame reveal={reveal} />
      </Suspense>
    </GlBoundary>
  );
}

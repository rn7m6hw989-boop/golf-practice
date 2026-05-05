// SessionView
import React from "react";
import { DRILLS } from "../drills.js";
import { ScoringSessionView } from "./ScoringSessionView.jsx";
import { SpiralSessionView } from "./SpiralSessionView.jsx";
import { FallLineSessionView } from "./FallLineSessionView.jsx";

export function SessionView({ drillId, onComplete, onCancel }) {
  const drill = DRILLS[drillId];
  if (!drill) return null;
  if (drill.sessionType === "spiral") {
    return (
      <SpiralSessionView
        drillId={drillId}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
  }
  if (drill.sessionType === "fallLine") {
    return (
      <FallLineSessionView
        drillId={drillId}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
  }
  return (
    <ScoringSessionView
      drillId={drillId}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
}

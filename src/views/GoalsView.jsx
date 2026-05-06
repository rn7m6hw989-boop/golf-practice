// GoalsView — placeholder for Phase B. The full OKR dashboard is built in
// Phase 3. For now, show a clean empty state that signals the philosophy
// without making promises.

import React from "react";
import { Trophy, Target, Flag } from "lucide-react";
import { T } from "../theme.js";
import { PageTitle } from "../components/PageTitle.jsx";
import { Card } from "../components/Card.jsx";

export function GoalsView({ onChangeTab }) {
  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle eyebrow="Goals" title="Your objectives" />

      <Card style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: T.greenSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Trophy size={20} color={T.green} strokeWidth={2} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8,
            letterSpacing: -0.2,
          }}
        >
          Goals are coming
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textDim,
            lineHeight: 1.55,
            marginBottom: 6,
          }}
        >
          This is where your objectives will live — the structured goals that
          shape why you practice and play.
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textDim,
            lineHeight: 1.55,
          }}
        >
          For now, start logging drills and rounds. Goal-setting opens up once
          there's enough data to build meaningful objectives against.
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 16,
        }}
      >
        <button
          onClick={() => onChangeTab && onChangeTab("drills")}
          style={{
            padding: "13px 16px",
            fontSize: 14,
            fontWeight: 500,
            background: T.green,
            color: T.greenInk,
            border: "none",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Target size={16} strokeWidth={2} />
          Browse drills
        </button>
        <button
          onClick={() => onChangeTab && onChangeTab("rounds")}
          style={{
            padding: "13px 16px",
            fontSize: 14,
            fontWeight: 500,
            background: "transparent",
            color: T.text,
            border: `0.5px solid ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Flag size={16} strokeWidth={2} />
          Start a round
        </button>
      </div>
    </div>
  );
}

// RoundView — the round-tracking screen. Placeholder in Phase B1 — full
// shot capture, hole navigation, and finish flow are implemented in B2.
// For now, shows the round basics and an End Round button so users can
// at least exit out cleanly.

import React, { useState } from "react";
import { Flag, X, Check } from "lucide-react";
import { T } from "../theme.js";
import { Card } from "../components/Card.jsx";

export function RoundView({ round, onEndRound, onExit }) {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  return (
    <div style={{ padding: "1rem 0 calc(1.5rem + env(safe-area-inset-bottom))" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={onExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: T.textDim,
            fontSize: 14,
            padding: "8px",
            margin: "-8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <X size={16} />
          Exit
        </button>
        <div
          style={{
            fontSize: 11,
            color: T.green,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: 500,
          }}
        >
          Round in progress
        </div>
        <button
          onClick={() => setShowConfirmEnd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: T.textDim,
            fontSize: 14,
            padding: "8px",
            margin: "-8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <Check size={16} />
          End
        </button>
      </div>

      {showConfirmEnd && (
        <Card style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            End this round? It moves to your past rounds and you can edit it
            later.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowConfirmEnd(false)}
              style={{
                flex: 1,
                padding: "11px",
                fontSize: 14,
                background: "transparent",
                border: `0.5px solid ${T.borderStrong}`,
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
                color: T.text,
                fontWeight: 500,
              }}
            >
              Keep going
            </button>
            <button
              onClick={onEndRound}
              style={{
                flex: 1,
                padding: "11px",
                fontSize: 14,
                background: T.green,
                color: T.greenInk,
                border: "none",
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              End round
            </button>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: "1rem", padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: T.greenSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Flag size={20} color={T.green} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {round.course || "Untitled course"}
            </div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>
              {round.date}
              {round.tees && ` · ${round.tees}`}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            color: T.textDim,
            lineHeight: 1.55,
          }}
        >
          Shot capture is coming next.
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textFaint,
            lineHeight: 1.55,
            marginTop: 8,
          }}
        >
          For now, you can exit to keep the round in progress, or end it to
          move it into your past rounds.
        </div>
      </Card>
    </div>
  );
}

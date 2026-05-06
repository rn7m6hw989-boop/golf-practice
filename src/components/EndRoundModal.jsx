// EndRoundModal — shown when a user tries to start a drill while a round is
// in progress. Offers to end the round (which marks it complete and moves it
// to history) and proceed with the drill, or cancel and stay where they are.

import React from "react";
import { T } from "../theme.js";
import { Flag } from "lucide-react";

export function EndRoundModal({ activeRound, onConfirm, onCancel }) {
  if (!activeRound) return null;

  const courseLabel = activeRound.course || "your round";
  const holesPlayed = activeRound.holes
    ? Object.keys(activeRound.holes).filter(
        (h) => activeRound.holes[h] && activeRound.holes[h].score,
      ).length
    : 0;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `0.5px solid ${T.borderStrong}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "1.5rem 1.25rem 1.25rem",
          maxWidth: 380,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: T.warnSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <Flag size={20} color={T.warn} strokeWidth={2} />
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 500,
            marginBottom: 8,
            letterSpacing: -0.2,
          }}
        >
          You have a round in progress
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textDim,
            lineHeight: 1.5,
            marginBottom: 18,
          }}
        >
          {courseLabel}
          {holesPlayed > 0 && ` · ${holesPlayed} hole${holesPlayed === 1 ? "" : "s"} recorded`}
          . You can't run drills while playing a round. End the round to start
          a drill — you can edit it later from your history.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: T.green,
              color: T.greenInk,
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
            }}
          >
            End round and start drill
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: "transparent",
              color: T.text,
              border: `0.5px solid ${T.borderStrong}`,
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
            }}
          >
            Keep the round going
          </button>
        </div>
      </div>
    </div>
  );
}

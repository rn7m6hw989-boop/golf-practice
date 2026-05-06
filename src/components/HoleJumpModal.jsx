// HoleJumpModal — shown during a live round when the user taps the hole
// status in the round screen header. Lets them jump to any hole.

import React from "react";
import { T } from "../theme.js";
import { HoleGrid } from "./HoleGrid.jsx";

export function HoleJumpModal({
  round,
  currentHole,
  onSelectHole,
  onCancel,
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderTopLeftRadius: "var(--border-radius-lg)",
          borderTopRightRadius: "var(--border-radius-lg)",
          padding:
            "1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))",
          width: "100%",
          maxWidth: 480,
          borderTop: `0.5px solid ${T.borderStrong}`,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          Jump to hole
        </div>

        <HoleGrid
          holes={round.holes}
          pars={round.pars}
          currentHole={currentHole}
          onSelectHole={(h) => {
            onSelectHole(h);
            onCancel();
          }}
        />

        <button
          onClick={onCancel}
          style={{
            width: "100%",
            padding: "11px 16px",
            fontSize: 14,
            fontWeight: 500,
            background: "transparent",
            color: T.text,
            border: `0.5px solid ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            marginTop: 18,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

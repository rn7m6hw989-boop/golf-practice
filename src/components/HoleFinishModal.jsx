// HoleFinishModal — captures the structured data for a hole when the user
// finishes (or edits) it. Captures:
//   - Par (pre-filled from round setup, can be overridden)
//   - Score (pre-filled from shots+penalties, can be overridden)
//   - Tiger 5 mistake toggles
//   - Notes (optional)
//
// All five Tiger 5 toggles are always shown regardless of par or other
// context — the user decides what's relevant.

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { T } from "../theme.js";

const TIGER_5 = [
  { key: "double", label: "Double bogey or worse" },
  { key: "bogeyPar5", label: "Bogey on a Par 5" },
  { key: "threePutt", label: "3-putt (or worse)" },
  { key: "twoChips", label: "2+ chips or pitches" },
  { key: "bogey150", label: "Bogey from 150 & in" },
];

export function HoleFinishModal({
  holeNumber,
  initialPar,
  initialScore,
  initialMistakes,
  initialNotes,
  isEdit,
  onSave,
  onCancel,
}) {
  const [par, setPar] = useState(initialPar || 4);
  const [score, setScore] = useState(initialScore || 0);
  const [mistakes, setMistakes] = useState(initialMistakes || {});
  const [notes, setNotes] = useState(initialNotes || "");

  const canSave = par >= 3 && par <= 6 && score >= 1 && score <= 15;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      par,
      score,
      mistakes,
      notes: notes.trim(),
    });
  };

  const toggleMistake = (key) => {
    setMistakes((m) => ({ ...m, [key]: !m[key] }));
  };

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
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: T.textFaint,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              fontWeight: 500,
              marginBottom: 2,
            }}
          >
            {isEdit ? "Edit hole" : "Finish hole"}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            Hole {holeNumber}
          </div>
        </div>

        {/* Par */}
        <SectionLabel>Par</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {[3, 4, 5, 6].map((p) => {
            const selected = par === p;
            return (
              <button
                key={p}
                onClick={() => setPar(p)}
                style={{
                  padding: "12px 0",
                  fontSize: 16,
                  fontWeight: 500,
                  background: selected ? T.green : T.surfaceRaised,
                  color: selected ? T.greenInk : T.text,
                  border: `0.5px solid ${selected ? T.green : T.borderStrong}`,
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Score */}
        <SectionLabel>Score</SectionLabel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: T.surfaceRaised,
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => setScore(Math.max(1, score - 1))}
            disabled={score <= 1}
            style={{
              ...counterBtnStyle,
              opacity: score <= 1 ? 0.3 : 1,
            }}
          >
            <Minus size={16} />
          </button>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              minWidth: 56,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
              color:
                score === 0
                  ? T.textFaint
                  : score < par
                    ? T.green
                    : score === par
                      ? T.text
                      : score === par + 1
                        ? T.warn
                        : T.loss,
            }}
          >
            {score || "—"}
          </div>
          <button
            onClick={() => setScore(Math.min(15, score + 1))}
            disabled={score >= 15}
            style={{
              ...counterBtnStyle,
              opacity: score >= 15 ? 0.3 : 1,
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        {score > 0 && par && (
          <div
            style={{
              fontSize: 12,
              color: T.textDim,
              textAlign: "center",
              marginTop: -10,
              marginBottom: 16,
            }}
          >
            {score === par - 2
              ? "Eagle"
              : score === par - 1
                ? "Birdie"
                : score === par
                  ? "Par"
                  : score === par + 1
                    ? "Bogey"
                    : score === par + 2
                      ? "Double bogey"
                      : score < par
                        ? `${par - score} under par`
                        : `+${score - par}`}
          </div>
        )}

        {/* Tiger 5 */}
        <SectionLabel>Tiger 5 mistakes</SectionLabel>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {TIGER_5.map((m) => {
            const on = !!mistakes[m.key];
            return (
              <button
                key={m.key}
                onClick={() => toggleMistake(m.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  fontSize: 14,
                  background: on ? T.warnSoft : T.surfaceRaised,
                  border: `0.5px solid ${on ? T.warn : T.borderStrong}`,
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: on ? T.warnDeep : T.text,
                  fontWeight: on ? 500 : 400,
                }}
              >
                <span>{m.label}</span>
                <ToggleSwitch on={on} />
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <SectionLabel>Notes (optional)</SectionLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What worked, what to remember…"
          rows={3}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: 14,
            background: T.surfaceRaised,
            border: `0.5px solid ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            color: T.text,
            outline: "none",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: 18,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: canSave ? T.green : T.surfaceRaised,
              color: canSave ? T.greenInk : T.textFaint,
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            {isEdit ? "Save changes" : "Finish hole"}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "11px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: "transparent",
              color: T.text,
              border: `0.5px solid ${T.borderStrong}`,
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: T.textFaint,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontWeight: 500,
        marginBottom: 6,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  );
}

function ToggleSwitch({ on }) {
  return (
    <div
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: on ? T.warn : T.border,
        position: "relative",
        flexShrink: 0,
        transition: "background 120ms",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: T.surface,
          transition: "left 120ms",
        }}
      />
    </div>
  );
}

const counterBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: T.surface,
  border: `0.5px solid ${T.borderStrong}`,
  color: T.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

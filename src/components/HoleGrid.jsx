// HoleGrid — 18-hole grid display, used on the round summary, the round
// detail view, and the in-round hole-jump modal.
//
// Each cell shows hole number, score (or "—"), and par. Score is color-coded:
//   under par   → green
//   par         → text
//   bogey       → warn
//   double+     → loss
//   no score    → faint
//
// A small dot indicates a Tiger 5 mistake on that hole.
//
// If onSelectHole is provided, cells are tappable. The currentHole prop
// (optional) highlights the active hole — useful in the hole-jump modal
// during a live round.

import React from "react";
import { T } from "../theme.js";

export function HoleGrid({
  holes,
  pars,
  currentHole = null,
  onSelectHole = null,
  showLegend = true,
}) {
  const rows = [];
  for (let h = 1; h <= 18; h++) {
    const data = holes && holes[h];
    rows.push({
      hole: h,
      par: (data && data.par) || (pars && pars[h - 1]) || null,
      score: data && data.score ? data.score : null,
      mistakes: (data && data.mistakes) || {},
    });
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 4,
        }}
      >
        {rows.map((row) => (
          <HoleCell
            key={row.hole}
            row={row}
            isCurrent={currentHole === row.hole}
            onClick={onSelectHole ? () => onSelectHole(row.hole) : null}
          />
        ))}
      </div>
      {showLegend && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12,
            fontSize: 11,
            color: T.textFaint,
            flexWrap: "wrap",
          }}
        >
          <Legend color={T.green} label="Under par" />
          <Legend color={T.text} label="Par" />
          <Legend color={T.warn} label="Bogey" />
          <Legend color={T.loss} label="Double+" />
        </div>
      )}
    </div>
  );
}

function HoleCell({ row, isCurrent, onClick }) {
  const { hole, par, score, mistakes } = row;
  const hasMistakes = mistakes && Object.values(mistakes).some((v) => v);

  let color = T.textFaint;
  if (score !== null && par) {
    const diff = score - par;
    color =
      diff < 0 ? T.green : diff === 0 ? T.text : diff === 1 ? T.warn : T.loss;
  }

  const tappable = !!onClick;

  return (
    <div
      onClick={onClick}
      style={{
        background: isCurrent ? T.greenSoft : T.surfaceRaised,
        border: `0.5px solid ${isCurrent ? T.green : T.border}`,
        borderRadius: "var(--border-radius-md)",
        padding: "8px 4px 10px",
        textAlign: "center",
        position: "relative",
        cursor: tappable ? "pointer" : "default",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: isCurrent ? T.greenDeep : T.textFaint,
          fontWeight: 500,
          marginBottom: 2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hole}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          minHeight: 20,
        }}
      >
        {score !== null ? score : "—"}
      </div>
      {par && (
        <div
          style={{
            fontSize: 9,
            color: isCurrent ? T.greenDeep : T.textFaint,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          P{par}
        </div>
      )}
      {hasMistakes && (
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 4,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.warn,
          }}
        />
      )}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />
      <span>{label}</span>
    </div>
  );
}

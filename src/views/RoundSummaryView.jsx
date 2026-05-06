// RoundSummaryView — end-of-round summary screen. Shown immediately after
// a round is ended. Mirrors the structure of the drill-side SummaryView:
// big headline numbers, supporting detail cards, a fixed "Done" button at
// the bottom that returns the user to the Rounds tab.
//
// What's NOT here yet:
//   - Strokes Gained calculations (deferred until we have the SG benchmark
//     tables and the OKR layer to surface them in)
//   - Per-shot analysis
//   - Comparison to past rounds (deferred to Phase 3 / Stats)

import React from "react";
import { Flag } from "lucide-react";
import { T } from "../theme.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { HoleGrid } from "../components/HoleGrid.jsx";

const TIGER_5 = [
  { key: "double", label: "Doubles or worse" },
  { key: "bogeyPar5", label: "Bogeys on Par 5s" },
  { key: "threePutt", label: "3-putts" },
  { key: "twoChips", label: "2+ chips/pitches" },
  { key: "bogey150", label: "Bogeys from 150 & in" },
];

export function RoundSummaryView({ round, onDone }) {
  // Compute totals from the per-hole data
  let totalScore = 0;
  let totalPar = 0;
  let holesPlayed = 0;
  const t5Counts = { double: 0, bogeyPar5: 0, threePutt: 0, twoChips: 0, bogey150: 0 };

  if (round.holes) {
    Object.values(round.holes).forEach((h) => {
      if (h && h.score) {
        totalScore += h.score;
        totalPar += h.par || 0;
        holesPlayed++;
        if (h.mistakes) {
          Object.keys(t5Counts).forEach((k) => {
            if (h.mistakes[k]) t5Counts[k]++;
          });
        }
      }
    });
  }
  const t5Total = Object.values(t5Counts).reduce((a, b) => a + b, 0);
  const totalShots = round.shots ? round.shots.length : 0;
  const totalPenalty = round.shots
    ? round.shots.reduce((acc, s) => acc + (s.penalty || 0), 0)
    : 0;

  const scoreDiff = totalScore - totalPar;
  const scoreDiffLabel =
    holesPlayed === 0
      ? "—"
      : scoreDiff === 0
        ? "E"
        : scoreDiff > 0
          ? `+${scoreDiff}`
          : `${scoreDiff}`;
  const scoreDiffColor =
    holesPlayed === 0
      ? T.textFaint
      : scoreDiff < 0
        ? T.green
        : scoreDiff === 0
          ? T.text
          : scoreDiff <= 5
            ? T.warn
            : T.loss;

  const dateLabel = round.date
    ? new Date(round.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <PageTitle eyebrow="Round complete" title={round.course || "Round"} />

      {/* Headline score card */}
      <Card style={{ padding: "1.5rem 1.25rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: T.textFaint,
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <Flag size={11} />
          {dateLabel}
          {round.tees && ` · ${round.tees}`}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: scoreDiffColor,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: -1,
            }}
          >
            {scoreDiffLabel}
          </div>
          <div
            style={{
              fontSize: 14,
              color: T.textDim,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalScore} / {totalPar}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: T.textFaint,
            marginTop: 6,
          }}
        >
          {holesPlayed === 0
            ? "No holes recorded"
            : holesPlayed === 18
              ? "18 holes"
              : `${holesPlayed} hole${holesPlayed === 1 ? "" : "s"} played`}
        </div>
      </Card>

      {/* Tiger 5 card */}
      <SectionLabel>Tiger 5 mistakes</SectionLabel>
      <Card style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: t5Total >= 4 ? T.warn : t5Total >= 8 ? T.loss : T.text,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t5Total}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            total mistake{t5Total === 1 ? "" : "s"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TIGER_5.map((m) => {
            const count = t5Counts[m.key];
            return (
              <div
                key={m.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  color: count > 0 ? T.text : T.textFaint,
                }}
              >
                <span>{m.label}</span>
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: count > 0 ? 500 : 400,
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Shot totals (only if shots were captured) */}
      {totalShots > 0 && (
        <>
          <SectionLabel>Shots logged</SectionLabel>
          <Card style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <span style={{ color: T.textDim }}>Total shots</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {totalShots}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <span style={{ color: T.textDim }}>Penalty strokes</span>
              <span
                style={{
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                  color: totalPenalty > 0 ? T.warn : T.text,
                }}
              >
                {totalPenalty}
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Per-hole breakdown */}
      <SectionLabel>Hole by hole</SectionLabel>
      <Card style={{ padding: "0.75rem", marginBottom: "1rem" }}>
        <HoleGrid holes={round.holes} pars={round.pars} />
      </Card>

      {/* Done button (fixed bottom, like drill summary) */}
      <div
        style={{
          position: "fixed",
          bottom: "calc(64px + env(safe-area-inset-bottom))",
          left: 0,
          right: 0,
          padding: "12px 16px 14px",
          background: T.surface,
          borderTop: `0.5px solid ${T.border}`,
        }}
      >
        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 500,
            background: T.green,
            color: T.greenInk,
            border: "none",
            borderRadius: "var(--border-radius-lg)",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

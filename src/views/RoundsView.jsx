// RoundsView — Rounds tab. Lists past rounds (or empty state) with a
// "Start a round" button. If there's an active round, it's pinned at the
// top with a Resume action.

import React from "react";
import { Flag, Play, ChevronRight } from "lucide-react";
import { T } from "../theme.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";

export function RoundsView({ rounds, activeRound, onStartRound, onResumeRound, onOpenRound }) {
  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle eyebrow="Rounds" title="Your rounds" />

      {/* Active round (if any) — pinned at top with Resume */}
      {activeRound && (
        <ActiveRoundCard round={activeRound} onResume={onResumeRound} />
      )}

      {/* Start a round button — disabled if there's already an active one */}
      {!activeRound && (
        <button
          onClick={onStartRound}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: "1.5rem",
          }}
        >
          <Flag size={17} strokeWidth={2} />
          Start a round
        </button>
      )}

      {/* Past rounds */}
      {rounds.length === 0 && !activeRound && (
        <Card style={{ textAlign: "center", padding: "1.75rem 1.25rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: T.surfaceRaised,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Flag size={20} color={T.textFaint} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            No rounds yet
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.textDim,
              lineHeight: 1.5,
            }}
          >
            Start a round to capture shots and track your performance.
          </div>
        </Card>
      )}

      {rounds.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              color: T.textFaint,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 500,
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            Past rounds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rounds.map((round) => (
              <PastRoundCard
                key={round.id}
                round={round}
                onOpen={() => onOpenRound(round.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveRoundCard({ round, onResume }) {
  const holesPlayed = round.holes
    ? Object.values(round.holes).filter((h) => h && h.score).length
    : 0;
  const shotsRecorded = round.shots ? round.shots.length : 0;

  return (
    <div
      onClick={onResume}
      style={{
        background: T.greenSoft,
        border: `1px solid ${T.green}`,
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: T.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Play size={18} color={T.greenInk} fill={T.greenInk} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: T.greenDeep,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
            marginBottom: 2,
          }}
        >
          Round in progress
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: T.greenDeep,
            lineHeight: 1.3,
          }}
        >
          {round.course || "Untitled course"}
        </div>
        {(holesPlayed > 0 || shotsRecorded > 0) && (
          <div
            style={{
              fontSize: 12,
              color: T.greenDeep,
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            {holesPlayed > 0 && `${holesPlayed} hole${holesPlayed === 1 ? "" : "s"} recorded`}
            {holesPlayed > 0 && shotsRecorded > 0 && " · "}
            {shotsRecorded > 0 && `${shotsRecorded} shot${shotsRecorded === 1 ? "" : "s"}`}
          </div>
        )}
      </div>
      <ChevronRight size={18} style={{ color: T.greenDeep, flexShrink: 0 }} />
    </div>
  );
}

function PastRoundCard({ round, onOpen }) {
  let scoreLabel = null;
  let parLabel = null;
  if (round.holes) {
    let totalScore = 0;
    let totalPar = 0;
    let holesPlayed = 0;
    Object.values(round.holes).forEach((h) => {
      if (h && h.score) {
        totalScore += h.score;
        totalPar += h.par || 0;
        holesPlayed++;
      }
    });
    if (holesPlayed > 0) {
      scoreLabel = String(totalScore);
      const diff = totalScore - totalPar;
      parLabel = totalPar > 0
        ? `${diff >= 0 ? "+" : ""}${diff} · ${holesPlayed} hole${holesPlayed === 1 ? "" : "s"}`
        : `${holesPlayed} hole${holesPlayed === 1 ? "" : "s"}`;
    }
  }

  const dateLabel = round.date
    ? new Date(round.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: undefined,
      })
    : new Date(round.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

  return (
    <Card onClick={onOpen} style={{ padding: "12px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {round.course || "Round"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textFaint,
              marginTop: 2,
            }}
          >
            {dateLabel}
            {round.tees && (
              <>
                {" · "}
                <span style={{ color: T.textDim }}>{round.tees}</span>
              </>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {scoreLabel ? (
            <>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.green,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {scoreLabel}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: T.textFaint,
                  marginTop: 2,
                }}
              >
                {parLabel}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: T.textDim }}>—</div>
          )}
        </div>
      </div>
    </Card>
  );
}

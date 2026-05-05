// ScoringSessionView
import React, { useEffect, useState } from "react";
import { Undo2, X, Trophy, Flag } from "lucide-react";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { T, getToneStyles } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";

export function ScoringSessionView({ drillId, onComplete, onCancel }) {
  const drill = DRILLS[drillId];
  const [holes, setHoles] = useState([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0); // bumps each tap to trigger CSS animation

  const score = holes.reduce((sum, h) => sum + h.points, 0);
  const holesPlayed = holes.length;
  const won = score >= drill.winThreshold;
  const lost = score <= drill.loseThreshold;
  const finished = won || lost;

  useEffect(() => {
    if (finished) {
      const timer = setTimeout(() => {
        onComplete({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          drillId,
          sessionType: "scoring",
          timestamp: Date.now(),
          holes,
          finalScore: score,
          finalHoles: holesPlayed,
          won,
        });
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [finished]);

  const recordHole = (outcome) => {
    if (finished) return;
    setHoles([...holes, { outcomeId: outcome.id, points: outcome.points }]);
    setScoreAnim((n) => n + 1);
  };

  const undoLast = () => {
    if (holes.length === 0) return;
    setHoles(holes.slice(0, -1));
  };

  // Position on the lose-to-win progress bar (uses the drill's actual thresholds)
  const winT = drill.winThreshold;
  const loseT = drill.loseThreshold;
  const progressPct = Math.max(
    0,
    Math.min(100, ((score - loseT) / (winT - loseT)) * 100),
  );

  return (
    <div style={{ padding: "1rem 0 1.5rem", minHeight: "calc(100vh - 4rem)" }}>
      <style>{`
        @keyframes scorePop {
          0% { transform: scale(1); }
          40% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes celebrate {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes outcomePulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        .outcome-btn:active {
          animation: outcomePulse 0.18s ease;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => {
            if (holes.length === 0) onCancel();
            else setShowConfirmCancel(true);
          }}
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
          End
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
          {drill.name}
        </div>
        <button
          onClick={undoLast}
          disabled={holes.length === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color:
              holes.length === 0
                ? T.textFaint
                : T.textDim,
            fontSize: 14,
            padding: "8px",
            margin: "-8px",
            cursor: holes.length === 0 ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          <Undo2 size={14} />
          Undo
        </button>
      </div>

      {showConfirmCancel && (
        <Card style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            End this session without saving?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowConfirmCancel(false)}
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
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "11px",
                fontSize: 14,
                background: T.lossSoft,
                border: `0.5px solid ${T.loss}`,
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
                color: T.loss,
                fontWeight: 500,
              }}
            >
              End session
            </button>
          </div>
        </Card>
      )}

      {/* Hero score display */}
      <div style={{ textAlign: "center", marginBottom: "1.75rem", position: "relative" }}>
        <div
          style={{
            fontSize: 11,
            color: T.textDim,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Score
        </div>
        <div
          key={scoreAnim}
          style={{
            fontSize: 76,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -2.5,
            color: finished
              ? won
                ? T.green
                : T.loss
              : score > 0
                ? T.green
                : score < 0
                  ? T.loss
                  : T.text,
            animation: scoreAnim > 0 ? "scorePop 0.32s ease" : "none",
            fontVariantNumeric: "tabular-nums",
            display: "inline-block",
          }}
        >
          {score > 0 ? "+" : ""}
          {score}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textFaint,
            marginTop: 8,
          }}
        >
          {holesPlayed} hole{holesPlayed === 1 ? "" : "s"} played
        </div>
      </div>

      {/* Progress bar — lose threshold to win threshold */}
      <div style={{ margin: "0 0 2rem", padding: "0 4px" }}>
        <div
          style={{
            position: "relative",
            height: 6,
            background: T.surface,
            borderRadius: 999,
            overflow: "visible",
          }}
        >
          {/* Center line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -4,
              bottom: -4,
              width: 1,
              background: T.borderStrong,
            }}
          />
          {/* Filled portion */}
          <div
            style={{
              position: "absolute",
              left: score >= 0 ? "50%" : `${progressPct}%`,
              right: score >= 0 ? `${100 - progressPct}%` : "50%",
              top: 0,
              bottom: 0,
              background: score >= 0 ? T.green : T.loss,
              transition: "all 0.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
              borderRadius: 999,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: T.textFaint,
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            fontWeight: 500,
          }}
        >
          <span>{loseT} lose</span>
          <span>0</span>
          <span>+{winT} win</span>
        </div>
      </div>

      {finished ? (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem 1.25rem",
            background: won ? T.greenSoft : T.lossSoft,
            border: `0.5px solid ${won ? T.green : T.loss}`,
            borderRadius: "var(--border-radius-lg)",
            animation: "celebrate 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: won ? T.green : T.loss,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            {won ? (
              <Trophy size={26} color={T.greenInk} strokeWidth={2} />
            ) : (
              <Flag size={26} color="#fff" strokeWidth={2} />
            )}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: won ? T.greenDeep : T.lossDeep,
              marginBottom: 4,
              letterSpacing: -0.3,
            }}
          >
            {won ? "Won the round!" : "Better luck next round"}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Saving session…
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 11,
              color: T.textFaint,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Tap your hole result
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            {drill.outcomes.map((outcome) => {
              const styles = getToneStyles(outcome.tone);
              return (
                <button
                  key={outcome.id}
                  className="outcome-btn"
                  onClick={() => recordHole(outcome)}
                  style={{
                    padding: "20px 12px",
                    background: styles.bg,
                    border: `1px solid ${styles.border}`,
                    borderRadius: "var(--border-radius-lg)",
                    cursor: "pointer",
                    textAlign: "center",
                    minHeight: 100,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                    transition: "background 0.15s ease, transform 0.1s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: styles.text,
                      lineHeight: 1.2,
                    }}
                  >
                    {outcome.label}
                  </div>
                  {outcome.sub && (
                    <div
                      style={{
                        fontSize: 11,
                        color: styles.text,
                        opacity: 0.7,
                        lineHeight: 1.2,
                      }}
                    >
                      {outcome.sub}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: styles.text,
                      opacity: 0.85,
                      marginTop: 4,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {outcome.points > 0 ? "+" : ""}
                    {outcome.points} pt{Math.abs(outcome.points) === 1 ? "" : "s"}
                  </div>
                </button>
              );
            })}
          </div>

          {holes.length > 0 && (
            <>
              <SectionLabel>Hole history</SectionLabel>
              <Card style={{ padding: "0.5rem 1rem" }}>
                {holes
                  .slice()
                  .reverse()
                  .map((h, i) => {
                    const outcome = drill.outcomes.find((o) => o.id === h.outcomeId);
                    const holeNum = holes.length - i;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "9px 0",
                          fontSize: 13,
                          borderBottom:
                            i < holes.length - 1
                              ? `0.5px solid ${T.border}`
                              : "none",
                        }}
                      >
                        <span style={{ color: T.textFaint, width: 50 }}>
                          Hole {holeNum}
                        </span>
                        <span style={{ flex: 1 }}>{outcome?.short || outcome?.label}</span>
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: 32,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            color:
                              h.points > 0
                                ? T.green
                                : h.points < 0
                                  ? T.loss
                                  : T.textFaint,
                          }}
                        >
                          {h.points > 0 ? "+" : ""}
                          {h.points}
                        </span>
                      </div>
                    );
                  })}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

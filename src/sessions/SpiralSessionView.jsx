// SpiralSessionView
import React, { useEffect, useState } from "react";
import { Undo2, X, Check, Circle, RotateCw, Trophy } from "lucide-react";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";

export function SpiralSessionView({ drillId, onComplete, onCancel }) {
  const drill = DRILLS[drillId];
  const config = drill.spiralConfig;

  // A "round" is one attempt at sinking all five in a row.
  // We track the current round, position within it, and total miss count.
  const [round, setRound] = useState(1);
  const [position, setPosition] = useState(0); // 0..4
  const [totalMisses, setTotalMisses] = useState(0);
  const [history, setHistory] = useState([]); // list of { round, distance, clock, made }
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tapAnim, setTapAnim] = useState(0);

  // Direction alternates each round (clockwise, counter, clockwise, ...)
  const isReversed = round % 2 === 0;
  const clockPositions = isReversed
    ? config.reversedClockPositions
    : config.clockPositions;

  const currentDistance = config.distances[position];
  const currentClock = clockPositions[position];

  const handleMake = () => {
    setTapAnim((n) => n + 1);
    const entry = {
      round,
      distance: currentDistance,
      clock: currentClock,
      made: true,
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);

    if (position === config.distances.length - 1) {
      // Made the final putt — won!
      setCompleted(true);
      setTimeout(() => {
        onComplete({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          drillId,
          sessionType: "spiral",
          timestamp: Date.now(),
          history: newHistory,
          totalRounds: round,
          finalMisses: totalMisses,
          won: true,
        });
      }, 1400);
    } else {
      setPosition(position + 1);
    }
  };

  const handleMiss = () => {
    setTapAnim((n) => n + 1);
    const entry = {
      round,
      distance: currentDistance,
      clock: currentClock,
      made: false,
    };
    setHistory([...history, entry]);
    setTotalMisses(totalMisses + 1);
    // Reset to start of next round, opposite direction
    setRound(round + 1);
    setPosition(0);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastEntry = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    if (lastEntry.made) {
      // Undoing a make — go back one position in the same round
      setPosition(position - 1);
    } else {
      // Undoing a miss — go back to the previous round's last position
      setRound(round - 1);
      setTotalMisses(totalMisses - 1);
      // Find the position they were at when they missed (last entry's position
      // within its round). Count entries in the previous round.
      const prevRoundEntries = newHistory.filter((h) => h.round === round - 1);
      setPosition(prevRoundEntries.length);
    }
  };

  return (
    <div style={{ padding: "1rem 0 calc(1.5rem + env(safe-area-inset-bottom))", minHeight: "calc(100vh - 4rem)" }}>
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
        .spiral-btn:active {
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
            if (history.length === 0) onCancel();
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
          onClick={handleUndo}
          disabled={history.length === 0 || completed}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color:
              history.length === 0 || completed
                ? T.textFaint
                : T.textDim,
            fontSize: 14,
            padding: "8px",
            margin: "-8px",
            cursor:
              history.length === 0 || completed ? "not-allowed" : "pointer",
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

      {completed ? (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem 1.25rem",
            background: T.greenSoft,
            border: `0.5px solid ${T.green}`,
            borderRadius: "var(--border-radius-lg)",
            animation: "celebrate 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: T.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Trophy size={26} color={T.greenInk} strokeWidth={2} />
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: T.greenDeep,
              marginBottom: 4,
              letterSpacing: -0.3,
            }}
          >
            Five in a row!
          </div>
          <div
            style={{
              fontSize: 14,
              color: T.greenDeep,
              opacity: 0.8,
              marginBottom: 6,
            }}
          >
            {totalMisses === 0
              ? "No misses — perfect run."
              : `${totalMisses} miss${totalMisses === 1 ? "" : "es"} along the way.`}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Saving session…
          </div>
        </div>
      ) : (
        <>
          {/* Stats row: misses count + round + streak */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                background: T.surface,
                borderRadius: "var(--border-radius-lg)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.textDim,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  fontWeight: 500,
                }}
              >
                Misses
              </div>
              <div
                key={`misses-${tapAnim}`}
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  color: totalMisses === 0 ? T.green : T.loss,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {totalMisses}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.textFaint,
                  marginTop: 2,
                }}
              >
                lower is better
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: T.surface,
                borderRadius: "var(--border-radius-lg)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.textDim,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  fontWeight: 500,
                }}
              >
                In a row
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  color: T.green,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {position}
                <span
                  style={{
                    fontSize: 16,
                    color: T.textFaint,
                    fontWeight: 400,
                  }}
                >
                  {" "}/ 5
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.textFaint,
                  marginTop: 2,
                }}
              >
                round {round}
              </div>
            </div>
          </div>

          {/* Streak dots — visual progress through 5 in a row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: "1.75rem",
            }}
          >
            {config.distances.map((_, i) => {
              const made = i < position;
              const current = i === position;
              return (
                <div
                  key={i}
                  style={{
                    width: current ? 32 : 12,
                    height: 12,
                    borderRadius: 999,
                    background: made
                      ? T.green
                      : current
                        ? T.greenSoft
                        : T.surface,
                    border: current ? `1.5px solid ${T.green}` : "none",
                    transition:
                      "width 0.3s ease, background 0.3s ease, border 0.3s ease",
                  }}
                />
              );
            })}
          </div>

          {/* Current putt info */}
          <div
            style={{
              background: T.surface,
              border: `1.5px solid ${T.green}`,
              borderRadius: "var(--border-radius-lg)",
              padding: "1.25rem 1.25rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: T.green,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              Putt {position + 1} of 5
            </div>
            <div
              key={`distance-${tapAnim}`}
              style={{
                fontSize: 56,
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: -2,
                color: T.greenDeep,
                animation: tapAnim > 0 ? "scorePop 0.32s ease" : "none",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currentDistance}
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: T.greenDeep,
                  opacity: 0.6,
                  marginLeft: 4,
                }}
              >
                ft
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 10,
                fontSize: 13,
                color: T.textDim,
              }}
            >
              <RotateCw
                size={13}
                style={{
                  transform: isReversed ? "scaleX(-1)" : "none",
                }}
              />
              <span>
                Place ball at <strong style={{ color: T.greenDeep, fontWeight: 500 }}>{currentClock}</strong>
                {" · "}
                {isReversed ? "counterclockwise" : "clockwise"} round
              </span>
            </div>
          </div>

          {/* Make / Miss buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            <button
              className="spiral-btn"
              onClick={handleMake}
              style={{
                padding: "20px 12px",
                background: T.winSoft,
                border: `1px solid ${T.win}`,
                borderRadius: "var(--border-radius-lg)",
                cursor: "pointer",
                textAlign: "center",
                minHeight: 100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                transition: "transform 0.1s ease",
              }}
            >
              <Check size={26} color={T.green} strokeWidth={2.5} />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: T.greenDeep,
                  lineHeight: 1.2,
                }}
              >
                Made it
              </div>
            </button>
            <button
              className="spiral-btn"
              onClick={handleMiss}
              style={{
                padding: "20px 12px",
                background: T.lossSoft,
                border: `1px solid ${T.loss}`,
                borderRadius: "var(--border-radius-lg)",
                cursor: "pointer",
                textAlign: "center",
                minHeight: 100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                transition: "transform 0.1s ease",
              }}
            >
              <Circle size={24} color={T.loss} strokeWidth={2.5} />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: T.lossDeep,
                  lineHeight: 1.2,
                }}
              >
                Missed
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.lossDeep,
                  opacity: 0.7,
                  lineHeight: 1.2,
                }}
              >
                resets to round {round + 1}
              </div>
            </button>
          </div>

          {history.length > 0 && (
            <>
              <SectionLabel>Putt history</SectionLabel>
              <Card style={{ padding: "0.5rem 1rem" }}>
                {history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "9px 0",
                        fontSize: 13,
                        borderBottom:
                          i < history.length - 1
                            ? `0.5px solid ${T.border}`
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          color: T.textFaint,
                          width: 56,
                        }}
                      >
                        R{h.round}
                      </span>
                      <span style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}>
                        {h.distance} ft · {h.clock}
                      </span>
                      <span
                        style={{
                          fontWeight: 500,
                          color: h.made ? T.green : T.loss,
                          minWidth: 56,
                          textAlign: "right",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        {h.made ? "Made" : "Miss"}
                      </span>
                    </div>
                  ))}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

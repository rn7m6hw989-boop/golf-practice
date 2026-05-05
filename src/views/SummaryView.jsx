// SummaryView
import React, { useEffect, useState } from "react";
import { Trophy, Flag, ChevronRight, TrendingUp, Info } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { SkillSpectrum } from "../components/SkillSpectrum.jsx";
import { getBenchmarkMatch, compareToHistory } from "../helpers.js";

export function SummaryView({ session, allSessions, onDone, onViewBenchmarks }) {
  const drill = DRILLS[session.drillId];
  const benchmark = getBenchmarkMatch(drill, session);
  const comparison = compareToHistory(session, allSessions);

  const outcomeCounts = {};
  if (session.sessionType === "scoring" && drill.outcomes) {
    drill.outcomes.forEach((o) => (outcomeCounts[o.id] = 0));
    session.holes.forEach((h) => {
      outcomeCounts[h.outcomeId] = (outcomeCounts[h.outcomeId] || 0) + 1;
    });
  }

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <style>{`
        @keyframes summaryEnter {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spectrumDrop {
          0% { opacity: 0; transform: translateY(-12px) scale(0.8); }
          70% { opacity: 1; transform: translateY(2px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <PageTitle eyebrow="Session complete" title={drill.name} />

      {/* Hero result */}
      <div
        style={{
          textAlign: "center",
          padding: "1.75rem 1.25rem",
          background: session.won ? T.greenSoft : T.surface,
          borderRadius: "var(--border-radius-lg)",
          marginBottom: "1.5rem",
          animation: "summaryEnter 0.4s ease",
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: 500,
            color: session.won ? T.greenDeep : T.textDim,
            marginBottom: 10,
          }}
        >
          {session.sessionType === "fallLine" ? "Reading recorded" : session.won ? "Won" : "Did not finish"}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -2,
            color: session.won ? T.greenDeep : T.text,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {session.sessionType === "spiral"
            ? session.finalMisses
            : session.sessionType === "fallLine"
              ? `${session.errorInches}″`
              : session.finalHoles}
        </div>
        <div
          style={{
            fontSize: 13,
            color: session.won ? T.greenDeep : T.textDim,
            marginTop: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
            opacity: 0.75,
          }}
        >
          {session.sessionType === "spiral"
            ? `miss${session.finalMisses === 1 ? "" : "es"} · ${session.totalRounds} round${session.totalRounds === 1 ? "" : "s"}`
            : session.sessionType === "fallLine"
              ? `off · ${session.slope} slope`
              : `hole${session.finalHoles === 1 ? "" : "s"} · final score ${session.finalScore > 0 ? "+" : ""}${session.finalScore}`}
        </div>
      </div>

      {/* THE BENCHMARK MOMENT — skill spectrum visualization (skipped for
          drills with no published benchmarks). */}
      {!benchmark.noBenchmark && (
        <div
          style={{
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "1.5rem 1.25rem 1.25rem",
            marginBottom: "1.25rem",
            animation: "summaryEnter 0.5s ease 0.1s both",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: T.green,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 14,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Your skill level
          </div>

          <div style={{ animation: "spectrumDrop 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.3s both" }}>
            <SkillSpectrum drill={drill} matchedGroup={benchmark.group} won={session.won} />
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              padding: "0 8px",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: -0.2,
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              {benchmark.label}
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.textDim,
                lineHeight: 1.5,
              }}
            >
              {benchmark.detail}
            </div>
          </div>

          <button
            onClick={onViewBenchmarks}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: "transparent",
              border: "none",
              color: T.green,
              fontSize: 13,
              margin: "16px auto 0",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            View full benchmark table
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* No-benchmark drills: brief explainer instead of the spectrum */}
      {benchmark.noBenchmark && (
        <div
          style={{
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem 1.25rem",
            marginBottom: "1.25rem",
            animation: "summaryEnter 0.5s ease 0.1s both",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Info
            size={18}
            style={{ color: T.green, flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 4,
                lineHeight: 1.3,
              }}
            >
              No published benchmark for this drill
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.textDim,
                lineHeight: 1.5,
              }}
            >
              Track your error against your own history. Smaller errors and
              steeper slopes are easier; small slopes are harder to read.
            </div>
          </div>
        </div>
      )}

      {/* Self-comparison */}
      {comparison && (
        <div
          style={{
            background:
              comparison.type === "best"
                ? T.greenSoft
                : T.surface,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "summaryEnter 0.5s ease 0.2s both",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                comparison.type === "best"
                  ? T.green
                  : T.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border:
                comparison.type === "best"
                  ? "none"
                  : `0.5px solid ${T.border}`,
            }}
          >
            <TrendingUp
              size={16}
              color={comparison.type === "best" ? T.greenInk : T.textDim}
              strokeWidth={2}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: comparison.type === "best" ? T.greenDeep : T.text,
                marginBottom: 2,
              }}
            >
              {comparison.type === "best"
                ? "Personal best!"
                : comparison.type === "tied"
                  ? "Tied your best"
                  : comparison.type === "first"
                    ? "First completed session"
                    : comparison.type === "above"
                      ? "Above your average"
                      : comparison.type === "below"
                        ? "Below your average"
                        : "Steady"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: comparison.type === "best" ? T.greenDeep : T.textDim,
                opacity: comparison.type === "best" ? 0.85 : 1,
                lineHeight: 1.4,
              }}
            >
              {comparison.message}
            </div>
          </div>
        </div>
      )}

      {session.sessionType === "scoring" && (
        <>
          <SectionLabel>Hole breakdown</SectionLabel>
          <Card style={{ marginBottom: "1.25rem", padding: "0.5rem 1.25rem" }}>
            {drill.outcomes.map((o, i) => {
              const count = outcomeCounts[o.id] || 0;
              const pct =
                session.holes.length > 0
                  ? (count / session.holes.length) * 100
                  : 0;
              return (
                <div
                  key={o.id}
                  style={{
                    padding: "11px 0",
                    borderBottom:
                      i < drill.outcomes.length - 1
                        ? `0.5px solid ${T.border}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    <span>{o.short || o.label}</span>
                    <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                      {count}
                    </span>
                  </div>
                  {/* Mini bar for visual frequency */}
                  <div
                    style={{
                      height: 3,
                      background: T.surface,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background:
                          o.tone === "win"
                            ? T.green
                            : o.tone === "loss"
                              ? T.loss
                              : o.tone === "warn"
                                ? T.warn
                                : T.borderStrong,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {session.sessionType === "spiral" && session.history && (
        <>
          <SectionLabel>Make rate by distance</SectionLabel>
          <Card style={{ marginBottom: "1.25rem", padding: "0.5rem 1.25rem" }}>
            {drill.spiralConfig.distances.map((dist, i) => {
              const attempts = session.history.filter((h) => h.distance === dist);
              const made = attempts.filter((h) => h.made).length;
              const total = attempts.length;
              const pct = total > 0 ? (made / total) * 100 : 0;
              return (
                <div
                  key={dist}
                  style={{
                    padding: "11px 0",
                    borderBottom:
                      i < drill.spiralConfig.distances.length - 1
                        ? `0.5px solid ${T.border}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{dist} ft</span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                        color:
                          total === 0
                            ? T.textFaint
                            : T.text,
                      }}
                    >
                      {total === 0 ? "—" : `${made}/${total}`}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: T.surface,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: total === 0 ? "transparent" : T.green,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {session.sessionType === "fallLine" && (
        <>
          <SectionLabel>Reading details</SectionLabel>
          <Card style={{ marginBottom: "1.25rem", padding: "0.5rem 1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: `0.5px solid ${T.border}`,
                fontSize: 14,
              }}
            >
              <span>Putt result</span>
              <span style={{ fontWeight: 500 }}>
                {session.wentIn ? "Rolled in straight" : "Broke"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: `0.5px solid ${T.border}`,
                fontSize: 14,
              }}
            >
              <span>Fall-line error</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {session.errorInches}″
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                fontSize: 14,
              }}
            >
              <span>Slope severity</span>
              <span style={{ fontWeight: 500, textTransform: "capitalize" }}>
                {session.slope}
              </span>
            </div>
          </Card>
        </>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 64,
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

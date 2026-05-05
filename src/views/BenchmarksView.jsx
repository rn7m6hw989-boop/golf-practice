// BenchmarksView
import React from "react";
import { Info } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { BackButton } from "../components/BackButton.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { Card } from "../components/Card.jsx";
import { getBenchmarkMatch } from "../helpers.js";

export function BenchmarksView({ drillId, currentSession, onBack }) {
  const drill = DRILLS[drillId];
  if (!drill) return null;

  // No-benchmark drills: show an explanatory card instead of an empty table.
  if (drill.benchmarks.length === 0) {
    return (
      <div style={{ padding: "1rem 0 9rem" }}>
        <BackButton onClick={onBack} />
        <PageTitle
          eyebrow={drill.benchmarkUnit}
          title="Benchmarks"
          subtitle={drill.name}
        />
        <Card style={{ padding: "1.5rem 1.25rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={18} style={{ color: T.green, flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              No published benchmark
            </div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55 }}>
              {drill.notes ||
                "This drill doesn't have published tour-pro and amateur benchmarks. Track your improvement against your own history instead."}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const matchedIndex = currentSession
    ? getBenchmarkMatch(drill, currentSession).groupIndex
    : null;

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <BackButton onClick={onBack} />

      <PageTitle
        eyebrow={drill.benchmarkUnit}
        title="Benchmarks"
        subtitle={drill.name}
      />

      <Card style={{ marginBottom: "1.25rem", padding: "0.5rem 1.25rem" }}>
        {drill.benchmarks.map((b, i) => {
          const isMatch = i === matchedIndex;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 0",
                borderBottom:
                  i < drill.benchmarks.length - 1
                    ? `0.5px solid ${T.border}`
                    : "none",
                fontSize: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isMatch ? T.green : T.borderStrong,
                  }}
                />
                <span
                  style={{
                    fontWeight: isMatch ? 500 : 400,
                    color: isMatch ? T.greenDeep : T.text,
                  }}
                >
                  {b.group}
                </span>
                {isMatch && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      background: T.green,
                      color: T.greenInk,
                      borderRadius: 999,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    You
                  </span>
                )}
              </div>
              <div
                style={{
                  fontWeight: 500,
                  color:
                    b.value === null
                      ? T.textFaint
                      : isMatch
                        ? T.green
                        : T.text,
                  fontSize: b.value === null ? 11 : 14,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {b.value !== null
                  ? drill.benchmarkMetric === "misses-to-win"
                    ? `${b.value} miss${b.value === 1 ? "" : "es"}`
                    : `${b.value} hole${b.value === 1 ? "" : "s"}`
                  : b.note}
              </div>
            </div>
          );
        })}
      </Card>

      {drill.notes && (
        <div
          style={{
            background: T.surface,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <Info
              size={15}
              style={{
                color: T.textFaint,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: T.textDim,
              }}
            >
              {drill.notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

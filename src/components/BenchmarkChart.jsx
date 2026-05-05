// BenchmarkChart
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { T } from "../theme.js";
import { getSessionBenchmarkValue } from "../helpers.js";

export function BenchmarkChart({ drill, sessions }) {
  const isMisses = drill.benchmarkMetric === "misses-to-win";
  const isInches = drill.benchmarkMetric === "fall-line-error";

  const wonSessions = sessions
    .filter((s) => s.drillId === drill.id && s.won)
    .slice(0, 30)
    .reverse()
    .map((s, i) => ({
      index: i + 1,
      value: getSessionBenchmarkValue(drill, s),
      timestamp: s.timestamp,
    }));

  if (wonSessions.length < 1) return null;

  // Pick three representative benchmarks for reference lines: best pro, mid
  // amateur, mid-good amateur. Falls back gracefully if the drill has fewer
  // ranked benchmarks. Drills with no benchmarks (fall-line) just have no
  // reference lines.
  const ranked = drill.benchmarks.filter((b) => b.value !== null);
  const thresholdGroupNames = ["Best tour putter", "80-golfer", "90-golfer"];
  let thresholds = ranked.filter((b) => thresholdGroupNames.includes(b.group));
  if (thresholds.length < 2) {
    if (ranked.length >= 3) {
      thresholds = [
        ranked[0],
        ranked[Math.floor(ranked.length / 2)],
        ranked[ranked.length - 1],
      ];
    } else {
      thresholds = ranked;
    }
  }

  // Spiral-game thresholds can have value=0 (tour pros). A reference line at 0
  // is invisible, and identical adjacent values clutter labels — dedupe.
  const seenValues = new Set();
  thresholds = thresholds.filter((t) => {
    if (seenValues.has(t.value)) return false;
    seenValues.add(t.value);
    return true;
  });

  // Y-axis: pad above the largest value so the line isn't pressed against the
  // top. Different metrics have different sensible floors.
  const maxVal = Math.max(
    ...wonSessions.map((s) => s.value),
    ...thresholds.map((t) => t.value),
    isMisses ? 4 : isInches ? 12 : 20,
  );
  const yMax = isMisses
    ? Math.max(5, Math.ceil(maxVal + 1))
    : isInches
      ? Math.max(12, Math.ceil(maxVal + 2))
      : Math.max(20, Math.ceil(maxVal * 1.1));

  const titleLabel = isMisses
    ? "Misses to win"
    : isInches
      ? "Fall-line error"
      : "Holes to win";

  // Format a value with its proper unit and pluralization for tooltips.
  const formatValue = (v) => {
    if (isMisses) return `${v} miss${v === 1 ? "" : "es"}`;
    if (isInches) return `${v} inch${v === 1 ? "" : "es"}`;
    return `${v} hole${v === 1 ? "" : "s"}`;
  };

  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: "var(--border-radius-lg)",
        padding: "1.25rem 0.5rem 1rem 0.25rem",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: T.green,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 4,
          paddingLeft: "1rem",
          fontWeight: 500,
        }}
      >
        Progress
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          paddingLeft: "1rem",
          marginBottom: 4,
        }}
      >
        {titleLabel}
      </div>
      <div
        style={{
          fontSize: 12,
          color: T.textFaint,
          paddingLeft: "1rem",
          marginBottom: 16,
        }}
      >
        Lower is better · last {wonSessions.length} session{wonSessions.length === 1 ? "" : "s"}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={wonSessions}
          margin={{ top: 8, right: 60, bottom: 8, left: 0 }}
        >
          <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
          <XAxis
            dataKey="index"
            stroke={T.textFaint}
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={T.textFaint}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={28}
            domain={[0, yMax]}
            reversed
            allowDecimals={false}
          />
          {thresholds.map((t) => (
            <ReferenceLine
              key={t.group}
              y={t.value}
              stroke={T.borderStrong}
              strokeDasharray="3 3"
              label={{
                value: t.short,
                position: "right",
                fill: T.textFaint,
                fontSize: 10,
                fontWeight: 500,
              }}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: T.surface,
              border: `0.5px solid ${T.borderStrong}`,
              borderRadius: "var(--border-radius-md)",
              fontSize: 12,
              padding: "8px 12px",
            }}
            formatter={(v) => [formatValue(v), ""]}
            labelFormatter={(i) => `Session ${i}`}
            separator=""
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={T.green}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: T.green, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: T.green, strokeWidth: 2, stroke: T.surface }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// SkillSpectrum
import React from "react";
import { T } from "../theme.js";

export function SkillSpectrum({ drill, matchedGroup, won }) {
  const allTiers = drill.benchmarks
    .slice()
    .sort((a, b) => a.tier - b.tier); // 0 (worst) -> 6 (best)
  const matchedTier = matchedGroup?.tier ?? null;

  return (
    <div style={{ padding: "8px 0" }}>
      {/* The bar itself */}
      <div
        style={{
          position: "relative",
          height: 44,
          marginBottom: 12,
        }}
      >
        {/* Gradient track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 14,
            height: 8,
            borderRadius: 999,
            background: `linear-gradient(to right, #3A332B 0%, #4A4438 25%, #59685A 50%, #2E7A47 75%, ${T.green} 100%)`,
          }}
        />
        {/* Tick marks for each tier */}
        {allTiers.map((tier, i) => {
          const pct = (tier.tier / 6) * 100;
          const isMatched = matchedTier === tier.tier;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${pct}%`,
                top: 12,
                transform: "translateX(-50%)",
                width: 2,
                height: 12,
                background: isMatched ? "transparent" : "rgba(255,255,255,0.6)",
              }}
            />
          );
        })}
        {/* User's position marker */}
        {won && matchedTier !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(matchedTier / 6) * 100}%`,
              top: 0,
              transform: "translateX(-50%)",
              width: 24,
              height: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: T.text,
                border: `3px solid ${T.green}`,
                boxShadow: "0 2px 6px rgba(20, 56, 40, 0.25)",
              }}
            />
            <div
              style={{
                width: 2,
                height: 8,
                background: T.green,
              }}
            />
          </div>
        )}
        {/* Did-not-finish marker (left of scale) */}
        {!won && (
          <div
            style={{
              position: "absolute",
              left: "0%",
              top: 0,
              transform: "translateX(-50%)",
              width: 24,
              height: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: T.text,
                border: `3px solid ${T.loss}`,
                boxShadow: "0 2px 6px rgba(169, 56, 56, 0.25)",
              }}
            />
            <div
              style={{
                width: 2,
                height: 8,
                background: T.loss,
              }}
            />
          </div>
        )}
      </div>

      {/* Endpoint labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: T.textFaint,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: 500,
          padding: "0 4px",
        }}
      >
        <span>110-golfer</span>
        <span>Tour pro</span>
      </div>
    </div>
  );
}

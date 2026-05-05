// SessionDetailView
import React, { useState } from "react";
import { Trophy, Flag, ChevronRight, Info } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { BackButton } from "../components/BackButton.jsx";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { SkillSpectrum } from "../components/SkillSpectrum.jsx";
import { getBenchmarkMatch, formatDateLong } from "../helpers.js";

export function SessionDetailView({ session, onBack, onDelete, onViewBenchmarks }) {
  const drill = DRILLS[session.drillId];
  const benchmark = getBenchmarkMatch(drill, session);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const outcomeCounts = {};
  if (session.sessionType === "scoring" && drill.outcomes) {
    drill.outcomes.forEach((o) => (outcomeCounts[o.id] = 0));
    session.holes.forEach((h) => {
      outcomeCounts[h.outcomeId] = (outcomeCounts[h.outcomeId] || 0) + 1;
    });
  }

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <BackButton onClick={onBack} />

      <PageTitle
        eyebrow={formatDateLong(session.timestamp)}
        title={drill.name}
      />

      <div
        style={{
          textAlign: "center",
          padding: "1.5rem 1.25rem",
          background: session.won ? T.greenSoft : T.surface,
          borderRadius: "var(--border-radius-lg)",
          marginBottom: "1.25rem",
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
            fontSize: 48,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -1.6,
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
            fontSize: 12,
            color: session.won ? T.greenDeep : T.textDim,
            marginTop: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
            opacity: 0.7,
          }}
        >
          {session.sessionType === "spiral"
            ? `miss${session.finalMisses === 1 ? "" : "es"} · ${session.totalRounds} round${session.totalRounds === 1 ? "" : "s"}`
            : session.sessionType === "fallLine"
              ? `off · ${session.slope} slope`
              : `holes · score ${session.finalScore > 0 ? "+" : ""}${session.finalScore}`}
        </div>
      </div>

      {!benchmark.noBenchmark && (
        <div
          style={{
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem 1.25rem 1rem",
            marginBottom: "1.25rem",
          }}
        >
          <SkillSpectrum drill={drill} matchedGroup={benchmark.group} won={session.won} />
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
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
              margin: "12px auto 0",
              padding: "6px 12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            View full benchmark table
            <ChevronRight size={14} />
          </button>
        </div>
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

      {session.sessionType === "scoring" && (
        <>
          <SectionLabel>Hole breakdown</SectionLabel>
          <Card style={{ marginBottom: "1.25rem", padding: "0.5rem 1.25rem" }}>
            {drill.outcomes.map((o, i) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom:
                    i < drill.outcomes.length - 1
                      ? `0.5px solid ${T.border}`
                      : "none",
                  fontSize: 14,
                }}
              >
                <span>{o.short || o.label}</span>
                <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                  {outcomeCounts[o.id] || 0}
                </span>
              </div>
            ))}
          </Card>

          <SectionLabel>All holes</SectionLabel>
          <Card style={{ marginBottom: "1.5rem", padding: "0.5rem 1.25rem" }}>
            {session.holes.map((h, i) => {
              const outcome = drill.outcomes.find((o) => o.id === h.outcomeId);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    fontSize: 13,
                    borderBottom:
                      i < session.holes.length - 1
                        ? `0.5px solid ${T.border}`
                        : "none",
                  }}
                >
                  <span style={{ color: T.textFaint, width: 56 }}>
                    Hole {i + 1}
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

          <SectionLabel>All putts</SectionLabel>
          <Card style={{ marginBottom: "1.5rem", padding: "0.5rem 1.25rem" }}>
            {session.history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  fontSize: 13,
                  borderBottom:
                    i < session.history.length - 1
                      ? `0.5px solid ${T.border}`
                      : "none",
                }}
              >
                <span style={{ color: T.textFaint, width: 40 }}>
                  R{h.round}
                </span>
                <span style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}>
                  {h.distance} ft · {h.clock}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    color: h.made ? T.green : T.loss,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {h.made ? "Made" : "Miss"}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      {confirmingDelete ? (
        <Card style={{ padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            Delete this session? This can't be undone.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setConfirmingDelete(false)}
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
              Cancel
            </button>
            <button
              onClick={() => onDelete(session)}
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
              Delete
            </button>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setConfirmingDelete(true)}
          style={{
            width: "100%",
            padding: "11px",
            fontSize: 13,
            background: "transparent",
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-md)",
            color: T.textFaint,
            cursor: "pointer",
          }}
        >
          Delete session
        </button>
      )}
    </div>
  );
}

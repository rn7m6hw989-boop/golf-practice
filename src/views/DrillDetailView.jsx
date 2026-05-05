// DrillDetailView
import React from "react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { BackButton } from "../components/BackButton.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { Card } from "../components/Card.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { getCategoryLabel } from "../helpers.js";

export function DrillDetailView({ drillId, onBack, onStart }) {
  const drill = DRILLS[drillId];
  if (!drill) return null;

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <BackButton onClick={onBack} />

      <PageTitle
        eyebrow={`${getCategoryLabel(drill.category)}${drill.skill ? ` · ${drill.skill}` : ""} · ${drill.distance}`}
        title={drill.name}
      />

      <div
        style={{
          background: T.greenSoft,
          borderRadius: "var(--border-radius-lg)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: T.greenDeep,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Goal
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: T.greenDeep }}>
          {drill.goal}
        </div>
      </div>

      <SectionLabel>Rules</SectionLabel>
      <Card style={{ marginBottom: "1.5rem" }}>
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {drill.rules.map((rule, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {rule}
            </li>
          ))}
        </ol>
      </Card>

      {drill.sessionType === "scoring" && (
        <>
          <SectionLabel>Scoring</SectionLabel>
          <Card style={{ marginBottom: "1.5rem", padding: "0.5rem 1.25rem" }}>
            {drill.scoring.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom:
                    i < drill.scoring.length - 1
                      ? `0.5px solid ${T.border}`
                      : "none",
                  fontSize: 14,
                }}
              >
                <span>{s.outcome}</span>
                <span
                  style={{
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    color:
                      s.points > 0 ? T.green : s.points < 0 ? T.loss : T.textFaint,
                  }}
                >
                  {s.points > 0 ? "+" : ""}
                  {s.points}
                </span>
              </div>
            ))}
          </Card>

          <SectionLabel>Win conditions</SectionLabel>
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
                background: T.winSoft,
                borderRadius: "var(--border-radius-lg)",
                padding: "14px 16px",
                border: `0.5px solid ${T.win}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.greenDeep,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                  fontWeight: 500,
                }}
              >
                Win at
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: T.greenDeep, letterSpacing: -0.4 }}>
                +{drill.winThreshold}
              </div>
            </div>
            <div
              style={{
                background: T.lossSoft,
                borderRadius: "var(--border-radius-lg)",
                padding: "14px 16px",
                border: `0.5px solid ${T.loss}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.lossDeep,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                  fontWeight: 500,
                }}
              >
                Lose at
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: T.lossDeep, letterSpacing: -0.4 }}>
                {drill.loseThreshold}
              </div>
            </div>
          </div>
        </>
      )}

      {drill.sessionType === "spiral" && (
        <>
          <SectionLabel>How it's measured</SectionLabel>
          <Card style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {drill.spiralConfig.distances.map((d, i) => (
                <React.Fragment key={d}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: T.greenSoft,
                        border: `1.5px solid ${T.green}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 500,
                        color: T.greenDeep,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {d}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: T.textFaint,
                        marginTop: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      ft
                    </div>
                  </div>
                  {i < drill.spiralConfig.distances.length - 1 && (
                    <ChevronRight
                      size={14}
                      style={{ color: T.textFaint, flexShrink: 0 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.textDim,
                lineHeight: 1.5,
                paddingTop: 8,
                borderTop: `0.5px solid ${T.border}`,
              }}
            >
              Sink all five in a row to win. Your score is the number of misses
              before that happens — lower is better.
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
          onClick={() => onStart(drillId)}
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
            letterSpacing: 0.2,
          }}
        >
          Start drill
        </button>
      </div>
    </div>
  );
}

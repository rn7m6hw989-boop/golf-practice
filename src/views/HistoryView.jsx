// HistoryView
import React from "react";
import { Calendar } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { getSessionDisplayMetric } from "../helpers.js";

export function HistoryView({ sessions, onOpenSession }) {
  if (sessions.length === 0) {
    return (
      <div style={{ padding: "1.25rem 0" }}>
        <PageTitle eyebrow="History" title="No sessions yet" />
        <Card style={{ textAlign: "center", padding: "2rem 1.25rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: T.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Calendar size={20} color={T.textFaint} />
          </div>
          <div style={{ fontSize: 14, color: T.textDim }}>
            Completed drills will appear here.
          </div>
        </Card>
      </div>
    );
  }

  const byDay = {};
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    const key = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year:
        new Date().getFullYear() === d.getFullYear() ? undefined : "numeric",
    });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s);
  });

  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle eyebrow="History" title="All sessions" />

      {Object.entries(byDay).map(([day, daySessions]) => (
        <div key={day} style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              fontSize: 11,
              color: T.green,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 10,
              paddingLeft: 4,
              fontWeight: 500,
            }}
          >
            {day}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {daySessions.map((session) => {
              const drill = DRILLS[session.drillId];
              return (
                <Card
                  key={session.id}
                  onClick={() => onOpenSession(session.id)}
                  style={{ padding: "12px 16px" }}
                  accent={session.won ? T.green : T.borderStrong}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {drill?.name || session.drillId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: T.textFaint,
                          marginTop: 2,
                        }}
                      >
                        {new Date(session.timestamp).toLocaleTimeString(
                          undefined,
                          { hour: "numeric", minute: "2-digit" },
                        )}
                        {drill?.skill && (
                          <>
                            {" · "}
                            <span style={{ color: T.textDim }}>{drill.skill}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {session.won ? (
                        <>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: T.green,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {getSessionDisplayMetric(session)}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: T.green,
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                              fontWeight: 500,
                              marginTop: 2,
                            }}
                          >
                            Won
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: 12,
                            color: T.textFaint,
                          }}
                        >
                          Did not finish
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

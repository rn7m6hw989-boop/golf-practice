// HomeView
import React, { useState } from "react";
import { Target, Trophy, Flag, ChevronRight } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { BenchmarkChart } from "../components/BenchmarkChart.jsx";
import { getBenchmarkMatch, getSessionDisplayMetric, formatDate } from "../helpers.js";

export function HomeView({ sessions, onOpenSession, onChangeTab }) {
  const drills = Object.values(DRILLS);
  const recentSessions = sessions.slice(0, 5);

  const totalSessions = sessions.length;
  const last7Days = sessions.filter(
    (s) => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000,
  ).length;

  // Find drills with at least one won session, sorted by count (most data first)
  const drillsWithData = drills
    .map((d) => ({
      drill: d,
      count: sessions.filter((s) => s.drillId === d.id && s.won).length,
    }))
    .filter((d) => d.count >= 1)
    .sort((a, b) => b.count - a.count);

  const [chartDrillId, setChartDrillId] = useState(null);

  // Default chart drill = the one with the most data, recomputed when sessions
  // change. Only sets if not already chosen or if previous choice no longer
  // has data (e.g., user deleted all sessions for it).
  useEffect(() => {
    if (drillsWithData.length === 0) {
      setChartDrillId(null);
      return;
    }
    const stillValid = drillsWithData.some((d) => d.drill.id === chartDrillId);
    if (!stillValid) {
      setChartDrillId(drillsWithData[0].drill.id);
    }
  }, [sessions]);

  const selectedChartDrill = chartDrillId
    ? drillsWithData.find((d) => d.drill.id === chartDrillId)?.drill
    : drillsWithData[0]?.drill;
  const showChart = !!selectedChartDrill;

  // Get current "tier" — the median tier across the user's last 10 benchmarked
  // won sessions. Median (rather than most-recent) gives a smoother, more
  // honest read on overall skill — a single bad day doesn't drag the banner
  // down, and a single great day doesn't inflate it. Drills without published
  // benchmarks (fall-line) are excluded.
  const recentBenchmarkedSessions = sessions
    .filter((s) => {
      if (!s.won) return false;
      const d = DRILLS[s.drillId];
      return d && d.benchmarkMetric !== "fall-line-error" && d.benchmarks?.length > 0;
    })
    .slice(0, 10);

  let currentTier = null;
  if (recentBenchmarkedSessions.length > 0) {
    const tiers = recentBenchmarkedSessions
      .map((s) => {
        const match = getBenchmarkMatch(DRILLS[s.drillId], s);
        return match.group?.tier;
      })
      .filter((t) => t !== undefined && t !== null)
      .sort((a, b) => a - b);

    if (tiers.length > 0) {
      const mid = Math.floor(tiers.length / 2);
      const medianTier =
        tiers.length % 2 === 0
          ? Math.round((tiers[mid - 1] + tiers[mid]) / 2)
          : tiers[mid];

      // Find a group with the matching tier — names are consistent across
      // drills (tier 3 = 80-golfer everywhere). Use any benchmarked drill
      // that has this tier defined.
      for (const session of recentBenchmarkedSessions) {
        const drill = DRILLS[session.drillId];
        const match = drill.benchmarks.find((b) => b.tier === medianTier);
        if (match) {
          currentTier = { group: match };
          break;
        }
      }
    }
  }

  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle
        eyebrow="Practice"
        title={totalSessions === 0 ? "Welcome" : "Your progress"}
      />

      {totalSessions > 0 && (
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
              Sessions
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: -0.5 }}>
              {totalSessions}
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.textFaint,
                marginTop: 2,
              }}
            >
              all time
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
              This week
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: -0.5 }}>
              {last7Days}
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.textFaint,
                marginTop: 2,
              }}
            >
              session{last7Days === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}

      {/* Current tier banner — only when there's a recent won session */}
      {currentTier && currentTier.group && (
        <div
          style={{
            background: T.greenSoft,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
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
            <Trophy size={20} color={T.greenInk} strokeWidth={2} />
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
              Current level
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: T.greenDeep,
                lineHeight: 1.3,
              }}
            >
              {currentTier.group.group}
            </div>
            {recentBenchmarkedSessions.length >= 3 && (
              <div
                style={{
                  fontSize: 11,
                  color: T.greenDeep,
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                across last {recentBenchmarkedSessions.length} session{recentBenchmarkedSessions.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero chart with drill picker */}
      {showChart && (
        <div style={{ marginBottom: "1.5rem" }}>
          {drillsWithData.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {drillsWithData.map(({ drill }) => {
                const isActive = drill.id === selectedChartDrill.id;
                return (
                  <button
                    key={drill.id}
                    onClick={() => setChartDrillId(drill.id)}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      background: isActive ? T.green : "transparent",
                      color: isActive ? T.greenInk : T.textDim,
                      border: `0.5px solid ${isActive ? T.green : T.border}`,
                      borderRadius: 999,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "background 0.15s ease, color 0.15s ease",
                    }}
                  >
                    {drill.name}
                  </button>
                );
              })}
            </div>
          )}
          <BenchmarkChart drill={selectedChartDrill} sessions={sessions} />
        </div>
      )}

      {totalSessions > 0 && (
        <button
          onClick={() => onChangeTab && onChangeTab("drills")}
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
            letterSpacing: 0.2,
          }}
        >
          <Target size={17} strokeWidth={2} />
          Browse drills
        </button>
      )}

      {recentSessions.length > 0 && (
        <>
          <SectionLabel>Recent sessions</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentSessions.map((session) => {
              const drill = DRILLS[session.drillId];
              return (
                <Card
                  key={session.id}
                  onClick={() => onOpenSession(session.id)}
                  style={{ padding: "12px 16px" }}
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
                        {formatDate(session.timestamp)}
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
                          <div style={{ fontSize: 14, fontWeight: 500, color: T.green }}>
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
        </>
      )}

      {totalSessions === 0 && (
        <Card style={{ textAlign: "center", padding: "2rem 1.25rem" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: T.greenSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Flag size={24} color={T.green} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            Ready to practice?
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.textDim,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            Choose a drill to log your first session.
          </div>
          <button
            onClick={() => onChangeTab && onChangeTab("drills")}
            style={{
              padding: "11px 20px",
              fontSize: 14,
              fontWeight: 500,
              background: T.green,
              color: T.greenInk,
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Target size={15} strokeWidth={2} />
            Browse drills
          </button>
        </Card>
      )}
    </div>
  );
}

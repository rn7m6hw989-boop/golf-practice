// StatsView — unified chronological activity feed showing drill sessions
// and rounds together. Replaces the old History tab. Will eventually grow
// to include aggregated stats sections at the top, alongside this list.

import React, { useState, useEffect } from "react";
import { Calendar, Flag, Target } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import {
  getRecentActivity,
  getSessionDisplayMetric,
  formatDate,
} from "../helpers.js";

export function StatsView({ onOpenSession, onOpenRound, refreshKey }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await getRecentActivity();
      if (!cancelled) setActivity(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (activity === null) {
    return (
      <div style={{ padding: "1.25rem 0 1rem" }}>
        <PageTitle eyebrow="Stats" title="Activity" />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div style={{ padding: "1.25rem 0 1rem" }}>
        <PageTitle eyebrow="Stats" title="Activity" />
        <Card style={{ textAlign: "center", padding: "2rem 1.25rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: T.surfaceRaised,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Calendar size={20} color={T.textFaint} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            No activity yet
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.textDim,
              lineHeight: 1.5,
            }}
          >
            Drills and rounds you complete will appear here.
          </div>
        </Card>
      </div>
    );
  }

  // Group by day for visual hierarchy.
  const byDay = {};
  for (const item of activity) {
    const dateKey = new Date(item.timestamp).toDateString();
    if (!byDay[dateKey]) byDay[dateKey] = [];
    byDay[dateKey].push(item);
  }
  const dayKeys = Object.keys(byDay).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle eyebrow="Stats" title="Activity" />

      {dayKeys.map((dayKey) => {
        const dayItems = byDay[dayKey];
        const dayDate = new Date(dayKey);
        const today = new Date();
        const isToday = dayDate.toDateString() === today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = dayDate.toDateString() === yesterday.toDateString();
        const dayLabel = isToday
          ? "Today"
          : isYesterday
            ? "Yesterday"
            : dayDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year:
                  dayDate.getFullYear() !== today.getFullYear()
                    ? "numeric"
                    : undefined,
              });

        return (
          <div key={dayKey} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                color: T.textFaint,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 500,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              {dayLabel}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {dayItems.map((item) =>
                item.type === "drillSession" ? (
                  <DrillSessionCard
                    key={item.data.id}
                    session={item.data}
                    onOpen={() => onOpenSession(item.data.id)}
                  />
                ) : (
                  <RoundCard
                    key={item.data.id}
                    round={item.data}
                    onOpen={() => onOpenRound(item.data.id)}
                  />
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DrillSessionCard({ session, onOpen }) {
  const drill = DRILLS[session.drillId];
  return (
    <Card
      onClick={onOpen}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <Target size={12} color={T.textFaint} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {drill?.name || session.drillId}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textFaint,
              marginLeft: 20,
            }}
          >
            {new Date(session.timestamp).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
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
                color: T.textDim,
              }}
            >
              {getSessionDisplayMetric(session)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function RoundCard({ round, onOpen }) {
  // Compute a brief score summary if score data is present
  let scoreLabel = null;
  let parLabel = null;
  if (round.holes) {
    let totalScore = 0;
    let totalPar = 0;
    let holesPlayed = 0;
    Object.values(round.holes).forEach((h) => {
      if (h && h.score) {
        totalScore += h.score;
        totalPar += h.par || 0;
        holesPlayed++;
      }
    });
    if (holesPlayed > 0) {
      scoreLabel = String(totalScore);
      const diff = totalScore - totalPar;
      parLabel = totalPar > 0
        ? `${diff >= 0 ? "+" : ""}${diff} · ${holesPlayed} hole${holesPlayed === 1 ? "" : "s"}`
        : `${holesPlayed} hole${holesPlayed === 1 ? "" : "s"}`;
    }
  }

  return (
    <Card
      onClick={onOpen}
      style={{ padding: "12px 16px" }}
      accent={T.green}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <Flag size={12} color={T.textFaint} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {round.course || "Round"}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textFaint,
              marginLeft: 20,
            }}
          >
            {new Date(round.timestamp).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
            {round.tees && (
              <>
                {" · "}
                <span style={{ color: T.textDim }}>{round.tees}</span>
              </>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {scoreLabel ? (
            <>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.green,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {scoreLabel}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: T.textFaint,
                  marginTop: 2,
                }}
              >
                {parLabel}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: T.textDim }}>—</div>
          )}
        </div>
      </div>
    </Card>
  );
}

// DrillsView
import React, { useState } from "react";
import { ChevronRight, Target } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS, CATEGORIES } from "../drills.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { getCategoryLabel, getSessionBenchmarkValue, getSessionDisplayMetric } from "../helpers.js";

export function DrillsView({ sessions, onOpenDrill }) {
  const drills = Object.values(DRILLS);

  // Build the filter options. Always show "All" plus every category in the
  // CATEGORIES list — even ones with no drills yet. This communicates the
  // full scope of the app and prepares the user for future additions.
  // Empty categories appear dimmed and trigger an empty state when selected.
  const presentCategoryIds = new Set(drills.map((d) => d.category));
  const filterOptions = [
    { id: "all", label: "All", isEmpty: false },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      isEmpty: !presentCategoryIds.has(c.id),
    })),
  ];

  const [activeFilter, setActiveFilter] = useState("all");

  const visibleDrills =
    activeFilter === "all"
      ? drills
      : drills.filter((d) => d.category === activeFilter);

  return (
    <div style={{ padding: "1.25rem 0 1rem" }}>
      <PageTitle eyebrow="Drills" title="Choose a drill" />

      {/* Category filter pills — always shown to reveal full scope of app */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {filterOptions.map((opt) => {
          const isActive = opt.id === activeFilter;
          return (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              style={{
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 500,
                background: isActive ? T.green : "transparent",
                color: isActive
                  ? T.greenInk
                  : opt.isEmpty
                    ? T.textFaint
                    : T.textDim,
                border: `0.5px solid ${
                  isActive ? T.green : opt.isEmpty ? T.border : T.borderStrong
                }`,
                borderRadius: 999,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                opacity: opt.isEmpty && !isActive ? 0.55 : 1,
                transition: "background 0.15s ease, color 0.15s ease, opacity 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Empty state when filtered to a category with no drills yet */}
      {visibleDrills.length === 0 && (
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
            <Target size={20} color={T.textFaint} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            No {getCategoryLabel(activeFilter).toLowerCase()} drills yet
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.textDim,
              lineHeight: 1.5,
            }}
          >
            More drills are on the way.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleDrills.map((drill) => {
          const drillSessions = sessions.filter((s) => s.drillId === drill.id);
          const wonForDrill = drillSessions.filter((s) => s.won);
          const bestSession =
            wonForDrill.length > 0
              ? wonForDrill.reduce((best, s) =>
                  getSessionBenchmarkValue(drill, s) <
                  getSessionBenchmarkValue(drill, best)
                    ? s
                    : best,
                )
              : null;
          const bestLabel = bestSession ? getSessionDisplayMetric(bestSession) : null;

          return (
            <Card
              key={drill.id}
              onClick={() => onOpenDrill(drill.id)}
              accent={drillSessions.length > 0 ? T.green : undefined}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        letterSpacing: -0.2,
                      }}
                    >
                      {drill.name}
                    </span>
                    {drill.skill && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          background: T.greenSoft,
                          color: T.greenDeep,
                          borderRadius: 999,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        {drill.skill}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.textDim,
                      lineHeight: 1.5,
                    }}
                  >
                    {drill.shortDescription}
                  </div>
                  {drillSessions.length > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textFaint,
                        marginTop: 8,
                      }}
                    >
                      {drillSessions.length} session
                      {drillSessions.length === 1 ? "" : "s"}
                      {bestLabel && (
                        <>
                          {" · best "}
                          <span style={{ color: T.green, fontWeight: 500 }}>
                            {bestLabel}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight
                  size={18}
                  style={{
                    color: T.textFaint,
                    flexShrink: 0,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

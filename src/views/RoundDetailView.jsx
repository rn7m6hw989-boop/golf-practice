// RoundDetailView — view of a past (completed) round. Structurally similar
// to the RoundSummaryView but interactive:
//   - Each hole in the grid is tappable (opens hole-finish modal in edit
//     mode for that hole)
//   - Per-hole shot list is displayed, with tap-to-edit on each shot
//   - Delete round option at the bottom
//
// Edits write back to storage immediately and notify the parent so the
// rounds list refreshes.

import React, { useState, useEffect } from "react";
import { Flag, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { T } from "../theme.js";
import { Card } from "../components/Card.jsx";
import { PageTitle } from "../components/PageTitle.jsx";
import { SectionLabel } from "../components/SectionLabel.jsx";
import { BackButton } from "../components/BackButton.jsx";
import { HoleGrid } from "../components/HoleGrid.jsx";
import { HoleFinishModal } from "../components/HoleFinishModal.jsx";
import { storage } from "../storage.js";

const TIGER_5 = [
  { key: "double", label: "Doubles or worse" },
  { key: "bogeyPar5", label: "Bogeys on Par 5s" },
  { key: "threePutt", label: "3-putts" },
  { key: "twoChips", label: "2+ chips/pitches" },
  { key: "bogey150", label: "Bogeys from 150 & in" },
];

export function RoundDetailView({ round, onBack, onDelete, onChanged }) {
  const [r, setR] = useState(round);
  const [editingHole, setEditingHole] = useState(null);
  const [expandedHole, setExpandedHole] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setR(round);
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute totals
  let totalScore = 0;
  let totalPar = 0;
  let holesPlayed = 0;
  const t5Counts = { double: 0, bogeyPar5: 0, threePutt: 0, twoChips: 0, bogey150: 0 };

  if (r.holes) {
    Object.values(r.holes).forEach((h) => {
      if (h && h.score) {
        totalScore += h.score;
        totalPar += h.par || 0;
        holesPlayed++;
        if (h.mistakes) {
          Object.keys(t5Counts).forEach((k) => {
            if (h.mistakes[k]) t5Counts[k]++;
          });
        }
      }
    });
  }
  const t5Total = Object.values(t5Counts).reduce((a, b) => a + b, 0);
  const totalShots = r.shots ? r.shots.length : 0;
  const totalPenalty = r.shots
    ? r.shots.reduce((acc, s) => acc + (s.penalty || 0), 0)
    : 0;

  const scoreDiff = totalScore - totalPar;
  const scoreDiffLabel =
    holesPlayed === 0
      ? "—"
      : scoreDiff === 0
        ? "E"
        : scoreDiff > 0
          ? `+${scoreDiff}`
          : `${scoreDiff}`;
  const scoreDiffColor =
    holesPlayed === 0
      ? T.textFaint
      : scoreDiff < 0
        ? T.green
        : scoreDiff === 0
          ? T.text
          : scoreDiff <= 5
            ? T.warn
            : T.loss;

  const dateLabel = r.date
    ? new Date(r.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const persistRound = async (next) => {
    setR(next);
    await storage.saveRound(next);
    onChanged && onChanged();
  };

  const handleSelectHole = (holeNum) => {
    const data = r.holes && r.holes[holeNum];
    if (!data || !data.score) {
      // Hole has no formal data — open the finish modal to add it
      setEditingHole(holeNum);
    } else {
      setEditingHole(holeNum);
    }
  };

  const handleSaveHole = async (data) => {
    if (editingHole === null) return;
    const next = {
      ...r,
      holes: {
        ...(r.holes || {}),
        [editingHole]: data,
      },
    };
    await persistRound(next);
    setEditingHole(null);
  };

  const handleConfirmDelete = async () => {
    await onDelete(r.id);
  };

  const editingData = editingHole !== null && r.holes ? r.holes[editingHole] : null;
  const editingPar =
    (editingData && editingData.par) ||
    (r.pars && r.pars[(editingHole || 1) - 1]) ||
    4;

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <BackButton onClick={onBack} />

      <PageTitle eyebrow="Round" title={r.course || "Untitled course"} />

      {/* Headline score card */}
      <Card style={{ padding: "1.5rem 1.25rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: T.textFaint,
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <Flag size={11} />
          {dateLabel}
          {r.tees && ` · ${r.tees}`}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: scoreDiffColor,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: -1,
            }}
          >
            {scoreDiffLabel}
          </div>
          <div
            style={{
              fontSize: 14,
              color: T.textDim,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalScore} / {totalPar}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: T.textFaint,
            marginTop: 6,
          }}
        >
          {holesPlayed === 0
            ? "No holes recorded"
            : holesPlayed === 18
              ? "18 holes"
              : `${holesPlayed} hole${holesPlayed === 1 ? "" : "s"} played`}
        </div>
      </Card>

      {/* Tiger 5 card */}
      <SectionLabel>Tiger 5 mistakes</SectionLabel>
      <Card style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: t5Total >= 4 ? T.warn : t5Total >= 8 ? T.loss : T.text,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t5Total}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            total mistake{t5Total === 1 ? "" : "s"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TIGER_5.map((m) => {
            const count = t5Counts[m.key];
            return (
              <div
                key={m.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  color: count > 0 ? T.text : T.textFaint,
                }}
              >
                <span>{m.label}</span>
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: count > 0 ? 500 : 400,
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Shot totals (only if shots were captured) */}
      {totalShots > 0 && (
        <>
          <SectionLabel>Shots logged</SectionLabel>
          <Card style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <span style={{ color: T.textDim }}>Total shots</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {totalShots}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <span style={{ color: T.textDim }}>Penalty strokes</span>
              <span
                style={{
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                  color: totalPenalty > 0 ? T.warn : T.text,
                }}
              >
                {totalPenalty}
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Per-hole grid — tappable */}
      <SectionLabel>Hole by hole</SectionLabel>
      <Card style={{ padding: "0.75rem", marginBottom: "1rem" }}>
        <HoleGrid
          holes={r.holes}
          pars={r.pars}
          onSelectHole={handleSelectHole}
        />
        <div
          style={{
            fontSize: 11,
            color: T.textFaint,
            textAlign: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTop: `0.5px solid ${T.border}`,
          }}
        >
          Tap any hole to view or edit
        </div>
      </Card>

      {/* Holes list — expandable, shows shots */}
      {totalShots > 0 && (
        <>
          <SectionLabel>Hole details</SectionLabel>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: "1rem",
            }}
          >
            {Array.from({ length: 18 }, (_, i) => i + 1)
              .filter((h) => {
                const hasShots = (r.shots || []).some((s) => s.hole === h);
                const hasData = r.holes && r.holes[h] && r.holes[h].score;
                return hasShots || hasData;
              })
              .map((h) => (
                <HoleDetailRow
                  key={h}
                  hole={h}
                  round={r}
                  expanded={expandedHole === h}
                  onToggle={() =>
                    setExpandedHole(expandedHole === h ? null : h)
                  }
                  onEditHole={() => setEditingHole(h)}
                />
              ))}
          </div>
        </>
      )}

      {/* Delete round */}
      <div style={{ marginTop: "2rem" }}>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 13,
              fontWeight: 500,
              background: "transparent",
              color: T.textDim,
              border: `0.5px solid ${T.border}`,
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Trash2 size={13} />
            Delete this round
          </button>
        ) : (
          <Card style={{ padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 14, marginBottom: 12 }}>
              Delete this round? It will be removed permanently.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmDelete(false)}
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
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: "11px",
                  fontSize: 14,
                  background: T.lossSoft,
                  color: T.loss,
                  border: "none",
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Hole finish modal (in edit mode) */}
      {editingHole !== null && (
        <HoleFinishModal
          holeNumber={editingHole}
          initialPar={editingPar}
          initialScore={editingData?.score || 0}
          initialMistakes={editingData?.mistakes || {}}
          initialNotes={editingData?.notes || ""}
          isEdit={!!(editingData && editingData.score)}
          onSave={handleSaveHole}
          onCancel={() => setEditingHole(null)}
        />
      )}
    </div>
  );
}

function HoleDetailRow({ hole, round, expanded, onToggle, onEditHole }) {
  const data = round.holes && round.holes[hole];
  const par = (data && data.par) || (round.pars && round.pars[hole - 1]) || null;
  const score = data && data.score;
  const shots = (round.shots || [])
    .filter((s) => s.hole === hole)
    .sort((a, b) => a.shotNum - b.shotNum);
  const notes = data && data.notes;

  let scoreColor = T.textFaint;
  if (score && par) {
    const diff = score - par;
    scoreColor =
      diff < 0 ? T.green : diff === 0 ? T.text : diff === 1 ? T.warn : T.loss;
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: T.textFaint,
            fontWeight: 500,
            minWidth: 32,
          }}
        >
          Hole {hole}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: T.textDim }}>
          Par {par || "—"}
          {shots.length > 0 && ` · ${shots.length} shot${shots.length === 1 ? "" : "s"}`}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: scoreColor,
            fontVariantNumeric: "tabular-nums",
            minWidth: 24,
            textAlign: "right",
          }}
        >
          {score || "—"}
        </div>
        {expanded ? (
          <ChevronUp size={14} color={T.textFaint} />
        ) : (
          <ChevronDown size={14} color={T.textFaint} />
        )}
      </div>
      {expanded && (
        <div
          style={{
            padding: "10px 14px 14px",
            borderTop: `0.5px solid ${T.border}`,
            background: T.bg,
          }}
        >
          {shots.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: T.textFaint,
                fontStyle: "italic",
                marginBottom: 10,
              }}
            >
              No shots recorded
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {shots.map((shot) => (
                <div
                  key={shot.shotNum}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    padding: "4px 0",
                    color: T.textDim,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      color: T.textFaint,
                      minWidth: 14,
                      textAlign: "center",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    #{shot.shotNum}
                  </span>
                  <span style={{ flex: 1 }}>{shot.lie}</span>
                  <span
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: T.text,
                    }}
                  >
                    {shot.dist} {shot.lie === "Green" ? "ft" : "yd"}
                  </span>
                  {shot.penalty > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        color: T.warn,
                        fontWeight: 500,
                      }}
                    >
                      +{shot.penalty}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {notes && (
            <div
              style={{
                fontSize: 12,
                color: T.textDim,
                lineHeight: 1.5,
                marginBottom: 10,
                paddingTop: 6,
                borderTop: `0.5px dashed ${T.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: T.textFaint,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                  marginTop: 4,
                }}
              >
                Notes
              </div>
              {notes}
            </div>
          )}
          <button
            onClick={onEditHole}
            style={{
              width: "100%",
              padding: "9px",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              border: `0.5px solid ${T.borderStrong}`,
              borderRadius: "var(--border-radius-md)",
              color: T.text,
              cursor: "pointer",
            }}
          >
            Edit hole
          </button>
        </div>
      )}
    </div>
  );
}

// RoundView — round-tracking screen with shot capture.
//
// Phase B2 includes:
//   - Header showing course, current hole, par
//   - Prev/next hole navigation (basic — full grid comes in B5)
//   - Lie selector (Tee / Fairway / Rough / Sand / Recovery / Green)
//   - Distance numpad with auto unit (yards / feet for green)
//   - Penalty stroke counter
//   - Add shot button
//   - Shot list for current hole with tap-to-edit
//   - Shot edit modal
//   - Exit (returns to Rounds tab, round persists) and End round
//
// Phase B3 will add the hole-finish modal (par/score/Tiger 5/notes).
// Phase B5 will add the 18-hole grid overview.

import React, { useState, useEffect } from "react";
import {
  Flag,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Undo2,
  Delete,
} from "lucide-react";
import { T } from "../theme.js";
import { Card } from "../components/Card.jsx";
import { storage } from "../storage.js";

const LIES = ["Tee", "Fairway", "Rough", "Sand", "Recovery", "Green"];

export function RoundView({ round, onEndRound, onExit, onRoundChanged }) {
  const [currentHole, setCurrentHole] = useState(1);
  const [pendingLie, setPendingLie] = useState(null);
  const [pendingDist, setPendingDist] = useState("");
  const [pendingPenalty, setPendingPenalty] = useState(0);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [editingShot, setEditingShot] = useState(null);

  // Local mirror of the round so we can update state immediately without
  // waiting for storage to round-trip. The round prop is what we initialize
  // from; subsequent updates persist to storage and notify the parent via
  // onRoundChanged() so the parent can refresh.
  const [r, setR] = useState(round);

  // If the parent passes us a different round (unusual), reset.
  useEffect(() => {
    setR(round);
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const par = r.pars && r.pars[currentHole - 1];
  const shotsThisHole = (r.shots || [])
    .filter((s) => s.hole === currentHole)
    .sort((a, b) => a.shotNum - b.shotNum);

  // Score-so-far for the current hole = number of shots + total penalty
  // strokes. (This is the working in-hole score before the user formally
  // closes the hole via the hole modal in B3.)
  const scoreSoFar =
    shotsThisHole.length +
    shotsThisHole.reduce((acc, s) => acc + (s.penalty || 0), 0);

  const persistRound = async (next) => {
    setR(next);
    await storage.setActiveRound(next);
    onRoundChanged && onRoundChanged();
  };

  const canAddShot =
    pendingLie !== null && pendingDist !== "" && parseInt(pendingDist, 10) > 0;

  const handleAddShot = async () => {
    if (!canAddShot) return;
    const newShot = {
      hole: currentHole,
      shotNum: shotsThisHole.length + 1,
      lie: pendingLie,
      dist: parseInt(pendingDist, 10),
      penalty: pendingPenalty,
    };
    const next = {
      ...r,
      shots: [...(r.shots || []), newShot],
    };
    await persistRound(next);
    // Clear inputs after a successful add — fresh state for the next shot.
    setPendingLie(null);
    setPendingDist("");
    setPendingPenalty(0);
  };

  const handleUndoShot = async () => {
    if (shotsThisHole.length === 0) return;
    const lastShot = shotsThisHole[shotsThisHole.length - 1];
    const next = {
      ...r,
      shots: r.shots.filter(
        (s) => !(s.hole === lastShot.hole && s.shotNum === lastShot.shotNum),
      ),
    };
    await persistRound(next);
  };

  const handleNumpadDigit = (digit) => {
    if (pendingDist.length >= 4) return;
    const next = pendingDist === "0" ? digit : pendingDist + digit;
    setPendingDist(next);
  };

  const handleNumpadBackspace = () => {
    setPendingDist(pendingDist.slice(0, -1));
  };

  const handleNumpadClear = () => {
    setPendingDist("");
  };

  const handlePrevHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
      setPendingLie(null);
      setPendingDist("");
      setPendingPenalty(0);
    }
  };

  const handleNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
      setPendingLie(null);
      setPendingDist("");
      setPendingPenalty(0);
    }
  };

  const handleEditShot = (shot) => {
    setEditingShot(shot);
  };

  const handleSaveEditedShot = async (updated) => {
    if (!editingShot) return;
    const next = {
      ...r,
      shots: r.shots.map((s) =>
        s.hole === editingShot.hole && s.shotNum === editingShot.shotNum
          ? { ...s, ...updated }
          : s,
      ),
    };
    await persistRound(next);
    setEditingShot(null);
  };

  const handleDeleteEditedShot = async () => {
    if (!editingShot) return;
    // Remove the shot, then renumber any subsequent shots in the same hole.
    const remaining = r.shots
      .filter(
        (s) => !(s.hole === editingShot.hole && s.shotNum === editingShot.shotNum),
      )
      .map((s) => {
        if (s.hole === editingShot.hole && s.shotNum > editingShot.shotNum) {
          return { ...s, shotNum: s.shotNum - 1 };
        }
        return s;
      });
    const next = { ...r, shots: remaining };
    await persistRound(next);
    setEditingShot(null);
  };

  const distanceUnit = pendingLie === "Green" ? "feet" : "yards";

  return (
    <div style={{ padding: "1rem 0 1.5rem" }}>
      {/* Top bar: Exit / status / End */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={onExit}
          style={topBarBtnStyle}
        >
          <X size={16} />
          Exit
        </button>
        <div
          style={{
            fontSize: 11,
            color: T.green,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: 500,
          }}
        >
          Round in progress
        </div>
        <button
          onClick={() => setShowConfirmEnd(true)}
          style={topBarBtnStyle}
        >
          <Check size={16} />
          End
        </button>
      </div>

      {showConfirmEnd && (
        <Card style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            End this round? It moves to your past rounds and you can edit it
            later.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowConfirmEnd(false)}
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
              Keep going
            </button>
            <button
              onClick={onEndRound}
              style={{
                flex: 1,
                padding: "11px",
                fontSize: 14,
                background: T.green,
                color: T.greenInk,
                border: "none",
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              End round
            </button>
          </div>
        </Card>
      )}

      {/* Course header */}
      <div
        style={{
          fontSize: 12,
          color: T.textFaint,
          marginBottom: 4,
          paddingLeft: 2,
        }}
      >
        <Flag
          size={11}
          style={{ verticalAlign: "middle", marginRight: 6 }}
        />
        {r.course || "Untitled course"}
        {r.tees && ` · ${r.tees}`}
      </div>

      {/* Hole navigation header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "12px 8px",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={handlePrevHole}
          disabled={currentHole === 1}
          style={{
            ...holeNavBtnStyle,
            opacity: currentHole === 1 ? 0.3 : 1,
            cursor: currentHole === 1 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, color: T.textFaint, letterSpacing: 0.5 }}>
            Hole
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {currentHole}
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textDim,
              marginTop: 2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Par {par || "—"}
            {scoreSoFar > 0 && ` · ${scoreSoFar} so far`}
          </div>
        </div>
        <button
          onClick={handleNextHole}
          disabled={currentHole === 18}
          style={{
            ...holeNavBtnStyle,
            opacity: currentHole === 18 ? 0.3 : 1,
            cursor: currentHole === 18 ? "default" : "pointer",
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Lie selector */}
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
        Lie
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: "1rem",
        }}
      >
        {LIES.map((lie) => {
          const selected = pendingLie === lie;
          return (
            <button
              key={lie}
              onClick={() => setPendingLie(lie)}
              style={{
                padding: "12px 4px",
                fontSize: 14,
                fontWeight: 500,
                background: selected ? T.green : T.surface,
                color: selected ? T.greenInk : T.text,
                border: `0.5px solid ${selected ? T.green : T.borderStrong}`,
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
              }}
            >
              {lie}
            </button>
          );
        })}
      </div>

      {/* Distance display + numpad */}
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
        Distance
      </div>
      <div
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "12px 16px",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pendingDist || "0"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: T.textFaint,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          {distanceUnit}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: "1rem",
        }}
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => handleNumpadDigit(d)}
            style={numpadBtnStyle}
          >
            {d}
          </button>
        ))}
        <button onClick={handleNumpadClear} style={numpadActionBtnStyle}>
          Clear
        </button>
        <button onClick={() => handleNumpadDigit("0")} style={numpadBtnStyle}>
          0
        </button>
        <button onClick={handleNumpadBackspace} style={numpadActionBtnStyle}>
          <Delete size={16} />
        </button>
      </div>

      {/* Penalty counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: "var(--border-radius-md)",
          padding: "10px 14px",
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500 }}>Penalty strokes</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setPendingPenalty(Math.max(0, pendingPenalty - 1))}
            disabled={pendingPenalty === 0}
            style={{
              ...penaltyBtnStyle,
              opacity: pendingPenalty === 0 ? 0.3 : 1,
            }}
          >
            <Minus size={16} />
          </button>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              minWidth: 18,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pendingPenalty}
          </div>
          <button
            onClick={() => setPendingPenalty(Math.min(5, pendingPenalty + 1))}
            disabled={pendingPenalty === 5}
            style={{
              ...penaltyBtnStyle,
              opacity: pendingPenalty === 5 ? 0.3 : 1,
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Add shot */}
      <button
        onClick={handleAddShot}
        disabled={!canAddShot}
        style={{
          width: "100%",
          padding: "14px 16px",
          fontSize: 15,
          fontWeight: 500,
          background: canAddShot ? T.green : T.surface,
          color: canAddShot ? T.greenInk : T.textFaint,
          border: canAddShot ? "none" : `0.5px solid ${T.border}`,
          borderRadius: "var(--border-radius-lg)",
          cursor: canAddShot ? "pointer" : "not-allowed",
          marginBottom: "1.25rem",
        }}
      >
        Add shot
      </button>

      {/* Shot list for current hole */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: T.textFaint,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
          }}
        >
          Shots this hole ({shotsThisHole.length})
        </div>
        {shotsThisHole.length > 0 && (
          <button
            onClick={handleUndoShot}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: T.textDim,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              fontWeight: 500,
            }}
          >
            <Undo2 size={12} />
            Undo last
          </button>
        )}
      </div>
      {shotsThisHole.length === 0 ? (
        <Card style={{ padding: "1.25rem", textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              color: T.textDim,
              fontStyle: "italic",
            }}
          >
            No shots recorded yet
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {shotsThisHole.map((shot) => (
            <Card
              key={`${shot.hole}-${shot.shotNum}`}
              onClick={() => handleEditShot(shot)}
              style={{ padding: "10px 14px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.textFaint,
                    minWidth: 16,
                    textAlign: "center",
                  }}
                >
                  #{shot.shotNum}
                </div>
                <div style={{ flex: 1 }}>{shot.lie}</div>
                <div
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color: T.text,
                  }}
                >
                  {shot.dist} {shot.lie === "Green" ? "ft" : "yd"}
                </div>
                {shot.penalty > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: T.warn,
                      fontWeight: 500,
                    }}
                  >
                    +{shot.penalty} pen
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Shot edit modal */}
      {editingShot && (
        <ShotEditModal
          shot={editingShot}
          onSave={handleSaveEditedShot}
          onDelete={handleDeleteEditedShot}
          onCancel={() => setEditingShot(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Shot edit modal
// ----------------------------------------------------------------------------

function ShotEditModal({ shot, onSave, onDelete, onCancel }) {
  const [lie, setLie] = useState(shot.lie);
  const [dist, setDist] = useState(String(shot.dist));
  const [penalty, setPenalty] = useState(shot.penalty || 0);

  const distNum = parseInt(dist, 10);
  const canSave = lie && !isNaN(distNum) && distNum > 0;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderTopLeftRadius: "var(--border-radius-lg)",
          borderTopRightRadius: "var(--border-radius-lg)",
          padding:
            "1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))",
          width: "100%",
          maxWidth: 480,
          borderTop: `0.5px solid ${T.borderStrong}`,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          Edit shot #{shot.shotNum}
        </div>

        <div
          style={{
            fontSize: 11,
            color: T.textFaint,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Lie
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 5,
            marginBottom: 14,
          }}
        >
          {LIES.map((l) => {
            const selected = lie === l;
            return (
              <button
                key={l}
                onClick={() => setLie(l)}
                style={{
                  padding: "10px 4px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: selected ? T.green : T.surfaceRaised,
                  color: selected ? T.greenInk : T.text,
                  border: `0.5px solid ${selected ? T.green : T.borderStrong}`,
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 11,
            color: T.textFaint,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Distance ({lie === "Green" ? "feet" : "yards"})
        </div>
        <input
          type="number"
          value={dist}
          onChange={(e) => setDist(e.target.value)}
          inputMode="numeric"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 18,
            background: T.surfaceRaised,
            border: `0.5px solid ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            color: T.text,
            outline: "none",
            fontFamily: "inherit",
            fontVariantNumeric: "tabular-nums",
            marginBottom: 14,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: T.surfaceRaised,
            border: `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>Penalty strokes</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setPenalty(Math.max(0, penalty - 1))}
              disabled={penalty === 0}
              style={{
                ...penaltyBtnStyle,
                opacity: penalty === 0 ? 0.3 : 1,
              }}
            >
              <Minus size={16} />
            </button>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                minWidth: 18,
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {penalty}
            </div>
            <button
              onClick={() => setPenalty(Math.min(5, penalty + 1))}
              disabled={penalty === 5}
              style={{
                ...penaltyBtnStyle,
                opacity: penalty === 5 ? 0.3 : 1,
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() =>
              onSave({ lie, dist: parseInt(dist, 10), penalty })
            }
            disabled={!canSave}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: canSave ? T.green : T.surfaceRaised,
              color: canSave ? T.greenInk : T.textFaint,
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            Save changes
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "11px 16px",
                fontSize: 14,
                fontWeight: 500,
                background: "transparent",
                color: T.text,
                border: `0.5px solid ${T.borderStrong}`,
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              style={{
                flex: 1,
                padding: "11px 16px",
                fontSize: 14,
                fontWeight: 500,
                background: T.lossSoft,
                color: T.loss,
                border: "none",
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
              }}
            >
              Delete shot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Shared styles
// ----------------------------------------------------------------------------

const topBarBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  background: "transparent",
  border: "none",
  color: T.textDim,
  fontSize: 14,
  padding: "8px",
  margin: "-8px",
  cursor: "pointer",
  fontWeight: 500,
};

const holeNavBtnStyle = {
  background: "transparent",
  border: "none",
  color: T.text,
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
};

const numpadBtnStyle = {
  padding: "16px 0",
  fontSize: 22,
  fontWeight: 500,
  background: T.surface,
  color: T.text,
  border: `0.5px solid ${T.border}`,
  borderRadius: "var(--border-radius-md)",
  cursor: "pointer",
  fontVariantNumeric: "tabular-nums",
};

const numpadActionBtnStyle = {
  padding: "16px 0",
  fontSize: 13,
  fontWeight: 500,
  background: T.surface,
  color: T.textDim,
  border: `0.5px solid ${T.border}`,
  borderRadius: "var(--border-radius-md)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const penaltyBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: T.surfaceRaised,
  border: `0.5px solid ${T.border}`,
  color: T.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

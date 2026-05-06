// RoundView — round-tracking screen with shot capture (redesigned).
//
// Layout principles:
//   - Status (course / hole / par / score-so-far) collapses into a compact
//     header row, not a giant card.
//   - The primary task (entering a shot: lie + distance + add) dominates.
//   - The native numeric keypad is used instead of a custom in-screen numpad.
//   - Penalty is hidden behind a progressive-disclosure link by default.
//   - Hole navigation is a small footer row, not a top-of-screen card.
//
// Phase B3 will add the hole-finish modal (par/score/Tiger 5/notes).
// Phase B5 will replace prev/next hole nav with the 18-hole grid overview.

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Undo2,
  AlertTriangle,
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
  const [showPenalty, setShowPenalty] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [editingShot, setEditingShot] = useState(null);

  const distInputRef = useRef(null);

  // Local mirror of the round so updates are immediate. Persists to storage
  // on every change.
  const [r, setR] = useState(round);

  useEffect(() => {
    setR(round);
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const par = r.pars && r.pars[currentHole - 1];
  const shotsThisHole = (r.shots || [])
    .filter((s) => s.hole === currentHole)
    .sort((a, b) => a.shotNum - b.shotNum);

  const scoreSoFar =
    shotsThisHole.length +
    shotsThisHole.reduce((acc, s) => acc + (s.penalty || 0), 0);

  const persistRound = async (next) => {
    setR(next);
    await storage.setActiveRound(next);
    onRoundChanged && onRoundChanged();
  };

  const distNum = parseInt(pendingDist, 10);
  const canAddShot =
    pendingLie !== null && !isNaN(distNum) && distNum > 0;

  const handleAddShot = async () => {
    if (!canAddShot) return;
    const newShot = {
      hole: currentHole,
      shotNum: shotsThisHole.length + 1,
      lie: pendingLie,
      dist: distNum,
      penalty: pendingPenalty,
    };
    const next = {
      ...r,
      shots: [...(r.shots || []), newShot],
    };
    await persistRound(next);
    setPendingLie(null);
    setPendingDist("");
    setPendingPenalty(0);
    setShowPenalty(false);
    if (distInputRef.current) distInputRef.current.blur();
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

  const goToHole = (h) => {
    if (h < 1 || h > 18) return;
    setCurrentHole(h);
    setPendingLie(null);
    setPendingDist("");
    setPendingPenalty(0);
    setShowPenalty(false);
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
    <div style={{ padding: "0.75rem 0 1rem" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <button onClick={onExit} style={topBarBtnStyle}>
          <X size={15} />
          Exit
        </button>
        <div
          style={{
            fontSize: 10,
            color: T.green,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: 500,
          }}
        >
          Round in progress
        </div>
        <button onClick={() => setShowConfirmEnd(true)} style={topBarBtnStyle}>
          <Check size={15} />
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

      {/* Compact info bar — course + hole status in two tight lines */}
      <div style={{ marginBottom: "1.25rem", paddingLeft: 2 }}>
        <div
          style={{
            fontSize: 12,
            color: T.textFaint,
            marginBottom: 4,
          }}
        >
          {r.course || "Untitled course"}
          {r.tees && ` · ${r.tees}`}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: T.textFaint,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 500,
            }}
          >
            Hole
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: T.text,
              lineHeight: 1,
            }}
          >
            {currentHole}
          </span>
          <span
            style={{
              fontSize: 13,
              color: T.textDim,
            }}
          >
            Par {par || "—"}
            {scoreSoFar > 0 && ` · ${scoreSoFar} so far`}
          </span>
        </div>
      </div>

      {/* Lie chips — single horizontal row */}
      <SectionLabel>Lie</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 5,
          marginBottom: "1rem",
        }}
      >
        {LIES.map((lie) => {
          const selected = pendingLie === lie;
          // Use shorter labels at narrow widths.
          const label = lie === "Recovery" ? "Rec" : lie;
          return (
            <button
              key={lie}
              onClick={() => setPendingLie(lie)}
              style={{
                padding: "10px 0",
                fontSize: 12,
                fontWeight: 500,
                background: selected ? T.green : T.surface,
                color: selected ? T.greenInk : T.text,
                border: `0.5px solid ${selected ? T.green : T.borderStrong}`,
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Distance — native numeric input */}
      <SectionLabel>Distance ({distanceUnit})</SectionLabel>
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          ref={distInputRef}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pendingDist}
          onChange={(e) => {
            // Strip non-digits and limit to 4 chars
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPendingDist(v);
          }}
          placeholder="0"
          style={{
            width: "100%",
            padding: "16px 16px",
            fontSize: 24,
            fontWeight: 500,
            background: T.surface,
            border: `0.5px solid ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            color: T.text,
            outline: "none",
            fontFamily: "inherit",
            fontVariantNumeric: "tabular-nums",
            textAlign: "center",
            // Hide spinner buttons in WebKit/Firefox
            MozAppearance: "textfield",
            WebkitAppearance: "none",
          }}
        />
      </div>

      {/* Penalty — progressive disclosure */}
      {showPenalty || pendingPenalty > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: T.warnSoft,
            border: `0.5px solid ${T.warn}`,
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: T.warnDeep,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={14} />
            Penalty strokes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => {
                const next = Math.max(0, pendingPenalty - 1);
                setPendingPenalty(next);
                if (next === 0) setShowPenalty(false);
              }}
              style={penaltyBtnStyle}
            >
              <Minus size={14} />
            </button>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                minWidth: 16,
                textAlign: "center",
                color: T.warnDeep,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pendingPenalty}
            </div>
            <button
              onClick={() =>
                setPendingPenalty(Math.min(5, pendingPenalty + 1))
              }
              disabled={pendingPenalty === 5}
              style={{
                ...penaltyBtnStyle,
                opacity: pendingPenalty === 5 ? 0.3 : 1,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setShowPenalty(true);
            setPendingPenalty(1);
          }}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: 13,
            background: "transparent",
            border: `0.5px dashed ${T.borderStrong}`,
            borderRadius: "var(--border-radius-md)",
            color: T.textDim,
            cursor: "pointer",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontWeight: 500,
          }}
        >
          <Plus size={13} />
          Add penalty stroke
        </button>
      )}

      {/* Add shot — primary action */}
      <button
        onClick={handleAddShot}
        disabled={!canAddShot}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: 16,
          fontWeight: 600,
          background: canAddShot ? T.green : T.surface,
          color: canAddShot ? T.greenInk : T.textFaint,
          border: canAddShot ? "none" : `0.5px solid ${T.border}`,
          borderRadius: "var(--border-radius-lg)",
          cursor: canAddShot ? "pointer" : "not-allowed",
          marginBottom: "1.5rem",
          letterSpacing: 0.3,
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
        <div
          style={{
            padding: "1rem 1.25rem",
            background: T.surface,
            border: `0.5px dashed ${T.border}`,
            borderRadius: "var(--border-radius-md)",
            textAlign: "center",
            fontSize: 13,
            color: T.textFaint,
            fontStyle: "italic",
          }}
        >
          No shots recorded yet
        </div>
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
                    fontVariantNumeric: "tabular-nums",
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

      {/* Hole navigation footer */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: `0.5px solid ${T.border}`,
        }}
      >
        <button
          onClick={() => goToHole(currentHole - 1)}
          disabled={currentHole === 1}
          style={{
            ...holeNavFooterBtnStyle,
            opacity: currentHole === 1 ? 0.3 : 1,
            cursor: currentHole === 1 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={16} />
          Hole {Math.max(1, currentHole - 1)}
        </button>
        <button
          onClick={() => goToHole(currentHole + 1)}
          disabled={currentHole === 18}
          style={{
            ...holeNavFooterBtnStyle,
            opacity: currentHole === 18 ? 0.3 : 1,
            cursor: currentHole === 18 ? "default" : "pointer",
          }}
        >
          Hole {Math.min(18, currentHole + 1)}
          <ChevronRight size={16} />
        </button>
      </div>

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
// Small helpers
// ----------------------------------------------------------------------------

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: T.textFaint,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontWeight: 500,
        marginBottom: 6,
        paddingLeft: 4,
      }}
    >
      {children}
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

        <SectionLabel>Lie</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 4,
            marginBottom: 14,
          }}
        >
          {LIES.map((l) => {
            const selected = lie === l;
            const label = l === "Recovery" ? "Rec" : l;
            return (
              <button
                key={l}
                onClick={() => setLie(l)}
                style={{
                  padding: "9px 0",
                  fontSize: 12,
                  fontWeight: 500,
                  background: selected ? T.green : T.surfaceRaised,
                  color: selected ? T.greenInk : T.text,
                  border: `0.5px solid ${selected ? T.green : T.borderStrong}`,
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <SectionLabel>Distance ({lie === "Green" ? "feet" : "yards"})</SectionLabel>
        <input
          type="number"
          inputMode="numeric"
          value={dist}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setDist(v);
          }}
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
            textAlign: "center",
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
              <Minus size={14} />
            </button>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                minWidth: 16,
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
              <Plus size={14} />
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
  fontSize: 13,
  padding: "8px",
  margin: "-8px",
  cursor: "pointer",
  fontWeight: 500,
};

const penaltyBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: T.surfaceRaised,
  border: `0.5px solid ${T.border}`,
  color: T.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const holeNavFooterBtnStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 500,
  background: T.surface,
  color: T.text,
  border: `0.5px solid ${T.borderStrong}`,
  borderRadius: "var(--border-radius-md)",
};

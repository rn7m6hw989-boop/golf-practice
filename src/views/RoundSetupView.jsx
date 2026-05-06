// RoundSetupView — entered before starting a round. Captures course, date,
// tees, and pars per hole. On confirmation, creates an active round in
// storage and proceeds to the round-tracking screen (placeholder in B1).

import React, { useState } from "react";
import { T } from "../theme.js";
import { BackButton } from "../components/BackButton.jsx";
import { PageTitle } from "../components/PageTitle.jsx";

const DEFAULT_PARS = [4, 4, 4, 3, 4, 4, 4, 5, 4, 4, 4, 3, 4, 4, 4, 5, 4, 4];

export function RoundSetupView({ onCancel, onStart }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [course, setCourse] = useState("");
  const [tees, setTees] = useState("");
  const [pars, setPars] = useState([...DEFAULT_PARS]);

  const updatePar = (index, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    if (num < 3 || num > 6) return;
    const next = [...pars];
    next[index] = num;
    setPars(next);
  };

  const handleStart = () => {
    onStart({
      date,
      course: course.trim(),
      tees: tees.trim(),
      pars,
    });
  };

  // Course is the only "required" field — but we don't enforce it strictly.
  // A round can be set up without a course name (the user might be at the
  // range, etc.); we just nudge with a placeholder.
  const canStart = true;

  return (
    <div style={{ padding: "1rem 0 9rem" }}>
      <BackButton onClick={onCancel} />

      <PageTitle eyebrow="New round" title="Round setup" />

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <FormField label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </FormField>

        <FormField label="Course">
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. Pebble Beach"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Tees">
          <input
            type="text"
            value={tees}
            onChange={(e) => setTees(e.target.value)}
            placeholder="e.g. Blue, White, 6,400"
            style={inputStyle}
          />
        </FormField>
      </div>

      <div
        style={{
          fontSize: 11,
          color: T.textFaint,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: 500,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        Par per hole
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 6,
          marginBottom: 24,
        }}
      >
        {pars.map((par, i) => (
          <ParCell
            key={i}
            holeNum={i + 1}
            par={par}
            onChange={(v) => updatePar(i, v)}
          />
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "calc(64px + env(safe-area-inset-bottom))",
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: T.surface,
          borderTop: `0.5px solid ${T.border}`,
        }}
      >
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 500,
            background: canStart ? T.green : T.surface,
            color: canStart ? T.greenInk : T.textFaint,
            border: canStart ? "none" : `0.5px solid ${T.border}`,
            borderRadius: "var(--border-radius-lg)",
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          Start round
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
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
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 15,
  background: T.surface,
  border: `0.5px solid ${T.borderStrong}`,
  borderRadius: "var(--border-radius-md)",
  color: T.text,
  outline: "none",
  fontFamily: "inherit",
};

function ParCell({ holeNum, par, onChange }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: "var(--border-radius-md)",
        padding: "8px 4px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.textFaint,
          fontWeight: 500,
          marginBottom: 2,
        }}
      >
        {holeNum}
      </div>
      <input
        type="number"
        min={3}
        max={6}
        inputMode="numeric"
        value={par}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "4px 0",
          fontSize: 18,
          fontWeight: 500,
          background: "transparent",
          border: "none",
          color: T.text,
          textAlign: "center",
          outline: "none",
          fontFamily: "inherit",
          fontVariantNumeric: "tabular-nums",
        }}
      />
    </div>
  );
}

// FallLineSessionView
import React, { useState } from "react";
import { Undo2, X, Check, Circle } from "lucide-react";
import { T } from "../theme.js";
import { DRILLS } from "../drills.js";
import { Card } from "../components/Card.jsx";

export function FallLineSessionView({ drillId, onComplete, onCancel }) {
  const drill = DRILLS[drillId];

  // Step state. We progressively reveal questions; each answer either
  // advances to the next question or completes the session.
  //   "putt"  → did the putt go straight in?
  //   "error" → measure the error (only if breaking)
  //   "slope" → small/moderate/steep
  //   "done"  → ready to save
  const [step, setStep] = useState("putt");
  const [wentIn, setWentIn] = useState(null); // true | false | null
  const [errorInches, setErrorInches] = useState("");
  const [slope, setSlope] = useState(null); // "small" | "moderate" | "steep"
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSave = () => {
    setCompleted(true);
    setTimeout(() => {
      onComplete({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        drillId,
        sessionType: "fallLine",
        timestamp: Date.now(),
        wentIn,
        errorInches: wentIn ? 0 : Number(errorInches),
        slope,
        won: true, // there's no win/loss for this drill — completion is success
      });
    }, 1000);
  };

  const handlePuttResult = (didGoIn) => {
    setWentIn(didGoIn);
    if (didGoIn) {
      // Skip the error step
      setErrorInches("0");
      setStep("slope");
    } else {
      setStep("error");
    }
  };

  const errorInchesNumber = Number(errorInches);
  const errorIsValid =
    errorInches !== "" && !isNaN(errorInchesNumber) && errorInchesNumber >= 0;

  const goBack = () => {
    if (step === "slope") {
      // Step back to error if we measured one, or to putt if it went in
      if (wentIn) {
        setStep("putt");
        setWentIn(null);
      } else {
        setStep("error");
      }
    } else if (step === "error") {
      setStep("putt");
      setWentIn(null);
      setErrorInches("");
    }
  };

  // The slope step needs both a slope choice and (if not went-in) a valid
  // error number to enable Save.
  const canSave =
    slope !== null && (wentIn || errorIsValid);

  const hasProgress =
    wentIn !== null || errorInches !== "" || slope !== null;

  return (
    <div style={{ padding: "1rem 0 calc(1.5rem + env(safe-area-inset-bottom))", minHeight: "calc(100vh - 4rem)" }}>
      <style>{`
        @keyframes celebrate {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => {
            if (!hasProgress) onCancel();
            else setShowConfirmCancel(true);
          }}
          style={{
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
          }}
        >
          <X size={16} />
          End
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
          {drill.name}
        </div>
        <button
          onClick={goBack}
          disabled={step === "putt" || completed}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: step === "putt" || completed ? T.textFaint : T.textDim,
            fontSize: 14,
            padding: "8px",
            margin: "-8px",
            cursor: step === "putt" || completed ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          <Undo2 size={14} />
          Back
        </button>
      </div>

      {showConfirmCancel && (
        <Card style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            End this session without saving?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowConfirmCancel(false)}
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
              onClick={onCancel}
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
              End session
            </button>
          </div>
        </Card>
      )}

      {completed ? (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem 1.25rem",
            background: T.greenSoft,
            border: `0.5px solid ${T.green}`,
            borderRadius: "var(--border-radius-lg)",
            animation: "celebrate 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: T.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Check size={28} color={T.greenInk} strokeWidth={2.5} />
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: T.greenDeep,
              marginBottom: 4,
              letterSpacing: -0.3,
            }}
          >
            Reading recorded
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Saving session…
          </div>
        </div>
      ) : (
        <>
          {/* Step 1: Did the putt go straight in? */}
          {step === "putt" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
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
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Step 1 of 3 · Take your putt
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: T.greenDeep,
                    lineHeight: 1.55,
                  }}
                >
                  Place a coin where you think the fall line is six feet from the hole.
                  Putt from just in front of the coin straight at the hole.
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: T.textFaint,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                What happened?
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  onClick={() => handlePuttResult(true)}
                  style={{
                    padding: "20px 12px",
                    background: T.winSoft,
                    border: `1px solid ${T.win}`,
                    borderRadius: "var(--border-radius-lg)",
                    cursor: "pointer",
                    textAlign: "center",
                    minHeight: 100,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={26} color={T.green} strokeWidth={2.5} />
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: T.greenDeep,
                      lineHeight: 1.2,
                    }}
                  >
                    Rolled straight in
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.greenDeep,
                      opacity: 0.75,
                      lineHeight: 1.2,
                    }}
                  >
                    correct fall line
                  </div>
                </button>
                <button
                  onClick={() => handlePuttResult(false)}
                  style={{
                    padding: "20px 12px",
                    background: T.warnSoft,
                    border: `1px solid ${T.warn}`,
                    borderRadius: "var(--border-radius-lg)",
                    cursor: "pointer",
                    textAlign: "center",
                    minHeight: 100,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Circle size={24} color={T.warn} strokeWidth={2.5} />
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: T.warnDeep,
                      lineHeight: 1.2,
                    }}
                  >
                    Putt broke
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.warnDeep,
                      opacity: 0.75,
                      lineHeight: 1.2,
                    }}
                  >
                    needs adjustment
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Measure the error (only if the putt broke) */}
          {step === "error" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
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
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Step 2 of 3 · Measure the error
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: T.greenDeep,
                    lineHeight: 1.55,
                  }}
                >
                  Adjust your starting position until you find the true fall line.
                  Then measure the distance between your original coin and the
                  true fall line.
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: T.textFaint,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Error in inches
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: "1.5rem",
                }}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  value={errorInches}
                  onChange={(e) => setErrorInches(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={{
                    width: 140,
                    padding: "16px 18px",
                    fontSize: 36,
                    fontWeight: 500,
                    background: T.surface,
                    border: `1.5px solid ${T.green}`,
                    borderRadius: "var(--border-radius-lg)",
                    color: T.text,
                    textAlign: "center",
                    fontVariantNumeric: "tabular-nums",
                    outline: "none",
                    letterSpacing: -0.5,
                  }}
                />
                <div
                  style={{
                    fontSize: 18,
                    color: T.textDim,
                    fontWeight: 500,
                  }}
                >
                  in
                </div>
              </div>

              <button
                onClick={() => setStep("slope")}
                disabled={!errorIsValid}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: 15,
                  fontWeight: 500,
                  background: errorIsValid ? T.green : T.surface,
                  color: errorIsValid ? T.greenInk : T.textFaint,
                  border: errorIsValid ? "none" : `0.5px solid ${T.border}`,
                  borderRadius: "var(--border-radius-lg)",
                  cursor: errorIsValid ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Slope severity */}
          {step === "slope" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
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
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Step 3 of 3 · Note the slope
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: T.greenDeep,
                    lineHeight: 1.55,
                  }}
                >
                  How steep was the slope near the hole? This helps you compare
                  apples to apples — small slopes are harder to read accurately.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  { id: "small", label: "Small", sub: "barely tilted" },
                  { id: "moderate", label: "Moderate", sub: "noticeable" },
                  { id: "steep", label: "Steep", sub: "obvious" },
                ].map((opt) => {
                  const isActive = slope === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSlope(opt.id)}
                      style={{
                        padding: "16px 8px",
                        background: isActive ? T.green : T.surface,
                        border: `1px solid ${isActive ? T.green : T.border}`,
                        borderRadius: "var(--border-radius-lg)",
                        cursor: "pointer",
                        textAlign: "center",
                        minHeight: 84,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                        transition: "background 0.15s ease, border 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: isActive ? T.greenInk : T.text,
                          lineHeight: 1.2,
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: isActive ? T.greenInk : T.textFaint,
                          opacity: isActive ? 0.85 : 1,
                          lineHeight: 1.2,
                        }}
                      >
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSave}
                disabled={!canSave}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: 15,
                  fontWeight: 500,
                  background: canSave ? T.green : T.surface,
                  color: canSave ? T.greenInk : T.textFaint,
                  border: canSave ? "none" : `0.5px solid ${T.border}`,
                  borderRadius: "var(--border-radius-lg)",
                  cursor: canSave ? "pointer" : "not-allowed",
                }}
              >
                Save reading
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

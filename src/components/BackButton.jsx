// BackButton
import React from "react";
import { ChevronLeft } from "lucide-react";
import { T } from "../theme.js";

export function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        color: T.textDim,
        fontSize: 14,
        padding: "8px 8px 8px 0",
        margin: "-8px 0 8px -8px",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      <ChevronLeft size={18} />
      Back
    </button>
  );
}

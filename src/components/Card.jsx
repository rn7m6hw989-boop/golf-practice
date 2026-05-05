// Card
import React from "react";
import { T } from "../theme.js";

export function Card({ children, style, onClick, accent, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, border-color 0.15s ease",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// PageTitle
import React from "react";
import { T } from "../theme.js";

export function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 11,
            color: T.green,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 500,
          margin: 0,
          letterSpacing: -0.4,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          style={{
            fontSize: 14,
            color: T.textDim,
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

// SectionLabel
import React from "react";
import { T } from "../theme.js";

export function SectionLabel({ children, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      <h2
        style={{
          fontSize: 11,
          fontWeight: 500,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: T.textDim,
        }}
      >
        {children}
      </h2>
      {action}
    </div>
  );
}

import React from "react";

// Stand-in for a missing asset. Never a drawn substitute for a real logo.
export const Placeholder: React.FC<{ file: string; style?: React.CSSProperties }> = ({ file, style }) => (
  <div
    style={{
      background: "#8A8A8A",
      border: "4px dashed #5E5E5E",
      color: "#1A1A1A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontFamily: "monospace",
      fontSize: 22,
      padding: 12,
      boxSizing: "border-box",
      wordBreak: "break-all",
      ...style,
    }}
  >
    MISSING: {file}
  </div>
);

import { loadFont } from "@remotion/fonts";
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { fontFiles } from "./brand";

// Local font files only, so renders never depend on system fonts or the network.
let loaded: Promise<void> | null = null;
const loadBrandFonts = () => {
  loaded ??= Promise.all(
    fontFiles.map((f) => loadFont({ family: f.family, url: staticFile(f.file), weight: f.weight, format: "woff2" })),
  ).then(() => undefined);
  return loaded;
};

// Renders children only once the fonts are in, so text measured for line
// breaks and auto-sizing always uses the real brand faces.
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadBrandFonts().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready ? <>{children}</> : null;
};

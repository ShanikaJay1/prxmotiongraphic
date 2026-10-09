import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill } from "remotion";
import { MusicBed, SfxEnabled } from "./audio";
import { colors } from "./brand";
import { SafeZoneOverlay } from "./components/SafeZoneOverlay";
import { audio, copy, cuts, hookVariants, layout, motion, video, type SceneId } from "./config";
import { FontGate } from "./fonts";
import { EASE_IN } from "./motion";
import { BrandWall } from "./scenes/BrandWall";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";
import { Reveal } from "./scenes/Reveal";
import { Turn } from "./scenes/Turn";
import { LayoutContext, type LayoutOptions } from "./layout-context";
import { schedule, type CutId } from "./timeline";

export type VideoProps = {
  cut: CutId;
  hookVariant: number | null; // 1-based index into hookVariants, null for copy.hook
  showSafeZones: boolean;
  muteSfx: boolean;
  // Optional per-render overrides of config.layout
  uiFrame?: LayoutOptions["uiFrame"];
  brandWall?: LayoutOptions["brandWall"];
};

export const hookText = (variant: number | null) => (variant ? hookVariants[variant - 1] ?? copy.hook : copy.hook);

export const SceneById: React.FC<{ id: SceneId; length: number; hook: string }> = ({ id, length, hook }) => {
  switch (id) {
    case "hook":
      return <Hook text={hook} />;
    case "turn":
      return <Turn />;
    case "reveal":
      return <Reveal />;
    case "wall":
      return <BrandWall duration={length} />;
    case "how":
      return <HowItWorks duration={length} />;
    case "cta":
      return <Cta duration={length} />;
  }
};

// Exits go up, entrances come from below: every cut is a 9 frame slide or wipe.
const presentationFor = (i: number) =>
  (i % 2 === 0
    ? slide({ direction: "from-bottom" })
    : wipe({ direction: "from-bottom" })) as TransitionPresentation<Record<string, unknown>>;

export const PrxVideo: React.FC<VideoProps> = ({ cut, hookVariant, showSafeZones, muteSfx, uiFrame, brandWall }) => {
  const scenes = schedule(cut);
  const hook = hookText(hookVariant);
  return (
    <SfxEnabled.Provider value={audio.sfx && !muteSfx}>
      <LayoutContext.Provider value={{ uiFrame: uiFrame ?? layout.uiFrame, brandWall: brandWall ?? layout.brandWall }}>
        <AbsoluteFill style={{ background: colors.background }}>
          <FontGate>
            <TransitionSeries>
              {scenes.flatMap((s, i) => [
                <TransitionSeries.Sequence key={s.id} durationInFrames={s.sequenceFrames} name={s.id}>
                  <SceneById id={s.id} length={s.length} hook={hook} />
                </TransitionSeries.Sequence>,
                i < scenes.length - 1 ? (
                  <TransitionSeries.Transition
                    key={`${s.id}-t`}
                    presentation={presentationFor(i)}
                    timing={linearTiming({ durationInFrames: motion.transitionFrames, easing: EASE_IN })}
                  />
                ) : null,
              ])}
            </TransitionSeries>
          </FontGate>
          <MusicBed durationInFrames={cuts[cut].durationInFrames} fps={video.fps} />
          {showSafeZones ? <SafeZoneOverlay /> : null}
        </AbsoluteFill>
      </LayoutContext.Provider>
    </SfxEnabled.Provider>
  );
};

// A single scene on its own, for previewing and review stills.
export const ScenePreview: React.FC<{ id: SceneId; cut: CutId; hookVariant: number | null; showSafeZones: boolean }> = ({
  id,
  cut,
  hookVariant,
  showSafeZones,
}) => {
  const s = schedule(cut).find((x) => x.id === id)!;
  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <FontGate>
        <SceneById id={id} length={s.length} hook={hookText(hookVariant)} />
      </FontGate>
      {showSafeZones ? <SafeZoneOverlay /> : null}
    </AbsoluteFill>
  );
};

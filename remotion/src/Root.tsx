import React from "react";
import { Composition, Folder } from "remotion";
import { cuts, video, type SceneId } from "./config";
import { schedule } from "./timeline";
import { PrxVideo, ScenePreview, type VideoProps } from "./Video";

const master: VideoProps = { cut: "master20", hookVariant: null, showSafeZones: false, muteSfx: false };

const SCENE_NAMES: Record<SceneId, string> = {
  hook: "1-Hook",
  turn: "2-Turn",
  reveal: "3-Reveal",
  wall: "4-BrandWall",
  how: "5-HowItWorks",
  cta: "6-CTA",
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="PRX-Master-20s"
      component={PrxVideo}
      durationInFrames={cuts.master20.durationInFrames}
      {...video}
      defaultProps={master}
    />
    <Composition
      id="PRX-Cutdown-15s"
      component={PrxVideo}
      durationInFrames={cuts.cutdown15.durationInFrames}
      {...video}
      defaultProps={{ ...master, cut: "cutdown15" as const }}
    />
    <Folder name="Scenes">
      {schedule("master20").map((s) => (
        <Composition
          key={s.id}
          id={`Scene-${SCENE_NAMES[s.id]}`}
          component={ScenePreview}
          durationInFrames={s.length}
          {...video}
          defaultProps={{ id: s.id, cut: "master20" as const, hookVariant: null, showSafeZones: true }}
        />
      ))}
    </Folder>
  </>
);

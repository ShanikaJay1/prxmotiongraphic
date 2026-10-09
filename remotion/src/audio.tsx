import React, { createContext, useContext } from "react";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { resolveAsset } from "./assets";
import { audio } from "./config";

// SFX sit on their own layer: config.audio.sfx = false (or the muteSfx prop)
// removes every one of them without touching the music bed.
export const SfxEnabled = createContext(audio.sfx);

const LENGTHS = { pop: 6, tick: 3, chime: 42 };

export const Sfx: React.FC<{ name: keyof typeof LENGTHS; at: number; volume?: number }> = ({ name, at, volume = 1 }) => {
  const enabled = useContext(SfxEnabled);
  if (!enabled) return null;
  return (
    <Sequence from={Math.round(at)} durationInFrames={LENGTHS[name]} layout="none" name={`sfx:${name}`}>
      <Html5Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={audio.sfxVolume * volume} />
    </Sequence>
  );
};

// Music bed, only if assets/audio/track.mp3 exists: 0.5s fade in, 1s fade out.
export const MusicBed: React.FC<{ durationInFrames: number; fps: number }> = ({ durationInFrames, fps }) => {
  const track = resolveAsset(audio.music);
  if (!track) return null;
  const fadeIn = Math.round(fps * 0.5);
  const fadeOut = fps;
  return (
    <Html5Audio
      src={track.src}
      volume={(f) =>
        audio.musicVolume *
        interpolate(f, [0, fadeIn, durationInFrames - fadeOut, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

import { audio, cuts, motion, video, type SceneId } from "./config";

export type CutId = keyof typeof cuts;
export type ScheduledScene = { id: SceneId; start: number; length: number; sequenceFrames: number };

// Turns the start frames in config into TransitionSeries sequence lengths.
// Each scene's sequence runs `transitionFrames` past the next scene's start so
// the transition overlaps it and the next scene still begins on its listed frame.
export const schedule = (cut: CutId): ScheduledScene[] => {
  const { scenes, durationInFrames } = cuts[cut];
  const T = motion.transitionFrames;
  const beat = audio.bpm ? (video.fps * 60) / audio.bpm : null;
  const starts = scenes.map((s, i) => (i === 0 || !beat ? s.start : Math.round(Math.round(s.start / beat) * beat)));
  return scenes.map((s, i) => {
    const next = i + 1 < scenes.length ? starts[i + 1] : durationInFrames;
    const length = next - starts[i];
    return { id: s.id, start: starts[i], length, sequenceFrames: i + 1 < scenes.length ? length + T : length };
  });
};

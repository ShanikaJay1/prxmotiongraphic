# AD-008 sound (approved 2026-10-28)

- Route: supplied song + sound effects.
- Song: AT-009 "This What We Doin Instrumental" (supplied by Shan in chat; no OneDrive link). `src/this-what-we-doin.wav`.
  - 160 BPM, half-time feel (pulse 0.75 s). In-point 87.805 s, so the mid-song pick-up (90.055 s) lands on the first roster stamp at 2.25 s. 20 ms fade in, 0.45 s fade out.
- Edit re-paced to the beat (motion/motion.html constants B/E/X): hook 3 pulses, 5 wraps x 2 pulses, line-up 3 pulses, close 3 pulses. Total 14.25 s.
- SFX: library anime-style effects AT-003 stamp, AT-004 tick, AT-005 pop, AT-007 whoosh short, AT-008 impact (`sfx/`), peak-aligned to the frame each visual lands. Cue list `cues.json` is exported from motion.html (`node ../motion/render.js cues`).
- Mix: `python3 mix.py` -> `mix.wav`, 48 kHz stereo, -14 LUFS integrated, -1.3 dBTP.
- Track Ad IDs are added at export by Render and Export (AT-003, AT-004, AT-005, AT-007, AT-008, AT-009).

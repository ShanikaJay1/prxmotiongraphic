# AD-005 · sound (approved)

Route: supplied song + sound effects.

- **Song:** AT-002 "Mystik Stylez" (Crazy Drift Phonk Type Beat), prod. Kriptik Beats, tagged free for commercial use. 87.5 BPM. The cut starts at 59.02 s (song beat 86, +48 ms onset offset), so the second drop hits on the hook's second photo stamp.
- **Effects:** anime-style, built in code (`build_audio.py`), saved in `sfx/`: stamp, tick, pop, whoosh, whoosh_short, impact. Each one is placed on the frame its visual lands on (see `audio_settings.json` for the cue list).
- **Mix:** song at 0.5, ducked about 4.5 dB for 90 ms under each stamp, tick and pop. Effects bus at 0.8. Two-pass loudnorm to -14 LUFS, TP -1.3 → `mix.wav`.
- The motion was re-paced to this song's beat grid (`../motion/motion.js`).
- `AD-005-sound-preview.mp4`: the approved preview with sound. The final render is made at Render and Export.

To rebuild: `python3 build_audio.py` in this folder (needs numpy and ffmpeg).

"""AD-005 sound: supplied song (AT-002) cut to the film + anime-style effects built in code.

Every effect is synthesised with numpy on the same timeline as motion.js, placed on the
exact frame its visual lands on. Output: sfx/*.wav (the effect library files) and mix.wav.
"""
import json, math, subprocess, wave
import numpy as np

SR, FPS, DUR = 44100, 24, 14.0
B = 60 / 87.5                      # beat length, same as motion.js
SONG_IN = 86 * B + 0.048           # film t=0 = song beat 86 (+48 ms onset offset) = 59.02 s; the second drop (59.19 s) hits on the hook's second photo stamp, full bass to the end
rng = np.random.default_rng(5)

def t_(n): return np.arange(int(n * SR)) / SR
def env(n, a, d):                  # attack / exponential decay envelope
    t = t_(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d); return e
def band(x, lo, hi):               # FFT band-pass
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def norm(x, peak=0.9): return x / (np.abs(x).max() + 1e-9) * peak

# ---------- effects ----------
def stamp():                       # "dosh": punchy mid thwack + paper slap, kept above the 808 so it cuts through
    n = 0.22; t = t_(n)
    f = 260 * np.exp(-t / 0.04) + 110
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .07)
    thwack = band(rng.standard_normal(len(t)), 250, 1600) * env(n, .001, .035)
    slap = band(rng.standard_normal(len(t)), 1200, 6000) * env(n, .0005, .02)
    return norm(body * .9 + thwack * .8 + slap * .6)

def tick():                        # panel cut: short paper snap with a little body
    n = 0.1; t = t_(n)
    snap = band(rng.standard_normal(len(t)), 700, 6000) * env(n, .0005, .018)
    knock = np.sin(2 * np.pi * (520 * np.exp(-t / .03) + 260) * t) * env(n, .0005, .025)
    return norm(snap + knock * .6)

def pop():                         # PAID bubble: rising pop + click
    n = 0.12; t = t_(n)
    f = 280 + 900 * (1 - np.exp(-t / 0.025))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .04)
    click = band(rng.standard_normal(len(t)), 2000, 8000) * env(n, .0005, .004)
    return norm(tone + click * .5)

def whoosh(n=0.38):                # air sweep high to low, peaks at the end (lands on the cut)
    t = t_(n); x = rng.standard_normal(len(t)); out = np.zeros_like(x); seg = 1024
    for i in range(0, len(x), seg):
        p = i / len(x); c = 6000 * (1 - p) + 700 * p
        out[i:i + seg] = band(x[i:i + seg], c * .6, c * 1.4)
    shape = (t / n) ** 2.2 * np.exp(-np.maximum(0, t - n * .92) / .02)
    return norm(out * shape, .8)

def impact():                      # FREE: sub boom + crack + bright anime "kiin" ring
    n = 1.2; t = t_(n)
    f = 90 * np.exp(-t / 0.12) + 34
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .35)
    crack = band(rng.standard_normal(len(t)), 600, 9000) * env(n, .0005, .045)
    ring = (np.sin(2 * np.pi * 2350 * t) + .5 * np.sin(2 * np.pi * 3520 * t)) * env(n, .003, .22) * .35
    return norm(boom * 1.0 + crack * .7 + ring)

FX = {"stamp": stamp(), "tick": tick(), "pop": pop(), "whoosh": whoosh(), "whoosh_short": whoosh(0.2), "impact": impact()}

# ---------- cue sheet (film seconds, on the beat grid, same as motion.js) ----------
on_frame = lambda t: math.ceil(t * FPS - 1e-6) / FPS     # the frame the visual first shows
CUES = []
def cue(t, name, gain, align="start"): CUES.append((t, name, gain, align))
for i in range(3): cue(i * .25 * B, "stamp", 1.0)                  # hook photos
for i in range(2): cue(.75 * B + i * .125 * B, "tick", .5)        # tape
cue(1 * B, "stamp", 1.0); cue(1.5 * B, "stamp", 1.0); cue(2 * B, "pop", .6)   # headline lines, "3." punch
for tc in (3 * B, 9 * B, 16 * B): cue(tc, "whoosh", .32, "end")    # scene cuts
for i in range(5): cue((3 + i * .5) * B, "tick", .65)               # showcase panels
for i in range(4): cue((9 + i * .5) * B, "tick", .55)             # value slices cut in (names ride with them)
for k in (11.5, 12, 12.5): cue(k * B, "pop", .65)                  # PAID x3
cue(13 * B, "impact", .85)                                         # FREE, on the drop
cue(16.5 * B, "stamp", .9); cue(17 * B, "stamp", 1.0); cue(17.5 * B, "tick", .6); cue(18 * B, "stamp", 1.0)   # close

# ---------- song bed ----------
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{SONG_IN:.4f}", "-t", f"{DUR}", "-i", "AT-002-mystik-stylez-kriptik-beats.mp3",
                "-ac", "2", "-ar", str(SR), "song_cut.wav"], check=True)
w = wave.open("song_cut.wav"); song = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(float) / 32768
N = int(DUR * SR); bed = np.zeros((N, 2)); bed[:min(N, len(song))] = song[:N]
fi, fo = int(.02 * SR), int(.6 * SR)
bed[:fi] *= np.linspace(0, 1, fi)[:, None]; bed[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

fx = np.zeros(N)
for t, name, g, align in CUES:
    s = FX[name]; peak = int(np.argmax(np.abs(s)))
    at = int(on_frame(t) * SR) - (len(s) if align == "end" else peak)   # place by measured peak, whooshes end on the cut
    a, b = max(0, at), min(N, at + len(s)); fx[a:b] += s[a - at:b - at] * g
# sidechain: dip the song ~7 dB for 90 ms under every stamp / tick / pop so the hits read over the 808
duck = np.ones(N)
for t, name, g, align in CUES:
    if name in ("stamp", "tick", "pop"):
        i = int(on_frame(t) * SR); L = int(.09 * SR); R = int(.12 * SR)
        shape = np.r_[np.full(L, .6), .6 + .4 * (np.arange(R) / R)]
        a, b = max(0, i - int(.005 * SR)), min(N, i - int(.005 * SR) + L + R)
        duck[a:b] = np.minimum(duck[a:b], shape[:b - a])
duck = np.convolve(duck, np.ones(64) / 64, "same")
mix = bed * 0.5 * duck[:, None] + fx[:, None] * 0.8
mix = np.clip(mix, -1, 1)
out = wave.open("mix_raw.wav", "w"); out.setnchannels(2); out.setsampwidth(2); out.setframerate(SR)
out.writeframes((mix * 32767).astype(np.int16).tobytes()); out.close()

# two-pass loudnorm to -14 LUFS, TP -1.3
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.3:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", "mix_raw.wav", "-af",
                f"loudnorm=I=-14:TP=-1.3:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "mix.wav"], check=True)

import os; os.makedirs("sfx", exist_ok=True)
for k, s in FX.items():
    o = wave.open(f"sfx/roki-{k}.wav", "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((s * 32767).astype(np.int16).tobytes()); o.close()
json.dump({"song": "AT-002", "song_in_s": round(SONG_IN, 4), "bpm": 87.5, "beat_s": B, "duration_s": DUR,
           "song_gain": .5, "fx_gain": .8, "loudness": "-14 LUFS, TP -1.3",
           "cues": [{"t": round(on_frame(t), 4), "fx": n, "gain": g, "align": al} for t, n, g, al in CUES]},
          open("audio_settings.json", "w"), indent=1)
print("cues", len(CUES), "input", m["input_i"], "->", "-14")

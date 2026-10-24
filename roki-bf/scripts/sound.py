"""Procedural sound for the Roki Black Friday hand wraps catalogue ad.

Everything is synthesised here (no samples, nothing to license). Cue times mirror the
constants in index.html (24 fps, 120 BPM, scene starts S1-S3 and every data-stamp), so
picture and sound stay locked if the timeline changes.

Direction: the same training-montage kit as the Grappler ad. Taiko-style drum on the
beat, a stamp on each offer word, an impact into the catalogue, a stamp per wrap panel
(rising, like a count), a whoosh on the ink wipe, a final hit and ring on SHOP NOW.

Usage: python3 scripts/sound.py out/roki-bf-sound-raw.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(11)

# ---- timeline (mirror index.html) -------------------------------------------
BPM = 120
BEAT = 60 / BPM
S1, S2, S3, TOTAL = 0.0, 2.5, 9.0, 13.5
WORD_STAMPS = [0.0, 0.5, 1.0]          # BUY 3 / GET 1 / FREE
HEAD_STAMPS = [S2, 3.0, 10.0, 10.5]    # PICK ANY 4 / PAY FOR 3 / ANIME HAND WRAPS / BUY 3 GET 1 FREE
SOFT_STAMPS = [7.0, 9.5, 11.0]         # price line, tag, apparel line
PANELS = [3.5 + i * BEAT for i in range(5)]   # the five wraps
FAN = [S3 + i * 3 / 24 for i in range(5)]
DEAL = 6.5
WIPES = [S3]
CTA = 11.5

N = int(TOTAL * SR)
mix = np.zeros((N, 2))


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, hz, order=2):
    return sosfilt(butter(order, hz, kind, fs=SR, output='sos'), x)


def place(sig, at, gain=1.0, p=0.0):
    a = (p + 1) * np.pi / 4
    st = np.stack([sig * np.cos(a), sig * np.sin(a)], 1) * gain
    i = int(round(at * SR))
    if i < 0:
        st, i = st[-i:], 0
    n = min(len(st), N - i)
    if n > 0:
        mix[i:i + n] += st[:n]


def env(t, attack, decay):
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


# ---- instruments -------------------------------------------------------------
def taiko(f0=62, d=0.9, body=1.0):
    t = t_axis(d)
    f = f0 * (1 + 0.9 * np.exp(-t / 0.03))            # pitch drops into the skin tone
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.002, 0.22 * body)
    over = np.sin(2 * np.pi * np.cumsum(f * 2.3) / SR) * env(t, 0.001, 0.05) * 0.35   # upper partial for phones
    slap = filt(rng.standard_normal(len(t)), 'band', [400, 3000]) * env(t, 0.0005, 0.012) * 0.5
    return np.tanh((tone + over + slap) * 1.6)


def rim():
    t = t_axis(0.12)
    return (filt(rng.standard_normal(len(t)), 'band', [1800, 7000]) * env(t, 0.0005, 0.015)
            + np.sin(2 * np.pi * 1650 * t) * env(t, 0.0005, 0.02) * 0.4)


def hat():
    t = t_axis(0.06)
    return filt(rng.standard_normal(len(t)), 'high', 7000) * env(t, 0.0005, 0.012)


def paper_crunch(d=0.14):
    t = t_axis(d)
    n = rng.standard_normal(len(t)) * (rng.random(len(t)) > 0.6)      # crackly, not smooth noise
    return filt(n, 'band', [900, 6000]) * env(t, 0.001, d / 3)


def stamp(weight=1.0):
    """A word slamming onto paper: drum body + snap + paper crunch."""
    a = taiko(70 + 20 * (1 - weight), 0.6, 0.8 * weight) * 0.9 * weight
    s = np.zeros_like(a)
    c = paper_crunch()
    s[:len(c)] += c * 0.7
    r = rim()
    s[:len(r)] += r * 0.35
    return a + s


def impact():
    t = t_axis(2.4)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t / 0.08)) / SR) * env(t, 0.002, 0.55)
    crash = filt(rng.standard_normal(len(t)), 'high', 2500) * env(t, 0.001, 0.5) * 0.35
    body = taiko(55, 2.4, 2.0)
    return np.tanh((sub * 1.2 + crash + body * 0.8) * 1.3)


def riser(d):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    for k, lo in enumerate(np.linspace(300, 3000, 8)):     # stepped sweep: matches the stepped picture
        seg = slice(int(k * len(t) / 8), int((k + 1) * len(t) / 8))
        out[seg] = filt(n, 'band', [lo, lo * 2.2])[seg]
    return out * (t / d) ** 2


def whoosh(d=0.5):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    lo = filt(n, 'band', [200, 1200])
    hi = filt(n, 'band', [1200, 5000])
    shape = np.sin(np.pi * t / d) ** 2
    return (lo * 0.8 + hi * 0.5 * (t / d)) * shape


def gong(d=3.0):
    t = t_axis(d)
    parts = [(110, 1.0, 1.6), (176.4, 0.6, 1.1), (246.7, 0.45, 0.9), (331.0, 0.3, 0.7), (497.3, 0.2, 0.45)]
    s = sum(a * np.sin(2 * np.pi * f * t * (1 + 0.002 * np.sin(2 * np.pi * 3 * t))) * env(t, 0.004, dc) for f, a, dc in parts)
    return s * 0.6


def bass_note(f, d):
    t = t_axis(d)
    saw = 2 * ((f * t) % 1) - 1
    return filt(saw, 'low', 420) * env(t, 0.005, d * 0.6)


# ---- arrangement --------------------------------------------------------------
beats = np.arange(0, CTA, BEAT)
for i, b in enumerate(beats):
    in_s2plus = b >= S2
    place(taiko(60, 0.8, 0.9), b, 0.45 if in_s2plus else 0.32)
    if in_s2plus:                                   # drive picks up once the product lands
        place(hat(), b + BEAT / 2, 0.10, 0.3)
        if i % 2 == 1:
            place(rim(), b, 0.12, -0.2)
    else:
        place(hat(), b + BEAT / 2, 0.05, 0.3)

# bass: A minor, root on each bar, fifth on beat 3
for bar, b in enumerate(np.arange(S2, CTA, BEAT * 4)):
    place(bass_note(55, BEAT * 2), b, 0.18)
    place(bass_note(82.4, BEAT * 2), b + BEAT * 2, 0.15)

place(stamp(1.0), 0.0, 0.6)
for w in WORD_STAMPS[1:]:
    place(stamp(1.0), w, 0.75)
place(riser(S2 - 1.5), 1.5, 0.18)
place(impact(), S2, 0.9)
for h in HEAD_STAMPS[1:]:
    place(stamp(0.85), h, 0.6)
for s_ in SOFT_STAMPS:
    place(paper_crunch(0.1), s_, 0.28, 0.2)
for k, c in enumerate(PANELS):
    place(stamp(0.5 + 0.08 * k), c, 0.45, -0.4 + 0.2 * k)
place(stamp(1.0), DEAL, 0.7)
for k, c in enumerate(FAN):
    place(rim(), c, 0.2, -0.4 + 0.2 * k)
for w in WIPES:
    place(whoosh(0.5), w - 0.3, 0.45)
place(impact(), CTA, 0.75)
place(gong(TOTAL - CTA + 0.2), CTA, 0.35)

# tail fade so the file ends clean
fade = int(0.35 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

peak = np.abs(mix).max()
mix = mix / peak * 0.89
out = sys.argv[1] if len(sys.argv) > 1 else 'out/roki-bf-sound-raw.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out, f'{TOTAL}s')

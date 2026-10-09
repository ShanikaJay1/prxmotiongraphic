"""Procedural sound design for the PRX brand-scroll short (brands.html).

Same approach and brand direction as scripts/sound.py: everything is
synthesised (no samples, nothing to license), soft attacks and long tails,
no coin sounds or reward jingles. Cue times mirror the constants in
brands.html, and the scroll ticks are computed from the same flick curve,
so each tile passing the top of the feed gets its own soft detent.

Usage: python3 scripts/sound_brands.py out/prx-brands-sound.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(11)

# ---- timeline constants (mirror brands.html) --------------------------------
S1, S2, S3, S4, S5 = 0.0, 1.95, 10.9, 14.2, 17.4
TOTAL = 21.6
DUR = dict(micro=0.2, fast=0.4, base=0.7, slow=1.1, hero=1.6)
STAGGER = dict(tight=0.04, base=0.08, wide=0.14)
HOLD = dict(short=0.3, base=0.8, long=1.5)
FLICKS = [(3.6, 1, DUR['slow']), (5.0, 3, DUR['slow']), (6.3, 7, DUR['hero']),
          (8.0, 12, DUR['hero']), (9.3, 18, DUR['slow'])]
H1_AT, H2_AT, H3_AT = 2.7, 6.3, S3 + 0.3
CTA_TAP = S5 + 2.6
EASE_ENTER = (0.16, 1, 0.3, 1)

N = int(TOTAL * SR)
bus_dry = np.zeros((N, 2))
bus_verb = np.zeros((N, 2))
bus_pad = np.zeros((N, 2))


# ---- curves (same solver as the page) ---------------------------------------
def bezier(x1, y1, x2, y2):
    cx = 3 * x1; bx = 3 * (x2 - x1) - cx; ax = 1 - cx - bx
    cy = 3 * y1; by = 3 * (y2 - y1) - cy; ay = 1 - cy - by

    def f(x):
        if x <= 0:
            return 0.0
        if x >= 1:
            return 1.0
        lo, hi, t = 0.0, 1.0, x
        for _ in range(40):
            sx = ((ax * t + bx) * t + cx) * t
            if sx < x:
                lo = t
            else:
                hi = t
            t = (lo + hi) / 2
        return ((ay * t + by) * t + cy) * t
    return f


ease_enter = bezier(*EASE_ENTER)


def feed_pos(t):
    pos, frm = 0.0, 0
    for at, to, d in FLICKS:
        pos += (to - frm) * ease_enter((t - at) / d)
        frm = to
    return pos


# ---- helpers ---------------------------------------------------------------
def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def pan(mono, p):
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def place(bus, sig, at, gain=1.0):
    if sig.ndim == 1:
        sig = pan(sig, 0)
    i = int(at * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    bus[max(i, 0):j] += sig[max(0, -i):j - i] * gain


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay_tau)


# ---- instruments -------------------------------------------------------------
def pad_voice(m, dur):
    t = np.arange(int(dur * SR)) / SR
    f = mtof(m)
    sig = np.zeros_like(t)
    for d in (-0.07, 0.0, 0.06):
        ph = 2 * np.pi * f * 2 ** (d / 12) * t + rng.uniform(0, 6.28)
        for k in range(1, 9):
            sig += np.sin(k * ph) / k * (0.85 ** k)
    return sig / 6


def chord(notes, start, end, gain, cutoff, xfade=0.8):
    dur = end - start + xfade
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.clip(t / xfade, 0, 1) ** 0.5 * np.clip((dur - t) / xfade, 0, 1) ** 0.5
    L = np.zeros(n)
    R = np.zeros(n)
    for i, m in enumerate(notes):
        v = pad_voice(m, dur)
        p = -0.5 + i / max(1, len(notes) - 1)
        L += v * np.cos((p + 1) * np.pi / 4)
        R += v * np.sin((p + 1) * np.pi / 4)
    st = lp(np.stack([L, R], 1), cutoff, 2)
    place(bus_pad, st * env[:, None], start - xfade / 2, gain)


def whoosh(at, length=0.9, peak=0.6, lo=300, hi=5000, p_from=-0.6, p_to=0.6, gain=0.3):
    n = int(length * SR)
    t = np.arange(n) / n
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        x = (c + 0.5) / chunks
        k = np.exp(-((x - peak) ** 2) / 0.05)
        f_lo = lo + (hi * 0.3 - lo) * k
        f_hi = min(hi * (0.35 + 0.65 * k), SR / 2 - 100)
        out[a:b] = bp(noise[max(0, a - 2000):b], f_lo, f_hi)[-(b - a):]
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / (1 - peak) * 3.5))
    sig = pan(out * env, np.linspace(p_from, p_to, n))
    place(bus_dry, sig, at - length * peak, gain)
    place(bus_verb, sig, at - length * peak, gain * 0.5)


def tick(at, freq=2600, gain=0.08, p=0.0, tau=0.012):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / tau)
    s += hp(rng.standard_normal(n), 4000) * np.exp(-t / 0.004) * 0.3
    sig = pan(s, p)
    place(bus_dry, sig, at, gain)
    place(bus_verb, sig, at, gain * 0.6)


def sub_thud(at, f0=70, f1=38, gain=0.5, body=0.35):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env_ad(n, 0.004, 0.28)
    s += (0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_ad(n, 0.004, 0.16)
    s += lp(rng.standard_normal(n), 900) * env_ad(n, 0.002, 0.03) * body
    place(bus_dry, s, at, gain)
    place(bus_verb, s, at, gain * 0.25)


def bell(at, m, gain=0.18, p=0.0, tau=0.9):
    n = int(2.8 * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * env_ad(n, 0.006, tau)
    s += 0.25 * np.sin(2 * np.pi * f * 2.0 * t) * env_ad(n, 0.004, tau * 0.45)
    s += 0.06 * np.sin(2 * np.pi * f * 2.76 * t) * env_ad(n, 0.003, tau * 0.3)
    sig = pan(s, p)
    place(bus_dry, sig, at, gain)
    place(bus_verb, sig, at, gain * 0.9)


def swell(start, end, gain=0.25, lo=200, hi=3000):
    n = int((end - start) * SR)
    t = np.arange(n) / n
    noise = rng.standard_normal((n, 2))
    s = lp(noise, lo) * (1 - t[:, None]) + lp(noise, hi) * t[:, None]
    env = t ** 3
    place(bus_dry, s * env[:, None], start, gain)
    place(bus_verb, s * env[:, None], start, gain * 0.6)


def press(at, gain=0.3):
    """Soft screen press: a muted low tap plus a tiny glassy click."""
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (220 * np.exp(-t / 0.03) + 110) * t) * env_ad(n, 0.001, 0.035)
    s += bp(rng.standard_normal(n), 2500, 7000) * env_ad(n, 0.0005, 0.004) * 0.5
    place(bus_dry, s, at, gain)
    place(bus_verb, s, at, gain * 0.3)


def pulse(start, end, bpm=104, gain=0.2, shaker=0.0):
    beat = 60 / bpm
    k = 0
    tt = start
    while tt < end - 0.05:
        fade = min(1, (tt - start) / (beat * 4), (end - tt) / (beat * 2))
        sub_thud(tt, f0=62, f1=42, gain=gain * fade, body=0.12)
        if shaker:
            n = int(0.06 * SR)
            sh = hp(rng.standard_normal(n), 6000) * env_ad(n, 0.004, 0.018)
            place(bus_dry, pan(sh, 0.35 if k % 2 else -0.35), tt + beat / 2, shaker * fade)
        tt += beat
        k += 1


# ---- the score ----------------------------------------------------------------
# Harmonic bed in E major: one colour per scene, resolving on the end card.
chord([52, 59, 63, 66, 68], S1, S2, 0.20, 1300)             # Emaj9: hook
chord([49, 56, 59, 63, 64], S2, 6.3, 0.21, 1800)            # C#m9: the feed
chord([45, 52, 56, 59, 64], 6.3, S3, 0.22, 2100)            # Amaj7(9): scroll speeds up
chord([47, 54, 59, 61, 66], S3, S4, 0.22, 2300)             # B sus2: brand wall
chord([40, 47, 59], S4, S5, 0.19, 1000)                     # pedal: how it works
chord([40, 52, 59, 63, 66, 68, 71], S5, TOTAL + 0.8, 0.23, 2400)  # Emaj9 resolve

# Momentum: a soft pulse from the feed through the wall, shaker once it speeds up
pulse(S2 + 0.4, S4 - 0.1, gain=0.18)
pulse(6.3, S4 - 0.1, gain=0.0, shaker=0.05)

# S1 · hook: bloom on frame 0, then the tiles clear
sub_thud(0.02, f0=80, f1=34, gain=0.38)
bell(0.05, 76, gain=0.08, tau=1.4)
whoosh(S2 - 0.2, length=0.9, peak=0.55, gain=0.2, p_from=0.4, p_to=-0.4)

# Header line changes
for at in (H1_AT, H2_AT, H3_AT):
    tick(at, freq=3000, gain=0.06)

# S2 · scrolling: thumb press, flick air, and a detent tick for every tile that
# crosses the top of the feed (pitch rises and level drops as the scroll speeds up)
for at, to, d in FLICKS:
    press(at - 0.18, gain=0.22)
    whoosh(at + 0.08, length=0.5 + 0.25 * (to > 6), peak=0.3, lo=900, hi=7000, p_from=0, p_to=0, gain=0.09)
frames = np.arange(int(S2 * 100), int(S3 * 100)) / 100
pos = np.array([feed_pos(x) for x in frames])
for i in range(1, len(pos)):
    if np.floor(pos[i]) > np.floor(pos[i - 1]):
        v = (pos[i] - pos[i - 1]) * 100                      # tiles per second
        tick(frames[i], freq=2100 + 140 * min(v, 8), gain=0.07 / (1 + 0.12 * v), p=0.15 * np.sin(i), tau=0.008)
# each landing settles with a quiet low tick
for at, to, d in FLICKS:
    tick(at + d * 0.55, freq=1400, gain=0.035, tau=0.02)

# S3 · brand wall
whoosh(S3 + 0.05, length=1.1, peak=0.5, gain=0.22)
sub_thud(S3 + 0.25, f0=74, f1=40, gain=0.28)

# S4 · how it works: three muted hits
whoosh(S4, length=0.9, peak=0.55, gain=0.18)
for i in range(3):
    at = S4 + 0.1 + i * (STAGGER['wide'] + HOLD['short'] + 0.25)
    sub_thud(at + 0.05, f0=68, f1=40, gain=0.3, body=0.25)
    tick(at + 0.05, freq=2400 + i * 300, gain=0.05)

# S5 · end card: swell, warm hit, bell resolve, then the CTA tap
swell(S5 - 1.0, S5 + 0.05, gain=0.16)
sub_thud(S5 + 0.1, f0=82, f1=34, gain=0.45)
bell(S5 + 0.15, 76, gain=0.12, p=-0.2, tau=1.6)
bell(S5 + 0.15 + STAGGER['wide'], 83, gain=0.07, p=0.2, tau=1.4)
tick(S5 + DUR['base'], gain=0.05)
press(CTA_TAP, gain=0.3)
bell(CTA_TAP + 0.05, 80, gain=0.07, tau=0.8)
bell(CTA_TAP + 0.05 + STAGGER['wide'], 88, gain=0.05, tau=1.0)

# ---- mix (same chain as scripts/sound.py; loudness is set at mux time) ------
def reverb_ir(seconds=2.4):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (seconds / 6.9))[:, None]
    ir = lp(ir, 6000)
    ir[: int(0.012 * SR)] = 0  # pre-delay
    return ir / np.sqrt((ir ** 2).sum(0))


ir = reverb_ir()
wet = np.stack([fftconvolve(bus_verb[:, c], ir[:, c])[:N] for c in range(2)], 1)

# Sidechain-style duck of the pad under the pulse and hits: follow the dry bus.
envf = lp(np.abs(bus_dry).mean(1), 12)
duck = 1 - np.clip(envf * 2.2, 0, 0.35)
mix = bus_pad * duck[:, None] + bus_dry + wet * 0.55
mix = hp(mix, 28, 2)

t = np.arange(N) / SR
mix *= np.clip(t / 0.01, 0, 1)[:, None] * np.clip((TOTAL - t) / 1.2, 0, 1)[:, None]

mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))

out = sys.argv[1] if len(sys.argv) > 1 else 'out/prx-brands-sound.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out)

"""Procedural sound design for the PRX Vault promo.

Every cue is synthesised here (no third-party samples, so no licensing), and
every cue time is derived from the same scene constants as index.html, so the
audio stays in sync if the timeline changes.

Brand direction (from the PRX brief): premium, confident, controlled. Soft
attacks and long tails, like the motion's "fast start, long soft landing".
No coin sounds, arcade chimes or "reward" jingles: cashback is confirmed money,
so the confirmation cue is a restrained two-note tone.

Usage: python3 scripts/sound.py out/prx-vault-sound.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(7)

# ---- timeline constants (mirror index.html) --------------------------------
S1, S2, S3, S4, S5, S6 = 0.0, 4.0, 10.0, 15.8, 21.6, 25.0
TOTAL = 29.0
DUR = dict(micro=0.2, fast=0.4, base=0.7, slow=1.1, hero=1.6)
STAGGER = dict(tight=0.04, base=0.08, wide=0.14)
HOLD = dict(short=0.3, base=0.8, long=1.5)
EXIT_RATIO = 0.6

N = int(TOTAL * SR)
bus_dry = np.zeros((N, 2))
bus_verb = np.zeros((N, 2))
bus_pad = np.zeros((N, 2))


# ---- helpers ---------------------------------------------------------------
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def pan(mono, p):
    """Equal-power pan; p in [-1, 1], scalar or per-sample array."""
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
    """Warm detuned saw pad voice, darkened; long attack and release."""
    t = t_axis(dur)
    f = mtof(m)
    sig = np.zeros_like(t)
    for d in (-0.07, 0.0, 0.06):
        ph = 2 * np.pi * f * 2 ** (d / 12) * t + rng.uniform(0, 6.28)
        # band-limited-ish saw from a few harmonics
        for k in range(1, 9):
            sig += np.sin(k * ph) / k * (0.85 ** k)
    return sig / 6


def chord(notes, start, end, gain, cutoff, xfade=0.9):
    dur = end - start + xfade
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.clip(t / xfade, 0, 1) ** 0.5 * np.clip((dur - t) / xfade, 0, 1) ** 0.5
    L = np.zeros(n)
    R = np.zeros(n)
    for i, m in enumerate(notes):
        v = pad_voice(m, dur)
        p = -0.5 + i / max(1, len(notes) - 1)  # spread voicing across the stereo field
        L += v * np.cos((p + 1) * np.pi / 4)
        R += v * np.sin((p + 1) * np.pi / 4)
    st = np.stack([L, R], 1)
    # slow filter "breath"
    st = lp(st, cutoff, 2)
    place(bus_pad, st * env[:, None], start - xfade / 2, gain)


def whoosh(at, length=0.9, peak=0.65, lo=300, hi=5000, p_from=-0.6, p_to=0.6, gain=0.35):
    """Filtered-noise air move; `peak` is where in the length it is loudest."""
    n = int(length * SR)
    t = np.arange(n) / n
    noise = rng.standard_normal(n)
    # sweep: split into chunks with rising then falling band
    out = np.zeros(n)
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        x = (c + 0.5) / chunks
        k = np.exp(-((x - peak) ** 2) / 0.05)
        f_lo = lo + (hi * 0.3 - lo) * k
        f_hi = min(hi * (0.35 + 0.65 * k), SR / 2 - 100)
        seg = bp(noise[max(0, a - 2000):b], f_lo, f_hi)[-(b - a):]
        out[a:b] = seg
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / (1 - peak) * 3.5))
    sig = pan(out * env, np.linspace(p_from, p_to, n))
    place(bus_dry, sig, at - length * peak, gain)
    place(bus_verb, sig, at - length * peak, gain * 0.5)


def tick(at, freq=2600, gain=0.08, p=0.0):
    """Soft UI tick for text/label entrances."""
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.012)
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
    # 2nd/3rd harmonics so the hit still reads on phone speakers (no sub below ~150 Hz)
    s += (0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_ad(n, 0.004, 0.16)
    s += lp(rng.standard_normal(n), 900) * env_ad(n, 0.002, 0.03) * body
    place(bus_dry, s, at, gain)
    place(bus_verb, s, at, gain * 0.25)


def latch(at, gain=0.55):
    """Vault latch: low thunk plus a damped metallic click. Card-link hand-off."""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    thunk = np.sin(2 * np.pi * (140 * np.exp(-t / 0.08) + 70) * t) * env_ad(n, 0.002, 0.07)
    click = bp(rng.standard_normal(n), 1800, 6500) * env_ad(n, 0.0005, 0.006)
    ring = (np.sin(2 * np.pi * 1870 * t) + 0.6 * np.sin(2 * np.pi * 2790 * t)) * env_ad(n, 0.001, 0.05) * 0.18
    s = thunk * 0.9 + click * 0.8 + ring
    # second, smaller click: the bolt seating
    s2 = np.zeros(n)
    k = int(0.055 * SR)
    s2[k:] = (click[: n - k] * 0.5 + thunk[: n - k] * 0.3)
    place(bus_dry, s + s2, at, gain)
    place(bus_verb, s + s2, at, gain * 0.5)


def bell(at, m, gain=0.18, p=0.0, tau=0.9):
    """Soft sine bell, no sparkle. A pure partial plus a quiet inharmonic one."""
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
    """Reverse-style riser: filtered noise that opens up into `end`."""
    n = int((end - start) * SR)
    t = np.arange(n) / n
    noise = rng.standard_normal((n, 2))
    a = lp(noise, lo)
    b = lp(noise, hi)
    s = a * (1 - t[:, None]) + b * t[:, None]
    env = t ** 3
    place(bus_dry, s * env[:, None], start, gain)
    place(bus_verb, s * env[:, None], start, gain * 0.6)


def pulse(start, end, bpm=100, gain=0.22, shaker=0.0):
    beat = 60 / bpm
    k = 0
    tt = start
    while tt < end - 0.05:
        fade = min(1, (tt - start) / (beat * 4), (end - tt) / (beat * 2))
        sub_thud(tt, f0=62, f1=42, gain=gain * fade, body=0.12)
        if shaker:
            n = int(0.06 * SR)
            tn = np.arange(n) / SR
            sh = hp(rng.standard_normal(n), 6000) * env_ad(n, 0.004, 0.018)
            place(bus_dry, pan(sh, 0.35 if k % 2 else -0.35), tt + beat / 2, shaker * fade)
        tt += beat
        k += 1


# ---- the score ----------------------------------------------------------------
# Harmonic bed: D major colour, one chord per scene.
chord([50, 57, 61, 64, 66], S1, S2, 0.22, 1400)            # Dmaj9: hook
chord([47, 54, 57, 61, 62], S2, S3, 0.22, 1700)            # Bm9-ish: link card
chord([43, 50, 54, 57, 62], S3, S4, 0.22, 2000)            # Gmaj7(9): shopping
chord([45, 52, 57, 59, 64], S4, S5, 0.23, 2200)            # A sus2: confirmation
chord([38, 45, 57], S5, S6, 0.20, 900)                     # stripped pedal: "No codes..."
chord([38, 50, 57, 61, 64, 66, 69], S6, TOTAL + 0.9, 0.24, 2400)  # Dmaj9 resolve

# Rhythmic pulse carries momentum through the three steps, drops for S5.
pulse(S2 + 0.3, S5 - 0.1, bpm=100, gain=0.2)
pulse(S3, S5 - 0.1, bpm=100, gain=0.0, shaker=0.05)

# S1: hook
swell(S1, S1 + 0.55, gain=0.18)
sub_thud(S1 + 0.55, f0=80, f1=34, gain=0.45)               # logo lands (hero ease)
bell(S1 + 0.6, 74, gain=0.10, tau=1.6)
tick(S1 + 1.0, gain=0.05)
tick(S1 + 1.0 + STAGGER['wide'], gain=0.05)
tick(S1 + 1.0 + STAGGER['wide'] * 2 + HOLD['short'], freq=3100, gain=0.07)

# Scene transitions: an air move peaking on each cut
for s in (S2, S3, S4, S5, S6):
    whoosh(s - 0.08, length=1.0, peak=0.6, gain=0.22)

# S2: link your card once
tick(S2, gain=0.045); tick(S2 + STAGGER['base'], gain=0.05); tick(S2 + STAGGER['base'] * 2 + DUR['fast'], gain=0.04)
whoosh(S2 + 0.75, length=0.8, peak=0.55, lo=120, hi=2200, p_from=0, p_to=0, gain=0.22)   # phone rises
card_in = S2 + 1.3
whoosh(card_in + 0.25, length=0.8, peak=0.4, lo=600, hi=7000, p_from=0.9, p_to=0.45, gain=0.22)
card_mv = card_in + DUR['slow'] + HOLD['base']
whoosh(card_mv + DUR['hero'] * 0.5, length=1.4, peak=0.55, lo=300, hi=5000, p_from=0.5, p_to=-0.3, gain=0.26)
latch(card_mv + DUR['hero'] * 0.82)                          # card seats into "Add Card"
whoosh(card_mv + DUR['hero'] + DUR['hero'] * 0.5, length=0.9, peak=0.5, lo=200, hi=2500, p_from=0, p_to=0, gain=0.12)

# S3: shop like you always do
tick(S3, gain=0.045); tick(S3 + STAGGER['base'], gain=0.05); tick(S3 + STAGGER['base'] * 2 + DUR['fast'], gain=0.04)
a3 = S3 + 0.6
for i in range(3):
    whoosh(a3 + i * STAGGER['wide'] + 0.3, length=0.6, peak=0.45, lo=500, hi=6000,
           p_from=0.7, p_to=0.2, gain=0.1)
for i in range(3):
    tick(S3 + 1.6 + i * STAGGER['base'], freq=2200 + i * 250, gain=0.05, p=-0.4 + i * 0.4)
hop = DUR['slow'] + HOLD['base']
for h in (a3 + hop, a3 + 2 * hop):
    if h < S4 - 0.6:
        whoosh(h + DUR['slow'] * 0.5, length=0.9, peak=0.5, lo=400, hi=6000, p_from=0.6, p_to=-0.6, gain=0.2)
        tick(h + DUR['slow'] * 0.95, freq=1900, gain=0.04)

# S4: cashback, confirmed
tick(S4, gain=0.045); tick(S4 + STAGGER['base'], gain=0.05); tick(S4 + STAGGER['base'] * 2 + DUR['fast'], gain=0.04)
whoosh(S4 + 0.75, length=0.8, peak=0.55, lo=120, hi=2200, p_from=0, p_to=0, gain=0.2)
toast = S4 + 0.5 + DUR['slow'] + HOLD['base']
whoosh(toast + 0.2, length=0.6, peak=0.4, lo=400, hi=5000, p_from=0, p_to=0, gain=0.14)
tick_start = toast + DUR['base'] * 0.5
bell(tick_start + 0.2, 81, gain=0.16, p=-0.1)               # A5
bell(tick_start + 0.38, 86, gain=0.15, p=0.1, tau=1.3)      # D6: a settled rising fourth
total_start = toast + DUR['base'] + HOLD['base']
swell(total_start, total_start + DUR['slow'], gain=0.07, lo=400, hi=4000)
sub_thud(total_start + DUR['slow'], f0=60, f1=40, gain=0.25, body=0.05)

# S5: No codes. No receipts. No gimmicks.
for i in range(3):
    sub_thud(S5 + i * (STAGGER['wide'] + HOLD['short']) + 0.05, f0=95, f1=40, gain=0.55, body=0.45)
n4 = S5 + 3 * (STAGGER['wide'] + HOLD['short']) + HOLD['short']
bell(n4 + 0.1, 69, gain=0.10, tau=1.4)
bell(n4 + 0.1, 74, gain=0.08, tau=1.4, p=0.2)

# S6: end card
swell(S6 - 0.9, S6 + 0.05, gain=0.2)
sub_thud(S6 + 0.1, f0=75, f1=32, gain=0.55)
for m, d, p in ((62, 0.12, -0.3), (66, 0.2, 0.0), (69, 0.28, 0.3), (74, 0.36, 0.0)):
    bell(S6 + d, m, gain=0.09, p=p, tau=2.0)
tick(S6 + DUR['base'] + STAGGER['wide'], gain=0.04)
tick(S6 + DUR['base'] + STAGGER['wide'] * 2 + HOLD['short'], freq=2000, gain=0.06)


# ---- mix ------------------------------------------------------------------------
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

# global fade in/out
t = np.arange(N) / SR
mix *= np.clip(t / 0.15, 0, 1)[:, None] * np.clip((TOTAL - t) / 1.4, 0, 1)[:, None]

# gentle soft-clip and peak normalise; loudness is set at mux time
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))

out = sys.argv[1] if len(sys.argv) > 1 else 'out/prx-vault-sound.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out)

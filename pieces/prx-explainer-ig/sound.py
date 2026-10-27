"""Procedural sound design for the PRX explainer (Instagram, 5s).

Same approach and instruments as scripts/sound.py: everything is synthesised
(no samples, no licensing), and cue times come from the scene constants in this
piece's index.html. Calm and premium: soft attacks and long tails, no coins
and no jingle.

Cues (from the storyboard):
  1. Hook        ambient pad fades in; low soft bloom as the headline lands
  2. Payoff      airy whoosh on the cut; one soft tonal swell under the light sweep
  3. CTA         pad resolves to a final chord

Usage: python3 pieces/prx-explainer-ig/sound.py pieces/prx-explainer-ig/out/sound.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(11)

# ---- timeline constants (mirror index.html) --------------------------------
S1, S2, S3 = 0.0, 1.5, 3.2
TOTAL = 5.0
DUR = dict(micro=0.2, fast=0.4, base=0.7, slow=1.1, hero=1.6)
STAGGER = dict(tight=0.04, base=0.08, wide=0.14)
HEADLINE_LANDS = S1 + 0.3 + STAGGER['wide']   # second line of the hook starts settling
SWEEP = S2 + 0.7                              # light sweep across the card

N = int(TOTAL * SR)
bus_dry = np.zeros((N, 2))
bus_verb = np.zeros((N, 2))
bus_pad = np.zeros((N, 2))


# ---- helpers ---------------------------------------------------------------
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
    t = np.arange(int(dur * SR)) / SR
    f = mtof(m)
    sig = np.zeros_like(t)
    for d in (-0.07, 0.0, 0.06):
        ph = 2 * np.pi * f * 2 ** (d / 12) * t + rng.uniform(0, 6.28)
        for k in range(1, 9):
            sig += np.sin(k * ph) / k * (0.85 ** k)
    return sig / 6


def chord(notes, start, end, gain, cutoff, fade_in=0.5, fade_out=0.5):
    dur = end - start
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.clip(t / fade_in, 0, 1) ** 0.5 * np.clip((dur - t) / fade_out, 0, 1) ** 0.5
    L = np.zeros(n)
    R = np.zeros(n)
    for i, m in enumerate(notes):
        v = pad_voice(m, dur)
        p = -0.5 + i / max(1, len(notes) - 1)
        L += v * np.cos((p + 1) * np.pi / 4)
        R += v * np.sin((p + 1) * np.pi / 4)
    st = lp(np.stack([L, R], 1), cutoff, 2)
    place(bus_pad, st * env[:, None], start, gain)


def whoosh(at, length=0.9, peak=0.6, lo=300, hi=5000, p_from=-0.6, p_to=0.6, gain=0.35):
    """Filtered-noise air move; `peak` is where in the length it is loudest."""
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


def bloom(at, gain=0.4):
    """Low soft bloom: a slow-attack sub with harmonics, no click."""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 44 + 20 * np.exp(-t / 0.25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_ad(n, 0.06, 0.5)
    place(bus_dry, s, at - 0.06, gain)
    place(bus_verb, s, at - 0.06, gain * 0.4)


def swell(start, end, gain=0.2, lo=200, hi=3000):
    """Filtered noise that opens up into `end`."""
    n = int((end - start) * SR)
    t = np.arange(n) / n
    noise = rng.standard_normal((n, 2))
    s = lp(noise, lo) * (1 - t[:, None]) + lp(noise, hi) * t[:, None]
    env = t ** 3
    place(bus_dry, s * env[:, None], start, gain)
    place(bus_verb, s * env[:, None], start, gain * 0.6)


def tone_swell(at, notes, rise=0.45, tau=0.7, gain=0.12):
    """One soft tonal swell: sines that rise in, peak at `at`, then decay."""
    n = int((rise + tau * 4) * SR)
    t = np.arange(n) / SR
    env = np.where(t < rise, (t / rise) ** 2, np.exp(-(t - rise) / tau))
    s = np.zeros((n, 2))
    for i, m in enumerate(notes):
        f = mtof(m)
        v = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * f * 2 * t)
        s += pan(v * env, -0.3 + 0.6 * i / max(1, len(notes) - 1))
    place(bus_dry, s, at - rise, gain)
    place(bus_verb, s, at - rise, gain * 1.2)


def bell(at, m, gain=0.18, p=0.0, tau=0.9):
    """Soft sine bell, no sparkle."""
    n = int(2.8 * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * env_ad(n, 0.006, tau)
    s += 0.25 * np.sin(2 * np.pi * f * 2.0 * t) * env_ad(n, 0.004, tau * 0.45)
    sig = pan(s, p)
    place(bus_dry, sig, at, gain)
    place(bus_verb, sig, at, gain * 0.9)


# ---- the score ----------------------------------------------------------------
# Pad: Dmaj9 fades in under the hook, lifts to Gmaj9 for the payoff,
# resolves to D major on the end card.
chord([50, 57, 61, 64, 66], S1, S2 + 0.35, 0.24, 1300, fade_in=0.6, fade_out=0.35)
chord([43, 50, 57, 59, 66], S2 - 0.1, S3 + 0.35, 0.24, 1800, fade_in=0.35, fade_out=0.35)
chord([38, 50, 57, 62, 66, 69], S3 - 0.1, TOTAL + 0.5, 0.26, 2200, fade_in=0.3, fade_out=0.1)

# 1 · Hook: a low soft bloom as the headline lands
swell(S1, HEADLINE_LANDS, gain=0.12, lo=150, hi=1800)
bloom(HEADLINE_LANDS, gain=0.42)
bell(HEADLINE_LANDS + 0.02, 74, gain=0.07, tau=1.2)

# 2 · Payoff: airy whoosh peaking on the cut, one tonal swell under the sweep
whoosh(S2, length=0.9, peak=0.6, lo=400, hi=7000, gain=0.24)
tone_swell(SWEEP + DUR['base'] * 0.5, [74, 81], gain=0.07)

# 3 · CTA: the resolve, marked by a quiet D-major bell voicing on the logo
for m, d, p in ((62, 0.0, -0.3), (66, 0.08, 0.0), (69, 0.16, 0.3)):
    bell(S3 + 0.05 + d, m, gain=0.06, p=p, tau=1.6)


# ---- mix ------------------------------------------------------------------------
def reverb_ir(seconds=2.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (seconds / 6.9))[:, None]
    ir = lp(ir, 6000)
    ir[: int(0.012 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(0))


ir = reverb_ir()
wet = np.stack([fftconvolve(bus_verb[:, c], ir[:, c])[:N] for c in range(2)], 1)
envf = lp(np.abs(bus_dry).mean(1), 12)
duck = 1 - np.clip(envf * 2.2, 0, 0.3)
mix = bus_pad * duck[:, None] + bus_dry + wet * 0.55
mix = hp(mix, 28, 2)

t = np.arange(N) / SR
mix *= np.clip(t / 0.05, 0, 1)[:, None] * np.clip((TOTAL - t) / 0.5, 0, 1)[:, None]

mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))

out = sys.argv[1] if len(sys.argv) > 1 else 'pieces/prx-explainer-ig/out/sound.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out)

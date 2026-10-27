"""Aggressive RokiRed halftone plates for AD-006's lifestyle panels (paper-grunge Tier C: mood imagery, no product sold
from these). Levels first, 45 degree dot screen, then photocopy grunge and edge grime. Writes assets/ht/<key>.png at the
exact panel size so nothing is rescaled in the browser."""
import math, pathlib, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter as gf

ROOT = pathlib.Path(__file__).parent
SRC, OUT = ROOT / "assets/model", ROOT / "assets/ht"
INK = (138, 0, 0)          # RokiRed
PAPER = (255, 255, 255)
SS = 3                     # supersample for clean dots

# key: (source, panel w, panel h, focus x, focus y, zoom, cell px)
PLATES = {
    "kbg-life":    ("kbg-wraps-life.jpg", 960, 300, .50, .40, 1.0, 6),
    "shirt-life":  ("shirt-life-1.jpg",   960, 340, .50, .22, 1.0, 6),
    "straps-life": ("straps-life-2.jpg",  960, 300, .50, .62, 1.0, 6),
    "muki-life":   ("muki-life-1.jpg",    324, 320, .50, .45, 1.0, 6),
    # 1:1 versions
    "kbg-life-sq":    ("kbg-wraps-life.jpg", 960, 200, .50, .42, 1.0, 6),
    "shirt-life-sq":  ("shirt-life-1.jpg",   960, 220, .50, .22, 1.0, 6),
    "straps-life-sq": ("straps-life-2.jpg",  960, 200, .50, .62, 1.0, 6),
    "muki-life-sq":   ("muki-life-1.jpg",    328, 260, .50, .45, 1.0, 6),
}


def cover(im, w, h, fx, fy, zoom):
    s = max(w / im.width, h / im.height) * zoom
    nw, nh = round(im.width * s), round(im.height * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    x, y = round((nw - w) * fx), round((nh - h) * fy)
    return im.crop((x, y, x + w, y + h))


def levels(L, target=.5):
    a, b = np.percentile(L, 2), np.percentile(L, 98)
    L = np.clip((L - a) / (b - a + 1e-6), 0, 1)
    g = math.log(target) / math.log(max(L.mean(), .02))
    return L ** g


def plate(key, src, w, h, fx, fy, zoom, cell):
    im = cover(Image.open(SRC / src).convert("L"), w * SS, h * SS, fx, fy, zoom)
    L = levels(np.asarray(im).astype(float) / 255, .62)
    L = np.clip((L - .55) * 1.3 + .55, 0, 1)                       # push contrast for the aggressive read
    W, H, c = w * SS, h * SS, cell * SS
    out = Image.new("L", (W, H), 0); d = ImageDraw.Draw(out)
    a = math.radians(45); ca, sa = math.cos(a), math.sin(a); R = math.hypot(W, H)
    v = -R
    while v < R:
        u = -R
        while u < R:
            x, y = W / 2 + u * ca - v * sa, H / 2 + u * sa + v * ca
            if 0 <= x < W and 0 <= y < H:
                r = math.sqrt(1 - L[int(y), int(x)]) * c * .74
                if r > .5:
                    d.ellipse([x - r, y - r, x + r, y + r], 255)
            u += c
        v += c
    ink = np.asarray(out.resize((w, h), Image.LANCZOS)).astype(float) / 255
    rng = np.random.default_rng(sum(map(ord, key)) + 6)
    n = gf(rng.standard_normal((h, w)), 1.1); n /= n.std()
    ink = np.clip(ink + np.clip((n - 1.9) * .9, 0, 1), 0, 1)         # photocopy speckle
    ink = ink * (gf(rng.standard_normal((h, w)), 1.4) > -1.6)        # dropout: worn print
    yy, xx = np.mgrid[0:h, 0:w]
    edge = np.minimum.reduce([xx, yy, w - 1 - xx, h - 1 - yy]) / 40
    grime = np.clip(1 - edge + gf(rng.standard_normal((h, w)), 6) * .6, 0, 1) * .55
    ink = np.maximum(ink, grime * (gf(rng.standard_normal((h, w)), 2) > .3))   # edge grime
    rgb = np.stack([PAPER[k] * (1 - ink) + INK[k] * ink for k in range(3)], 2)
    Image.fromarray(rgb.astype("uint8")).save(OUT / f"{key}.png")


OUT.mkdir(parents=True, exist_ok=True)
for k, args in PLATES.items():
    plate(k, *args)
    print(k)

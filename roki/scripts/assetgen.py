"""Procedural asset pack for paper-grunge-motion. python3 assetgen.py OUTDIR [seed]
Everything is generated, so there is no licence to track. Ink assets are black on transparent: tint them in CSS with mask-image."""
import sys, os, json, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter as gf, map_coordinates

OUT = sys.argv[1] if len(sys.argv) > 1 else 'pack'
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 1
manifest = {}
def rng(*k): return np.random.default_rng(abs(sum((i+1)*ord(c) for i,c in enumerate(''.join(map(str,k))))*7919+SEED*104729) % (2**32))
def save(img, cat, name, **meta):
    os.makedirs(f'{OUT}/{cat}', exist_ok=True)
    p = f'{cat}/{name}.' + ('jpg' if img.mode == 'RGB' else 'png')
    img.save(f'{OUT}/{p}', quality=90) if img.mode == 'RGB' else img.save(f'{OUT}/{p}')
    manifest.setdefault(cat, []).append(dict(file=p, size=list(img.size), **meta))
def fbm(shape, r, scales, weights=None):
    h = np.zeros(shape)
    for i, s in enumerate(scales):
        n = gf(r.standard_normal(shape), s); n /= n.std() + 1e-9
        h += n * (weights[i] if weights else 1 / (i + 1))
    return h
def alpha_img(a, rgb=(0, 0, 0)):
    a = np.clip(a, 0, 1); im = Image.new('RGBA', a.shape[::-1], rgb + (0,)); im.putalpha(Image.fromarray((a * 255).astype('uint8'))); return im
def wobble(a, r, amp=4, scale=18):
    h, w = a.shape; dx = gf(r.standard_normal((h, w)), scale); dy = gf(r.standard_normal((h, w)), scale)
    dx *= amp / (dx.std() + 1e-9); dy *= amp / (dy.std() + 1e-9)
    yy, xx = np.mgrid[0:h, 0:w]; return map_coordinates(a, [yy + dy, xx + dx], order=1, mode='constant')
def smooth(x, a, b): t = np.clip((x - a) / (b - a + 1e-9), 0, 1); return t * t * (3 - 2 * t)

# ---------- 1. paper ----------
PAPERS = {  # name: (base rgb, crease strength, fibre, tint noise)
 'cream':   ((244, 241, 230), 1.0, .5, .02), 'kraft':   ((217, 209, 184), .8, 1.0, .05),
 'newsprint': ((226, 224, 214), .5, 1.4, .03), 'cool':   ((239, 239, 240), 1.0, .4, .01),
 'vermilion-stock': ((236, 214, 200), .7, .8, .03), 'charcoal': ((38, 38, 40), .9, .6, .02)}
def paper(name, i, W=1080, H=1350):
    from scipy.spatial import cKDTree
    base, crease, fibre, tint = PAPERS[name]; r = rng('paper', name, i)
    N = int(90 + r.integers(0, 50)); pts = r.random((N, 2)) * [W, H]; tree = cKDTree(pts)
    sw, sh = W // 3, H // 3; yy, xx = np.mgrid[0:sh, 0:sw] * 3.0
    xx = xx + gf(r.standard_normal((sh, sw)), 14) * 160; yy = yy + gf(r.standard_normal((sh, sw)), 14) * 160   # wobble the folds
    d, idx = tree.query(np.c_[xx.ravel(), yy.ravel()], k=2)
    cell = r.normal(0, 1, N) * .011 * crease; facet = cell[idx[:, 0]].reshape(sh, sw)
    edge = np.exp(-((d[:, 1] - d[:, 0]) / 4.5) ** 2).reshape(sh, sw)
    light = np.where(cell[idx[:, 1]].reshape(sh, sw) > cell[idx[:, 0]].reshape(sh, sw), -1, .6)   # lit side of a fold is lighter
    low = facet + edge * light * .075 * crease
    low = np.asarray(Image.fromarray(low.astype('float32')).resize((W, H), Image.BICUBIC)).astype(float)
    low = gf(low, 1.2)
    fib = gf(r.standard_normal((H, W)), (.6, 3)) * fibre * .03
    spk = (r.random((H, W)) > 0.9985) * r.random((H, W)) * -.16 * fibre
    cloud = gf(r.standard_normal((H, W)), 150); cloud = cloud / cloud.std() * tint
    s_ = np.clip(1 + low + fib + spk + cloud, .7, 1.15)
    img = np.stack([np.clip(base[c] * s_, 0, 255) for c in range(3)], 2)
    return Image.fromarray(img.astype('uint8'))
# ---------- 2. brush strokes ----------
def brush(i, W=1100, H=240, dry=.6, taper=.5, wob=.12):
    r = rng('brush', i); x = np.linspace(0, 1, W)
    cy = H / 2 + gf(r.standard_normal(W), 90) * H * wob * 6
    th = H * (.34 + .1 * gf(r.standard_normal(W), 70) * 3) * (smooth(x, 0, .05 + .1 * taper) * smooth(1 - x, 0, .12 + .25 * taper) * .55 + .45)
    yy = np.arange(H)[:, None]; d = np.abs(yy - cy[None]) / (th[None] + 1e-6)
    bris = gf(r.standard_normal((H, W)), (1.1, 55)); bris = (bris - bris.mean()) / bris.std()
    thr = -1.4 + dry * 2.4 * smooth(x, .25, 1)[None]   # dry-out towards the end
    fine = gf(r.standard_normal((H, W)), (.7, 3)); fine /= fine.std()
    edge = 1 - smooth(d + fine * .06, .88, 1.0)
    a = edge * (bris > thr) * (1 - smooth(d, .7, 1) * .4 * (fine > 0))
    return alpha_img(gf(a.astype(float), .5))
# ---------- 3. splatter ----------
def splatter(i, S=900, drops=70):
    r = rng('splat', i); im = Image.new('L', (S * 2, S * 2), 0); d = ImageDraw.Draw(im); c = S
    for _ in range(r.integers(5, 9)):
        a, rr = r.random() * 6.28, r.random() * S * .08; x, y = c + math.cos(a) * rr, c + math.sin(a) * rr; s = S * (.07 + r.random() * .09)
        d.ellipse([x - s, y - s * (.6 + r.random() * .5), x + s, y + s * (.6 + r.random() * .5)], 255)
    for _ in range(drops):
        a = r.random() * 6.28; dist = (r.random() ** .7) * S * .85 + S * .12; s = max(1.5, S * .035 * (1 - dist / (S * 1.05)) * (.3 + r.random()))
        x, y = c + math.cos(a) * dist, c + math.sin(a) * dist
        if r.random() < .35:  # streak droplet
            d.line([c + math.cos(a) * (dist - s * 4), c + math.sin(a) * (dist - s * 4), x, y], 255, int(max(2, s * .8)))
        d.ellipse([x - s, y - s, x + s, y + s], 255)
    a = np.asarray(im.filter(ImageFilter.GaussianBlur(S * .012))).astype(float) / 255
    a = wobble(smooth(a, .45, .55), r, 3, 10)
    return alpha_img(a).crop(alpha_img(a).getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
# ---------- 4. halftone / screens (graphic fills: fine cells, 6 to 12 px) ----------
def screen(kind, angle, cell, ramp, W=1080, H=1080, i=0):
    yy, xx = np.mgrid[0:H, 0:W].astype(float); a = math.radians(angle)
    u = (xx * math.cos(a) + yy * math.sin(a)) / cell; v = (-xx * math.sin(a) + yy * math.cos(a)) / cell
    fu, fv = u - np.round(u), v - np.round(v)
    if ramp == 'flat': t = np.full((H, W), .55)
    elif ramp == 'radial': t = np.clip(1 - np.hypot(xx - W / 2, yy - H / 2) / (W * .55), 0, 1) ** .8
    elif ramp == 'linear': t = xx / W
    else:
        t = gf(rng('scr', i).standard_normal((H, W)), 110); t = np.clip(t / t.std() * .3 + .5, 0, 1)  # organic
    if kind == 'dot': d = np.hypot(fu, fv); rad = np.sqrt(t) * .62
    elif kind == 'line': d = np.abs(fv); rad = t * .5
    elif kind == 'square': d = np.maximum(abs(fu), abs(fv)); rad = np.sqrt(t) * .5
    elif kind == 'cross': d = np.minimum(abs(fu), abs(fv)); rad = t * .28
    else: d = abs(fu) + abs(fv); rad = np.sqrt(t) * .7  # diamond
    return alpha_img((rad - d) * cell + .5)
# ---------- 5. tape ----------
def tape(kind, i, W=360, H=96):
    r = rng('tape', kind, i); a = np.ones((H, W))
    for side in (0, 1):  # torn zig-zag ends
        pts = np.abs(gf(r.standard_normal(H), 1.5)) * 26 + 6
        for y in range(H):
            if side == 0: a[y, :int(pts[y])] = 0
            else: a[y, W - int(pts[y]):] = 0
    a = gf(a, .8); fib = gf(r.standard_normal((H, W)), (.5, 6)) * .12
    cols = {'kraft': ((209, 190, 150), .86), 'masking': ((232, 222, 178), .8), 'clear': ((255, 255, 255), .32), 'washi': ((238, 150, 140), .78)}[kind]
    rgb = np.stack([np.clip(cols[0][c] * (1 + fib), 0, 255) for c in range(3)], 2)
    al = a * cols[1] * (1 + fib * .5)
    if kind == 'washi':
        st = ((np.arange(W)[None] // 14) % 2) * .22; rgb = np.clip(rgb * (1 - st[..., None]) + 255 * st[..., None] * .5, 0, 255)
    if kind == 'clear': al = al * (.6 + .4 * np.clip((np.abs(np.arange(H)[:, None] - H / 2) / (H / 2)) ** 4 * 3, 0, 1))
    im = Image.fromarray(rgb.astype('uint8')).convert('RGBA'); im.putalpha(Image.fromarray((np.clip(al, 0, 1) * 255).astype('uint8'))); return im
# ---------- 6. torn edges (paper coloured, drop on top of a darker ground) ----------
def torn(i, amp, W=1080, H=220, colour=(244, 241, 230)):
    r = rng('torn', i); x = np.arange(W)
    e = H * .5 + gf(r.standard_normal(W), 6) * amp * 3 + gf(r.standard_normal(W), 1.2) * amp * 1.2 + np.round(gf(r.standard_normal(W), 40) * amp, 0)
    yy = np.arange(H)[:, None]; a = smooth(yy - e[None], -1, 1)  # below edge = paper
    fibre = np.exp(-((yy - e[None] + 7) / 6) ** 2) * .5   # lighter fibre strip hugging the tear
    rgb = np.zeros((H, W, 3))
    for c in range(3): rgb[..., c] = np.clip(colour[c] * (1 - .02 * r.random((H, W))) + 14 * fibre, 0, 255)
    im = Image.fromarray(rgb.astype('uint8')).convert('RGBA'); im.putalpha(Image.fromarray((np.clip(a + fibre * .8 * (a < .5), 0, 1) * 255).astype('uint8'))); return im
# ---------- 7. grunge overlays (black, use multiply) ----------
def grunge(kind, i, W=1080, H=1350):
    r = rng('grunge', kind, i)
    if kind == 'dust':
        a = (r.random((H, W)) > .9992).astype(float); a = gf(a, .9) * 9
        for _ in range(26):  # hairs
            im = Image.new('L', (W, H)); d = ImageDraw.Draw(im); x, y = r.random() * W, r.random() * H; pts = [(x, y)]
            for _ in range(8): x += r.normal(0, 14); y += r.normal(0, 14); pts.append((x, y))
            d.line(pts, 255, 1); a += np.asarray(im) / 255 * .8
    elif kind == 'scratch':
        im = Image.new('L', (W, H)); d = ImageDraw.Draw(im)
        for _ in range(34):
            x, y = r.random() * W, r.random() * H; ang = r.normal(1.2, .5); L = r.random() * 500 + 80; pts = []
            for k in range(14): pts.append((x + math.cos(ang) * L * k / 13 + r.normal(0, 1.4), y + math.sin(ang) * L * k / 13 + r.normal(0, 1.4)))
            d.line(pts, int(r.integers(120, 255)), 1)
        a = np.asarray(im) / 255 * .9
    elif kind == 'stain':
        n = fbm((H, W), r, [160, 70, 25], [1, .6, .3]); a = np.clip(smooth(n, .2, 1.2) * .22, 0, 1)
        yy, xx = np.mgrid[0:H, 0:W]; cx, cy = r.random() * W, r.random() * H; rad = r.random() * 160 + 120   # coffee ring
        ring = np.exp(-((np.hypot(xx - cx, yy - cy) - rad) / 5) ** 2) * .35 * (n > -.3); a = np.maximum(a, ring * smooth(n, -.6, .4))
    elif kind == 'photocopy':
        n = gf(r.standard_normal((H, W)), 1.1); n /= n.std()
        a = smooth(n + 1.9 + np.linspace(-.3, .3, W)[None], 2.4, 3.4) * .9
    else:  # edge grime frame
        yy, xx = np.mgrid[0:H, 0:W]; dist = np.minimum.reduce([xx, yy, W - 1 - xx, H - 1 - yy]) / (min(W, H) * .5)
        n = fbm((H, W), r, [30, 12, 4], [1, .8, .5]); a = smooth(.55 - dist * 2.2 + n * .22, 0, .5) * .75
    return alpha_img(a)
# ---------- 8. shapes (black ink on transparent) ----------
def hand_circle(i, S=720):
    r = rng('circle', i); im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im); n = 160; cx = cy = S / 2
    rx, ry = S * (.36 + r.random() * .04), S * (.3 + r.random() * .05); a0 = r.random() * 6.28; turns = 1.12 + r.random() * .1
    pts = []; nz = gf(r.standard_normal(n), 6); nz = nz / (nz.std() + 1e-9) * .018
    for k in range(n):
        t = a0 + turns * 6.2832 * k / (n - 1); gr = 1 + .1 * k / n + nz[k]
        pts.append((cx + math.cos(t) * rx * gr, cy + math.sin(t) * ry * gr))
    for k in range(n - 1):
        w = int(6 + 10 * math.sin(math.pi * k / (n - 1)) ** .6); d.line([pts[k], pts[k + 1]], 255, w); d.ellipse([pts[k][0] - w / 2, pts[k][1] - w / 2, pts[k][0] + w / 2, pts[k][1] + w / 2], 255)
    a = wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1.2))) / 255.0, r, 2.5, 14); return alpha_img(smooth(a, .35, .65))
def scribble_line(i, W=900, H=120, loops=0):
    r = rng('scrib', i); im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); pts = []
    for k in range(60):
        x = 20 + (W - 40) * k / 59; y = H / 2 + math.sin(k * .5) * (H * .08 + (H * .22 if loops else 0)) + r.normal(0, 3); pts.append((x, y))
    for k in range(59): d.line([pts[k], pts[k + 1]], 255, int(7 + 6 * math.sin(math.pi * k / 59)))
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1))) / 255.0, r, 2, 12), .3, .7))
def arrow(i, S=600):
    r = rng('arrow', i); im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im); p0, p1, p2 = np.array([70, S * .8]), np.array([S * .3 + r.random() * 100, S * .1]), np.array([S - 90, S * .3 + r.random() * 60]); pts = []
    for t in np.linspace(0, 1, 50): pts.append(tuple((1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2))
    for k in range(49): d.line([pts[k], pts[k + 1]], 255, int(8 + 8 * k / 49))
    e = np.array(pts[-1]); ang = math.atan2(pts[-1][1] - pts[-3][1], pts[-1][0] - pts[-3][0])
    for s in (-1, 1): d.line([tuple(e), (e[0] - math.cos(ang + s * .55) * 90, e[1] - math.sin(ang + s * .55) * 90)], 255, 16)
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1.3))) / 255.0, r, 2, 12), .3, .7))
def sparkle(i, S=400):
    r = rng('spark', i); im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im); c = S / 2
    pts = []
    for j in range(8): a = j * math.pi / 4; rad = c * (.95 if j % 2 == 0 else .2) * (1 + r.normal(0, .05)); pts.append((c + math.cos(a - math.pi / 2) * rad, c + math.sin(a - math.pi / 2) * rad))
    d.polygon(pts, 255); return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1))) / 255.0, r, 2, 10), .4, .6))
def xmark(i, S=300):
    r = rng('x', i); im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im)
    for (a, b) in [((40, 50), (S - 40, S - 55)), ((S - 50, 40), (50, S - 40))]: d.line([a, b], 255, 36)
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1.5))) / 255.0, r, 3, 10), .3, .7))
def stamp_ring(i, S=700):
    r = rng('ring', i); yy, xx = np.mgrid[0:S, 0:S]; d = np.hypot(xx - S / 2, yy - S / 2); a = ((abs(d - S * .44) < 9) | (abs(d - S * .36) < 4)).astype(float)
    a = gf(a, 1.2); n = gf(r.standard_normal((S, S)), 1.4); n /= n.std(); a *= (n > -.9 + i * .25); return alpha_img(smooth(wobble(a, r, 2.5, 20), .3, .7))
def speed_lines(i, S=1080, n=44):
    r = rng('speed', i); im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im); c = S / 2
    for k in range(n):
        a = k / n * 6.2832 + r.random() * .1; w = (.7 + r.random() * 2) * math.pi / 180; L = S * (.35 + r.random() * .15)
        d.polygon([(c + math.cos(a - w) * S * .49, c + math.sin(a - w) * S * .49), (c + math.cos(a + w) * S * .49, c + math.sin(a + w) * S * .49), (c + math.cos(a) * (S * .49 - L), c + math.sin(a) * (S * .49 - L))], 255)
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(.8))) / 255.0, r, 3, 16), .3, .7))

# ---------- build ----------
DRY = [.2, .4, .6, .8, .5, .7, .3, .9]
for name in PAPERS:
    for i in range(3): save(paper(name, i), 'paper', f'{name}_{i}', family=name)
for i in range(8): save(brush(i, dry=DRY[i], taper=[.2, .5, .8][i % 3], H=[220, 260, 180, 300][i % 4]), 'brush', f'stroke_{i}', dry=DRY[i])
for i in range(6): save(splatter(i, drops=[40, 70, 100][i % 3]), 'splatter', f'splat_{i}')
SCREENS = [('dot', 45, 6, 'flat'), ('dot', 45, 8, 'radial'), ('dot', 15, 10, 'linear'), ('dot', 75, 6, 'organic'), ('line', 45, 6, 'linear'), ('line', 0, 6, 'flat'), ('square', 45, 8, 'radial'), ('cross', 45, 8, 'flat'), ('diamond', 0, 10, 'organic'), ('dot', 22, 12, 'radial')]
for k, (kind, ang, cell, ramp) in enumerate(SCREENS):
    save(screen(kind, ang, cell, ramp, i=k), 'screen', f'{kind}_{ang}_{cell}_{ramp}', kind=kind, angle=ang, cell=cell, ramp=ramp)
for kind in ['kraft', 'masking', 'clear', 'washi']:
    for i in range(2): save(tape(kind, i), 'tape', f'{kind}_{i}', kind=kind)
for i, amp in enumerate([2, 4, 7]): save(torn(i, amp), 'torn', f'edge_{i}', amp=amp)
for kind in ['dust', 'scratch', 'stain', 'photocopy', 'edge']:
    for i in range(2): save(grunge(kind, i), 'grunge', f'{kind}_{i}', kind=kind, blend='multiply')
for i in range(3): save(hand_circle(i), 'shape', f'circle_{i}')
for i in range(3): save(scribble_line(i, loops=i == 2), 'shape', f'scribble_{i}')
for i in range(3): save(arrow(i), 'shape', f'arrow_{i}')
for i in range(2):
    save(sparkle(i), 'shape', f'sparkle_{i}'); save(xmark(i), 'shape', f'x_{i}'); save(stamp_ring(i), 'shape', f'ring_{i}'); save(speed_lines(i), 'shape', f'speedlines_{i}')
json.dump(manifest, open(f'{OUT}/manifest.json', 'w'), indent=1)
print({k: len(v) for k, v in manifest.items()})

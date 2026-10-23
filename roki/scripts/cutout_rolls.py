"""Cut the two rolled wraps (grappler flat 06) off the grey seamless.
The white Roki patch matches the seamless, so a colour key eats it. Instead: find the red/dark
product pixels, split them into the two rolls, and take each roll's convex hull (a roll is convex).
python3 scripts/cutout_rolls.py in.jpg out.png"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(float)
sat = a.max(2) - a.min(2)
prod = (sat > 60) | (a.mean(2) < 90)
prod = ndi.binary_opening(prod, iterations=2)
lab, n = ndi.label(prod); sizes = ndi.sum(prod, lab, range(1, n + 1))
prod = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 4000])
ys, xs = np.nonzero(prod)
# the gap between the rolls: the column with the fewest product pixels near the middle of the bbox
x0, x1 = xs.min(), xs.max(); cols = prod.sum(0)
mid = x0 + (x1 - x0) // 3 + np.argmin(cols[x0 + (x1 - x0) // 3: x0 + 2 * (x1 - x0) // 3])
mask = Image.new('L', im.size, 0); d = ImageDraw.Draw(mask)
for sel in (xs < mid, xs >= mid):
    pts = np.c_[xs[sel], ys[sel]][::7]; h = ConvexHull(pts)
    d.polygon([tuple(p) for p in pts[h.vertices]], 255)
m = np.asarray(mask) > 0
m = ndi.binary_erosion(m, iterations=3)
alpha = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.4))
out = im.convert('RGBA'); out.putalpha(alpha)
out = out.crop(alpha.point(lambda v: 255 if v > 20 else 0).getbbox()); out.save(sys.argv[2]); print(sys.argv[2], out.size, 'split at', mid)

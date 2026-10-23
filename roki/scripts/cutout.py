"""Cut a product off its seamless by flooding the background from the border (paper-grunge-motion 5.9).
python3 scripts/cutout.py in.jpg out.png [tol]"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, dst = sys.argv[1], sys.argv[2]; tol = float(sys.argv[3]) if len(sys.argv) > 3 else 28
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(float)
# the seamless is a gradient, so compare each pixel with a heavily blurred background estimate from the border ring
border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
med = np.median(border, 0)
sat = a.max(2) - a.min(2)
bg = (np.abs(a - med).max(2) < tol + 40) & (sat < 22) & (a.mean(2) > 150)
lab, _ = ndi.label(bg)
edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
fg = ndi.binary_fill_holes(~np.isin(lab, list(edge)))
fg = ndi.binary_opening(fg, iterations=3)
lab2, n = ndi.label(fg); sizes = ndi.sum(fg, lab2, range(1, n + 1))
keep = [i + 1 for i, s in enumerate(sizes) if s > sizes.max() * 0.05]
fg = np.isin(lab2, keep); fg = ndi.binary_erosion(fg, iterations=2)
alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert('RGBA'); out.putalpha(alpha)
out = out.crop(alpha.point(lambda v: 255 if v > 20 else 0).getbbox()); out.save(dst); print(dst, out.size)

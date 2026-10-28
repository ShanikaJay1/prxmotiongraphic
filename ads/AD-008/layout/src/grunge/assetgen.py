# Subset of the paper-grunge Appendix A generator: paper stock, brush strokes, hand circles, arrows, scribbles.
# Run: python3 assetgen.py OUTDIR [seed]
import sys, os, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter as gf, map_coordinates
OUT = sys.argv[1] if len(sys.argv) > 1 else 'pack'; SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 1
def rng(*k): return np.random.default_rng(abs(sum((i+1)*ord(c) for i,c in enumerate(''.join(map(str,k))))*7919+SEED*104729) % (2**32))
def save(img, name): os.makedirs(OUT, exist_ok=True); img.save(f'{OUT}/{name}.png')
def alpha_img(a):
    a = np.clip(a, 0, 1); im = Image.new('RGBA', a.shape[::-1], (0,0,0,0)); im.putalpha(Image.fromarray((a*255).astype('uint8'))); return im
def wobble(a, r, amp=4, scale=18):
    h, w = a.shape; dx = gf(r.standard_normal((h, w)), scale); dy = gf(r.standard_normal((h, w)), scale)
    dx *= amp/(dx.std()+1e-9); dy *= amp/(dy.std()+1e-9); yy, xx = np.mgrid[0:h, 0:w]
    return map_coordinates(a, [yy+dy, xx+dx], order=1, mode='constant')
def smooth(x, a, b): t = np.clip((x-a)/(b-a+1e-9), 0, 1); return t*t*(3-2*t)
def paper(i, W=1080, H=1920, base=(255,255,255), crease=.6, fibre=.4):
    from scipy.spatial import cKDTree
    r = rng('paper', i); N = int(90+r.integers(0,50)); pts = r.random((N,2))*[W,H]; tree = cKDTree(pts)
    sw, sh = W//3, H//3; yy, xx = np.mgrid[0:sh, 0:sw]*3.0
    xx = xx+gf(r.standard_normal((sh,sw)),14)*160; yy = yy+gf(r.standard_normal((sh,sw)),14)*160
    d, idx = tree.query(np.c_[xx.ravel(), yy.ravel()], k=2)
    cell = r.normal(0,1,N)*.011*crease; facet = cell[idx[:,0]].reshape(sh,sw)
    edge = np.exp(-((d[:,1]-d[:,0])/4.5)**2).reshape(sh,sw)
    light = np.where(cell[idx[:,1]].reshape(sh,sw) > cell[idx[:,0]].reshape(sh,sw), -1, .6)
    low = facet+edge*light*.075*crease
    low = gf(np.asarray(Image.fromarray(low.astype('float32')).resize((W,H), Image.BICUBIC)).astype(float), 1.2)
    fib = gf(r.standard_normal((H,W)), (.6,3))*fibre*.03
    s_ = np.clip(1+low+fib, .7, 1.0)   # capped at 1: white paper only ever darkens slightly
    return Image.fromarray(np.stack([np.clip(base[c]*s_,0,255) for c in range(3)],2).astype('uint8'))
def brush(i, W=1100, H=200, dry=.5, taper=.5, wob=.06):
    r = rng('brush', i); x = np.linspace(0,1,W); cy = H/2+gf(r.standard_normal(W),90)*H*wob*6
    th = H*(.34+.1*gf(r.standard_normal(W),70)*3)*(smooth(x,0,.05+.1*taper)*smooth(1-x,0,.12+.25*taper)*.55+.45)
    yy = np.arange(H)[:,None]; d = np.abs(yy-cy[None])/(th[None]+1e-6)
    bris = gf(r.standard_normal((H,W)),(1.1,55)); bris = (bris-bris.mean())/bris.std()
    thr = -1.4+dry*2.4*smooth(x,.25,1)[None]; fine = gf(r.standard_normal((H,W)),(.7,3)); fine /= fine.std()
    a = (1-smooth(d+fine*.06,.88,1.0))*(bris>thr)*(1-smooth(d,.7,1)*.4*(fine>0))
    return alpha_img(gf(a.astype(float),.5))
def hand_circle(i, W=900, H=420):
    r = rng('circle', i); im = Image.new('L', (W,H), 0); d = ImageDraw.Draw(im); n = 160; cx, cy = W/2, H/2
    rx, ry = W*.42, H*.36; a0 = r.random()*6.28; turns = 1.12+r.random()*.1; pts = []
    nz = gf(r.standard_normal(n),6); nz = nz/(nz.std()+1e-9)*.018
    for k in range(n):
        t = a0+turns*6.2832*k/(n-1); g = 1+.1*k/n+nz[k]; pts.append((cx+math.cos(t)*rx*g, cy+math.sin(t)*ry*g))
    for k in range(n-1):
        w = int(6+10*math.sin(math.pi*k/(n-1))**.6); d.line([pts[k],pts[k+1]],255,w); d.ellipse([pts[k][0]-w/2,pts[k][1]-w/2,pts[k][0]+w/2,pts[k][1]+w/2],255)
    a = wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1.2)))/255.0, r, 2.5, 14); return alpha_img(smooth(a,.35,.65))
def arrow(i, S=600):
    r = rng('arrow', i); im = Image.new('L',(S,S),0); d = ImageDraw.Draw(im)
    p0, p1, p2 = np.array([70,S*.8]), np.array([S*.3+r.random()*100,S*.1]), np.array([S-90,S*.3+r.random()*60]); pts = []
    for t in np.linspace(0,1,50): pts.append(tuple((1-t)**2*p0+2*(1-t)*t*p1+t**2*p2))
    for k in range(49): d.line([pts[k],pts[k+1]],255,int(8+8*k/49))
    e = np.array(pts[-1]); ang = math.atan2(pts[-1][1]-pts[-3][1], pts[-1][0]-pts[-3][0])
    for s in (-1,1): d.line([tuple(e),(e[0]-math.cos(ang+s*.55)*90, e[1]-math.sin(ang+s*.55)*90)],255,16)
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1.3)))/255.0, r, 2, 12), .3, .7))
def scribble(i, W=900, H=120):
    r = rng('scrib', i); im = Image.new('L',(W,H),0); d = ImageDraw.Draw(im); pts = []
    for k in range(60): pts.append((20+(W-40)*k/59, H/2+math.sin(k*.5)*H*.08+r.normal(0,3)))
    for k in range(59): d.line([pts[k],pts[k+1]],255,int(7+6*math.sin(math.pi*k/59)))
    return alpha_img(smooth(wobble(np.asarray(im.filter(ImageFilter.GaussianBlur(1)))/255.0, r, 2, 12), .3, .7))
for i in range(3): save(paper(i), f'paper_{i}')
for i in range(3): save(brush(i, dry=[.3,.5,.7][i]), f'stroke_{i}')
for i in range(3): save(hand_circle(i), f'circle_{i}')
for i in range(2): save(arrow(i), f'arrow_{i}')
for i in range(2): save(scribble(i), f'scribble_{i}')
print('ok')

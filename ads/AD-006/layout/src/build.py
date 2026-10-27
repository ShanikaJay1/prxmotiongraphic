"""AD-006 Best Sellers Static Carousel: hi-fi layouts, 5 variations of the approved C4 webtoon stack.
Story 1080x1920. Roki design system tokens; paper-grunge finish. Writes out/<V>/slide-<n>.html."""
import html, pathlib

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "out"
W, H = 1080, 1920
X0, Y0, PW = 60, 300, 960          # panel area: 240 safe + 60 margin; 960 wide
G = 24                              # gutter

HOOK = ("THE GEAR PEOPLE KEEP", "COMING", "BACK", "FOR.")   # "BACK" is the one accent word

PRODUCTS = {
    "kbg":    dict(name="KAMOGAWA BOXING GYM HAND WRAPS", line="No. 1 seller. Built for boxers.", price="$29.99"),
    "gomu":   dict(name="GOMU HAND WRAPS", line="Stretch, snap back, go again.", price="$29.99"),
    "shirt":  dict(name="KAMOGAWA BOXING GYM TRAINING SHIRT", line="For training days.", price="$64.95"),
    "shorts": dict(name="IPPO FIGHT SHORTS", line="Made for fight training.", price="$99.95"),
    "straps": dict(name="THE FRUIT LIFTING STRAPS", line="For lifters who refuse to let go.", price="$35.00"),
    "muki":   dict(name="MUKI MUKI PUMP COVER", line="Muki Muki mode: activated.", price="$64.95"),
}

# Photo crops: (file, object-position, zoom). Zoom > 1 is a detail crop of the same flat lay.
IMG = {
    "kbg-hero": ("kbg-wraps-2.jpg", "50% 55%", 1.0), "kbg-strip": ("kbg-wraps-1.jpg", "50% 30%", 1.0),
    "gomu-hero": ("gomu-2.jpg", "50% 50%", 1.0), "gomu-close": ("gomu-1.jpg", "50% 50%", 1.0),
    "shirt-hero": ("shirt-1.jpg", "50% 50%", 1.0), "shirt-close": ("shirt-2.jpg", "55% 55%", 1.4),
    "shirt-strip": ("shirt-1.jpg", "50% 40%", 1.6),
    "shorts-hero": ("shorts-1.jpg", "50% 50%", 1.0), "shorts-close": ("shorts-2.jpg", "50% 55%", 1.3),
    "straps-hero": ("straps-1.jpg", "50% 50%", 1.0), "straps-strip": ("straps-2.jpg", "50% 22%", 1.0),
    "muki-hero": ("muki-2.jpg", "50% 50%", 1.0), "muki-close": ("muki-1.jpg", "50% 45%", 1.15),
    "kbg-detail": ("kbg-wraps-1.jpg", "40% 50%", 1.3), "shorts-detail": ("shorts-1.jpg", "50% 60%", 1.5),
}
TILES = ["kbg-hero", "gomu-hero", "shirt-hero", "shorts-hero", "straps-hero", "muki-hero"]

# The approved C4 stack: (height, content). Split bands are tuples of (fraction, content).
SLIDES = [
    ("cover", [(300, "text"), (560, "lineup"), (282, ((0.5, "kbg-detail"), (0.5, "shorts-detail")))]),
    ("kbg",   [(700, "kbg-hero"), (180, "kbg-strip"), (262, "text")]),
    ("gomu",  [(240, "text"), (900, "gomu-hero")]),
    ("shirt", [(420, ((0.6, "shirt-hero"), (0.4, "shirt-close"))), (280, "shirt-strip"), (394, "text")]),
    ("shorts", [(860, "shorts-hero"), (306, ((0.45, "text"), (0.55, "shorts-close")))]),
    ("straps", [(200, "straps-strip"), (620, "straps-hero"), (322, "text")]),
    ("muki",  [(320, ((0.35, "muki-close"), (0.65, "text"))), (822, "muki-hero")]),
    ("end",   [(260, ((0.333, "t0"), (0.334, "t1"), (0.333, "t2"))), (260, ((0.333, "t3"), (0.334, "t4"), (0.333, "t5"))), (574, "text")]),
]

# ---------- the five finished treatments ----------
VARIANTS = {
    "H1": dict(title="Paper and ink", ground="var(--paper)", on="var(--ink)", panel="var(--ink)", pw=8,
               textbg="var(--paper)", texton="var(--ink)", price="var(--RokiRed)", accent="var(--RokiRed)",
               cap_bg="var(--paper)", cap_on="var(--ink)", logo="black", strip_fx=None, paper=True),
    "H2": dict(title="Studio grey", ground="var(--studio-grey)", on="var(--ink)", panel="var(--paper)", pw=8,
               textbg="var(--paper)", texton="var(--ink)", price="var(--ink)", accent="var(--RokiRed)",
               cap_bg="var(--ink)", cap_on="var(--paper)", logo="black", strip_fx=None, paper=False),
    "H3": dict(title="Ink night", ground="var(--ink)", on="var(--paper)", panel="var(--paper)", pw=8,
               textbg="var(--ink)", texton="var(--paper)", price="var(--paper)", accent="var(--signal-red)",
               cap_bg="var(--paper)", cap_on="var(--ink)", logo="white", strip_fx=None, paper=False),
    "H4": dict(title="Screen-tone manga", ground="var(--paper)", on="var(--ink)", panel="var(--ink)", pw=8,
               textbg="screentone", texton="var(--ink)", price="var(--ink)", accent="var(--RokiRed)",
               cap_bg="var(--paper)", cap_on="var(--ink)", logo="black", strip_fx="speed", paper=True, kicker=True),
    "H5": dict(title="Ink panels, red price", ground="var(--paper)", on="var(--ink)", panel="var(--ink)", pw=8,
               textbg="var(--ink)", texton="var(--paper)", price="tag", accent="var(--signal-red)",
               cap_bg="var(--paper)", cap_on="var(--ink)", logo="black", strip_fx=None, paper=True),
}

CSS = """
@font-face{font-family:"Druk Wide";src:url(../../assets/fonts/DrukWide-Bold.ttf);font-weight:700}
@font-face{font-family:"Anime Ace";src:url(../../assets/fonts/AnimeAce-Bold.ttf);font-weight:700}
@font-face{font-family:Poppins;src:url(../../assets/fonts/Poppins-400.woff2);font-weight:400}
@font-face{font-family:Poppins;src:url(../../assets/fonts/Poppins-700.woff2);font-weight:700}
:root{--RokiRed:#8a0000;--signal-red:#d52828;--ink:#080808;--paper:#ffffff;--studio-grey:#e3e6e7;--ink-muted:#5a5a5a;
--font-display:"Druk Wide","Arial Black",sans-serif;--font-comic:"Anime Ace",cursive;--font-body:Poppins,Arial,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{background:var(--ground);position:relative;font-family:var(--font-body);color:var(--on)}
.pn{position:absolute;overflow:hidden;outline:var(--pw) solid var(--panel);outline-offset:calc(var(--pw) / -2)}
.pn>img.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.08) brightness(.96) saturate(.95)}
.pn .tone{position:absolute;inset:0;background:radial-gradient(circle,rgba(8,8,8,.55) 32%,transparent 36%) 0 0/5px 5px;mix-blend-mode:multiply;opacity:.16;pointer-events:none}
.pn.text{display:flex;flex-direction:column;justify-content:space-between;padding:36px 40px}
.pn.text.row{flex-direction:row;align-items:flex-end}
.screentone{background:var(--paper) radial-gradient(circle,rgba(8,8,8,.9) 30%,transparent 33%) 0 0/9px 9px}
.speed{background:var(--paper) repeating-linear-gradient(90deg,var(--ink) 0 3px,transparent 3px 26px)}
.line{font:400 34px/1.3 var(--font-body)}
.kick{font:700 32px/1.15 var(--font-comic)}
.price{font:700 64px/.95 var(--font-display);letter-spacing:0}
.tag{display:inline-block;background:var(--signal-red);color:var(--paper);padding:14px 20px 10px;font:700 56px/1 var(--font-display)}
.chip{display:inline-block;background:var(--paper);padding:10px 16px}
.cap{position:absolute;z-index:5;background:var(--cap-bg);color:var(--cap-on);border:3px solid var(--ink);padding:16px 22px 12px;
font:700 32px/1.02 var(--font-display);letter-spacing:0}
.hook{font:700 64px/.95 var(--font-display);display:inline-block}
.hook .acc{color:var(--accent)}
.end .big{font:700 88px/.92 var(--font-display);letter-spacing:-1px;display:inline-block}
.end .cta{font:700 28px/1.1 var(--font-body);color:var(--accent);margin-top:16px}
.end .url{font:400 24px/1.3 var(--font-body);margin-top:8px;opacity:.75}
.logo{position:absolute;z-index:6}
#grain{position:absolute;inset:0;z-index:9;pointer-events:none;mix-blend-mode:multiply;opacity:.07}
#paper{position:absolute;inset:0;z-index:0;pointer-events:none;mix-blend-mode:multiply;opacity:.35}
.tile-frame{position:absolute;border:3px solid var(--panel);overflow:hidden;background:var(--paper)}
.tile-frame img{width:100%;height:100%;object-fit:cover;filter:contrast(1.08) brightness(.96)}
"""

FIT = """<script>
function fit(el,maxW,maxH,lo=40,hi=140){{while(hi-lo>1){{const m=(lo+hi)>>1;el.style.fontSize=m+'px';
(el.scrollWidth<=maxW&&el.scrollHeight<=maxH)?lo=m:hi=m}}el.style.fontSize=lo+'px'}}
document.fonts.ready.then(()=>{{document.querySelectorAll('.hook,.end .big').forEach(el=>{{const p=el.closest('.pn');
const extra=el.classList.contains('big')?110:0;fit(el,p.clientWidth-80,p.clientHeight-72-extra)}});document.body.dataset.ready=1}});
</script>"""
SVG_FX = """<svg width="0" height="0" style="position:absolute"><defs>
<filter id="grainf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/>
<feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .55"/></feComponentTransfer></filter>
<filter id="paperf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="4" result="n"/>
<feDiffuseLighting in="n" surfaceScale="2" lighting-color="#fff"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting></filter>
<filter id="rough" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="3" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs></svg>"""


def photo(key):
    f, pos, z = IMG[key]
    zoom = f"transform:scale({z});transform-origin:{pos};" if z != 1 else ""
    return f'<img class="ph" src="../../assets/{f}" style="object-position:{pos};{zoom}"><div class="tone"></div>'


def lineup(w, h, v):
    """Six flat lays, overlapped and offset in framed tiles (design system collage rule)."""
    tw, th = 300, 300
    spots = [(20, 30, -2), (250, 10, 1.5), (480, 40, -1), (650, 220, 2), (360, 240, -2.5), (90, 240, 1)]
    out = ""
    for (x, y, r), key in zip(spots, TILES):
        f, pos, _ = IMG[key]
        out += (f'<div class="tile-frame" style="left:{x}px;top:{y}px;width:{tw}px;height:{th}px;transform:rotate({r}deg)">'
                f'<img src="../../assets/{f}" style="object-position:{pos}"></div>')
    bg = "var(--studio-grey)" if v["ground"] != "var(--studio-grey)" else "var(--paper)"
    if v["ground"] == "var(--ink)":
        bg = "#1a1a1a"
    return f'<div style="position:absolute;inset:0;background:{bg}">{out}</div>'


def text_panel(kind, v, w, h):
    if kind == "cover":
        a, b, c, d = HOOK
        return f'<div class="hook" style="filter:url(#rough)">{a} {b} <span class="acc">{c}</span> {d}</div>'
    if kind == "end":
        return ('<div class="end"><div class="big" style="filter:url(#rough)">FIND<br>YOURS.</div>'
                '<div class="cta">SHOP NOW</div><div class="url">rokiovertime.com</div></div>')
    p = PRODUCTS[kind]
    cls = "kick" if v.get("kicker") else "line"
    line = f'<div class="{cls}">{html.escape(p["line"])}</div>'
    if v["price"] == "tag":
        price = f'<div><span class="tag">{p["price"]}</span></div>'
    else:
        price = f'<div class="price" style="color:{v["price"]}">{p["price"]}</div>'
    if v["textbg"] == "screentone":   # copy sits on solid paper chips over the tone, never on the dots
        line = f'<div><span class="chip {cls}">{html.escape(p["line"])}</span></div>'
        price = f'<div><span class="chip price">{p["price"]}</span></div>'
    return line + price


def build_slide(idx, kind, stack, v):
    parts, y, hero_box = [], Y0, None
    for h, content in stack:
        cells = content if isinstance(content, tuple) else ((1.0, content),)
        x = X0
        n = len(cells)
        for i, (frac, c) in enumerate(cells):
            w = round((PW - G * (n - 1)) * frac) if n > 1 else PW
            if i == n - 1:
                w = X0 + PW - x
            style = f"left:{x}px;top:{y}px;width:{w}px;height:{h}px"
            if c == "text":
                bgcls = "screentone" if v["textbg"] == "screentone" else ""
                bg = "" if bgcls else f"background:{v['textbg']};"
                row = " row" if h < 260 or (w > 700 and h < 300) else ""
                inner = text_panel(kind, v, w, h)
                parts.append(f'<div class="pn text {bgcls}{row}" style="{style};{bg}color:{v["texton"]}">{inner}</div>')
            elif c == "lineup":
                parts.append(f'<div class="pn" style="{style}">{lineup(w, h, v)}</div>')
            elif c.startswith("t") and c[1:].isdigit():
                parts.append(f'<div class="pn" style="{style}">{photo(TILES[int(c[1:])])}</div>')
            elif c.endswith("-strip") and v["strip_fx"] == "speed" and kind not in ("shirt",):
                parts.append(f'<div class="pn speed" style="{style}"></div>')
            else:
                parts.append(f'<div class="pn" style="{style}">{photo(c)}</div>')
                if c.endswith("-hero") and hero_box is None:
                    hero_box = (x, y, w, h)
            x += w + G
        y += h + G
    if hero_box and kind in PRODUCTS:
        hx, hy, hw, hh = hero_box
        parts.append(f'<div class="cap" style="left:{hx + 30}px;top:{hy + hh - 46}px;max-width:{min(hw - 60, 640)}px">'
                     f'{PRODUCTS[kind]["name"]}</div>')
    logo = v["logo"]
    parts.append(f'<img class="logo" src="../../assets/wordmark-{logo}.png" style="left:60px;top:{H - 240 - 60 - 53}px;width:210px">')
    parts.append(f'<img class="logo" src="../../assets/choten-{logo}.png" style="right:60px;top:{H - 240 - 60 - 48}px;width:190px">')
    paper = '<div id="paper" style="filter:url(#paperf)"></div>' if v.get("paper") else ""
    vars_ = (f"--ground:{v['ground']};--on:{v['on']};--panel:{v['panel']};--pw:{v['pw']}px;"
             f"--accent:{v['accent']};--cap-bg:{v['cap_bg']};--cap-on:{v['cap_on']}")
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body style="{vars_}">{SVG_FX}{paper}{"".join(parts)}<div id="grain" style="filter:url(#grainf)"></div>{FIT}</body></html>')


for key, v in VARIANTS.items():
    d = OUT / key
    d.mkdir(parents=True, exist_ok=True)
    for i, (kind, stack) in enumerate(SLIDES, 1):
        (d / f"slide-{i}.html").write_text(build_slide(i, kind, stack, v))
print("ok")

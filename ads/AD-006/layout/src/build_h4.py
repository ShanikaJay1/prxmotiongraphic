"""AD-006 H4 (screen-tone manga), revised: text-only panels hug their copy, and the freed height becomes
white space between and around the panels (space-evenly), not padding inside them. Writes out/H4b/."""
import html
from build import (OUT, W, H, X0, Y0, PW, SLIDES, PRODUCTS, IMG, TILES, HOOK, VARIANTS, CSS, SVG_FX,
                   photo, lineup)

V = VARIANTS["H4"]
AREA_H = 1190          # same panel area as the approved stack
GAP = 24               # minimum gutter; space-evenly adds the rest

FLOW_CSS = """
.stack{position:absolute;left:60px;top:300px;width:960px;height:1190px;display:flex;flex-direction:column;justify-content:space-evenly}
.row{display:flex;gap:24px;align-items:flex-start;width:100%}
.cell{position:relative;flex:none}
.cell>.pn{position:relative;width:100%;height:100%}
.pn.text{display:block;padding:28px 32px;height:auto!important}
.pn.text .stackcopy{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.pn.text .inline{display:flex;align-items:center;justify-content:space-between;gap:24px}
.pn.text .inline .pname{max-width:540px}
.chip.pname{font:700 36px/1 var(--font-display);color:var(--RokiRed);padding:12px 16px 8px}
.cap{bottom:-30px;left:30px}
.pn>img.ht{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
"""

FIT = """<script>
function fit(el,maxW,lo=40,hi=140){while(hi-lo>1){const m=(lo+hi)>>1;el.style.fontSize=m+'px';el.scrollWidth<=maxW?lo=m:hi=m}el.style.fontSize=lo+'px'}
document.fonts.ready.then(()=>{document.querySelectorAll('.hook,.end .big').forEach(el=>{const p=el.closest('.pn');
fit(el,p.clientWidth-64,40,el.classList.contains('big')?88:64)});document.body.dataset.ready=1});
</script>"""


def copy_html(kind, wide):
    if kind == "cover":
        a, b, c, d = HOOK
        return f'<div class="hook" style="filter:url(#rough)">{a} {b} <span class="acc">{c}</span> {d}</div>'
    if kind == "end":
        return ('<div class="end"><div class="big" style="filter:url(#rough)">FIND<br>YOURS.</div>'
                '<div class="cta">SHOP NOW</div><div class="url">rokiovertime.com</div></div>')
    p = PRODUCTS[kind]
    # no prices: the ad runs across currencies, so the product name takes the price's place
    name = f'<span class="chip pname">{p["name"]}</span>'
    line = f'<span class="chip kick">{html.escape(p["line"])}</span>'
    # a wide panel sets name and line on one row; a narrow one stacks them
    return f'<div class="{"inline" if wide else "stackcopy"}">{name}{line}</div>'


def cell_html(kind, c, w, h, first_hero):
    style = f"width:{w}px;height:{h}px"
    if c == "text":
        return f'<div class="cell" style="width:{w}px"><div class="pn text screentone">{copy_html(kind, w > 700)}</div></div>', False
    if c == "lineup":
        return f'<div class="cell" style="{style}"><div class="pn">{lineup(w, h, V)}</div></div>', False
    if c.startswith("t") and c[1:].isdigit():
        return f'<div class="cell" style="{style}"><div class="pn">{photo(TILES[int(c[1:])])}</div></div>', False
    if c.startswith("ht:"):   # pre-rendered halftone plate, already at panel size: no grade, no tone overlay
        return f'<div class="cell" style="{style}"><div class="pn"><img class="ht" src="../../assets/ht/{c[3:]}.png"></div></div>', False
    if c.endswith("-strip") and kind != "shirt":
        return f'<div class="cell" style="{style}"><div class="pn speed"></div></div>', False
    is_hero = c.endswith("-hero") and first_hero and kind in PRODUCTS
    return f'<div class="cell" style="{style}"><div class="pn">{photo(c)}</div></div>', is_hero


def build(kind, stack):
    rows, need_hero = [], True
    for h, content in stack:
        cells = content if isinstance(content, tuple) else ((1.0, content),)
        n, x, parts = len(cells), 0, []
        for i, (frac, c) in enumerate(cells):
            w = round((PW - GAP * (n - 1)) * frac) if n > 1 else PW
            if i == n - 1:
                w = PW - x
            ch, was_hero = cell_html(kind, c, w, h, need_hero)
            need_hero = need_hero and not was_hero
            parts.append(ch)
            x += w + GAP
        rows.append(f'<div class="row">{"".join(parts)}</div>')
    logo = V["logo"]
    logos = (f'<img class="logo" src="../../assets/wordmark-{logo}.png" style="left:60px;top:{H - 240 - 60 - 53}px;width:210px">'
             f'<img class="logo" src="../../assets/choten-{logo}.png" style="right:60px;top:{H - 240 - 60 - 48}px;width:190px">')
    vars_ = (f"--ground:{V['ground']};--on:{V['on']};--panel:{V['panel']};--pw:{V['pw']}px;"
             f"--accent:{V['accent']};--cap-bg:{V['cap_bg']};--cap-on:{V['cap_on']}")
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}{FLOW_CSS}</style></head>'
            f'<body style="{vars_}">{SVG_FX}<div id="paper" style="filter:url(#paperf)"></div>'
            f'<div class="stack">{"".join(rows)}</div>{logos}<div id="grain" style="filter:url(#grainf)"></div>{FIT}</body></html>')


d = OUT / "H4b"
d.mkdir(parents=True, exist_ok=True)
for i, (kind, stack) in enumerate(SLIDES, 1):
    (d / f"slide-{i}.html").write_text(build(kind, stack))
print("ok")

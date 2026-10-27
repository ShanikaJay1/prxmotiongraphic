"""AD-006 H4, textured and colour-varied. Writes out/H4c/.
Grounds rotate through the Roki palette (paper, ink, studio-grey) so the swipe changes colour every slide.
Texture per slide: paper stock, dust, an ink splatter on alternate slides, rough panel frames, grain.
No tape and no brush strokes. Each slide keeps one accent: RokiRed on light grounds, signal-red on ink."""
import build_h4
from build import OUT, SLIDES

PACK = "../../assets/grunge"
GROUNDS = ["paper", "ink", "studio-grey", "paper", "ink", "studio-grey", "paper", "ink"]

TEX_CSS = """
.stack{z-index:2}
.pn{outline:none!important}
.cell::after{content:"";position:absolute;inset:0;border:8px solid var(--panel);filter:url(#roughf);pointer-events:none;z-index:3}
.stock{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;z-index:0;opacity:.4}
.gr{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;z-index:1;pointer-events:none}
.mark{position:absolute;z-index:1;pointer-events:none}
#grainA{position:absolute;inset:0;z-index:1;pointer-events:none;mix-blend-mode:multiply;opacity:.12}
body.dark .gr,body.dark .mark{filter:invert(1);mix-blend-mode:screen}
body.dark #grainA{mix-blend-mode:screen;opacity:.08}
"""

ROUGH = """<svg width="0" height="0" style="position:absolute"><filter id="roughf" x="-2%" y="-2%" width="104%" height="104%">
<feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="11" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter></svg>"""


def splatter(i, dark):
    if i % 2 == 0:
        return ""
    k = (i // 2) % 6   # bleeds off a bottom corner, below the logo row
    left = -110 if (i // 2) % 2 == 0 else 850
    return (f'<img class="mark" src="{PACK}/splatter/splat_{k}.png" style="left:{left}px;top:1690px;'
            f'width:340px;height:340px;object-fit:contain;opacity:{.45 if dark else .85}">')


def themed(i, page):
    g = GROUNDS[i]
    dark = g == "ink"
    # ground, frame colour, accent and logo ink follow the design system's light/dark pairings
    page = page.replace("--ground:var(--paper)", f"--ground:var(--{g})")
    if dark:
        page = page.replace("--panel:var(--ink)", "--panel:var(--paper)")
        page = page.replace("--accent:var(--RokiRed)", "--accent:var(--signal-red)")
        page = page.replace("wordmark-black.png", "wordmark-white.png").replace("choten-black.png", "choten-white.png")
        page = page.replace("<body ", '<body class="dark" ', 1)
    stock = "" if dark else f'<img class="stock" src="{PACK}/paper/cool_{i % 3}.jpg">'
    under = (f'{stock}<img class="gr" src="{PACK}/grunge/dust_{i % 2}.png" style="opacity:{.3 if dark else .4}">'
             f'{splatter(i, dark)}<div id="grainA" style="filter:url(#grainf)"></div>')
    page = page.replace('<div id="paper" style="filter:url(#paperf)"></div>', under)
    page = page.replace("</style>", TEX_CSS + "</style>", 1)
    return page.replace('<div id="grain"', ROUGH + '<div id="grain"')


d = OUT / "H4c"
d.mkdir(parents=True, exist_ok=True)
for i, (kind, stack) in enumerate(SLIDES):
    (d / f"slide-{i + 1}.html").write_text(themed(i, build_h4.build(kind, stack)))
print("ok")

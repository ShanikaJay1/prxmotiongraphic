"""AD-006 H4r adapted to 1:1 (1080 x 1080) for the Meta feed carousel. Writes out/SQ/.
Story safe zones no longer apply: 60 px margins all round, panel area 960 x 880 above the logo row.
Image panel heights are re-proportioned for the square; text panels still hug their copy."""
import re
import build, build_h4, build_h4c
from build import OUT, SLIDES, IMG, TILES

S = 1080
STACKS = {
    "cover":  [(238, "text"), (370, "lineup"), (210, ((0.5, "kbg-detail"), (0.5, "shorts-detail")))],
    "kbg":    [(480, "kbg-hero"), (200, "ht:kbg-life-sq"), (120, "text")],
    "gomu":   [(120, "text"), (680, "gomu-hero")],
    "shirt":  [(330, ((0.6, "shirt-hero"), (0.4, "shirt-close"))), (220, "ht:shirt-life-sq"), (120, "text")],
    "shorts": [(640, ((0.6, "shorts-hero"), (0.4, "shorts-close"))), (120, "text")],   # portrait hero keeps the whole short
    "straps": [(200, "ht:straps-life-sq"), (460, "straps-hero"), (150, "text")],
    "muki":   [(260, ((0.35, "ht:muki-life-sq"), (0.65, "text"))), (560, "muki-hero")],
    "end":    [(200, ((0.333, "t0"), (0.334, "t1"), (0.333, "t2"))), (200, ((0.333, "t3"), (0.334, "t4"), (0.333, "t5"))), (300, "text")],
}


def lineup_sq(w, h, v):
    """The cover collage, scaled to the shorter panel: tiles shrink with the height and spread across the width."""
    k = h / 560
    tw = round(300 * k)
    spots = [(20, 30, -2), (250, 10, 1.5), (480, 40, -1), (650, 220, 2), (360, 240, -2.5), (90, 240, 1)]
    out = ""
    for (x, y, r), key in zip(spots, TILES):
        f, pos, _ = IMG[key]
        x2 = round(20 + (x - 20) * (w - tw - 40) / 630)
        out += (f'<div class="tile-frame" style="left:{x2}px;top:{round(y * k)}px;width:{tw}px;height:{tw}px;transform:rotate({r}deg)">'
                f'<img src="../../assets/{f}" style="object-position:{pos}"></div>')
    return f'<div style="position:absolute;inset:0;background:var(--studio-grey)">{out}</div>'


build_h4.lineup = lineup_sq
RED_CSS = ".chip.price{color:var(--RokiRed)}.end .cta{color:var(--RokiRed)!important}"

d = OUT / "SQ"
d.mkdir(parents=True, exist_ok=True)
for i, (kind, _) in enumerate(SLIDES):
    page = build_h4c.themed(i, build_h4.build(kind, STACKS[kind]))
    if build_h4c.GROUNDS[i] != "ink":
        page = re.sub(r'(splatter/splat_\d)\.png', r'\1_red.png', page)
    page = page.replace("html,body{width:1080px;height:1920px", f"html,body{{width:1080px;height:{S}px")
    page = page.replace(".stack{position:absolute;left:60px;top:300px;width:960px;height:1190px",
                        ".stack{position:absolute;left:60px;top:60px;width:960px;height:880px")
    page = page.replace(f"top:{1920 - 240 - 60 - 53}px", f"top:{S - 60 - 53}px").replace(f"top:{1920 - 240 - 60 - 48}px", f"top:{S - 60 - 48}px")
    page = page.replace("top:1690px", "top:-130px")      # splatter bleeds off a top corner, behind the panels
    page = page.replace("</style>", RED_CSS + "</style>", 1)
    (d / f"slide-{i + 1}.html").write_text(page)
print("ok")

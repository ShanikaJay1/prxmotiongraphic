# AD-005 · Black Friday 4 Wrap Pack · approved layout

Approved branded layout (C1 collage direction, revised), Story 1080×1920, four scenes:

1. Hook: taped collage, "4 pairs. Pay for 3."
2. Showcase: manga page with all five active hand wraps (Kamogawa, Gomu, Grappler, Sendo, Dragon)
3. Value: four slice panels with name captions (Kamogawa, Gomu, Sendo, Dragon), PAID ×3 and FREE circle bubbles. No prices are shown anywhere: Shan removed them for currency reasons on 28 Oct 2026, breaking the offer rule on bundle totals for this ad only.
4. Offer and close: 頂点へ brush mark, splash panel, offer line, dates, CTA bar

- `AD-005-layout.html`: source for all four screens (one `<section>` per scene)
- `screens/`: rendered PNG of each scene and a contact sheet
- `img/`: product and model shots and logo files, from the Roki design system (Shopify catalogue)
- `g/`: generated paper-grunge assets

The fonts (`fonts/DrukWide-Bold.ttf`, `fonts/AnimeAce-Bold.ttf`) are not committed. Fetch them from the Roki design system into `fonts/` beside the HTML before rendering. Serve the folder over HTTP, not `file://`, because Chromium blocks CSS mask images from file URLs.

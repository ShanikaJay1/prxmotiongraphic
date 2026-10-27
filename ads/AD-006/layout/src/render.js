// Render every out/<V>/slide-<n>.html to PNG at 1080 x $H (default 1920), then build a contact sheet per variation.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const root = process.argv[2], only = process.argv[3];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: Number(process.env.H || 1920) } });
  for (const v of fs.readdirSync(path.join(root, 'out')).filter(x => !only || x === only)) {
    for (let i = 1; i <= 8; i++) {
      await p.goto('file://' + path.join(root, 'out', v, `slide-${i}.html`));
      await p.waitForFunction(() => document.body.dataset.ready === '1');
      await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(root, 'out', v, `slide-${i}.png`) });
    }
  }
  await b.close();
})();

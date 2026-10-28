// Renders every variation x beat to frames/v{V}-b{B}.png. Roster beat shows a different wrap per variation.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(let v=1;v<=5;v++)for(let beat=0;beat<4;beat++){
  await p.goto('file://'+path.resolve(__dirname,'index.html')+`?v=${v}&b=${beat}&r=${v-1}`);
  await p.waitForSelector('body[data-ready="1"]');await p.waitForTimeout(150);
  await p.screenshot({path:path.resolve(__dirname,`frames/v${v}-b${beat}.png`),clip:{x:0,y:0,width:1080,height:1920}});
}
await b.close();})();

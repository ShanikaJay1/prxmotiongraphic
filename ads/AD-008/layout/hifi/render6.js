// Renders the approved V2 grunge direction (v=6), all four beats, roster cycling all five wraps.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const jobs=[[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[3,0]];
for(const [beat,r] of jobs){
  await p.goto('http://localhost:8765/hifi/index.html'+`?v=6&b=${beat}&r=${r}`);
  await p.waitForSelector('body[data-ready="1"]');await p.waitForTimeout(200);
  await p.screenshot({path:path.resolve(__dirname,`frames/v6-b${beat}-r${r}.png`),clip:{x:0,y:0,width:1080,height:1920}});
}
await b.close();})();

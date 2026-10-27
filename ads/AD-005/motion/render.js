// usage: node render.js <out_dir> [fromFrame] [toFrame] [step]
const {chromium}=require('playwright');
(async()=>{const [out,a='0',b='335',st='1']=process.argv.slice(2);
const br=await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none']});
const p=await br.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://localhost:8766/motion/AD-005-motion.html');await p.waitForFunction(()=>window.ready===true,null,{timeout:60000});
for(let f=+a;f<=+b;f+=+st){await p.evaluate(t=>window.seek(t),f/24);await p.screenshot({path:`${out}/f${String(f).padStart(4,'0')}.png`});}
await br.close();})();

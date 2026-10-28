const {chromium}=require('playwright');
(async()=>{const [out,a,b]=process.argv.slice(2);
const br=await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none']});
const p=await br.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:2});
await p.goto('http://localhost:8767/motion/AD-005-motion.html');await p.waitForFunction(()=>window.ready===true,null,{timeout:90000});
if(+a===0)console.log('fonts',await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).join(',')));
for(let f=+a;f<=+b;f++){await p.evaluate(t=>window.seek(t),f/24);await p.screenshot({path:`${out}/f${String(f).padStart(4,'0')}.png`});}
await br.close();})();

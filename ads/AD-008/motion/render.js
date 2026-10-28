// AD-008 motion render. Serves ads/AD-008 over HTTP (masks need it), seeks motion.html frame by frame.
// Usage: node render.js draft|full|stills [t1,t2,...]
//   draft  -> out/AD-008-draft.mp4   (540x960, 24 fps, quick)
//   full   -> out/AD-008-motion.mp4  (1080x1920, 24 fps, crf 16, BT.709 TV range)
//   stills -> out/still-<t>.png
//   cues   -> ../sound/cues.json (song in-point and SFX hits, from the same timeline)
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..');const OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.woff2':'font/woff2'};
const mode=process.argv[2]||'draft';
(async()=>{
  const srv=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname));
    if(!p.startsWith(ROOT)||!fs.existsSync(p)){r.writeHead(404).end();return;}r.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'}).end(fs.readFileSync(p));}).listen(0);
  const port=srv.address().port;
  const b=await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none']});
  const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.goto(`http://127.0.0.1:${port}/motion/motion.html?export`);await pg.waitForFunction(()=>window.ready===true);
  const shot=async t=>{await pg.evaluate(t=>seek(t),t);await pg.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return pg.screenshot({clip:{x:0,y:0,width:1080,height:1920},type:'png'});};
  if(mode==='cues'){fs.writeFileSync(path.join(ROOT,'sound','cues.json'),JSON.stringify(await pg.evaluate(()=>({...window.SOUND,cues:window.CUES})),null,1));}
  else if(mode==='stills'){for(const t of (process.argv[3]||'0.5,1.5,3,9.5,10.5,12.5').split(',').map(Number)){fs.writeFileSync(path.join(OUT,`still-${t}.png`),await shot(t));}}
  else{
    const {FPS,TOTAL}=await pg.evaluate(()=>({FPS,TOTAL}));const N=Math.round(FPS*TOTAL);
    const draft=mode==='draft';const file=path.join(OUT,draft?'AD-008-draft.mp4':'AD-008-motion-silent.mp4');
    const vf=draft?'scale=540:960:flags=lanczos,format=yuv420p':'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p';
    const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-i','-','-vf',vf,'-c:v','libx264','-crf',draft?'23':'16','-preset',draft?'veryfast':'slow',
      ...(draft?[]:['-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709']),'-r',String(FPS),'-movflags','+faststart',file],{stdio:['pipe','inherit','inherit']});
    for(let f=0;f<N;f++){const png=await shot(f/FPS);if(!ff.stdin.write(png))await new Promise(r=>ff.stdin.once('drain',r));}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log(file,N,'frames');
  }
  await b.close();srv.close();
})();

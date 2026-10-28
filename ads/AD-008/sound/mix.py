# AD-008 sound: supplied song (AT-009) from its mid-song pick-up + library anime-style SFX (AT-003..AT-008),
# every hit placed on the frame its visual lands (cues.json, exported from motion.html).
# Usage: python3 mix.py  -> mix.wav (48 kHz stereo, -14 LUFS integrated, true peak -1.3 dBTP)
import json, wave, subprocess, numpy as np, os
HERE=os.path.dirname(os.path.abspath(__file__)); SR=48000
def load(p):
    w=wave.open(p); sr=w.getframerate(); ch=w.getnchannels(); sw=w.getsampwidth()
    a=np.frombuffer(w.readframes(w.getnframes()), {2:np.int16,4:np.int32}[sw]).astype(np.float32)/(2**(8*sw-1))
    a=a.reshape(-1,ch); a=np.repeat(a,2,1) if ch==1 else a
    if sr!=SR: a=np.stack([np.interp(np.arange(0,len(a),sr/SR),np.arange(len(a)),a[:,c]) for c in range(2)],1)
    return a
c=json.load(open(f'{HERE}/cues.json')); T=c['TOTAL']; N=int(round(T*SR))
song=load(f'{HERE}/src/this-what-we-doin.wav'); i0=int(round(c['SONG_IN']*SR))
mix=song[i0:i0+N].copy()*0.8
f_in=int(.02*SR); mix[:f_in]*=np.linspace(0,1,f_in)[:,None]
f_out=int(.45*SR); mix[-f_out:]*=np.linspace(1,0,f_out)[:,None]**1.5          # tail fade on the final hold
for q in c['cues']:
    s=load(f'{HERE}/sfx/roki-{q["s"]}.wav'); pk=int(np.argmax(np.abs(s).max(1)))  # align the SFX peak to the cue frame
    a=int(round(q['t']*SR))-pk; a0=max(a,0); s=s[a0-a:]; s=s[:N-a0]; mix[a0:a0+len(s)]+=s*q['g']
w=wave.open(f'{HERE}/premix.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix,-1,1)*32767).astype(np.int16).tobytes()); w.close()
# two-pass loudnorm to -14 LUFS / -1.3 dBTP
r=subprocess.run(['ffmpeg','-hide_banner','-i',f'{HERE}/premix.wav','-af','loudnorm=I=-14:TP=-1.3:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
m=json.loads(r[r.rindex('{'):r.rindex('}')+1])
af=f"loudnorm=I=-14:TP=-1.3:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{HERE}/premix.wav','-af',af,'-ar',str(SR),f'{HERE}/mix.wav'],check=True)
os.remove(f'{HERE}/premix.wav')
r=subprocess.run(['ffmpeg','-hide_banner','-i',f'{HERE}/mix.wav','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
print(r[r.rindex('Summary'):].replace('\n',' ')[:400])

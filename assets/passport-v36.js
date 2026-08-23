(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let file=null,img=null,removed=null,removedImg=null,bg="original",result=null,frame={x:50,y:50,w:62,h:72},zoom=1,cropMode=false;
const presets=[
 ['india','India / UK / Europe — 35×45 mm','mm',35,45],['usa','USA — 2×2 in','in',2,2],['canada','Canada — 50×70 mm','mm',50,70],
 ['australia','Australia — 35×45 mm','mm',35,45],['schengen','Schengen / EU — 35×45 mm','mm',35,45],['china','China Visa — 33×48 mm','mm',33,48],
 ['philippines','Philippines — 2×2 in','in',2,2],['malaysia','Malaysia — 35×50 mm','mm',35,50],['ind34','Indonesia — 3×4 cm','cm',3,4],
 ['ind46','Indonesia — 4×6 cm','cm',4,6],['pakistan','Pakistan — 35×45 mm','mm',35,45],['nigeria','Nigeria — 35×45 mm','mm',35,45],
 ['uae','UAE — 43×55 mm','mm',43,55],['vietnam','Vietnam — 4×6 cm','cm',4,6],['nepal','Nepal — 35×45 mm','mm',35,45],
 ['bangladesh','Bangladesh — 35×45 mm','mm',35,45],['custom','Custom size','mm',35,45]
];
const colors={white:'#fff',offwhite:'#f5f5f5',blue:'#dbeafe',red:'#ef4444'};
const fmt=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';
const px=(v,u,d)=>u==='px'?Math.max(1,Math.round(v)):Math.max(1,Math.round(u==='cm'?v*d/2.54:u==='mm'?v*d/25.4:v*d));
function load(f){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=typeof f==='string'?f:URL.createObjectURL(f)})}
function status(t,ok=false){const e=$('#status');if(e){e.textContent=t;e.className='status '+(ok?'ok':'muted')}}
function bgStatus(t,err=false){const e=$('#bgStatus');if(e){e.textContent=t;e.className='status '+(err?'err':'muted')}}
function targetKB(){const v=$('#target').value;return v==='custom'?Math.max(0,+$('#targetCustom').value||0):+v}
function ratio(){return Math.max(.01,+$('#w').value)/Math.max(.01,+$('#h').value)}
function setPresetOptions(){const s=$('#presetSelect');s.innerHTML=presets.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('');s.value='india'}
function syncMeta(){
 const d=+$('#dpi').value,u=$('#unit').value,w=+$('#w').value,h=+$('#h').value,k=targetKB(),tw=px(w,u,d),th=px(h,u,d);
 $('#liveDetails').innerHTML=`<span class="pill">${w} × ${h} ${u.toUpperCase()}</span><span class="pill">${tw} × ${th} px</span><span class="pill">${d} DPI</span><span class="pill">${k?k+' KB target':'No KB target'}</span><span class="pill">${$('#format').value.toUpperCase()}</span>`;
 $('#customTargetWrap').classList.toggle('hidden',$('#target').value!=='custom');
 $('#mainStage').style.aspectRatio=`${tw}/${th}`;
}
function selectPreset(k){const p=presets.find(x=>x[0]===k)||presets[0];$('#unit').value=p[2];$('#w').value=p[3];$('#h').value=p[4];syncMeta();renderLive();}
function pick(f){
 if(!f||!f.type.startsWith('image/'))return status('Please choose a JPG, PNG, WebP or supported image.');
 file=f;removed=null;removedImg=null;bg='original';cropMode=false;
 load(f).then(i=>{
   img=i; $('#uploadMeta').innerHTML=`<b>${f.name}</b> · ${fmt(f.size)} · ${i.naturalWidth} × ${i.naturalHeight}px`;
   $('#editor').classList.remove('hidden');$('#presetSelect').value='india';
   frame={x:50,y:50,w:62,h:72};zoom=1;$('#zoom').value=1;$('#posX').value=50;$('#posY').value=50;
   $('#mainImg').src=i.src; $('#cropImg').src=i.src; syncMeta(); renderFrame(); renderLive(); setCropMode(false);
   status('Photo loaded. Change size, crop, background or text — the main preview updates here.');
 }).catch(()=>status('Could not read this image. Please try JPG, PNG or WebP.'));
}
function renderFrame(){
 const st=$('#mainStage'),f=$('#frame');if(!st||!f)return;
 let bw=st.clientWidth*.62,bh=bw/ratio();
 if(bh>st.clientHeight*.78){bh=st.clientHeight*.78;bw=bh*ratio()}
 bw=Math.max(80,Math.min(st.clientWidth-18,bw));bh=Math.max(80,Math.min(st.clientHeight-18,bh));
 f.style.width=bw+'px';f.style.height=bh+'px';
 const left=(frame.x/100)*(st.clientWidth-bw),top=(frame.y/100)*(st.clientHeight-bh);
 f.style.left=Math.max(9,Math.min(st.clientWidth-bw-9,left))+'px';f.style.top=Math.max(9,Math.min(st.clientHeight-bh-9,top))+'px';
 $('#cropReadout').textContent=`Crop ${Math.round(bw)} × ${Math.round(bh)} px · Zoom ${zoom.toFixed(2)}×`;
}
function setCropMode(on){cropMode=!!on;$('#mainStage').classList.toggle('cropMode',cropMode);$('#mainImg').classList.toggle('hidden',cropMode);$('#cropImg').classList.toggle('hidden',!cropMode);$('#frame').classList.toggle('hidden',!cropMode);$('#cropControls').classList.toggle('hidden',!cropMode);$('#cropToggle').textContent=cropMode?'Done crop':'Edit crop';if(cropMode)renderFrame();}
function setFrameFromEl(){const st=$('#mainStage'),f=$('#frame');frame.x=Math.max(0,Math.min(100,(f.offsetLeft/(st.clientWidth-f.offsetWidth))*100));frame.y=Math.max(0,Math.min(100,(f.offsetTop/(st.clientHeight-f.offsetHeight))*100));$('#posX').value=Math.round(frame.x);$('#posY').value=Math.round(frame.y);renderLive();}
function setupCrop(){
 const st=$('#mainStage'),f=$('#frame');let mode=null,sx=0,sy=0,sl=0,stp=0,sw=0,sh=0;
 const pos=e=>{const p=e.touches?e.touches[0]:e;return{x:p.clientX,y:p.clientY}};
 const down=e=>{if(!cropMode)return;const p=pos(e);mode=e.target.classList.contains('handle')?'resize':'move';sx=p.x;sy=p.y;sl=f.offsetLeft;stp=f.offsetTop;sw=f.offsetWidth;sh=f.offsetHeight;e.preventDefault()};
 const move=e=>{if(!mode)return;const p=pos(e),dx=p.x-sx,dy=p.y-sy,W=st.clientWidth,H=st.clientHeight;
   if(mode==='move'){f.style.left=Math.max(6,Math.min(W-f.offsetWidth-6,sl+dx))+'px';f.style.top=Math.max(6,Math.min(H-f.offsetHeight-6,stp+dy))+'px'}
   else {let nw=Math.max(70,sw+dx),nh=nw/ratio();if(nh>H*.85){nh=H*.85;nw=nh*ratio()}if(nw>W*.85){nw=W*.85;nh=nw/ratio()}f.style.width=nw+'px';f.style.height=nh+'px'}
   setFrameFromEl();e.preventDefault();
 };
 const up=()=>mode=null;
 f.addEventListener('mousedown',down);f.addEventListener('touchstart',down,{passive:false});window.addEventListener('mousemove',move);window.addEventListener('touchmove',move,{passive:false});window.addEventListener('mouseup',up);window.addEventListener('touchend',up);
}
function cropSource(srcW,srcH,targetRatio){
 const st=$('#mainStage'),f=$('#frame');let fx=f.offsetLeft/st.clientWidth,fy=f.offsetTop/st.clientHeight,fw=f.offsetWidth/st.clientWidth,fh=f.offsetHeight/st.clientHeight;
 let cw=srcW*fw,ch=srcH*fh;if(cw/ch>targetRatio)cw=ch*targetRatio;else ch=cw/targetRatio;
 const cx=srcW*(fx+fw/2),cy=srcH*(fy+fh/2);cw=Math.min(srcW,cw/zoom);ch=Math.min(srcH,ch/zoom);if(cw/ch>targetRatio)cw=ch*targetRatio;else ch=cw/targetRatio;
 return[Math.max(0,Math.min(srcW-cw,cx-cw/2)),Math.max(0,Math.min(srcH-ch,cy-ch/2)),cw,ch]
}
function sourceFor(){return bg==='original'?img:removedImg}
async function downscaleForAI(f,maxSide=1600){const im=await load(f);if(Math.max(im.naturalWidth,im.naturalHeight)<=maxSide)return f;const s=maxSide/Math.max(im.naturalWidth,im.naturalHeight),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return new Promise(r=>c.toBlob(b=>r(b||f),'image/jpeg',.92))}
async function runAI(){
 if(!file)throw Error('Upload a photo first');if(removed)return removed;bgStatus('Preparing background removal…');
 try{const small=await downscaleForAI(file),mode=$('#bgQuality').value,model=mode==='hq'?'u2net_human_seg':'u2netp';bgStatus(mode==='hq'?'Loading high-quality AI model…':'Loading fast AI model (~5 MB, first use only)…');
  const mod=await import('https://unpkg.com/@bunnio/rembg-web@1.0.2/dist/index.js');let session=null;try{session=await mod.newSession(model)}catch(e){}
  const maskBlob=await mod.remove(small,{session,onlyMask:true,postProcessMask:true,onProgress:p=>{if(p?.progress!=null)bgStatus(`Removing background ${Math.round(p.progress)}%`)}});
  const maskImg=await load(maskBlob),c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='destination-in';x.drawImage(maskImg,0,0,c.width,c.height);removed=await new Promise(r=>c.toBlob(r,'image/png'));removedImg=await load(removed);renderLive();bgStatus('Background removed.');return removed;
 }catch(e){console.error(e);bgStatus('Could not remove background. Try Fast mode or the dedicated tool.',true);throw e}
}
async function chooseBg(m){bg=m;$$('.bgchoice').forEach(x=>x.classList.toggle('active',x.dataset.bg===m));if(m!=='original'&&!removed){try{await runAI()}catch{}}renderLive()}
function drawLiveCanvas(){
 const src=sourceFor()||img,d=+$('#dpi').value,u=$('#unit').value,tw=px(+$('#w').value,u,d),th=px(+$('#h').value,u,d),cv=document.createElement('canvas');cv.width=tw;cv.height=th;
 const x=cv.getContext('2d');let [sx,sy,sw,sh]=cropSource(src.naturalWidth,src.naturalHeight,tw/th);
 if(bg!=='original'){x.fillStyle=bg==='transparent'?'#00000000':colors[bg]||'#fff';x.fillRect(0,0,tw,th)}
 x.save();x.filter=`brightness(${$('#brightness').value}%) contrast(${$('#contrast').value}%) saturate(${$('#saturation').value}%)`;x.drawImage(src,sx,sy,sw,sh,0,0,tw,th);x.restore();
 const ot=$('#overlayText').value.trim();if(ot){const bh=Math.max(18,Math.round(th*.10));x.fillStyle=$('#overlayColor').value==='white'?'rgba(0,0,0,.58)':'rgba(255,255,255,.78)';x.fillRect(0,th-bh,tw,bh);x.fillStyle=$('#overlayColor').value==='white'?'#fff':'#111';x.font=`600 ${Math.max(10,Math.round(bh*.55))}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(ot,tw/2,th-bh/2,tw-10)}
 return cv;
}
function renderLive(){if(!img)return;syncMeta();const cv=drawLiveCanvas();$('#mainImg').src=cv.toDataURL('image/jpeg',.9);window.__liveCanvas=cv;}
async function blob(cv,type,q){return new Promise(r=>cv.toBlob(r,type,q))}
async function fitJpeg(cv,target){if(!target)return{blob:await blob(cv,'image/jpeg',+$('#quality').value/100),canvas:cv};const lim=target*1024;let cur=cv;for(let pass=0;pass<10;pass++){let lo=.05,hi=1,best=null;for(let i=0;i<12;i++){const q=(lo+hi)/2,b=await blob(cur,'image/jpeg',q);if(b.size<=lim){best={blob:b,canvas:cur};lo=q}else hi=q}if(best)return best;const n=document.createElement('canvas');n.width=Math.max(40,Math.floor(cur.width*.88));n.height=Math.max(40,Math.floor(cur.height*.88));n.getContext('2d').drawImage(cur,0,0,n.width,n.height);cur=n}return{blob:await blob(cur,'image/jpeg',.6),canvas:cur}}
async function renderFinal(){const cv=drawLiveCanvas(),fmtv=$('#format').value,k=targetKB(),packed=fmtv==='png'?{blob:await blob(cv,'image/png'),canvas:cv}:await fitJpeg(cv,k);return{...packed,tw:packed.canvas.width,th:packed.canvas.height,d:+$('#dpi').value,k}}
async function process(){
 if(!file)return status('Upload a photo first.');try{if(bg!=='original'&&!removed)await runAI();status('Creating final photo…');result=await renderFinal();$('#result').classList.remove('hidden');const u=URL.createObjectURL(result.blob);$('#finalPreview').src=u;
  const ext=$('#format').value==='png'?'png':'jpg';$('#single').innerHTML=`<div class="muted">${result.tw} × ${result.th}px · ${$('#w').value} × ${$('#h').value} ${$('#unit').value.toUpperCase()} · ${result.d} DPI · ${fmt(result.blob.size)}${result.k?' · target '+result.k+' KB':''}</div><div class="actions"><a class="btn" href="${u}" download="formtools-passport-photo.${ext}">Download single photo</a></div>`;
  buildCopies();status(`Done · ${fmt(result.blob.size)} output.`,true);$('#result').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){console.error(e);status('Could not create the result. Try another image or settings.')}
}
function buildCopies(){const c=$('#copies');c.innerHTML='';[['1','1'],['2','2'],['4','4'],['6','6'],['8','8'],['12','12'],['16','16'],['24','24'],['32','32'],['custom','Custom']].forEach(([n,t],i)=>{const b=document.createElement('button');b.className='copy'+(i===0?' active':'');b.type='button';b.textContent=t==='Custom'?'Custom':t;b.onclick=()=>{$$('.copy').forEach(x=>x.classList.remove('active'));b.classList.add('active');makeSheet(n==='custom'?Math.max(1,Math.min(60,+$('#customCopies').value||12)):+n)};c.append(b)});makeSheet(1)}
async function makeSheet(count){if(!result)return;const paper=$('#paper').value,dims=paper==='a5'?[1748,2480]:paper==='letter'?[2550,3300]:[2480,3508],margin=40,gap=18,cols=count<=4?2:count<=8?4:5,cellW=Math.max(40,Math.floor((dims[0]-margin*2-gap*(cols-1))/cols)),cellH=Math.round(result.canvas.height*cellW/result.canvas.width),rows=Math.ceil(count/cols),H=Math.max(dims[1],margin*2+rows*cellH+(rows-1)*gap),cv=document.createElement('canvas');cv.width=dims[0];cv.height=H;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);for(let i=0;i<count;i++){const col=i%cols,row=Math.floor(i/cols);x.drawImage(result.canvas,margin+col*(cellW+gap),margin+row*(cellH+gap),cellW,cellH)}$('#sheet').innerHTML='';$('#sheet').append(cv);const b=await blob(cv,'image/jpeg',.95),u=URL.createObjectURL(b);$('#sheetAction').innerHTML=`<a class="btn" href="${u}" download="formtools-passport-${count}-copies-${paper}.jpg">Download ${count}-copy ${paper.toUpperCase()} sheet</a>`}
$('#drop').onclick=()=>$('#file').click();$('#file').onchange=e=>pick(e.target.files[0]);$('#drop').ondragover=e=>{e.preventDefault();$('#drop').classList.add('drag')};$('#drop').ondragleave=()=>$('#drop').classList.remove('drag');$('#drop').ondrop=e=>{e.preventDefault();$('#drop').classList.remove('drag');pick(e.dataTransfer.files[0])};
$('#presetSelect').onchange=e=>selectPreset(e.target.value);
['unit','w','h','dpi','target','targetCustom','format','quality'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{syncMeta();renderFrame();renderLive()}));
$('#target').onchange=()=>{syncMeta();renderLive()};
$('#zoom').oninput=e=>{zoom=+e.target.value;renderFrame();renderLive()};$('#posX').oninput=e=>{frame.x=+e.target.value;renderFrame();renderLive()};$('#posY').oninput=e=>{frame.y=+e.target.value;renderFrame();renderLive()};
$('#resetCrop').onclick=()=>{frame={x:50,y:50,w:62,h:72};zoom=1;$('#zoom').value=1;$('#posX').value=50;$('#posY').value=50;renderFrame();renderLive()};
$('#cropToggle').onclick=()=>setCropMode(!cropMode);
$('#removeBg').onclick=()=>runAI().catch(()=>{});$$('.bgchoice').forEach(b=>b.onclick=()=>chooseBg(b.dataset.bg));
['brightness','contrast','saturation','overlayText','overlayColor'].forEach(id=>$('#'+id)?.addEventListener('input',renderLive));
$('#create').onclick=process;setPresetOptions();setupCrop();
})();

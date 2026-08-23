(()=>{
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let file=null,img=null,removed=null,removedImg=null,bg='original',result=null,frame={x:50,y:50,w:62,h:72},zoom=1;
const presets=[['india','India 35×45','mm',35,45],['usa','USA 2×2″','in',2,2],['uk','UK 35×45','mm',35,45],['canada','Canada 50×70','mm',50,70],['australia','Australia 35×45','mm',35,45],['schengen','Schengen/EU 35×45','mm',35,45],['china','China Visa 33×48','mm',33,48],['philippines','Philippines 2×2″','in',2,2],['malaysia','Malaysia 35×50','mm',35,50],['ind34','Indonesia 3×4','cm',3,4],['ind46','Indonesia 4×6','cm',4,6],['pakistan','Pakistan 35×45','mm',35,45],['nigeria','Nigeria 35×45','mm',35,45],['uae','UAE 43×55','mm',43,55],['vietnam','Vietnam 4×6','cm',4,6],['nepal','Nepal 35×45','mm',35,45],['bangladesh','Bangladesh 35×45','mm',35,45],['custom','Custom','mm',35,45]];
const colors={white:'#fff',offwhite:'#f5f5f5',blue:'#dbeafe',red:'#ef4444'};
const fmt=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';
const px=(v,u,d)=>u==='px'?Math.round(v):Math.max(1,Math.round(u==='cm'?v*d/2.54:u==='mm'?v*d/25.4:v*d));
function load(f){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=typeof f==='string'?f:URL.createObjectURL(f)})}
function setStatus(t,ok=false){const e=$('#status');if(e){e.textContent=t;e.className=ok?'ok':'muted'}}
function setBgStatus(t,err=false){const e=$('#bgStatus');if(e){e.textContent=t;e.className=err?'err':'muted'}}
function ratio(){return Math.max(.01,+$('#w').value)/Math.max(.01,+$('#h').value)}
function pick(f){
  file=f; removed=null; removedImg=null; bg='original';
  load(f).then(i=>{
    img=i;
    $('#uploadMeta').innerHTML=`<b>${f.name}</b> · ${fmt(f.size)} · ${i.naturalWidth} × ${i.naturalHeight}px`;
    $('#editor').classList.remove('hidden'); renderPresets(); select('india');
    $('#cropImg').src=i.src; ['Original','White','Offwhite','Blue','Red','Transparent'].forEach(x=>$('#bg'+x).src=i.src);
    frame={x:50,y:50,w:62,h:72}; zoom=1; $('#zoom').value=1; $('#posX').value=50; $('#posY').value=50;
    renderFrame(); setStatus('Photo loaded — choose size, crop and background.');
  }).catch(()=>setStatus('Could not read this image.'));
}
function renderPresets(){const s=$('#sizes');s.innerHTML='';presets.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.k=p[0];b.innerHTML=`<b>${p[1]}</b><small>${p[3]} × ${p[4]} ${p[2].toUpperCase()}</small>`;b.onclick=()=>select(p[0]);s.append(b)})}
function select(k){const p=presets.find(x=>x[0]===k)||presets[0];$('#unit').value=p[2];$('#w').value=p[3];$('#h').value=p[4];$$('#sizes .choice').forEach(x=>x.classList.toggle('active',x.dataset.k===k));renderFrame();syncSpec()}
function syncSpec(){
  const e=$('#spec')||$('#ft-live-spec'); if(!e)return;
  const target=$('#target').value==='custom'?$('#targetCustom').value:$('#target').value;
  e.innerHTML=`<span>Width</span><b>${$('#w').value} ${$('#unit').value}</b><span>Height</span><b>${$('#h').value} ${$('#unit').value}</b><span>Pixels</span><b>${px(+$('#w').value,$('#unit').value,+$('#dpi').value)} × ${px(+$('#h').value,$('#unit').value,+$('#dpi').value)}</b><span>DPI</span><b>${$('#dpi').value}</b><span>Target</span><b>${target&&target!=='0'?target+' KB':'No target'}</b>`;
}
function renderFrame(){
 const st=$('#cropStage'),f=$('#frame');if(!st||!f)return;
 let bw=st.clientWidth*.62,bh=bw/ratio();
 if(bh>st.clientHeight*.78){bh=st.clientHeight*.78;bw=bh*ratio()}
 bw=Math.max(80,Math.min(st.clientWidth-16,bw));bh=Math.max(80,Math.min(st.clientHeight-16,bh));
 f.style.width=bw+'px';f.style.height=bh+'px';
 const left=(frame.x/100)*(st.clientWidth-bw),top=(frame.y/100)*(st.clientHeight-bh);
 f.style.left=Math.max(8,Math.min(st.clientWidth-bw-8,left))+'px';f.style.top=Math.max(8,Math.min(st.clientHeight-bh-8,top))+'px';
 $('#cropReadout').textContent=`Crop ${Math.round(bw)} × ${Math.round(bh)} px • Zoom ${zoom.toFixed(2)}×`;
}
function setFrameFromEl(){const st=$('#cropStage'),f=$('#frame');if(!st||!f)return;frame.x=Math.max(0,Math.min(100,(f.offsetLeft/(st.clientWidth-f.offsetWidth))*100));frame.y=Math.max(0,Math.min(100,(f.offsetTop/(st.clientHeight-f.offsetHeight))*100));$('#posX').value=Math.round(frame.x);$('#posY').value=Math.round(frame.y)}
function setupCrop(){
 const st=$('#cropStage'),f=$('#frame');if(!st||!f)return;let mode=null,sx=0,sy=0,sl=0,stp=0,sw=0;
 const pos=e=>{const p=e.touches?e.touches[0]:e;return{x:p.clientX,y:p.clientY}};
 const down=e=>{if($('#cropMode').value!=='manual')return;const p=pos(e);mode=e.target.classList.contains('handle')?'resize':'move';sx=p.x;sy=p.y;sl=f.offsetLeft;stp=f.offsetTop;sw=f.offsetWidth;e.preventDefault()};
 const move=e=>{if(!mode)return;const p=pos(e),dx=p.x-sx,dy=p.y-sy,W=st.clientWidth,H=st.clientHeight;
   if(mode==='move'){f.style.left=Math.max(6,Math.min(W-f.offsetWidth-6,sl+dx))+'px';f.style.top=Math.max(6,Math.min(H-f.offsetHeight-6,stp+dy))+'px'}
   else {let nw=Math.max(70,sw+dx),nh=nw/ratio();if(nh>H*.85){nh=H*.85;nw=nh*ratio()}if(nw>W*.85){nw=W*.85;nh=nw/ratio()}f.style.width=nw+'px';f.style.height=nh+'px'}
   setFrameFromEl();e.preventDefault();
 };
 const up=()=>mode=null;
 f.addEventListener('mousedown',down);f.addEventListener('touchstart',down,{passive:false});window.addEventListener('mousemove',move);window.addEventListener('touchmove',move,{passive:false});window.addEventListener('mouseup',up);window.addEventListener('touchend',up);
}
function renderBg(){if(!file)return;const u=URL.createObjectURL(file);$('#bgOriginal').src=u;$('#bgWhite').src=u;$('#bgOffwhite').src=u;$('#bgBlue').src=u;$('#bgRed').src=u;$('#bgTransparent').src=u}
async function downscaleForAI(f,maxSide=1600){
 const im=await load(f);
 if(Math.max(im.naturalWidth,im.naturalHeight)<=maxSide)return f;
 const scale=maxSide/Math.max(im.naturalWidth,im.naturalHeight);
 const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);
 c.getContext('2d').drawImage(im,0,0,c.width,c.height);
 return new Promise(r=>c.toBlob(b=>r(b||f),'image/jpeg',.92));
}
async function runAI(){
 if(!file)throw Error('Upload a photo first.'); if(removed)return removed;
 setBgStatus('Preparing image…');
 try{
   const small=await downscaleForAI(file);
   const mode=$('#bgQuality')?.value||'fast';
   const model=mode==='hq'?'u2net_human_seg':'u2netp';
   setBgStatus(mode==='hq'?'Loading high-quality AI model (first use can be large)…':'Loading fast AI model (~5 MB, first use only)…');
   const mod=await import('https://unpkg.com/@bunnio/rembg-web@1.0.2/dist/index.js');
   let session=null;
   try{session=await mod.newSession(model)}catch(e){console.warn('Session preload failed; falling back to library defaults',e)}
   const maskBlob=await mod.remove(small,{session,onlyMask:true,postProcessMask:true,onProgress:p=>{if(p?.progress!=null)setBgStatus(`Removing background ${Math.round(p.progress)}%`)}})
   const maskImg=await load(maskBlob);
   const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
   const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='destination-in';x.drawImage(maskImg,0,0,c.width,c.height);
   removed=await new Promise(r=>c.toBlob(r,'image/png'));
   removedImg=await load(removed);
   await paintBg();setBgStatus(mode==='hq'?'High-quality background removed.':'Fast background removed.');return removed;
 }catch(e){console.error(e);setBgStatus('Background removal failed. Try Fast mode or the dedicated Background Remover.',true);throw e}
}
async function paintBg(){
 const im=await load(removed); const make=async(c)=>{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');if(c){x.fillStyle=c;x.fillRect(0,0,cv.width,cv.height)}x.drawImage(im,0,0);return new Promise(r=>cv.toBlob(r,'image/png'))};
 $('#bgWhite').src=URL.createObjectURL(await make(colors.white));$('#bgOffwhite').src=URL.createObjectURL(await make(colors.offwhite));$('#bgBlue').src=URL.createObjectURL(await make(colors.blue));$('#bgRed').src=URL.createObjectURL(await make(colors.red));$('#bgTransparent').src=URL.createObjectURL(removed);
}
async function chooseBg(m){bg=m;$$('#backgroundStep .choice').forEach(x=>x.classList.toggle('active',x.dataset.bg===m));if(m!=='original'&&!removed){try{await runAI()}catch{}}else if(removed)await paintBg()}
function cropSource(srcW,srcH,targetRatio){
 const st=$('#cropStage'),f=$('#frame');let fx=f.offsetLeft/st.clientWidth,fy=f.offsetTop/st.clientHeight,fw=f.offsetWidth/st.clientWidth,fh=f.offsetHeight/st.clientHeight;
 // Convert the visible frame to a source crop, then apply zoom around its center.
 let cw=srcW*fw, ch=srcH*fh;
 if(cw/ch>targetRatio)cw=ch*targetRatio;else ch=cw/targetRatio;
 const cx=srcW*(fx+fw/2),cy=srcH*(fy+fh/2);
 cw=Math.min(srcW,cw/zoom);ch=Math.min(srcH,ch/zoom);
 if(cw/ch>targetRatio)cw=ch*targetRatio;else ch=cw/targetRatio;
 const sx=Math.max(0,Math.min(srcW-cw,cx-cw/2)),sy=Math.max(0,Math.min(srcH-ch,cy-ch/2));
 return [sx,sy,cw,ch];
}
function sourceFor(){return bg==='original'?img:removedImg}
function targetKB(){const v=$('#target').value;return v==='custom'?Math.max(0,+$('#targetCustom').value):+v}
async function canvasBlob(cv,type,q){return new Promise(r=>cv.toBlob(r,type,q))}
async function fitJpeg(cv,target){
 if(!target)return {blob:await canvasBlob(cv,'image/jpeg',.92),canvas:cv};
 const limit=Math.max(1024,Math.round(target*1024));
 let current=cv;
 for(let pass=0;pass<10;pass++){
   let lo=.05,hi=1,best=null;
   for(let i=0;i<12;i++){
     const q=(lo+hi)/2,b=await canvasBlob(current,'image/jpeg',q);
     if(!b)break;
     if(b.size<=limit){best={blob:b,quality:q,canvas:current};lo=q}else hi=q;
   }
   if(best)return best;
   const next=document.createElement('canvas');
   next.width=Math.max(40,Math.floor(current.width*.88));
   next.height=Math.max(40,Math.floor(current.height*.88));
   next.getContext('2d').drawImage(current,0,0,next.width,next.height);
   current=next;
 }
 return {blob:await canvasBlob(current,'image/jpeg',.60),quality:.60,canvas:current};
}
async function render(){
 const src=sourceFor();if(!src)throw Error('Upload a photo first.');
 const d=+$('#dpi').value,tw=px(+$('#w').value,$('#unit').value,d),th=px(+$('#h').value,$('#unit').value,d);
 const cv=document.createElement('canvas');cv.width=tw;cv.height=th;const x=cv.getContext('2d');x.imageSmoothingQuality='high';
 let [sx,sy,sw,sh]=cropSource(src.naturalWidth,src.naturalHeight,tw/th);
 if(bg!=='original'){x.fillStyle=bg==='transparent'?'#00000000':colors[bg];x.fillRect(0,0,tw,th)}
 x.save();x.filter=`brightness(${$('#brightness').value}%) contrast(${$('#contrast').value}%) saturate(${$('#saturation').value}%)`;x.drawImage(src,sx,sy,sw,sh,0,0,tw,th);x.restore();
 const ot=$('#overlayText')?.value?.trim();
 if(ot){
   const barH=Math.max(Math.round(th*0.09),18),fontSize=Math.max(Math.round(barH*0.55),10);
   const col=$('#overlayColor')?.value||'white';
   x.save();
   x.fillStyle=col==='white'?'rgba(0,0,0,.55)':'rgba(255,255,255,.72)';
   x.fillRect(0,th-barH,tw,barH);
   x.fillStyle=col==='white'?'#fff':'#111';
   x.font=`600 ${fontSize}px Arial, sans-serif`;x.textAlign='center';x.textBaseline='middle';
   x.fillText(ot,tw/2,th-barH/2,tw-10);
   x.restore();
 }
 const fmt=$('#format').value, kb=targetKB();
 if(fmt==='png' && kb) setStatus('PNG selected: target KB is not enforced losslessly; choose JPG for exact target KB.');
 const packed=fmt==='png'?{blob:await canvasBlob(cv,'image/png'),canvas:cv}:{...await fitJpeg(cv,kb),};
 return {canvas:packed.canvas||cv,blob:packed.blob,tw:packed.canvas?.width||tw,th:packed.canvas?.height||th,d,kb};
}
async function process(){
 if(!file)return setStatus('Upload a photo first.');
 try{
   if(bg!=='original'&&!removed)await runAI();
   setStatus('Creating final photo…');const r=await render();result=r;
   $('#result').classList.remove('hidden');$('#compare').classList.remove('hidden');
   const u=URL.createObjectURL(r.blob),ou=URL.createObjectURL(file);
   $('#single').innerHTML=`<div class="single-output"><div class="photo-preview"><img src="${u}" alt="Final passport photo"></div><div><h3>Single photo — ready</h3><div class="details">Output: ${r.tw} × ${r.th} px<br>Requested: ${$('#w').value} × ${$('#h').value} ${$('#unit').value}<br>DPI: ${r.d}<br>Final: ${fmt(r.blob.size)}${r.kb?' · Target '+r.kb+' KB':''}<br>Background: ${bg}</div><div class="actions"><a class="btn" href="${u}" download="formtools-passport-photo.jpg">Download Single JPG</a><button class="btn secondary" id="png" type="button">Download Single PNG</button></div></div></div>`;
   $('#png').onclick=async()=>{const b=await canvasBlob(r.canvas,'image/png');const v=URL.createObjectURL(b),a=document.createElement('a');a.href=v;a.download='formtools-passport-photo.png';a.click();setTimeout(()=>URL.revokeObjectURL(v),1000)};
   buildCopies();$('#before').src=ou;$('#after').src=u;$('#beforeDetails').innerHTML=`${file.name}<br>${fmt(file.size)}<br>${img.naturalWidth} × ${img.naturalHeight} px`;$('#afterDetails').innerHTML=`${fmt(r.blob.size)}<br>${r.tw} × ${r.th} px<br>${$('#w').value} × ${$('#h').value} ${$('#unit').value}<br>${r.d} DPI`;
   setStatus(`Done • ${fmt(r.blob.size)} output.`,true);
 }catch(e){console.error(e);setStatus('Could not create the result. Try another image or settings.')}
}
function buildCopies(){
 const c=$('#copies');c.innerHTML='';[['1','1'],['4','4'],['6','6'],['8','8'],['12','12'],['16','16'],['24','24'],['32','32'],['custom','Custom']].forEach(([n,t])=>{const b=document.createElement('button');b.type='button';b.className='choice';b.textContent=t==='Custom'?'Custom copies':`${t} copies`;b.onclick=()=>makeSheet(n==='custom'?Math.max(1,Math.min(60,+$('#customCopies').value||12)):+n);c.append(b)});makeSheet(4)}
async function makeSheet(count){
 if(!result)return;const paper=$('#paper').value,margin=Math.max(0,+$('#margin').value||0),dims=paper==='a5'?[1748,2480]:paper==='letter'?[2550,3300]:[2480,3508],cols=count<=4?2:count<=8?4:5,gap=18,cellW=Math.max(40,Math.floor((dims[0]-margin*2-gap*(cols-1))/cols)),cellH=Math.max(40,Math.round(result.canvas.height*cellW/result.canvas.width)),rows=Math.ceil(count/cols),H=Math.max(dims[1],margin*2+rows*cellH+(rows-1)*gap);
 const cv=document.createElement('canvas');cv.width=dims[0];cv.height=H;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);for(let i=0;i<count;i++){const col=i%cols,row=Math.floor(i/cols);x.drawImage(result.canvas,margin+col*(cellW+gap),margin+row*(cellH+gap),cellW,cellH)}$('#sheet').innerHTML='';$('#sheet').append(cv);const b=await canvasBlob(cv,'image/jpeg',.95),u=URL.createObjectURL(b);$('#sheetAction').innerHTML=`<a class="btn" href="${u}" download="formtools-passport-${count}-copies-${paper}.jpg">Download ${count}-copy ${paper.toUpperCase()} sheet</a>`}
$('#drop').onclick=()=>$('#file').click();$('#file').onchange=e=>pick(e.target.files[0]);$('#drop').ondragover=e=>{e.preventDefault();$('#drop').classList.add('drag')};$('#drop').ondragleave=()=>$('#drop').classList.remove('drag');$('#drop').ondrop=e=>{e.preventDefault();$('#drop').classList.remove('drag');pick(e.dataTransfer.files[0])};
$('#cropMode').onchange=()=>{renderFrame();};$('#zoom').oninput=e=>{zoom=+e.target.value;renderFrame()};$('#posX').oninput=e=>{frame.x=+e.target.value;renderFrame()};$('#posY').oninput=e=>{frame.y=+e.target.value;renderFrame()};$('#resetCrop').onclick=()=>{frame={x:50,y:50,w:62,h:72};zoom=1;$('#zoom').value=1;$('#posX').value=50;$('#posY').value=50;renderFrame()};
['unit','w','h','dpi','target','targetCustom','format'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{renderFrame();syncSpec()}));
$('#removeBg').onclick=()=>runAI().catch(()=>{});$$('#backgroundStep .choice').forEach(b=>b.onclick=()=>chooseBg(b.dataset.bg));$('#create').onclick=process;renderPresets();select('india');setupCrop();
})();
(()=>{'use strict';
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const presets=[['india','India / UK / Europe — 35×45 mm','mm',35,45],['usa','USA — 2×2 in','in',2,2],['canada','Canada — 50×70 mm','mm',50,70],['australia','Australia — 35×45 mm','mm',35,45],['schengen','Schengen / EU — 35×45 mm','mm',35,45],['china','China Visa — 33×48 mm','mm',33,48],['philippines','Philippines — 2×2 in','in',2,2],['malaysia','Malaysia — 35×50 mm','mm',35,50],['indonesia34','Indonesia — 3×4 cm','cm',3,4],['indonesia46','Indonesia — 4×6 cm','cm',4,6],['pakistan','Pakistan — 35×45 mm','mm',35,45],['nigeria','Nigeria — 35×45 mm','mm',35,45],['uae','UAE — 43×55 mm','mm',43,55],['vietnam','Vietnam — 4×6 cm','cm',4,6],['nepal','Nepal — 35×45 mm','mm',35,45],['bangladesh','Bangladesh — 35×45 mm','mm',35,45],['custom','Custom size','mm',35,45]];
let img=null,file=null,bg='original',cutout=null,crop={zoom:1,x:50,y:50},finalBlob=null,finalCanvas=null,urls=[];
function setStatus(t,e=false){$('status').textContent=t;$('status').style.color=e?'#b42318':'#64748b'}
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Image could not be loaded'));i.src=typeof src==='string'?src:URL.createObjectURL(src)})}
function px(v,u,d){v=Number(v)||1;return u==='px'?Math.max(1,Math.round(v)):u==='mm'?Math.max(1,Math.round(v*d/25.4)):u==='cm'?Math.max(1,Math.round(v*d/2.54)):Math.max(1,Math.round(v*d))}
function dims(){const u=$('unit').value,d=+$('dpi').value;return{w:px($('w').value,u,d),h:px($('h').value,u,d)}}
function targetKB(){if($('format').value==='png')return 0;return $('kb').value==='custom'?Math.max(1,+$('customKB').value||50):+$('kb').value}
function fmt(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'}
function source(){return cutout||img}
function cropRect(sw,sh,r){let cw=sw,ch=sh;if(cw/ch>r)cw=ch*r;else ch=cw/r;const z=Math.max(1,crop.zoom);cw=Math.min(sw,cw/z);ch=Math.min(sh,ch/z);const maxX=Math.max(0,sw-cw),maxY=Math.max(0,sh-ch);return[Math.max(0,Math.min(maxX,(sw-cw)*crop.x/100)),Math.max(0,Math.min(maxY,(sh-ch)*crop.y/100)),cw,ch]}
function draw(){if(!img)return null;const s=source(),d=dims(),c=document.createElement('canvas');c.width=d.w;c.height=d.h;const x=c.getContext('2d');const [sx,sy,sw,sh]=cropRect(s.naturalWidth,s.naturalHeight,d.w/d.h);if(bg!=='original'){x.fillStyle={white:'#fff',offwhite:'#f7f5ef',blue:'#dbeafe',red:'#fee2e2'}[bg]||'#fff';x.fillRect(0,0,d.w,d.h)}x.save();x.filter=`brightness(${$('brightness').value}%) contrast(${$('contrast').value}%) saturate(${$('saturation').value}%)`;x.drawImage(s,sx,sy,sw,sh,0,0,d.w,d.h);x.restore();const text=$('overlay').value.trim();if(text){const fs=Math.max(12,Math.round(Math.min(d.w,d.h)*.055)),pad=Math.round(fs*.65),bh=Math.max(Math.round(d.h*.14),fs+pad*2),y=$('overlayPos').value==='top'?0:d.h-bh;x.save();x.fillStyle='#fff';x.fillRect(0,y,d.w,bh);x.fillStyle='#111827';x.font=`700 ${fs}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,d.w/2,y+bh/2,d.w-pad);x.restore()}return c}
function render(){if(!img)return;const c=draw(),v=$('canvas');v.classList.remove('hidden');v.width=c.width;v.height=c.height;v.getContext('2d').drawImage(c,0,0);$('upload').classList.remove('empty');const d=dims();$('spec').innerHTML=`<span class="pill">${$('w').value} × ${$('h').value} ${$('unit').value.toUpperCase()}</span><span class="pill">${d.w} × ${d.h}px</span><span class="pill">${$('dpi').value} DPI</span><span class="pill">${targetKB()?targetKB()+' KB target':'No KB target'}</span><span class="pill">${$('format').value.toUpperCase()}</span>`;if($('cropFrame').classList.contains('on'))positionFrame()}
function positionFrame(){const p=$('upload'),f=$('cropFrame'),d=dims(),r=d.w/d.h;let fw=Math.min(p.clientWidth*.58,360),fh=fw/r;if(fh>p.clientHeight*.76){fh=p.clientHeight*.76;fw=fh*r}f.style.width=fw+'px';f.style.height=fh+'px';f.style.left=(p.clientWidth-fw)*crop.x/100+'px';f.style.top=(p.clientHeight-fh)*crop.y/100+'px'}
function tab(name){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.tabpane').forEach(p=>p.classList.toggle('hidden',p.id!=='tab-'+name));if(name==='crop'){$('cropFrame').classList.add('on');positionFrame()}else $('cropFrame').classList.remove('on');window.scrollTo({top:0,behavior:'smooth'})}
function init(){const sel=$('preset');presets.forEach(p=>{const o=document.createElement('option');o.value=p[0];o.textContent=p[1];sel.append(o)});sel.value='india';applyPreset('india');[10,20,30,40,50,70,100,150,200,300].forEach(n=>{const b=document.createElement('button');b.textContent=n+' KB';b.className=n===50?'active':'';b.onclick=()=>{$('kb').value=n;$$('#quick button').forEach(q=>q.classList.remove('active'));b.classList.add('active');render()};$('quick').append(b)})}
function applyPreset(k){const p=presets.find(x=>x[0]===k)||presets[0];$('unit').value=p[2];$('w').value=p[3];$('h').value=p[4];render()}
async function pick(f){if(!f||!f.type.startsWith('image/'))return setStatus('Please choose a JPG, PNG or WebP image.',true);file=f;try{img=await loadImage(f);cutout=null;bg='original';crop={zoom:1,x:50,y:50};$('zoom').value=1;$('cx').value=50;$('cy').value=50;$$('.choice').forEach(b=>b.classList.toggle('active',b.dataset.bg==='original'));$('aiBg').disabled=false;$('resultPreview').innerHTML='';$('download').classList.add('hidden');render();setStatus(`${img.naturalWidth} × ${img.naturalHeight}px • ${fmt(f.size)} • Ready`);tab('size')}catch(e){setStatus(e.message,true)}}
async function removeAI(){
 if(!file)return setStatus('Upload a photo first.',true);
 $('aiBg').disabled=true;$('bgStatus').textContent='Loading AI model (~5 MB first use)…';
 try{
  const small=await downscale(file,1600);
  const mod=await import('https://unpkg.com/@bunnio/rembg-web@1.0.2/dist/index.js');
  let session=null;
  try{session=await mod.newSession($('aiQuality').value==='hq'?'u2net_human_seg':'u2netp')}catch(e){console.warn('Session init failed, using fallback',e)}
  const onProgress=i=>{if(i&&i.progress!=null)$('bgStatus').textContent=`Removing background… ${Math.round(i.progress)}%`};
  let mask;
  try{mask=await mod.remove(small,{session,onlyMask:true,postProcessMask:true,onProgress})}
  catch(e){console.warn('AI remove retry',e);mask=await mod.remove(small,{onlyMask:true,postProcessMask:true,onProgress})}
  const mi=await loadImage(mask),c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='destination-in';x.drawImage(mi,0,0,c.width,c.height);
  cutout=await loadImage(await new Promise(r=>c.toBlob(r,'image/png')));
  $('bgStatus').textContent='Background removed. Choose a colour.';render();
  return true;
 }catch(e){console.error(e);$('bgStatus').textContent='Background removal failed. Chrome/Edge with internet access is recommended.';setStatus('AI background removal could not start.',true);return false}
 finally{$('aiBg').disabled=false}
}
async function chooseBackground(nextBg){
 bg=nextBg;
 if(nextBg==='original'){cutout=null;$$('.choice').forEach(x=>x.classList.toggle('active',x.dataset.bg===nextBg));render();return}
 if(!cutout){
  const ok=await removeAI();
  if(!ok){$$('.choice').forEach(x=>x.classList.toggle('active',x.dataset.bg==='original'));bg='original';return}
 }
 $$('.choice').forEach(x=>x.classList.toggle('active',x.dataset.bg===nextBg));
 render();
}
async function downscale(f,max){const i=await loadImage(f);if(Math.max(i.naturalWidth,i.naturalHeight)<=max)return f;const s=max/Math.max(i.naturalWidth,i.naturalHeight),c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*s);c.height=Math.round(i.naturalHeight*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);return new Promise(r=>c.toBlob(b=>r(b||f),'image/jpeg',.9))}
async function jpeg(c,target){if(!target)return{blob:await blob(c,'image/jpeg',.94),canvas:c};const limit=target*1024;let cur=c;for(let pass=0;pass<14;pass++){let lo=.05,hi=.98,best=null;for(let i=0;i<14;i++){const q=(lo+hi)/2,b=await blob(cur,'image/jpeg',q);if(b.size<=limit){best={blob:b,canvas:cur};lo=q}else hi=q}if(best)return best;const n=document.createElement('canvas');n.width=Math.max(60,Math.floor(cur.width*.9));n.height=Math.max(60,Math.floor(cur.height*.9));n.getContext('2d').drawImage(cur,0,0,n.width,n.height);cur=n}return{blob:await blob(cur,'image/jpeg',.55),canvas:cur}}
function blob(c,t,q){return new Promise(r=>c.toBlob(r,t,q))}
async function create(){if(!img)return setStatus('Upload a photo first.',true);setStatus('Creating final photo…');try{const c=draw();finalCanvas=c;const out=$('format').value==='png'?{blob:await blob(c,'image/png'),canvas:c}:await jpeg(c,targetKB());finalBlob=out.blob;const u=URL.createObjectURL(out.blob);urls.push(u);$('download').href=u;$('download').download=`formtools-passport-${dims().w}x${dims().h}.${$('format').value}`;$('download').classList.remove('hidden');$('resultPreview').innerHTML=`<img src="${u}" style="max-width:260px;width:100%;border:1px solid #d9ddec">`;$('resultInfo').textContent=`${out.canvas.width} × ${out.canvas.height}px • ${$('dpi').value} DPI • ${fmt(out.blob.size)}`;buildCopies();setStatus('Final photo ready.');tab('download')}catch(e){console.error(e);setStatus('Could not create the result.',true)}}
function buildCopies(){const box=$('copies');box.innerHTML='';[1,2,4,6,8,16,24,32].forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>makeSheet(n);box.append(b)});const b=document.createElement('button');b.textContent='Custom';b.onclick=()=>makeSheet(Math.max(1,Math.min(60,+$('customCopies').value||8)));box.append(b);makeSheet(1)}
async function makeSheet(n){if(!finalCanvas)return;const paper=$('paper').value,d=paper==='a5'?[1748,2480]:paper==='letter'?[2550,3300]:[2480,3508],m=55,g=20,cols=n<=4?2:n<=8?4:5,cw=Math.floor((d[0]-2*m-g*(cols-1))/cols),ch=Math.round(cw*finalCanvas.height/finalCanvas.width),rows=Math.ceil(n/cols),H=Math.max(d[1],2*m+rows*ch+g*(rows-1)),c=document.createElement('canvas');c.width=d[0];c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);for(let i=0;i<n;i++){const col=i%cols,row=Math.floor(i/cols);x.drawImage(finalCanvas,m+col*(cw+g),m+row*(ch+g),cw,ch)}$('sheet').innerHTML='';$('sheet').append(c);const u=URL.createObjectURL(await blob(c,'image/jpeg',.95));urls.push(u);$('sheetDownload').innerHTML=`<a class="btn" href="${u}" download="passport-${n}-copies-${paper}.jpg">Download ${n} copies (${paper.toUpperCase()})</a>`}
$('upload').onclick=e=>{if(e.target.id!=='cropFrame')$('file').click()};$('file').onchange=e=>pick(e.target.files[0]);$('upload').ondragover=e=>{e.preventDefault()};$('upload').ondrop=e=>{e.preventDefault();pick(e.dataTransfer.files[0])};
$$('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.tab));$('nextSize').onclick=()=>tab('crop');$('nextCrop').onclick=()=>tab('background');$('nextBg').onclick=()=>tab('details');$('nextDetails').onclick=()=>tab('download');
$('preset').onchange=e=>applyPreset(e.target.value);['unit','w','h','dpi','kb','customKB','format','overlay','overlayPos','brightness','contrast','saturation'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='kb')$('customWrap').classList.toggle('hidden',$('kb').value!=='custom');render()}));
$('zoom').oninput=e=>{crop.zoom=+e.target.value;render()};$('cx').oninput=e=>{crop.x=+e.target.value;render()};$('cy').oninput=e=>{crop.y=+e.target.value;render()};$('resetCrop').onclick=()=>{crop={zoom:1,x:50,y:50};$('zoom').value=1;$('cx').value=50;$('cy').value=50;render()};
$$('.choice').forEach(b=>b.onclick=()=>chooseBackground(b.dataset.bg));$('aiBg').onclick=async()=>{await removeAI();};$('create').onclick=create;$('paper').onchange=()=>finalCanvas&&makeSheet(1);
// drag crop frame
(()=>{const f=$('cropFrame'),p=$('upload');let down=false,sx=0,sy=0,ox=50,oy=50;const pos=e=>{const q=e.touches?e.touches[0]:e;return{x:q.clientX,y:q.clientY}};f.addEventListener('mousedown',e=>{down=true;const q=pos(e);sx=q.x;sy=q.y;ox=crop.x;oy=crop.y;e.preventDefault()});f.addEventListener('touchstart',e=>{down=true;const q=pos(e);sx=q.x;sy=q.y;ox=crop.x;oy=crop.y;e.preventDefault()},{passive:false});const move=e=>{if(!down)return;const q=pos(e);crop.x=Math.max(0,Math.min(100,ox+(q.x-sx)/p.clientWidth*100));crop.y=Math.max(0,Math.min(100,oy+(q.y-sy)/p.clientHeight*100));$('cx').value=Math.round(crop.x);$('cy').value=Math.round(crop.y);render();e.preventDefault()};window.addEventListener('mousemove',move);window.addEventListener('touchmove',move,{passive:false});window.addEventListener('mouseup',()=>down=false);window.addEventListener('touchend',()=>down=false)})();
init();
})();

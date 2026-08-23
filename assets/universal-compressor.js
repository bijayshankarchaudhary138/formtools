(()=>{
"use strict";
const $=s=>document.querySelector(s);
let files=[];
const slugTarget=+(document.body.dataset.targetKb||50);
const fmt=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';
const toPx=(v,u,d)=>u==='px'?Math.round(v):Math.max(40,Math.round(u==='cm'?v*d/2.54:u==='mm'?v*d/25.4:v*d));
const read=file=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(file)});
const blob=(c,q)=>new Promise(r=>c.toBlob(r,'image/jpeg',q));
async function compress(c,target){
 if(!target)return {blob:await blob(c,.92),quality:.92};
 const limit=target*1024;let lo=.04,hi=1,best=null;
 for(let i=0;i<13;i++){const q=(lo+hi)/2,b=await blob(c,q);if(b.size<=limit){best={blob:b,quality:q};lo=q}else hi=q}
 if(best)return best;
 let scale=.95,cv=c;
 for(let i=0;i<12;i++){const n=document.createElement('canvas');n.width=Math.max(40,Math.floor(cv.width*scale));n.height=Math.max(40,Math.floor(cv.height*scale));n.getContext('2d').drawImage(cv,0,0,n.width,n.height);const b=await blob(n,.82);if(b.size<=limit)return {blob:b,quality:.82,canvas:n};cv=n;scale*=.92}
 return {blob:await blob(cv,.72),quality:.72,canvas:cv};
}
async function one(f){
 const im=await read(f),u=$('#unit').value,w=+$('#w').value,h=+$('#h').value,d=+$('#dpi').value;
 let tw=im.naturalWidth,th=im.naturalHeight;
 if(w&&h){tw=toPx(w,u,d);th=toPx(h,u,d);if($('#aspect').checked){const r=im.naturalWidth/im.naturalHeight;th=Math.max(40,Math.round(tw/r))}}
 const c=document.createElement('canvas');c.width=tw;c.height=th;c.getContext('2d').imageSmoothingQuality='high';c.getContext('2d').drawImage(im,0,0,tw,th);
 const target=Math.max(0,+$('#target').value);const r=await compress(c,target);return {...r,canvas:r.canvas||c,original:f,origW:im.naturalWidth,origH:im.naturalHeight,tw,th,d};
}
function render(r,i){
 const u=URL.createObjectURL(r.blob),target=+$('#target').value,within=r.blob.size<=target*1024;
 return `<article class="result-card"><div class="rgrid"><div><img src="${u}" alt="Compressed result ${i+1}"></div><div class="details"><b>${r.original.name}</b><br>Original: ${fmt(r.original.size)} · ${r.origW}×${r.origH}px<br>Output: <strong>${fmt(r.blob.size)}</strong> · ${r.canvas.width}×${r.canvas.height}px<br>Target: ${target} KB · DPI: ${r.d}<br><span class="pill">${within?'Within target':'Closest safe result'}</span><div class="actions"><a class="btn" href="${u}" download="${r.original.name.replace(/\.[^.]+$/,'')}-compressed.jpg">Download JPG</a></div></div></div></article>`;
}
async function run(){if(!files.length){$('#status').textContent='Choose an image first.';return}$('#go').disabled=true;const out=[];try{for(let i=0;i<files.length;i++){out.push(await one(files[i]));$('#status').textContent=`Processed ${i+1}/${files.length}`;$('#out').innerHTML=out.map(render).join('')}$('#status').textContent=`Done • ${out.length} image(s) ready.`}catch(e){console.error(e);$('#status').textContent='Processing failed. Try a smaller image.'}finally{$('#go').disabled=false}}
$('#target').value=slugTarget;$('#targetPreset').value=String(slugTarget);$('#targetPreset').onchange=e=>{if(e.target.value!=='custom')$('#target').value=e.target.value;sync()};$('#target').oninput=sync;
function sync(){const k=$('#target').value;$('#targetPreset').value='custom';const b=$('#go');if(b)b.textContent=`Compress to ${k||'Target'}KB`;const t=document.querySelector('[data-target-label]');if(t)t.textContent=k?`Target: ${k} KB`:'No target'}
$('#unit').onchange=()=>$('#unitLabel').textContent=$('#unit').value.toUpperCase();
$('#drop').onclick=()=>$('#files').click();$('#files').onchange=e=>{files=[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,10);$('#fileInfo').textContent=files.length?`${files.length} image(s) selected • up to 10 at once`:'No image selected';};
$('#drop').ondragover=e=>{e.preventDefault();$('#drop').classList.add('drag')};$('#drop').ondragleave=()=>$('#drop').classList.remove('drag');$('#drop').ondrop=e=>{e.preventDefault();$('#drop').classList.remove('drag');files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/')).slice(0,10);$('#fileInfo').textContent=files.length?`${files.length} image(s) selected • up to 10 at once`:'No image selected'};
$('#go').onclick=run;sync();
})();
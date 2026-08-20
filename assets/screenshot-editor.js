(()=>{const $=s=>document.querySelector(s);let file=null,img=null,undo=[],redo=[],tool='crop',down=false,sx=0,sy=0,actions=[];const c=$('#canvas'),x=c.getContext('2d');
function snapshot(){undo.push(x.getImageData(0,0,c.width,c.height));if(undo.length>30)undo.shift();redo=[]}
function load(f){file=f;const u=URL.createObjectURL(f);img=new Image();img.onload=()=>{URL.revokeObjectURL(u);c.width=img.naturalWidth;c.height=img.naturalHeight;x.drawImage(img,0,0);undo=[x.getImageData(0,0,c.width,c.height)];$('#info').textContent=`${f.name} • ${f.type} • ${(f.size/1024).toFixed(1)} KB • ${img.naturalWidth} × ${img.naturalHeight}px • ${img.naturalWidth/img.naturalHeight}`;showCompare(null)};img.src=u}
function pos(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
function color(){return $('#color').value}
$('#file').onchange=e=>e.target.files[0]&&load(e.target.files[0]);$('#drop').onclick=()=>$('#file').click();$('#drop').ondragover=e=>e.preventDefault();$('#drop').ondrop=e=>{e.preventDefault();e.dataTransfer.files[0]&&load(e.dataTransfer.files[0])};$('#tool').onchange=e=>tool=e.target.value;
['bold','italic','underline'].forEach(id=>$('#'+id).onclick=()=>$('#'+id).classList.toggle('active'));
c.onpointerdown=e=>{if(!img)return;down=true;const p=pos(e);sx=p.x;sy=p.y;snapshot()};
c.onpointerup=e=>{if(!down)return;down=false;const p=pos(e),w=p.x-sx,h=p.y-sy,ix=Math.min(sx,p.x),iy=Math.min(sy,p.y),aw=Math.abs(w),ah=Math.abs(h);
if(tool==='crop'&&aw>5&&ah>5){const d=x.getImageData(ix,iy,aw,ah);c.width=aw;c.height=ah;x.putImageData(d,0,0)}
else if(tool==='blur'||tool==='redact'||tool==='highlight'){x.fillStyle=tool==='redact'?'#111':tool==='highlight'?'rgba(255,235,59,.45)':'rgba(0,0,0,.35)';x.fillRect(ix,iy,aw,ah)}
else if(tool==='rect'){x.strokeStyle=color();x.lineWidth=+$('#size').value||6;x.strokeRect(ix,iy,aw,ah)}
else if(tool==='text'){const sz=+$('#size').value||32;let f=`${$('#bold').classList.contains('active')?'bold ':''}${$('#italic').classList.contains('active')?'italic ':''}${sz}px ${$('#fontFamily').value}`;x.fillStyle=color();x.font=f;x.textAlign=$('#textAlign').value;x.textBaseline='top';x.fillText($('#text').value||'Text',p.x,p.y);if($('#underline').classList.contains('active')){const tw=x.measureText($('#text').value||'Text').width;x.fillRect(p.x+(x.textAlign==='center'?-tw/2:x.textAlign==='right'?-tw:0),p.y+sz+2,tw,2)}}
else if(tool==='draw'){x.strokeStyle=color();x.lineWidth=+$('#size').value||6;x.beginPath();x.moveTo(sx,sy);x.lineTo(p.x,p.y);x.stroke()}
showCompare(null)};
$('#undo').onclick=()=>{if(undo.length>1){redo.push(x.getImageData(0,0,c.width,c.height));undo.pop();const d=undo[undo.length-1];c.width=d.width;c.height=d.height;x.putImageData(d,0,0);showCompare(null)}};
$('#redo').onclick=()=>{if(redo.length){undo.push(x.getImageData(0,0,c.width,c.height));const d=redo.pop();c.width=d.width;c.height=d.height;x.putImageData(d,0,0);showCompare(null)}};
$('#rotate').onclick=()=>{snapshot();const d=document.createElement('canvas');d.width=c.height;d.height=c.width;const q=d.getContext('2d');q.translate(d.width/2,d.height/2);q.rotate(Math.PI/2);q.drawImage(c,-c.width/2,-c.height/2);c.width=d.width;c.height=d.height;x.drawImage(d,0,0);showCompare(null)};
$('#clear').onclick=()=>{if(undo.length){const d=undo[0];c.width=d.width;c.height=d.height;x.putImageData(d,0,0);undo=[d];redo=[];showCompare(null)}};
function showCompare(after){const p=$('#compare');if(!p||!file)return;p.innerHTML=`<div class="compare-card"><div><b>Original</b><br>${file.name}<br>${(file.size/1024).toFixed(1)} KB<br>${img.naturalWidth} × ${img.naturalHeight}px</div><div><b>Current edit</b><br>${c.width} × ${c.height}px<br>${actions.length} editing action(s)</div></div>`}
$('#download').onclick=()=>{c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='formtools-edited-screenshot.png';a.click();showCompare(b)},'image/png')};
})();
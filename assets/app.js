/* FormTools browser-side image engine */
const $=s=>document.querySelector(s);
let selectedFiles=[];
const objectUrls=new Set();
let sourceAspect=1;

function setStatus(message,type=""){
  const el=$("#status"); if(!el)return;
  el.textContent=message; el.className=`status ${type}`;
}
function revokeAll(){for(const u of objectUrls)URL.revokeObjectURL(u);objectUrls.clear()}
function setupUploader(){
  const zone=$("#dropzone"),input=$("#fileInput"); if(!zone||!input)return;
  zone.addEventListener("click",()=>input.click());
  ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add("drag")}));
  ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove("drag")}));
  zone.addEventListener("drop",e=>{if(e.dataTransfer?.files?.length)loadFiles(e.dataTransfer.files)});
  input.addEventListener("change",()=>loadFiles(input.files));
}
async function loadFiles(list){
  revokeAll();
  selectedFiles=[...list].filter(f=>f.type.startsWith("image/"));
  const preview=$("#preview"); if(preview)preview.innerHTML="";
  const uploadDetails=$("#uploadDetails"); if(uploadDetails)uploadDetails.innerHTML="";
  if(!selectedFiles.length)return setStatus("Please choose an image file.","err");
  for(const file of selectedFiles.slice(0,20)){
    const wrap=document.createElement("div"); wrap.className="preview-item";
    const img=document.createElement("img"); img.alt=file.name;
    const u=URL.createObjectURL(file); objectUrls.add(u); img.src=u;
    const cap=document.createElement("small"); cap.textContent=`${file.name} • ${(file.size/1024).toFixed(1)} KB`;
    wrap.append(img,cap); preview?.appendChild(wrap);
    if(file===selectedFiles[0]){try{const im=await loadImage(file);sourceAspect=im.naturalWidth/im.naturalHeight;setInitialDimensions(im);
      const d=$("#uploadDetails");if(d)d.innerHTML=`<div class="upload-detail-card"><div><b>Uploaded image</b><br>${file.name}</div><div><b>Type</b><br>${file.type||"Image"}</div><div><b>Dimensions</b><br>${im.naturalWidth} × ${im.naturalHeight} px</div><div><b>File size</b><br>${(file.size/1024).toFixed(1)} KB (${file.size.toLocaleString()} bytes)</div><div><b>Aspect ratio</b><br>${(im.naturalWidth/im.naturalHeight).toFixed(3)}</div><div><b>Upload status</b><br>✓ Ready — processing stays in your browser</div></div>`; 
    }catch{}}
  }
  setStatus(`${selectedFiles.length} image(s) selected. Processing stays in your browser.`);
}
function getDpi(){const v=$("#dpi")?.value||"96";return v==="custom"?Math.max(1,Number($("#customDpi")?.value)||300):Number(v)}
function unitToPx(v,unit,dpi){if(!v)return null;v=Number(v);if(unit==="px")return v;if(unit==="cm")return v*dpi/2.54;if(unit==="mm")return v*dpi/25.4;if(unit==="in")return v*dpi;return v}
function pxToUnit(v,unit,dpi){if(unit==="px")return v;if(unit==="cm")return v*2.54/dpi;if(unit==="mm")return v*25.4/dpi;if(unit==="in")return v/dpi;return v}
function setInitialDimensions(img){
  const unit=$("#unit")?.value||"px",dpi=getDpi();
  if($("#width")&&!$("#width").value)$("#width").value=pxToUnit(img.naturalWidth,unit,dpi).toFixed(unit==="px"?0:2);
  if($("#height")&&!$("#height").value)$("#height").value=pxToUnit(img.naturalHeight,unit,dpi).toFixed(unit==="px"?0:2);
}
function syncAspect(changed){
  if(!$("#aspect")?.checked||!sourceAspect)return;
  if(changed==="width"&&$("#width")?.value)$("#height").value=(Number($("#width").value)/sourceAspect).toFixed($("#unit")?.value==="px"?0:2);
  if(changed==="height"&&$("#height")?.value)$("#width").value=(Number($("#height").value)*sourceAspect).toFixed($("#unit")?.value==="px"?0:2);
}
function convertUnit(oldUnit,newUnit){const dpi=getDpi();for(const id of ["width","height"]){const el=$("#"+id);if(el?.value){const px=unitToPx(Number(el.value),oldUnit,dpi);el.value=pxToUnit(px,newUnit,dpi).toFixed(newUnit==="px"?0:2)}}}
function updateUnit(){
  const u=$("#unit")?.value||"px";
  const labels={px:["Width (px)","Height (px)"],cm:["Width (cm)","Height (cm)"],mm:["Width (mm)","Height (mm)"],in:["Width (in)","Height (in)"]}[u];
  const wl=document.querySelector('label[for="width"]'),hl=document.querySelector('label[for="height"]');
  if(wl)wl.textContent=labels[0];if(hl)hl.textContent=labels[1];
  if(sourceAspect)syncAspect("width");
}
function pathPreset(){
  const p=location.pathname.toLowerCase();
  let target=null;
  const m=p.match(/(?:compress-image|compress-jpg)-to-(20|50|100)kb/); if(m)target=Number(m[1]);
  if(p.includes("140x60")){if($("#unit"))$("#unit").value="px";if($("#width"))$("#width").value=140;if($("#height"))$("#height").value=60}
  if(p.includes("300-dpi")){if($("#dpi"))$("#dpi").value="300"}
  if(p.includes("change-image-dpi")){if($("#dpi"))$("#dpi").value="300"}
  if(p.includes("compress-jpg"))if($("#format"))$("#format").value="image/jpeg";
  if(p.includes("image-to-png"))if($("#format"))$("#format").value="image/png";
  if(p.includes("image-to-webp"))if($("#format"))$("#format").value="image/webp";
  if(p.includes("image-to-jpg"))if($("#format"))$("#format").value="image/jpeg";
  if(p.includes("resize-image-in-px"))if($("#unit"))$("#unit").value="px";
  if(p.includes("resize-image-in-cm"))if($("#unit"))$("#unit").value="cm";
  if(p.includes("resize-image-in-mm"))if($("#unit"))$("#unit").value="mm";
  if(p.includes("resize-image-in-inch"))if($("#unit"))$("#unit").value="in";
  if(target&&$("#targetKB"))$("#targetKB").value=String(target);
  if(p.includes("passport-photo-maker")&&!$("#width")?.value){$("#unit").value="px";$("#width").value=413;$("#height").value=531;$("#dpi").value="300"}
  return target;
}
function injectAdvancedControls(){
  const box=document.querySelector(".toolbox"),controls=box?.querySelector(".controls");
  if(!box||!controls||!$("#fileInput")||document.querySelector("#unit"))return;
  controls.outerHTML=`<div class="controls advanced-controls">
    <div class="field"><label for="unit">Resize unit</label><select id="unit"><option value="px">PX — Pixels</option><option value="cm">CM — Centimetres</option><option value="mm">MM — Millimetres</option><option value="in">Inch — Inches</option></select></div>
    <div class="field"><label for="width">Width (px)</label><input id="width" min="1" step="0.01" type="number" placeholder="Auto"></div>
    <div class="field"><label for="height">Height (px)</label><input id="height" min="1" step="0.01" type="number" placeholder="Auto"></div>
    <div class="field"><label for="dpi">DPI</label><select id="dpi"><option>72</option><option selected>96</option><option>150</option><option>200</option><option>300</option><option>600</option><option value="custom">Custom</option></select></div>
    <div class="field" id="customDpiWrap" hidden><label for="customDpi">Custom DPI</label><input id="customDpi" min="1" type="number" value="300"></div>
    <div class="field check"><label><input id="aspect" type="checkbox" checked> Maintain aspect ratio</label></div>
    <div class="field"><label for="crop">Crop before resize</label><select id="crop"><option value="none">No crop</option><option value="1:1">1:1 Square</option><option value="4:3">4:3</option><option value="3:2">3:2</option><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="manual">✂ Manual crop…</option></select></div>
    <div class="field"><label for="rotate">Rotate</label><select id="rotate"><option value="0">0°</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></div>
    <div class="field"><label for="flip">Flip</label><select id="flip"><option value="none">None</option><option value="h">Horizontal</option><option value="v">Vertical</option><option value="both">Horizontal + Vertical</option></select></div>
    <div class="field"><label for="format">Output format</label><select id="format"><option value="image/jpeg">JPG / JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
    <div class="field"><label for="quality">Quality <output id="qualityValue">90</output>%</label><input id="quality" type="range" min="5" max="100" value="90"></div>
    <div class="field"><label for="targetKB">Target file size</label><select id="targetKB"><option value="">No target</option><option value="20">20 KB</option><option value="50">50 KB</option><option value="100">100 KB</option><option value="200">200 KB</option><option value="500">500 KB</option><option value="1024">1 MB</option><option value="custom">Custom</option></select></div>
    <div class="field" id="customKBWrap" hidden><label for="customKB">Custom target KB</label><input id="customKB" min="1" type="number" value="100"></div>
    <div class="field wide"><small class="privacy-note">🔒 Images are processed locally in your browser; files are not uploaded by this tool.</small></div>
  </div>`;
  $("#unit")?.addEventListener("change",e=>{const old=e.target.dataset.previousUnit||"px";convertUnit(old,e.target.value);e.target.dataset.previousUnit=e.target.value;updateUnit()});
  $("#dpi")?.addEventListener("change",()=>$("#customDpiWrap").hidden=$("#dpi").value!=="custom");
  $("#targetKB")?.addEventListener("change",()=>$("#customKBWrap").hidden=$("#targetKB").value!=="custom");
  $("#quality")?.addEventListener("input",e=>$("#qualityValue").textContent=e.target.value);
  $("#crop")?.addEventListener("change",e=>{if(e.target.value==="manual"){openManualCrop();}});
  $("#aspect")?.addEventListener("change",()=>{if($("#aspect").checked)syncAspect("width")});
  $("#width")?.addEventListener("input",()=>syncAspect("width"));
  $("#height")?.addEventListener("input",()=>syncAspect("height"));
  pathPreset(); $("#unit").dataset.previousUnit=$("#unit").value; updateUnit();
}
function loadImage(file){return new Promise((resolve,reject)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(u);resolve(img)};img.onerror=e=>{URL.revokeObjectURL(u);reject(e)};img.src=u})}
function cropRect(sw,sh,mode){
  if(!mode||mode==="none"||mode==="manual")return{x:0,y:0,w:sw,h:sh};
  const [a,b]=mode.split(":").map(Number); if(!a||!b)return{x:0,y:0,w:sw,h:sh};
  const ratio=a/b; let w=sw,h=sh;
  if(sw/sh>ratio)w=sh*ratio;else h=sw/ratio;
  return{x:(sw-w)/2,y:(sh-h)/2,w,h};
}
async function canvasFor(file,width,height,opts={}){
  const img=await loadImage(file); let crop=cropRect(img.naturalWidth,img.naturalHeight,opts.crop||"none");
  if(window.__manualCrop&&window.__manualCropDisplay?.w){const m=window.__manualCrop,d=window.__manualCropDisplay;crop={x:m.x/d.w*img.naturalWidth,y:m.y/d.h*img.naturalHeight,w:m.w/d.w*img.naturalWidth,h:m.h/d.h*img.naturalHeight}}
  let w=width,h=height;
  if(!w&&!h){w=crop.w;h=crop.h}else if(w&&!h)h=Math.round(crop.h*w/crop.w);else if(h&&!w)w=Math.round(crop.w*h/crop.h);
  w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));
  const rot=((Number(opts.rotate)||0)%360+360)%360,swap=rot===90||rot===270;
  const c=document.createElement("canvas");c.width=swap?h:w;c.height=swap?w:h;
  const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(rot*Math.PI/180);
  const sx=opts.flip==="h"||opts.flip==="both"?-1:1,sy=opts.flip==="v"||opts.flip==="both"?-1:1;ctx.scale(sx,sy);
  ctx.drawImage(img,crop.x,crop.y,crop.w,crop.h,-w/2,-h/2,w,h);ctx.restore();return c;
}
const canvasBlob=(c,m,q)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("Canvas export failed")),m,q));
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
async function addDpiMetadata(blob,dpi,mime){
  const d=Math.max(1,Math.round(dpi)); const buf=new Uint8Array(await blob.arrayBuffer());
  if(mime==="image/jpeg"&&buf[0]===255&&buf[1]===216){
    // Update the standard JFIF density fields, or insert a JFIF APP0 segment.
    if(buf[2]===255&&buf[3]===224&&buf[6]===74&&buf[7]===70&&buf[8]===73&&buf[9]===70&&buf[10]===0){
      const out=buf.slice();out[13]=1;out[14]=(d>>>8)&255;out[15]=d&255;out[16]=(d>>>8)&255;out[17]=d&255;return new Blob([out],{type:mime});
    }
    const app=new Uint8Array([255,224,0,16,74,70,73,70,0,1,1,1,(d>>>8)&255,d&255,(d>>>8)&255,d&255,0,0]);
    const out=new Uint8Array(buf.length+18);out.set(buf.slice(0,2),0);out.set(app,2);out.set(buf.slice(2),20);return new Blob([out],{type:mime});
  }
  if(mime==="image/png"&&buf.length>24&&buf[0]===137&&buf[1]===80&&buf[2]===78&&buf[3]===71){
    const ppm=Math.max(1,Math.round(d/0.0254));const data=new Uint8Array(9);const dv=new DataView(data.buffer);dv.setUint32(0,ppm);dv.setUint32(4,ppm);data[8]=1;
    const type=new TextEncoder().encode("pHYs"),chunkData=new Uint8Array(21);const cdv=new DataView(chunkData.buffer);cdv.setUint32(0,9);chunkData.set(type,4);chunkData.set(data,8);cdv.setUint32(17,crc32(chunkData.slice(4,17)));
    const out=new Uint8Array(buf.length+21);out.set(buf.slice(0,8),0);out.set(chunkData,8);out.set(buf.slice(8),29);return new Blob([out],{type:mime});
  }
  return blob;
}
function targetKB(){const v=$("#targetKB")?.value||"";return v==="custom"?Math.max(1,Number($("#customKB")?.value)||100):(v?Number(v):null)}
let manualCropRect=null,cropDrag=null;
function openManualCrop(){if(!selectedFiles.length)return setStatus("Upload an image before manual cropping.","err");const m=$("#cropModal"),im=$("#cropImage"),sel=$("#cropSelection");const u=URL.createObjectURL(selectedFiles[0]);im.onload=()=>{URL.revokeObjectURL(u);m.hidden=false;manualCropRect=null;sel.hidden=true};im.src=u}
function setupManualCrop(){const b=$("#manualCropBtn"),m=$("#cropModal"),cl=$("#cropClose"),rs=$("#cropReset"),ap=$("#cropApply"),st=$("#cropStage"),im=$("#cropImage"),sel=$("#cropSelection");if(!b||!st)return;b.onclick=openManualCrop;cl.onclick=()=>m.hidden=true;rs.onclick=()=>{manualCropRect=null;sel.hidden=true};st.onpointerdown=e=>{if(e.target!==im&&e.target!==sel)return;const r=im.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;cropDrag={sx:x,sy:y,ex:x,ey:y};manualCropRect={x,y,w:1,h:1};sel.hidden=false;drawCropSelection();st.setPointerCapture?.(e.pointerId)};st.onpointermove=e=>{if(!cropDrag)return;const r=im.getBoundingClientRect();cropDrag.ex=Math.max(0,Math.min(r.width,e.clientX-r.left));cropDrag.ey=Math.max(0,Math.min(r.height,e.clientY-r.top));manualCropRect={x:Math.min(cropDrag.sx,cropDrag.ex),y:Math.min(cropDrag.sy,cropDrag.ey),w:Math.abs(cropDrag.ex-cropDrag.sx),h:Math.abs(cropDrag.ey-cropDrag.sy)};drawCropSelection()};st.onpointerup=()=>cropDrag=null;ap.onclick=()=>{if(!manualCropRect||manualCropRect.w<3||manualCropRect.h<3)return setStatus("Drag over the image to select a crop area.","err");window.__manualCrop=manualCropRect;window.__manualCropDisplay={w:im.clientWidth,h:im.clientHeight};$("#crop").value="manual";m.hidden=true;setStatus("Manual crop applied. Run the tool to process it.","ok")}}
function drawCropSelection(){const s=$("#cropSelection");if(!s||!manualCropRect)return;s.hidden=false;s.style.left=manualCropRect.x+"px";s.style.top=manualCropRect.y+"px";s.style.width=manualCropRect.w+"px";s.style.height=manualCropRect.h+"px"}
function options(){
  const unit=$("#unit")?.value||"px",dpi=getDpi();
  return {width:unitToPx(Number($("#width")?.value)||0,unit,dpi),height:unitToPx(Number($("#height")?.value)||0,unit,dpi),dpi,aspect:$("#aspect")?.checked!==false,crop:$("#crop")?.value||"none",rotate:Number($("#rotate")?.value||0),flip:$("#flip")?.value||"none",mime:$("#format")?.value||"image/jpeg",quality:Number($("#quality")?.value||90)/100,targetKB:targetKB()};
}
async function fitToTarget(file,target,width,height,mime,opts,quality){
  const limit=Math.max(1024,Math.floor(target*1024));let canvas=await canvasFor(file,width,height,opts),best=null,bestSize=Infinity;
  for(let pass=0;pass<12;pass++){
    let lo=.02,hi=Math.max(.05,quality);
    for(let i=0;i<16;i++){
      const q=(lo+hi)/2,b=await canvasBlob(canvas,mime,q);
      if(b.size<bestSize){best=b;bestSize=b.size}
      if(b.size>limit)hi=q;else lo=q;
    }
    if(bestSize<=limit)return{blob:best,within:true,canvas};
    const factor=Math.max(.42,Math.min(.9,Math.sqrt(limit/Math.max(bestSize,1))*0.97));
    const nw=Math.max(24,Math.floor(canvas.width*factor)),nh=Math.max(24,Math.floor(canvas.height*factor));
    if(nw===canvas.width&&nh===canvas.height)break;
    canvas=await canvasFor(file,nw,nh,{...opts,crop:"none"});
  }
  const fallback=await canvasBlob(canvas,mime,.02);return{blob:fallback,within:fallback.size<=limit,canvas};
}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
async function downloadMany(items){
  if(items.length===1){downloadBlob(items[0].blob,items[0].name);return}
  try{
    const JSZip=await new Promise((res,rej)=>{if(window.JSZip)return res(window.JSZip);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";s.onload=()=>res(window.JSZip);s.onerror=rej;document.head.appendChild(s)});
    const zip=new JSZip();items.forEach(x=>zip.file(x.name,x.blob));downloadBlob(await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),"formtools-images.zip");
  }catch{items.forEach((x,i)=>setTimeout(()=>downloadBlob(x.blob,x.name),i*250))}
}
function relatedTools(){
  const box=document.querySelector(".toolbox");if(!box||!$("#fileInput")||box.parentElement?.querySelector(".related-tools"))return;
  const links=[
    ["/image-resizer/","Image Resizer"],["/image-compressor/","Image Compressor"],["/compress-image-to-20kb/","Compress to 20KB"],["/compress-image-to-50kb/","Compress to 50KB"],["/compress-image-to-100kb/","Compress to 100KB"],["/compress-jpg-to-20kb/","JPG to 20KB"],["/compress-jpg-to-50kb/","JPG to 50KB"],["/compress-jpg-to-100kb/","JPG to 100KB"],["/background-remover/","Background Remover"],["/passport-photo-maker/","Passport Photo Maker"],["/signature-resizer/","Signature Resizer"],["/image-tools/","All Image Tools"]
  ];
  const parent=box.parentElement;const layout=document.createElement("div");layout.className="tool-layout";parent.insertBefore(layout,box);layout.appendChild(box);
  const aside=document.createElement("aside");aside.className="related-tools card";aside.innerHTML=`<h2>Related Image Tools</h2><p>More browser-based tools you may need.</p><nav>${links.map(([u,t])=>`<a href="${u}">${t}</a>`).join("")}</nav>`;layout.appendChild(aside);
}
function showComparison(originals,items){const p=$("#comparison");if(!p)return;p.innerHTML="";originals.forEach((f,i)=>{const o=items[i],c=document.createElement("article");c.className="compare-card";const g=document.createElement("div");g.className="compare-grid";const a=document.createElement("div"),b=document.createElement("div"),ai=document.createElement("img"),bi=document.createElement("img");ai.src=URL.createObjectURL(f);bi.src=URL.createObjectURL(o.blob);ai.alt="Original image";bi.alt="Processed image";a.innerHTML="<strong>Before</strong>";a.append(ai);b.innerHTML="<strong>After</strong>";b.append(bi);g.append(a,b);const info=document.createElement("div");info.className="compare-info";const saved=Math.max(0,(1-o.blob.size/f.size)*100);info.innerHTML=`<div><b>Original</b><br>${f.name}<br>${(f.size/1024).toFixed(1)} KB</div><div><b>Output</b><br>${o.name}<br>${(o.blob.size/1024).toFixed(1)} KB</div><div><b>Change</b><br>${saved.toFixed(1)}% smaller</div>`;c.append(g,info);p.append(c)})}
async function showComparison(originals,items){const p=$("#comparison");if(!p)return;p.innerHTML="";for(let i=0;i<originals.length;i++){const f=originals[i],o=items[i],im=await loadImage(o.blob),c=document.createElement("article");c.className="compare-card";const g=document.createElement("div");g.className="compare-grid";const a=document.createElement("div"),b=document.createElement("div"),ai=document.createElement("img"),bi=document.createElement("img");ai.src=URL.createObjectURL(f);bi.src=URL.createObjectURL(o.blob);ai.alt="Original image before editing";bi.alt="Processed image after editing";a.innerHTML="<strong>Original Image (Before)</strong>";a.append(ai);b.innerHTML="<strong>Processed Image (After)</strong>";b.append(bi);g.append(a,b);const saved=Math.max(0,(1-o.blob.size/f.size)*100);const info=document.createElement("div");info.className="compare-info";info.innerHTML=`<div><b>Original</b><br>File: ${f.name}<br>Type: ${f.type||"Image"}<br>Dimensions: ${await imageDimensions(f)}<br>File size: ${(f.size/1024).toFixed(1)} KB (${f.size.toLocaleString()} bytes)<br>Aspect ratio: ${(await imageRatio(f)).toFixed(3)}</div><div><b>After editing</b><br>File: ${o.name}<br>Type: ${o.blob.type||"Image"}<br>Dimensions: ${im.naturalWidth} × ${im.naturalHeight} px<br>File size: ${(o.blob.size/1024).toFixed(1)} KB (${o.blob.size.toLocaleString()} bytes)<br>Aspect ratio: ${(im.naturalWidth/im.naturalHeight).toFixed(3)}</div><div><b>Result</b><br>${saved.toFixed(1)}% smaller<br>Quality: ${$("#quality")?.value||"—"}%<br>DPI: ${getDpi()}<br>Target: ${$("#targetKB")?.value&&$("#targetKB").value!=="custom"?$("#targetKB").value+" KB":"Custom / none"}</div>`;c.append(g,info);p.append(c)}}
async function imageDimensions(f){const im=await loadImage(f);return `${im.naturalWidth} × ${im.naturalHeight} px`}
async function imageRatio(f){const im=await loadImage(f);return im.naturalWidth/im.naturalHeight}
async function processImages(){
  if(!selectedFiles.length)return setStatus("Please upload at least one image first.","err");
  const o=options(),p=location.pathname.toLowerCase();let target=o.targetKB;
  const preset=p.match(/(?:compress-image|compress-jpg)-to-(20|50|100)kb/);if(preset)target=Number(preset[1]);
  if(p.includes("compress-jpg"))o.mime="image/jpeg";
  if(p.includes("140x60")){o.width=140;o.height=60}
  if(p.includes("passport-photo-maker")&&!o.width&&!o.height){o.width=413;o.height=531;o.dpi=300}
  if(o.aspect&&o.width&&!o.height&&sourceAspect)o.height=Math.round(o.width/sourceAspect);
  if(o.aspect&&o.height&&!o.width&&sourceAspect)o.width=Math.round(o.height*sourceAspect);
  setStatus("Processing locally in your browser…");
  const items=[];
  for(let i=0;i<selectedFiles.length;i++){
    const f=selectedFiles[i];let result;
    if(target){result=await fitToTarget(f,target,o.width,o.height,o.mime,{crop:o.crop,rotate:o.rotate,flip:o.flip},o.quality);result.blob=await addDpiMetadata(result.blob,o.dpi,o.mime);}
    else{const c=await canvasFor(f,o.width,o.height,{crop:o.crop,rotate:o.rotate,flip:o.flip});result={blob:await addDpiMetadata(await canvasBlob(c,o.mime,o.quality),o.dpi,o.mime),within:true,canvas:c}}
    const ext=o.mime==="image/png"?"png":o.mime==="image/webp"?"webp":"jpg";items.push({blob:result.blob,name:`formtools-${i+1}.${ext}`});
    setStatus(`Processed ${i+1}/${selectedFiles.length} • ${(result.blob.size/1024).toFixed(1)} KB${target?` • target ${target} KB${result.within?" ✓":" • closest practical result"}`:""}`);
  }
  await downloadMany(items);setStatus(`Done • ${items.length} image(s) processed. Download started.` ,"ok");
}
document.addEventListener("DOMContentLoaded",()=>{injectAdvancedControls();setupUploader();setupManualCrop();relatedTools();$("#processBtn")?.addEventListener("click",processImages)});

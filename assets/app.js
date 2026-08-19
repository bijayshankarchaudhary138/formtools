const $=s=>document.querySelector(s);
let selectedFiles=[];
const objectUrls=new Set();
function setStatus(message,type=""){const el=$("#status");if(!el)return;el.textContent=message;el.className="status "+type}
function revokeAll(){for(const u of objectUrls)URL.revokeObjectURL(u);objectUrls.clear()}
function setupUploader(){
 const zone=$("#dropzone"),input=$("#fileInput"); if(!zone||!input)return;
 zone.addEventListener("click",()=>input.click());
 ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add("drag")}));
 ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove("drag")}));
 zone.addEventListener("drop",e=>{if(e.dataTransfer?.files?.length)loadFiles(e.dataTransfer.files)});
 input.addEventListener("change",()=>loadFiles(input.files));
}
function loadFiles(list){
 revokeAll(); selectedFiles=[...list].filter(f=>f.type.startsWith("image/"));
 const preview=$("#preview");if(preview)preview.innerHTML="";
 selectedFiles.slice(0,12).forEach(file=>{const img=document.createElement("img");img.alt=file.name;const u=URL.createObjectURL(file);objectUrls.add(u);img.src=u;preview?.appendChild(img)});
 setStatus(`${selectedFiles.length} image(s) selected.`);
}
function canvasFor(file,width,height){return new Promise((resolve,reject)=>{
 const img=new Image(),u=URL.createObjectURL(file);
 img.onload=()=>{URL.revokeObjectURL(u);let w=img.naturalWidth,h=img.naturalHeight;
 if(width&&height){w=width;h=height}else if(width){h=Math.round(h*width/w);w=width}else if(height){w=Math.round(w*height/h);h=height}
 const c=document.createElement("canvas");c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));
 const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.drawImage(img,0,0,c.width,c.height);resolve(c)};
 img.onerror=e=>{URL.revokeObjectURL(u);reject(e)};img.src=u;
})}
const canvasBlob=(c,m,q)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("Canvas export failed")),m,q));

async function fitToTarget(file,targetKB,width,height,mime){
 const target=Math.max(1024,Math.floor(targetKB*1024));
 let canvas=await canvasFor(file,width,height), best=null, bestSize=Infinity;
 for(let pass=0;pass<10;pass++){
   let lo=.03,hi=.97;
   for(let i=0;i<14;i++){
     const q=(lo+hi)/2,b=await canvasBlob(canvas,mime,q);
     if(b.size<bestSize){best=b;bestSize=b.size}
     if(b.size>target)hi=q;else{best=b;bestSize=b.size;lo=q}
   }
   if(bestSize<=target)return {blob:best,within:true,canvas};
   // Reduce pixel area when quality alone cannot reach target.
   const factor=Math.max(.48,Math.min(.88,Math.sqrt(target/Math.max(bestSize,1))*0.96));
   const nw=Math.max(24,Math.floor(canvas.width*factor)),nh=Math.max(24,Math.floor(canvas.height*factor));
   if(nw===canvas.width&&nh===canvas.height)break;
   canvas=await canvasFor(file,nw,nh);
 }
 const fallback=await canvasBlob(canvas,mime,.03);
 return {blob:fallback,within:fallback.size<=target,canvas};
}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
async function downloadMany(items,zipName){
 if(items.length===1){downloadBlob(items[0].blob,items[0].name);return}
 const JSZip=await new Promise((res,rej)=>{if(window.JSZip)return res(window.JSZip);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";s.onload=()=>res(window.JSZip);s.onerror=rej;document.head.appendChild(s)});
 const zip=new JSZip();items.forEach(x=>zip.file(x.name,x.blob));downloadBlob(await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),zipName);
}
async function processImages(){
 if(!selectedFiles.length)return setStatus("Please upload an image first.","err");
 const path=location.pathname,width=parseInt($("#width")?.value||"0",10)||null,height=parseInt($("#height")?.value||"0",10)||null;
 let target=parseInt($("#targetKB")?.value||"0",10)||null;
 if(path.includes("50kb"))target=50;if(path.includes("20kb"))target=20;if(path.includes("100kb"))target=100;
 const jpgOnly=path.includes("compress-jpg-to-");
 let mime=jpgOnly?"image/jpeg":($("#format")?.value||"image/jpeg");
 if(mime==="image/png"&&target)mime="image/jpeg"; // JPEG is the practical target-KB format.
 if(path.includes("140x60")){width=140;height=60}
 // Passport standard 35x45 mm at 300dpi if the user leaves dimensions blank.
 if(path.includes("passport-photo-maker")&&!width&&!height){width=413;height=531}
 setStatus("Processing…");
 const items=[];
 for(let i=0;i<selectedFiles.length;i++){
   const f=selectedFiles[i];
   let result;
   if(target) result=await fitToTarget(f,target,width,height,mime);
   else result={blob:await canvasBlob(await canvasFor(f,width,height),mime,.92),within:true};
   const ext=mime==="image/png"?"png":"jpg";
   items.push({blob:result.blob,name:`formtools-${i+1}.${ext}`});
   const kb=(result.blob.size/1024).toFixed(1);
   setStatus(`Processed ${i+1}/${selectedFiles.length} • ${kb} KB${target?` • target ${target} KB${result.within?" ✓":" • closest possible"}`:""}`);
 }
 await downloadMany(items,"formtools-images.zip");
 setStatus(`Done • ${items.length} file(s) processed and ready to download.`,"ok");
}
document.addEventListener("DOMContentLoaded",()=>{setupUploader();$("#processBtn")?.addEventListener("click",processImages)});

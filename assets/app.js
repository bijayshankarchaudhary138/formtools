
const $ = s => document.querySelector(s);
let selectedFiles = [];

function setStatus(message, type=""){
  const el=$("#status");
  if(!el) return;
  el.textContent=message;
  el.className="status "+type;
}

function setupUploader(){
  const zone=$("#dropzone"), input=$("#fileInput");
  if(!zone || !input) return;
  zone.addEventListener("click",()=>input.click());
  input.addEventListener("change",()=>loadFiles(input.files));
  ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{
    e.preventDefault(); zone.classList.add("drag");
  }));
  ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{
    e.preventDefault(); zone.classList.remove("drag");
  }));
  zone.addEventListener("drop",e=>loadFiles(e.dataTransfer.files));
}

function loadFiles(list){
  selectedFiles=[...list];
  const preview=$("#preview");
  if(preview) preview.innerHTML="";
  selectedFiles.forEach(file=>{
    if(file.type.startsWith("image/")){
      const img=document.createElement("img");
      img.alt=file.name;
      img.src=URL.createObjectURL(file);
      preview?.appendChild(img);
    }
  });
  setStatus(`${selectedFiles.length} file(s) selected.`);
}

function canvasFor(file,width,height){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      let w=img.naturalWidth,h=img.naturalHeight;
      if(width && height){w=width;h=height}
      else if(width){h=Math.round(h*width/w);w=width}
      else if(height){w=Math.round(w*height/h);h=height}
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,w);canvas.height=Math.max(1,h);
      const ctx=canvas.getContext("2d");
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas);
    };
    img.onerror=reject;
    img.src=URL.createObjectURL(file);
  });
}

function canvasBlob(canvas,mime,quality){
  return new Promise(resolve=>canvas.toBlob(resolve,mime,quality));
}

async function compressToTarget(file,targetKB,width,height,mime){
  const canvas=await canvasFor(file,width,height);
  let low=0.08,high=0.96,best=null;
  for(let i=0;i<14;i++){
    const q=(low+high)/2;
    const blob=await canvasBlob(canvas,mime,q);
    if(!blob) break;
    if(!targetKB || blob.size<=targetKB*1024){
      best=blob;low=q;
    }else high=q;
  }
  if(!best) best=await canvasBlob(canvas,mime,0.08);
  return best;
}

async function processImages(){
  if(!selectedFiles.length){setStatus("Please upload an image first.","err");return}
  const path=location.pathname;
  const width=parseInt($("#width")?.value||"0",10)||null;
  const height=parseInt($("#height")?.value||"0",10)||null;
  let target=parseInt($("#targetKB")?.value||"0",10)||null;

  if(path.includes("140x60")){ // exact preset
    target=target||null;
  }
  if(path.includes("50kb")) target=50;
  if(path.includes("20kb")) target=20;
  if(path.includes("100kb")) target=100;

  const mime=$("#format")?.value || "image/jpeg";
  setStatus("Processing…");

  for(let i=0;i<selectedFiles.length;i++){
    const f=selectedFiles[i];
    let w=width,h=height;
    if(path.includes("140x60")){w=140;h=60}
    const blob=await compressToTarget(f,target,w,h,mime);
    const ext=mime==="image/png"?"png":"jpg";
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`formtools-${i+1}.${ext}`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  }
  setStatus(`Done. ${selectedFiles.length} file(s) processed.`,"ok");
}

document.addEventListener("DOMContentLoaded",()=>{
  setupUploader();
  $("#processBtn")?.addEventListener("click",processImages);
});

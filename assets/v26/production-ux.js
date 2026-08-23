
/* V26: shared production UX helpers */
(function(){
"use strict";
window.FT26 = {
  clamp:function(v,a,b){v=Number(v);return Math.min(b,Math.max(a,isFinite(v)?v:a));},
  kbLabel:function(v){return v ? "Compress to "+v+" KB" : "Compress Image";},
  setStatus:function(el,msg,type){if(!el)return;el.textContent=msg||"";el.dataset.type=type||"info";},
  fileInfo:function(file){
    if(!file)return null;
    return {name:file.name,type:file.type||"unknown",bytes:file.size,width:null,height:null};
  },
  readImage:function(file){
    return new Promise(function(resolve,reject){
      if(!file || !/^image\//.test(file.type)){reject(new Error("Please select an image file."));return;}
      var u=URL.createObjectURL(file), img=new Image();
      img.onload=function(){var r={url:u,width:img.naturalWidth,height:img.naturalHeight};resolve(r);};
      img.onerror=function(){URL.revokeObjectURL(u);reject(new Error("The image could not be read."));};
      img.src=u;
    });
  }
};
document.addEventListener("DOMContentLoaded",function(){
  document.querySelectorAll('input[id*="target" i][id*="kb" i],input[name*="target" i][name*="kb" i]').forEach(function(inp){
    var btn=document.querySelector('[data-compress-target],button[id*="compress" i],button[class*="compress" i]');
    if(!btn)return;
    function sync(){btn.textContent=FT26.kbLabel(inp.value);}
    inp.addEventListener("input",sync);inp.addEventListener("change",sync);sync();
  });
});
})();

//Shorter name
function dg(s){
  return document.getElementById(s);
}

onloadFuncs.push(function(){
  dg("tagnum").onchange=function (){};
  dg("criteria").onchange=function (){
    if (dg("criteria").value=="Combo color"){
      dg("tagnum").value=components.combo;
      dg("tagnum").readOnly=true;
      toggleclass("tagnum","readonly",true);
    }else{
      dg("tagnum").readOnly=false;
      toggleclass("tagnum","readonly",false);
    }
  };
  dg("HP").oninput=function (){
    dg("HPl").textContent=dg("HP").value;
  };
  dg("CS").oninput=function (){
    dg("CSl").textContent=dg("CS").value;
  };
  dg("OD").oninput=function (){
    if (components.AR===undefined) dg("ARl").textContent=dg("AR").value=dg("OD").value;
    dg("ODl").textContent=dg("OD").value;
  };
  dg("AR").oninput=function (){
    if (components.AR===undefined) dg("AR").value=dg("OD").value;
    dg("ARl").textContent=dg("AR").value;
  };
});

function HSVtoRGB(h,s,v) {
  var r,g,b,i,f,p,q,t;
  if (arguments.length === 1) {
    s=h.s,v=h.v,h=h.h;
  }
  i=Math.floor(h*6);
  f=h*6-i;
  p=v*(1-s);
  q=v*(1-f*s);
  t=v*(1-(1-f)*s);
  switch (i%6){
    case 0:r=v,g=t,b=p;break;
    case 1:r=q,g=v,b=p;break;
    case 2:r=p,g=v,b=t;break;
    case 3:r=p,g=q,b=v;break;
    case 4:r=t,g=p,b=v;break;
    case 5:r=v,g=p,b=q;break;
  }
  return {
    r:Math.round(r*255),
    g:Math.round(g*255),
    b:Math.round(b*255)
  };
}

function rainbowColor(n,l){
  return HSVtoRGB(n/l,1,1);
}
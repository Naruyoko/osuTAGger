//Shorter name
function dg(s){
  return document.getElementById(s);
}
function toggleclass(x,c,t){
  if (typeof x!="object"){
    x=dg(x);
  }
  var o=x.className;
  if (!t){
    x.className=o.replace(new RegExp(c,"g"),"");
  }else if (x.className.search(c)==-1){
    x.className+=" "+c;
  }
  o=x.className;
  x.className=o.replace(/  /g," ");
}

var file=null;
var reader=new FileReader();
var importedFileContent="";
var onloadFuncs=[];
onloadFuncs.push(function(){
  //Check for API support
  if (!(window.File&&window.FileReader&&window.FileList&&window.Blob)){
    var error="File APIs are not fully supported in this browser!";
    alert(error);
    console.error(error);
  }
});
window.onload=function(){
  for (var i of onloadFuncs) i();
};

function textToFile(str){
  var file=new Blob([str],{type:"text/plain;charset=UTF-8;"});
  return file;
}

//file import
function onupload(){
  file=dg("upload").files[0];
}
function readFile(){
  dg("loading").style.display="";
  reader.readAsArrayBuffer(file,"UTF-8");
}
reader.onload=function(e){
  var t=new Date();
  importedFileContent=arrayBufferToString(reader.result);
  t=new Date()-t;
  var q=reader.result.byteLength;
  var d=q/t;
  console.log("File imported");
  console.log("Length: "+q+" bytes");
  console.log("        "+importedFileContent.length+" chars");
  console.log("Load time: "+t+"ms");
  console.log(d+" Bps");
  try{
    readComponents();
  }catch(e){
    dg("loading").style.display="none";
    dg("s2").style.display="none";
    dg("s3").style.display="none";
    throw e;
  }finally{
    displayComponents();
    dg("loading").style.display="none";
    dg("s2").style.display="";
    dg("s3").style.display="none";
  }
};
function arrayBufferToString(s){
  var f=new Uint8Array(s);
  var r="";
  for (var i=0;i<f.length;i++){
    var c=f[i];
    if (!(c&128)){
      c=c&127;
    }else if (!(c&32)){
      c=c&31;
      c<<=6;
      i++;
      c+=f[i]&63;
    }else if (!(c&16)){
      c=c&15;
      c<<=6;
      i++;
      c+=f[i]&63;
      c<<=6;
      i++;
      c+=f[i]&63;
    }else if (!(c&8)){
      c=c&7;
      c<<=6;
      i++;
      c+=f[i]&63;
      c<<=6;
      i++;
      c+=f[i]&63;
      c<<=6;
      i++;
      c+=f[i]&63;
    }
    r+=String.fromCharCode(c);
  }
  return r;
}

var components=null;

//process osu file
function readComponents(){
  components={};
  components.fileName=file.name;
  var f=importedFileContent;
  var indexOfLF=f.indexOf("\n",1);
  if (indexOfLF==-1){
    if (f.indexOf("\r")!=-1) components.lineBreak="\r";
    else components.lineBreak="\n";
  }else if (f[indexOfLF-1]=="\r") components.lineBreak="\r\n";
  else components.lineBreak="\n";
  var s=f.split(components.lineBreak);
  for (var a in s){
    a=+a;
    var l=s[a];
    if (l.substring(0,15)=="osu file format"){
      if (components.header!==undefined) throw Error("Duplicate header");
      components.header=a;
    }else if (l=="[General]"){
      if (components.general!==undefined) throw Error("Duplicate [General]");
      components.general=a;
    }else if (l=="[Editor]"){
      if (components.editor!==undefined) throw Error("Duplicate [Editor]");
      components.editor=a;
    }else if (l=="[Metadata]"){
      if (components.metadata!==undefined) throw Error("Duplicate [Metadata]");
      components.metadata=a;
    }else if (l=="[Difficulty]"){
      if (components.difficulty!==undefined) throw Error("Duplicate [Difficulty]");
      components.difficulty=a;
    }else if (l=="[Events]"){
      if (components.events!==undefined) throw Error("Duplicate [Events]");
      components.events=a;
    }else if (l=="[TimingPoints]"){
      if (components.timingPoints!==undefined) throw Error("Duplicate [TimingPoints]");
      components.timingPoints=a;
    }else if (l=="[Colours]"){
      if (components.colours!==undefined) throw Error("Duplicate [Colours]");
      components.colours=a;
    }else if (l=="[HitObjects]"){
      if (components.hitObjects!==undefined) throw Error("Duplicate [HitObjects]");
      components.hitObjects=a;
    }else if (l.substring(0,6)=="Title:"){
      if (components.metadata===undefined) throw Error("Unexpected title");
      components.title=a;
    }else if (l.substring(0,13)=="TitleUnicode:"){
      if (components.metadata===undefined) throw Error("Unexpected title (Unicode)");
      components.titleUnicode=a;
    }else if (l.substring(0,7)=="Artist:"){
      if (components.metadata===undefined) throw Error("Unexpected artist");
      components.artist=a;
    }else if (l.substring(0,14)=="ArtistUnicode:"){
      if (components.metadata===undefined) throw Error("Unexpected artist (Unicode)");
      components.artistUnicode=a;
    }else if (l.substring(0,8)=="Creator:"){
      if (components.metadata===undefined) throw Error("Unexpected creator");
      components.creator=a;
    }else if (l.substring(0,8)=="Version:"){
      if (components.metadata===undefined) throw Error("Unexpected difficulty name");
      components.version=a;
    }else if (l.substring(0,12)=="HPDrainRate:"){
      if (components.difficulty===undefined) throw Error("Unexpected HP");
      components.HP=a;
    }else if (l.substring(0,11)=="CircleSize:"){
      if (components.difficulty===undefined) throw Error("Unexpected CS");
      components.CS=a;
    }else if (l.substring(0,18)=="OverallDifficulty:"){
      if (components.difficulty===undefined) throw Error("Unexpected OD");
      components.OD=a;
    }else if (l.substring(0,13)=="ApproachRate:"){
      if (components.difficulty===undefined) throw Error("Unexpected AR");
      components.AR=a;
    }
  }
  if (components.colours!==undefined){
    components.combo=0;
    for (var i=components.colours;i<components.hitObjects;i++){
      l=s[i];
      if (l.substring(0,5)=="Combo"){
        components.combo++;
        if (l[5]!=components.combo) throw Error("Unexpected Combo"+l[5]);
      }
    }
  }else{
    components.combo=4;
  }
}

function displayComponents(){
  var f=importedFileContent;
  var s=f.split(components.lineBreak);
  dg("title").textContent=s[components.title].substring(6);
  dg("titleUnicode").textContent=s[components.titleUnicode].substring(13);
  dg("artist").textContent=s[components.artist].substring(7);
  dg("artistUnicode").textContent=s[components.artistUnicode].substring(14);
  dg("creator").textContent=s[components.creator].substring(8);
  dg("version").textContent=s[components.version].substring(8);
  dg("HP").value=dg("HPl").textContent=dg("HPd").textContent=s[components.HP].substring(12);
  dg("CS").value=dg("CSl").textContent=dg("CSd").textContent=s[components.CS].substring(11);
  dg("OD").value=dg("ODl").textContent=dg("ODd").textContent=s[components.OD].substring(18);
  dg("AR").value=dg("ARl").textContent=dg("ARd").textContent=s[components.AR].substring(13);
  dg("difname").value=s[components.version].substring(8)+" Player [#]";
}

onloadFuncs.push(function (){
  dg("generatefile").onclick=function (){
    dg("generating").style.display="";
    try{
      generateFile();
    }catch(e){
      dg("generating").style.display="none";
      dg("s3").style.display="none";
      throw e;
    }finally{
      dg("generating").style.display="none";
      dg("s3").style.display="";
    }
  };
});

function generateFile(){
  var f=importedFileContent;
  var s=f.split(components.lineBreak);
  var m=dg("tagnum").value;
  if (dg("difname").value.indexOf("[#]")==-1){
    dg("playernumnotfound").style.display="";
    throw Error("You need player number in difficulty name");
  }else{
    var difname=dg("difname").value;
    dg("playernumnotfound").style.display="none";
  }
  var f=splitFile();
  var p=dg("s3");
  while (p.firstChild) p.removeChild(p.firstChild);
  if (dg("downloadtype").value=="Separate files"){
    for (var i=0;i<m;i++){
      var e=document.createElement("A");
      var name=difname.replace(new RegExp("\\[#\\]","g"),i+1);
      e.textContent=name;
      e.href=URL.createObjectURL(textToFile(f[i]));
      e.download=components.fileName.substring(0,components.fileName.lastIndexOf("["+s[components.version].substring(8)+"]"))+"["+name+"].osu";
      p.appendChild(e);
      p.appendChild(document.createElement("BR"));
    }
  }else if (dg("downloadtype").value=="zip"){
    var z=new JSZip();
    for (var i=0;i<m;i++){
      var name=difname.replace(new RegExp("\\[#\\]","g"),i+1);
      z.file(components.fileName.substring(0,components.fileName.lastIndexOf("["+s[components.version].substring(8)+"]"))+"["+name+"].osu",f[i]);
    }
    z.generateAsync({type:"blob"}).then(function (content){
      var e=document.createElement("A");
      e.textContent=components.fileName.substring(0,components.fileName.lastIndexOf(".osu"))+".zip";
      e.href=URL.createObjectURL(content);
      e.download=components.fileName.substring(0,components.fileName.lastIndexOf(".osu"))+".zip";
      p.appendChild(e);
    });
  }
}

function splitFile(){
  var f=importedFileContent;
  var s=f.split(components.lineBreak);
  var a=[];
  var m=dg("tagnum").value;
  if (dg("difname").value.indexOf("[#]")==-1){
    dg("playernumnotfound").style.display="";
    throw Error("You need player number in difficulty name");
  }else{
    var difname=dg("difname").value;
    dg("playernumnotfound").style.display="none";
  }
  for (var i=0;i<m;i++){
    var b=s.slice(0,components.hitObjects);
    b[components.version]="Version:"+difname.replace(new RegExp("\\[#\\]","g"),i+1);
    b[components.HP]="HPDrainRate:"+dg("HP").value;
    b[components.CS]="CircleSize:"+dg("CS").value;
    b[components.OD]="OverallDifficulty:"+dg("OD").value;
    b[components.AR]="ApproachRate:"+dg("AR").value;
    a.push(b);
  }
  if (components.colours&&dg("color").value=="Rainbow"){
    for (i=0;i<m;i++){
      var c=rainbowColor(i,m);
      for (j=components.colours;j<components.hitObjects;j++){
        var l=a[i][j];
        if (l.substring(0,5)=="Combo"){
          a[i][j]=l.substring(0,9)+c.r+","+c.g+","+c.b;
        }
      }
    }
  }
  var n=dg("criteria").value;
  var p=-1;
  var o=[];
  for (i=0;i<m;i++) o.push(0);
  c=-1;
  for (i=components.hitObjects;i<s.length;i++){
    var l=s[i];
    if (l&&"0123456789".indexOf(l[0])!=-1){
      var t=+l.split(",")[3];
      if (t&4) c=(c+(t&4?(t>>4&7)+1:0))%components.combo;
      if (n=="New combo"){
        if (t&4){
          p=(p+1)%m;
        }
      }else if (n=="Every object"){
        p=(p+1)%m;
      }else if (n=="Combo color"){
        if (t&4){
          p=(p+(t>>4&7)+1)%m;
        }
      }
      if (dg("spinners").checked&&t&8){
        for (j=0;j<m;j++){
          var w=l.split(",");
          w[3]=t&139|(c==o[j]?0:((c-o[j]+components.combo-1)%components.combo<<4)|4);
          a[j].push(w.join(","));
          o[j]=c;
        }
      }else{
        var w=l.split(",");
        w[3]=t&139|(c==o[p]?0:((c-o[p]+components.combo-1)%components.combo<<4)|4);
        a[p].push(w.join(","));
        o[p]=c;
      }
    }else{
      for (j=0;j<m;j++) a[j].push(l);
    }
  }
  for (i=0;i<m;i++) a[i]=a[i].join(components.lineBreak);
  return a;
}
// Orthographic textured Earth. Rotation matches d3-geo's geographic hit testing.
// GPU rendering where available, with a bounded software fallback.
export function createEarthTexture(onReady,onError=()=>{}) {
 const surface=document.createElement('canvas');
 let gl=surface.getContext('webgl',{alpha:true,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
 let program,buffer,texture,zoomLocation,rotationLocation,ready=false,disposed=false,pixels,software,output,normals,detailRequested=false;
 const detail=new Image();
 if(gl){
  try{
   const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('shader');return shader};
   const vs=compile(gl.VERTEX_SHADER,'attribute vec2 p; varying vec2 v; void main(){v=p;gl_Position=vec4(p,0.,1.);}');
   const fs=compile(gl.FRAGMENT_SHADER,`precision highp float;
    varying vec2 v; uniform sampler2D earth; uniform vec2 rotation; uniform float zoom;
    void main(){
     vec2 p=v/(0.87*zoom); float d=dot(p,p); if(d>1.0){gl_FragColor=vec4(0.);return;}
     float z=sqrt(max(0.,1.-d)); float c=cos(rotation.y),s=sin(rotation.y);
     float lon=atan(p.x,z*c+p.y*s)-rotation.x;
     float lat=asin(clamp(p.y*c-z*s,-1.,1.));
     vec3 color=texture2D(earth,vec2(fract(lon/6.28318530718+.5),.5-lat/3.14159265359)).rgb;
     float light=.46+.60*max(0.,dot(vec3(p,z),normalize(vec3(-.35,.45,1.))));
     color*=light;
     float atmosphere=pow(1.-z,3.)*.48;
     color=mix(color,vec3(.28,.67,.91),atmosphere);
     gl_FragColor=vec4(color,1.-smoothstep(.994,1.,d));
    }`);
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');
   gl.useProgram(program);zoomLocation=gl.getUniformLocation(program,'zoom');rotationLocation=gl.getUniformLocation(program,'rotation');buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  }catch{gl=null;}
 }
 if(!gl){
  software=document.createElement('canvas');software.width=software.height=280;
  const ctx=software.getContext('2d');output=ctx.createImageData(280,280);normals=[];
  for(let y=0;y<280;y++)for(let x=0;x<280;x++){
   const nx=(x+.5-140)/(280*.435),ny=(140-y-.5)/(280*.435),d=nx*nx+ny*ny;
   if(d<=1)normals.push([4*(y*280+x),nx,ny,Math.sqrt(1-d)]);
  }
 }
 const img=new Image();img.onload=()=>{
  if(disposed)return;
  if(gl){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img)}
  else{const source=document.createElement('canvas');source.width=img.width;source.height=img.height;const c=source.getContext('2d');c.drawImage(img,0,0);pixels=c.getImageData(0,0,img.width,img.height).data}
  ready=true;onReady();
 };img.onerror=()=>{if(!disposed)onError()};img.src='/assets/earth-natural.jpg';
 const requestDetail=()=>{
  if(!ready||detailRequested||!gl||gl.isContextLost()||gl.getParameter(gl.MAX_TEXTURE_SIZE)<4096)return;
  detailRequested=true;detail.onload=()=>{if(disposed||gl.isContextLost())return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,detail);onReady()};detail.src='/assets/earth-natural-hd.jpg';
 };
 return {
  requestDetail,
  draw(ctx,size,angle,latitude,zoom=1,interactive=false){
   if(!ready)return false;
   const a=angle*Math.PI/180,b=latitude*Math.PI/180;
   if(gl&&!gl.isContextLost()){
    const resolution=Math.min(800,Math.round(size*Math.min(devicePixelRatio||1,interactive?1:1.5)));
    if(surface.width!==resolution){surface.width=surface.height=resolution;gl.viewport(0,0,resolution,resolution)}
    gl.uniform1f(zoomLocation,zoom);gl.uniform2f(rotationLocation,a,b);gl.drawArrays(gl.TRIANGLES,0,6);ctx.drawImage(surface,0,0,size,size);
   }else if(software&&pixels){
    const c=Math.cos(b),s=Math.sin(b);
    for(const [i,x,y,z] of normals){
     const lon=Math.atan2(x,z*c+y*s)-a,lat=Math.asin(y*c-z*s);
     const u=((lon/(2*Math.PI)+.5)%1+1)%1,v=.5-lat/Math.PI;
     const j=4*(Math.min(img.height-1,Math.floor(v*img.height))*img.width+Math.floor(u*img.width));
     const light=.46+.60*Math.max(0,(-x*.35+y*.45+z)/1.15),haze=Math.pow(1-z,3)*.48;
     for(let k=0;k<3;k++)output.data[i+k]=pixels[j+k]*light*(1-haze)+[71,171,232][k]*haze;
     output.data[i+3]=255;
    }
    software.getContext('2d').putImageData(output,0,0);ctx.drawImage(software,size*(1-zoom)/2,size*(1-zoom)/2,size*zoom,size*zoom);
   }else return false;
   return true;
  },
  dispose(){disposed=true;img.onload=null;img.onerror=null;detail.onload=null;detail.onerror=null;if(gl){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}}
 };
}

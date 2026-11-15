import React, {useEffect, useRef, useState} from 'react';
import {geoOrthographic, geoPath, geoContains, geoCentroid, geoDistance} from 'd3-geo';
import {Pause, Play, RotateCcw, ArrowLeft, ArrowRight, Move, ZoomIn, ZoomOut} from 'lucide-react';
import countries from './countries.json';
import {createEarthTexture} from './EarthTexture';
import './refinements.css';

const text={
 ru:{eyebrow:'БЕЗ ГРАНИЦ',title:'Мир в ваших руках',hint:'Перетащите глобус. Наведите курсор на страну.',mobile:'Вращайте одним пальцем, приближайте двумя. Коснитесь страны.',pause:'Остановить вращение',play:'Продолжить вращение',reset:'Вернуть исходный вид',left:'Повернуть влево',right:'Повернуть вправо',label:'Интерактивный глобус. Перетаскивайте или используйте клавиши со стрелками.',rest:'Немного любопытства — целый мир открытий.',error:'Глобус временно недоступен.'},
 en:{eyebrow:'BEYOND BORDERS',title:'The world at your fingertips',hint:'Drag to rotate. Hover over a country.',mobile:'Drag with one finger, pinch with two to zoom. Tap a country.',pause:'Pause rotation',play:'Resume rotation',reset:'Reset globe',left:'Rotate left',right:'Rotate right',label:'Interactive globe. Drag or use the arrow keys to rotate.',rest:'A little curiosity. A whole world to explore.',error:'The globe is temporarily unavailable.'},
 az:{eyebrow:'SƏRHƏDSİZ',title:'Dünya əllərinizdə',hint:'Qlobusu sürüşdürün. Kursoru ölkənin üzərinə gətirin.',mobile:'Bir barmaqla fırladın, iki barmaqla böyüdün. Ölkəyə toxunun.',pause:'Fırlanmanı dayandır',play:'Fırlanmanı davam etdir',reset:'İlkin görünüşə qayıt',left:'Sola fırlat',right:'Sağa fırlat',label:'İnteraktiv qlobus. Sürükləyin və ya ox düymələri ilə fırladın.',rest:'Bir az maraq — kəşf ediləcək bütöv bir dünya.',error:'Qlobus müvəqqəti olaraq əlçatan deyil.'}
};

export default function WorldGlobe({lang}){
 const t=text[lang];
 const canvasRef=useRef(null),api=useRef(null);
 const [zoom,setZoom]=useState(1);
 const [paused,setPaused]=useState(false),[selected,setSelected]=useState(null),[error,setError]=useState(false);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const country=selected?.code?countries.find(c=>c.code===selected.code):null;
 useEffect(()=>{
  const canvas=canvasRef.current,ctx=canvas.getContext('2d');
  if(!ctx){setError(true);return}
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller=new AbortController();
  let magnification=1,pinch=null,pinched=false,interactionFrame=0;
  const pointers=new Map();
  let data=null,size=460,angle=-35,latitude=-18,frame=0,last=0,visible=false,hover=false,focused=false,drag=null,active=null,lastPick=0,manualPause=false,resumeAt=0;
  const projection=geoOrthographic().clipAngle(90).precision(.6);
  const path=geoPath(projection,ctx);
  const earth=createEarthTexture(()=>draw());
  const choose=(feature)=>{if(feature===active)return;active=feature;setSelected(feature?.properties||null)};
  const draw=()=>{
   ctx.clearRect(0,0,size,size);const r=size*.435*magnification,c=size/2;
   projection.translate([c,c]).scale(r).rotate([angle,latitude]);
   const ocean=ctx.createRadialGradient(c-r*.45,c-r*.5,r*.1,c,c,r);
   ocean.addColorStop(0,'#27466c');ocean.addColorStop(.7,'#152b50');ocean.addColorStop(1,'#101b39');
   ctx.beginPath();path({type:'Sphere'});ctx.fillStyle=ocean;ctx.fill();
   ctx.save();ctx.beginPath();path({type:'Sphere'});ctx.clip();
   const textured=earth.draw(ctx,size,angle,latitude,magnification);
   if(!textured&&data)for(const feature of data.features){ctx.beginPath();path(feature);ctx.fillStyle='#769d7d';ctx.fill()}
   if(active){ctx.beginPath();path(active);ctx.fillStyle='#ffffff22';ctx.fill();ctx.strokeStyle='#fff2bb';ctx.lineWidth=1.5;ctx.stroke()}
   const shade=ctx.createRadialGradient(c-r*.25,c-r*.3,r*.05,c,c,r*1.05);
   shade.addColorStop(0,'#00234500');shade.addColorStop(.6,'#00234512');shade.addColorStop(1,'#00152d18');
   ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);ctx.restore();
   ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.strokeStyle='#9ddcff88';ctx.lineWidth=1;ctx.stroke();
  };
  const tick=now=>{
   frame=0;if(!visible||document.hidden)return;
   if(now-last>=40){const dt=last?Math.min(now-last,80)/1000:0;last=now;
    if(!manualPause&&!motion.matches&&!hover&&!focused&&!drag&&now>resumeAt){angle+=dt*2;draw()}
   }
   if(!manualPause&&!motion.matches&&!hover&&!focused&&!drag)frame=requestAnimationFrame(tick);
  };
  const sync=()=>{cancelAnimationFrame(frame);last=0;draw();if(visible&&!document.hidden&&!manualPause&&!motion.matches&&!hover&&!focused&&!drag)frame=requestAnimationFrame(tick)};
  const resize=()=>{size=canvas.getBoundingClientRect().width;const ratio=Math.min(window.devicePixelRatio||1,1.6);canvas.width=Math.round(size*ratio);canvas.height=Math.round(size*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw()};
  const coords=e=>{const rect=canvas.getBoundingClientRect();return [e.clientX-rect.left,e.clientY-rect.top]};
  const pick=(e,force=false)=>{
   if(!data||(!force&&performance.now()-lastPick<65))return;lastPick=performance.now();
   const [x,y]=coords(e);if(Math.hypot(x-size/2,y-size/2)>size*.435*magnification){choose(null);draw();return}
   const location=projection.invert([x,y]);let hit=data.features.find(f=>geoContains(f,location));
   if(!hit&&e.pointerType==='touch'){let nearest=12;for(const f of data.features){const center=geoCentroid(f);if(geoDistance(center,[-angle,-latitude])>Math.PI/2)continue;const p=projection(center),distance=Math.hypot(p[0]-x,p[1]-y);if(distance<nearest){nearest=distance;hit=f}}}
   choose(hit||null);draw();
  };
  const repaint=()=>{if(!interactionFrame)interactionFrame=requestAnimationFrame(()=>{interactionFrame=0;draw()})};
  const distance=()=>{const [a,b]=Array.from(pointers.values());return Math.hypot(a.x-b.x,a.y-b.y)};
  const rebase=()=>{if(pointers.size>=2){pinch={distance:Math.max(1,distance()),zoom:magnification};pinched=true;drag={moved:true}}else if(pointers.size===1){const p=pointers.values().next().value;pinch=null;drag={...p,angle,latitude,moved:pinched}}};
  const down=e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   const [x,y]=coords(e);if(!pointers.size&&Math.hypot(x-size/2,y-size/2)>size*.435*magnification)return;
   if(!pointers.size)pinched=false;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   canvas.setPointerCapture(e.pointerId);rebase();canvas.classList.add('globe-dragging');choose(null);sync();
  };
  const move=e=>{
   if(pointers.has(e.pointerId)){
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointers.size>=2){magnification=Math.max(1,Math.min(2,pinch.zoom*distance()/pinch.distance));setZoom(Math.round(magnification*100)/100);earth.requestDetail();repaint();return}
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.abs(dx)+Math.abs(dy)>4;angle=drag.angle+dx*.35/magnification;latitude=Math.max(-70,Math.min(70,drag.latitude-dy*.3/magnification));repaint()}
   }else if(e.pointerType!=='touch'){hover=true;pick(e);sync()}
  };
  const finish=(e,cancelled=false)=>{
   if(!pointers.has(e.pointerId))return;
   const moved=drag?.moved;pointers.delete(e.pointerId);
   if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
   if(pointers.size){rebase();return}
   drag=null;pinch=null;canvas.classList.remove('globe-dragging');resumeAt=performance.now()+1800;
   if(!cancelled&&!pinched&&!moved)pick(e,true);
   pinched=false;if(e.pointerType==='touch'){hover=false;focused=false;}sync();
  };
  const up=e=>finish(e);
  const leave=e=>{hover=false;if(e.pointerType!=='touch'&&!drag)choose(null);sync()};
  const focus=()=>{focused=true;sync()};const blur=()=>{focused=false;sync()};
  const turn=(x,y=0)=>{angle+=x;latitude=Math.max(-70,Math.min(70,latitude+y));choose(null);resumeAt=performance.now()+1800;sync()};
  const key=e=>{const keys={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,10],ArrowDown:[0,-10]};if(keys[e.key]){e.preventDefault();turn(...keys[e.key])}};
  const events={pointerdown:down,pointermove:move,pointerup:up,pointercancel:e=>finish(e,true),lostpointercapture:e=>finish(e,true),pointerleave:leave,focus,blur,keydown:key};
  Object.entries(events).forEach(([name,fn])=>canvas.addEventListener(name,fn));
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()},{threshold:.02});io.observe(canvas);
  const preference=()=>{setReduced(motion.matches);sync()};motion.addEventListener('change',preference);document.addEventListener('visibilitychange',sync);
  api.current={zoom:value=>{magnification=value;if(value>1)earth.requestDetail();choose(null);sync()},pause:value=>{manualPause=value;sync()},turn,reset:()=>{angle=-35;latitude=-18;magnification=1;setZoom(1);choose(null);sync()}};
  fetch('/assets/world-countries.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('map');return r.json()}).then(value=>{data=value;draw()}).catch(e=>{if(e.name!=='AbortError')setError(true)});
  resize();
  return()=>{earth.dispose();cancelAnimationFrame(interactionFrame);controller.abort();cancelAnimationFrame(frame);ro.disconnect();io.disconnect();motion.removeEventListener('change',preference);document.removeEventListener('visibilitychange',sync);Object.entries(events).forEach(([name,fn])=>canvas.removeEventListener(name,fn));api.current=null};
 },[]);
 const changeZoom=delta=>{const value=Math.max(1,Math.min(2,Math.round((zoom+delta)*10)/10));setZoom(value);api.current?.zoom(value)};
 const zoomText=lang==='ru'?['Уменьшить','Увеличить']:lang==='az'?['Kiçilt','Böyüt']:['Zoom out','Zoom in'];
 const pause=()=>{setPaused(value=>{api.current?.pause(!value);return !value})};
 return <section id="world" className="globe-section" aria-labelledby="globe-title"><div className="container globe-layout">
  <div className="globe-copy"><span className="overline">{t.eyebrow}</span><h2 id="globe-title">{t.title}</h2><p id="globe-hint" className="globe-desktop-hint"><Move size={16}/>{t.hint}</p><p className="globe-touch-hint"><Move size={16}/>{t.mobile}</p></div>
  <div className="globe-playground"><div className="globe-orbit" aria-hidden="true"/><canvas ref={canvasRef} className="world-globe" tabIndex={0} role="img" aria-label={t.label} aria-describedby="globe-hint"/><div className="globe-ground" aria-hidden="true"/></div>
  <div className="globe-caption" role="status" aria-live="polite">{error?<span>{t.error}</span>:selected?<span className="globe-country">{country&&<img src={`/assets/flags/${country.code}.svg`} alt="" width="28" height="21"/>}{country?.labels[lang]||selected.name}</span>:<span>{t.rest}</span>}</div>
  <p className="globe-credit">{lang==='ru'?'Изображение Земли: ':lang==='az'?'Yer təsviri: ':'Earth imagery: '}<a href="https://svs.gsfc.nasa.gov/3615/" target="_blank" rel="noopener noreferrer">NASA / Goddard SVS</a></p>
  <div className="globe-controls"><button onClick={()=>changeZoom(-.2)} disabled={zoom<=1} aria-label={zoomText[0]}><ZoomOut size={18}/></button><span className="globe-zoom-value" aria-live="polite">{Math.round(zoom*100)}%</span><button onClick={()=>changeZoom(.2)} disabled={zoom>=2} aria-label={zoomText[1]}><ZoomIn size={18}/></button><button onClick={()=>api.current?.turn(-18)} aria-label={t.left}><ArrowLeft size={18}/></button>{!reduced&&<button onClick={pause} aria-label={paused?t.play:t.pause} aria-pressed={paused}>{paused?<Play size={18}/>:<Pause size={18}/>}</button>}<button onClick={()=>api.current?.turn(18)} aria-label={t.right}><ArrowRight size={18}/></button><button onClick={()=>api.current?.reset()} aria-label={t.reset}><RotateCcw size={17}/></button></div>
 </div></section>;
}

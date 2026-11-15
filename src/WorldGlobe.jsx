import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {geoOrthographic, geoPath, geoContains, geoCentroid, geoDistance} from 'd3-geo';
import {Pause, Play, RotateCcw, ArrowLeft, ArrowRight, Move, ZoomIn, ZoomOut, X} from 'lucide-react';
import countries from './countries.json';
import {createEarthTexture} from './EarthTexture';
import './globe.css';

const text={
 ru:{eyebrow:'БЕЗ ГРАНИЦ',title:'Мир в ваших руках',hint:'Наведите курсор, чтобы увидеть название. Нажмите на страну, чтобы закрепить его и приблизить глобус.',mobile:'Коснитесь страны, чтобы закрепить название. Вращайте одним пальцем, приближайте двумя или кнопками + / −.',pause:'Остановить вращение',play:'Продолжить вращение',reset:'Вернуть исходный вид',left:'Повернуть влево',right:'Повернуть вправо',label:'Интерактивный глобус. Перетаскивайте или используйте клавиши со стрелками.',rest:'Немного любопытства — целый мир открытий.',error:'Глобус временно недоступен.'},
 en:{eyebrow:'BEYOND BORDERS',title:'The world at your fingertips',hint:'Hover to see a country name. Click to pin its label, then zoom in. Drag to rotate.',mobile:'Tap a country to pin its name. Drag with one finger; pinch or use + / − to zoom.',pause:'Pause rotation',play:'Resume rotation',reset:'Reset globe',left:'Rotate left',right:'Rotate right',label:'Interactive globe. Drag or use the arrow keys to rotate.',rest:'A little curiosity. A whole world to explore.',error:'The globe is temporarily unavailable.'},
 az:{eyebrow:'SƏRHƏDSİZ',title:'Dünya əllərinizdə',hint:'Ölkənin adını görmək üçün kursoru yaxınlaşdırın. Adı sabitləmək üçün klikləyin, sonra böyüdün. Fırlatmaq üçün sürüşdürün.',mobile:'Adını sabitləmək üçün ölkəyə toxunun. Bir barmaqla fırladın, iki barmaqla və ya + / − ilə böyüdün.',pause:'Fırlanmanı dayandır',play:'Fırlanmanı davam etdir',reset:'İlkin görünüşə qayıt',left:'Sola fırlat',right:'Sağa fırlat',label:'İnteraktiv qlobus. Sürükləyin və ya ox düymələri ilə fırladın.',rest:'Bir az maraq — kəşf ediləcək bütöv bir dünya.',error:'Qlobus müvəqqəti olaraq əlçatan deyil.'}
};

export default function WorldGlobe({lang}){
 const t=text[lang];
 const canvasRef=useRef(null),tooltipRef=useRef(null),api=useRef(null);
 const [zoom,setZoom]=useState(1);
 const [paused,setPaused]=useState(false),[selected,setSelected]=useState(null),[error,setError]=useState(false);
 const [loading,setLoading]=useState(true);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const country=selected?.code?countries.find(c=>c.code===selected.code):null;
 useEffect(()=>{
  const canvas=canvasRef.current,tooltip=tooltipRef.current,ctx=canvas.getContext('2d');
  if(!ctx){setError(true);return}
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller=new AbortController();
  let magnification=1,pinch=null,pinched=false,interactionFrame=0,anchor=null,pinned=false,resourcesStarted=false,disposed=false;
  const pointers=new Map();
  let data=null,size=460,angle=-35,latitude=-18,frame=0,last=0,visible=false,hover=false,focused=false,drag=null,active=null,lastPick=0,manualPause=false,resumeAt=0;
  const projection=geoOrthographic().clipAngle(90).precision(.6);
  const path=geoPath(projection,ctx);
  let earth=null;
  const choose=(feature,location=null,pin=false)=>{
   const changed=feature!==active;active=feature;anchor=feature?location||geoCentroid(feature):null;pinned=!!feature&&pin;
   if(changed)setSelected(feature?.properties||null);
   if(pinned){manualPause=true;setPaused(true)}
  };
  const positionLabel=()=>{
   if(!tooltip||!active||!anchor){if(tooltip)tooltip.style.visibility='hidden';return}
   // Text stays in CSS pixels; only the geographic anchor follows map zoom.
   if(geoDistance(anchor,[-angle,-latitude])>Math.PI/2){tooltip.style.visibility='hidden';return}
   const [x,y]=projection(anchor),width=tooltip.offsetWidth,height=tooltip.offsetHeight;
   const left=Math.max(10,Math.min(size-width-10,x+14));
   const top=Math.max(10,Math.min(size-height-10,y-height-18));
   tooltip.style.left=`${Math.round(left)}px`;tooltip.style.top=`${Math.round(top)}px`;tooltip.style.visibility='visible';
  };
  const draw=()=>{
   if(disposed||size<=0)return;
   ctx.clearRect(0,0,size,size);const r=size*.435*magnification,c=size/2;
   projection.translate([c,c]).scale(r).rotate([angle,latitude]);
   const ocean=ctx.createRadialGradient(c-r*.45,c-r*.5,r*.1,c,c,r);
   ocean.addColorStop(0,'#27466c');ocean.addColorStop(.7,'#152b50');ocean.addColorStop(1,'#101b39');
   ctx.beginPath();path({type:'Sphere'});ctx.fillStyle=ocean;ctx.fill();
   ctx.save();ctx.beginPath();path({type:'Sphere'});ctx.clip();
   const textured=earth?.draw(ctx,size,angle,latitude,magnification);
   if(!textured&&data)for(const feature of data.features){ctx.beginPath();path(feature);ctx.fillStyle='#769d7d';ctx.fill()}
   if(data){ctx.beginPath();path(data);ctx.strokeStyle='#d9e8f05c';ctx.lineWidth=.65;ctx.stroke()}
   if(active){ctx.beginPath();path(active);ctx.fillStyle='#ffffff22';ctx.fill();ctx.strokeStyle='#fff2bb';ctx.lineWidth=1.5;ctx.stroke()}
   const shade=ctx.createRadialGradient(c-r*.25,c-r*.3,r*.05,c,c,r*1.05);
   shade.addColorStop(0,'#00234500');shade.addColorStop(.6,'#00234512');shade.addColorStop(1,'#00152d18');
   ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);ctx.restore();
   ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.strokeStyle='#9ddcff88';ctx.lineWidth=1;ctx.stroke();
   if(active&&anchor&&geoDistance(anchor,[-angle,-latitude])<Math.PI/2){const [x,y]=projection(anchor);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#163b65';ctx.lineWidth=2;ctx.stroke()}
   positionLabel();
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
   const location=projection.invert([x,y]);if(!location||!Number.isFinite(location[0])||!Number.isFinite(location[1])){choose(null);draw();return}
   let hit=data.features.find(f=>geoContains(f,location));
   if(!hit&&e.pointerType==='touch'){let nearest=12;for(const f of data.features){const center=geoCentroid(f);if(geoDistance(center,[-angle,-latitude])>Math.PI/2)continue;const p=projection(center),distance=Math.hypot(p[0]-x,p[1]-y);if(distance<nearest){nearest=distance;hit=f}}}
   choose(hit||null,location,force);draw();
  };
  const applyZoom=value=>{
   magnification=Math.max(1,Math.min(3,value));
   // Zoom into a pinned country instead of pushing it outside the viewport.
   if(pinned&&anchor){angle=-anchor[0];latitude=Math.max(-70,Math.min(70,-anchor[1]))}
  };
  const repaint=()=>{if(!interactionFrame)interactionFrame=requestAnimationFrame(()=>{interactionFrame=0;draw()})};
  const distance=()=>{const [a,b]=Array.from(pointers.values());return Math.hypot(a.x-b.x,a.y-b.y)};
  const rebase=()=>{if(pointers.size>=2){pinch={distance:Math.max(1,distance()),zoom:magnification};pinched=true;drag={moved:true}}else if(pointers.size===1){const p=pointers.values().next().value;pinch=null;drag={...p,angle,latitude,moved:pinched}}};
  const down=e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   const [x,y]=coords(e);if(!pointers.size&&Math.hypot(x-size/2,y-size/2)>size*.435*magnification)return;
   if(!pointers.size)pinched=false;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   canvas.setPointerCapture(e.pointerId);rebase();canvas.classList.add('globe-dragging');sync();
  };
  const move=e=>{
   if(pointers.has(e.pointerId)){
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointers.size>=2){applyZoom(pinch.zoom*distance()/pinch.distance);setZoom(Math.round(magnification*100)/100);earth?.requestDetail();repaint();return}
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.abs(dx)+Math.abs(dy)>4;if(drag.moved&&active)choose(null);angle=drag.angle+dx*.35/magnification;latitude=Math.max(-70,Math.min(70,drag.latitude-dy*.3/magnification));repaint()}
   }else if(e.pointerType!=='touch'){hover=true;cancelAnimationFrame(frame);frame=0;last=0;if(!pinned)pick(e)}
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
  const leave=e=>{hover=false;if(e.pointerType!=='touch'&&!drag&&!pinned)choose(null);sync()};
  const focus=()=>{focused=true;sync()};const blur=()=>{focused=false;sync()};
  const turn=(x,y=0)=>{angle+=x;latitude=Math.max(-70,Math.min(70,latitude+y));choose(null);resumeAt=performance.now()+1800;sync()};
  const key=e=>{if(e.key==='Enter'){e.preventDefault();const rect=canvas.getBoundingClientRect();pick({clientX:rect.left+size/2,clientY:rect.top+size/2,pointerType:'keyboard'},true);sync();return}if(e.key==='Escape'){e.preventDefault();choose(null);sync();return}if(['+','=','-','_'].includes(e.key)){e.preventDefault();const value=Math.max(1,Math.min(3,magnification+(e.key==='-'||e.key==='_'?-.2:.2)));setZoom(Math.round(value*100)/100);api.current?.zoom(value);return}const keys={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,10],ArrowDown:[0,-10]};if(keys[e.key]){e.preventDefault();turn(...keys[e.key])}};
  const events={pointerdown:down,pointermove:move,pointerup:up,pointercancel:e=>finish(e,true),lostpointercapture:e=>finish(e,true),pointerleave:leave,focus,blur,keydown:key};
  Object.entries(events).forEach(([name,fn])=>canvas.addEventListener(name,fn));
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const ensureResources=()=>{if(resourcesStarted)return;resourcesStarted=true;earth=createEarthTexture(()=>{if(!disposed)draw()});fetch('/assets/world-countries.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('map');return r.json()}).then(value=>{if(disposed)return;data=value;setLoading(false);draw()}).catch(e=>{if(e.name!=='AbortError'&&!disposed){setError(true);setLoading(false)}})};
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)ensureResources();sync()},{threshold:.02});io.observe(canvas);
  const preference=()=>{setReduced(motion.matches);sync()};motion.addEventListener('change',preference);document.addEventListener('visibilitychange',sync);
  api.current={draw,zoom:value=>{applyZoom(value);if(value>1)earth?.requestDetail();sync()},pause:value=>{manualPause=value;if(!value)choose(null);sync()},clear:()=>{choose(null);sync()},turn,reset:()=>{angle=-35;latitude=-18;magnification=1;setZoom(1);choose(null);sync()}};

  resize();
  return()=>{disposed=true;earth?.dispose();cancelAnimationFrame(interactionFrame);controller.abort();cancelAnimationFrame(frame);ro.disconnect();io.disconnect();motion.removeEventListener('change',preference);document.removeEventListener('visibilitychange',sync);Object.entries(events).forEach(([name,fn])=>canvas.removeEventListener(name,fn));api.current=null};
 },[]);
 const changeZoom=delta=>{const value=Math.max(1,Math.min(3,Math.round((zoom+delta)*10)/10));setZoom(value);api.current?.zoom(value)};
 const zoomText=lang==='ru'?['Уменьшить','Увеличить']:lang==='az'?['Kiçilt','Böyüt']:['Zoom out','Zoom in'];
 useLayoutEffect(()=>{api.current?.draw()},[selected,lang]);
 const pause=()=>{const value=!paused;setPaused(value);api.current?.pause(value)};
 const clearLabel={ru:'Снять выделение страны',en:'Clear country selection',az:'Ölkə seçimini sil'}[lang];
 const loadingText={ru:'Загружаем карту…',en:'Loading the map…',az:'Xəritə yüklənir…'}[lang];
 const selectedName=country?.labels[lang]||selected?.name||'';
 return <section id="world" className="globe-section" aria-labelledby="globe-title"><div className="container globe-layout">
  <div className="globe-copy"><span className="overline">{t.eyebrow}</span><h2 id="globe-title">{t.title}</h2><p id="globe-hint" className="globe-desktop-hint"><Move size={16}/>{t.hint}</p><p className="globe-touch-hint"><Move size={16}/>{t.mobile}</p></div>
  <div className={`globe-playground${zoom>1?' is-zoomed':''}`}><div className="globe-orbit" aria-hidden="true"/><canvas ref={canvasRef} className="world-globe" tabIndex={0} role="img" aria-label={t.label+' '+({ru:'Enter — выбрать страну в центре; + и − — масштаб; Escape — снять выделение.',en:'Enter selects the center country; + and − zoom; Escape clears selection.',az:'Enter mərkəzdəki ölkəni seçir; + və − miqyası dəyişir; Escape seçimi silir.'}[lang])} aria-describedby={selected?'globe-hint globe-country-label':'globe-hint'} aria-busy={loading}/><div ref={tooltipRef} id="globe-country-label" className="globe-label" role="tooltip" hidden={!selected||error}>{country&&<img src={`/assets/flags/${country.code}.svg`} alt="" width="24" height="18"/>}<span>{selectedName}</span></div><div className="globe-ground" aria-hidden="true"/></div>
  <div className="globe-caption">{error?t.error:loading?loadingText:t.rest}</div>
  <span className="globe-screen-reader" role="status" aria-live="polite">{selectedName}</span>
  <p className="globe-credit">{lang==='ru'?'Изображение Земли: ':lang==='az'?'Yer təsviri: ':'Earth imagery: '}<a href="https://svs.gsfc.nasa.gov/3615/" target="_blank" rel="noopener noreferrer">NASA / Goddard SVS</a></p>
  <div className="globe-controls"><div className="globe-control-group"><button onClick={()=>changeZoom(-.2)} disabled={zoom<=1} aria-label={zoomText[0]}><ZoomOut size={18}/></button><span className="globe-zoom-value" aria-live="polite">{Math.round(zoom*100)}%</span><button onClick={()=>changeZoom(.2)} disabled={zoom>=3} aria-label={zoomText[1]}><ZoomIn size={18}/></button></div><div className="globe-control-group"><button onClick={()=>api.current?.turn(-18)} aria-label={t.left}><ArrowLeft size={18}/></button>{!reduced&&<button onClick={pause} aria-label={paused?t.play:t.pause} aria-pressed={paused}>{paused?<Play size={18}/>:<Pause size={18}/>}</button>}<button onClick={()=>api.current?.turn(18)} aria-label={t.right}><ArrowRight size={18}/></button><button onClick={()=>api.current?.reset()} aria-label={t.reset}><RotateCcw size={17}/></button><button onClick={()=>api.current?.clear()} disabled={!selected} aria-label={clearLabel}><X size={18}/></button></div></div>
 </div></section>;
}

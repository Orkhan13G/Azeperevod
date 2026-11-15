import React, {useEffect, useRef, useState} from 'react';
import countries from './countries.json';
import './motion.css';

const copy = {
  ru: {world:'Мир без языковых границ',note:'Флаги стран и территорий мира. Доступные языки — в разделе цен.',flags:'Флаги стран и территорий'},
  en: {world:'A world beyond language barriers',note:'Flags of countries and territories. See pricing for available languages.',flags:'Country and territory flags'},
  az: {world:'Dil sərhədlərini aşan dünya',note:'Ölkə və ərazi bayraqları. Mövcud dillər qiymətlər bölməsindədir.',flags:'Ölkə və ərazi bayraqları'}
};

// Restore the original deployed WebGL ribbon, including its palette and geometry.
// The matching poster remains visible while shaders load or if WebGL is unavailable.
function FlowCanvas() {
  const canvasRef=useRef(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let renderer=null,frame=0,last=0,elapsed=0,visible=true,disposed=false,loading=false,lost=false;
    let controller=new AbortController();
    const running=()=>!disposed&&!lost&&!media.matches&&visible&&!document.hidden;
    const tick=now=>{
      frame=0;
      if(!running()||!renderer)return;
      if(!last)last=now;
      const delta=now-last;
      if(delta>=32){elapsed+=delta;last=now;renderer.draw(elapsed)}
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{
      cancelAnimationFrame(frame);frame=0;last=0;
      if(renderer&&!lost)renderer.draw(elapsed);
      if(renderer&&running())frame=requestAnimationFrame(tick);
    };
    const start=async()=>{
      if(renderer||loading||!running())return;
      loading=true;
      try{
        const {createRibbonRenderer}=await import('./RibbonRenderer.js');
        if(disposed)return;
        const instance=await createRibbonRenderer(canvas,()=>{if(!disposed)setReady(true)},{signal:controller.signal});
        if(disposed){instance.dispose();return}
        renderer=instance;sync();
      }catch(error){if(error.name!=='AbortError')console.warn('Ribbon animation unavailable; retaining original poster.',error)}
      finally{loading=false}
    };
    const update=()=>{sync();start()};
    const resize=new ResizeObserver(()=>renderer?.resize());resize.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});observer.observe(canvas);
    const onLost=event=>{event.preventDefault();lost=true;controller.abort();setReady(false);renderer?.dispose();renderer=null;sync()};
    const onRestored=()=>{lost=false;controller=new AbortController();start()};
    canvas.addEventListener('webglcontextlost',onLost);
    canvas.addEventListener('webglcontextrestored',onRestored);
    media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
    start();
    return()=>{
      disposed=true;controller.abort();cancelAnimationFrame(frame);renderer?.dispose();resize.disconnect();observer.disconnect();
      canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
      media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);
    };
  },[]);
  return <div className={`ribbon-surface${ready?' ribbon-ready':''}`}><img className="ribbon-poster" src="/assets/ribbon-poster.webp" width="1392" height="975" alt="" aria-hidden="true" fetchPriority="high"/><canvas className="flow-canvas" ref={canvasRef} aria-hidden="true"/></div>;
}

export function HeroFlow() {
  return <div className="hero-flow" aria-hidden="true"><FlowCanvas/><div className="flow-shade"/></div>;
}

export function FlagRibbon({lang}) {
  const [inView,setInView]=useState(true);
  const root=useRef(null);
  const text=copy[lang];
  useEffect(()=>{
    let intersecting=true;
    const sync=()=>setInView(intersecting&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{intersecting=entry.isIntersecting;sync()});observer.observe(root.current);
    document.addEventListener('visibilitychange',sync);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync)};
  },[]);
  return <section ref={root} className={`flag-section ${!inView?'flags-paused':''}`} aria-label={text.flags}>
    <div className="container flag-heading"><p>{text.world}</p></div>
    <div id="flag-viewport" className="flag-viewport" role="region" aria-label={text.flags}>
      <div className="flag-track">{[0,1].map(copyIndex=><ul key={copyIndex} className="flag-group" aria-hidden={copyIndex===1?true:undefined}>{countries.filter(country=>['az','gb','us','ru','de','fr','tr','it','es','cn','jp','ae','kz','ge','br','in'].includes(country.code)).map((country,index)=><li className="flag-item" key={country.code} title={country.labels[lang]||country.name}><img src={`/assets/flags/${country.code}.svg`} alt="" width="48" height="36" loading={index<14&&copyIndex===0?'eager':'lazy'} decoding="async"/><span>{country.labels[lang]||country.name}</span></li>)}</ul>)}</div>
    </div>
  </section>;
}

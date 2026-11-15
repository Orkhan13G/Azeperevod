import React, {useEffect, useRef, useState} from 'react';
import {Pause, Play} from 'lucide-react';
import countries from './countries.json';
import './motion.css';

const copy = {
  ru: {pause:'Приостановить анимацию',play:'Продолжить анимацию',world:'Мир без языковых границ',note:'Флаги стран и территорий мира. Доступные языки — в разделе цен.',flags:'Флаги стран и территорий'},
  en: {pause:'Pause animation',play:'Resume animation',world:'A world beyond language barriers',note:'Flags of countries and territories. See pricing for available languages.',flags:'Country and territory flags'},
  az: {pause:'Animasiyanı dayandır',play:'Animasiyanı davam etdir',world:'Dil sərhədlərini aşan dünya',note:'Ölkə və ərazi bayraqları. Mövcud dillər qiymətlər bölməsindədir.',flags:'Ölkə və ərazi bayraqları'}
};

// Smooth, deterministic wandering values: no short repeating timeline or reset.
// Cubic B-spline blending keeps velocity and acceleration continuous at knots.
function wander(time, seed) {
  const n=Math.floor(time), f=time-n, f2=f*f, f3=f2*f;
  const value=k=>{const v=Math.sin(k*127.1+seed*311.7)*43758.5453;return (v-Math.floor(v))*2-1};
  return ((1-f)**3*value(n-1)+(3*f3-6*f2+4)*value(n)+
    (-3*f3+3*f2+3*f+1)*value(n+1)+f3*value(n+2))/6;
}

// A bounded 2D canvas: no WebGL dependency, no external requests, no DOM writes per frame.
// The navy CSS background is also the permanent fallback when canvas is unavailable.
function FlowCanvas({paused}) {
  const canvasRef = useRef(null);
  const clock = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0, last=0, visible=true, width=0, height=0;
    const draw = () => {
      const t=clock.current, small=width<650;
      ctx.clearRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.86,height*.23,0,width*.86,height*.23,width*.78);
      glow.addColorStop(0,'#517b9c40');glow.addColorStop(1,'#517b9c00');
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      // Independent but related deformation streams keep the ribbon transforming
      // instead of reversing a single synchronized "breathing" animation.
      const flow=t*.32;
      const center=.75+wander(flow,2)*.14;
      const tilt=wander(flow*.83,7)*.32;
      const bend=wander(flow*1.13,11)*.28;
      const base=small?.27:.25;
      const widths=[0,1,2,3].map(k=>base*(1+wander(flow*.91+k*.21,19)*.58+wander(flow*1.17,k+31)*.26));
      const centers=[center-tilt,center-bend-tilt*.35,center+bend+tilt*.35,center+tilt];
      const y1=.24+wander(flow*.87,43)*.13;
      const y2=.68+wander(flow*1.07,47)*.14;
      for(let i=0;i<88;i++) {
        const u=i/87, offset=u-.5;
        const x=centers.map((c,k)=>width*(c+offset*widths[k]));
        const gradient=ctx.createLinearGradient(x[0],0,x[3],height);
        gradient.addColorStop(0,`hsla(${263-u*88},53%,${32+u*22}%,${small?.42:.66})`);
        gradient.addColorStop(.52,`hsla(${244-u*69},55%,${38+u*23}%,${small?.5:.78})`);
        gradient.addColorStop(1,'#91c8ef00');
        ctx.beginPath();ctx.moveTo(x[0],-height*.12);
        ctx.bezierCurveTo(x[1],height*y1,x[2],height*y2,x[3],height*1.12);
        ctx.globalAlpha=Math.min(1,u/.1,(1-u)/.1);
        ctx.strokeStyle=gradient;ctx.lineWidth=width*(small?.011:.008);
        ctx.stroke();ctx.globalAlpha=1;
      }
    };
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      width=rect.width;height=rect.height;
      // Maximum rendering resolution remains modest even on high-density screens.
      const scale=Math.min(window.devicePixelRatio||1,1.25,1400/Math.max(width,1));
      canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
      ctx.setTransform(scale,0,0,scale,0,0);draw();
    };
    const tick=(now)=>{
      frame=0;
      if(paused||media.matches||!visible||document.hidden)return;
      if(!last)last=now;
      if(now-last>=32){clock.current+=Math.min(now-last,60)/1440;last=now;draw()}
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{cancelAnimationFrame(frame);last=0;draw();if(!paused&&!media.matches&&visible&&!document.hidden)frame=requestAnimationFrame(tick)};
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(canvas);
    media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    resize();sync();
    return()=>{cancelAnimationFrame(frame);resizeObserver.disconnect();observer.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
  },[paused]);
  return <canvas className="flow-canvas" ref={canvasRef} aria-hidden="true"/>;
}

export function HeroFlow({lang}) {
  const [paused,setPaused]=useState(false);
  const text=copy[lang];
  return <><div className="hero-flow" aria-hidden="true"><FlowCanvas paused={paused}/><div className="flow-shade"/></div><button className="motion-toggle hero-motion-toggle" onClick={()=>setPaused(!paused)} aria-label={paused?text.play:text.pause} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}</button></>;
}

export function FlagRibbon({lang}) {
  const [paused,setPaused]=useState(false);
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
  return <section ref={root} className={`flag-section ${paused||!inView?'flags-paused':''}`} aria-label={text.flags}>
    <div className="container flag-heading"><p>{text.world}</p><button className="motion-toggle" aria-controls="flag-viewport" aria-label={paused?text.play:text.pause} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button></div>
    <div id="flag-viewport" className="flag-viewport" tabIndex={0} role="region" aria-label={text.flags}>
      <div className="flag-track">{[0,1].map(copyIndex=><ul key={copyIndex} className="flag-group" aria-hidden={copyIndex===1?true:undefined}>{countries.map((country,index)=><li className="flag-item" key={country.code} title={country.labels[lang]||country.name}><img src={`/assets/flags/${country.code}.svg`} alt="" width="48" height="36" loading={index<14&&copyIndex===0?'eager':'lazy'} decoding="async"/><span>{country.labels[lang]||country.name}</span></li>)}</ul>)}</div>
    </div><p className="flag-note container">{text.note}</p>
  </section>;
}

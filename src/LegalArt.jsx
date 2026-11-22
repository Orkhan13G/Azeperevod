import React from 'react';

// A balanced brass sculpture, animated as one composed object on hover.
export default function LegalArt(){return <svg className="legal-art" viewBox="0 0 320 210" aria-hidden="true">
 <defs>
  <linearGradient id="legal-brass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f9e6b8"/><stop offset=".36" stopColor="#b38b4e"/><stop offset=".62" stopColor="#f0d194"/><stop offset="1" stopColor="#8e6937"/></linearGradient>
  <linearGradient id="legal-base" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b49766"/><stop offset="1" stopColor="#655239"/></linearGradient>
  <radialGradient id="legal-halo"><stop stopColor="#e7ca8c" stopOpacity=".18"/><stop offset="1" stopColor="#e7ca8c" stopOpacity="0"/></radialGradient>
 </defs>
 <ellipse cx="160" cy="110" rx="145" ry="98" fill="url(#legal-halo)"/>
 <circle className="legal-orbit" cx="160" cy="95" r="79" fill="none" stroke="#d2b47d" strokeOpacity=".25"/>
 <path d="M94 188h132l12 10H82z" fill="url(#legal-base)"/><path d="M111 176h98v12h-98z" fill="url(#legal-brass)"/>
 <path d="M155 48h10v123h-10zM145 169h30v7h-30z" fill="url(#legal-brass)"/>
 <circle cx="160" cy="39" r="9" fill="url(#legal-brass)"/>
 <g className="justice-balance">
  <path d="M70 63q90-27 180 0" fill="none" stroke="url(#legal-brass)" strokeWidth="7" strokeLinecap="round"/>
  <circle cx="160" cy="51" r="6" fill="#f1d79e"/>
  <g className="justice-pan justice-pan-left"><path d="m78 64-30 72m30-72 30 72" fill="none" stroke="#d2b47d" strokeWidth="2"/><path d="M42 136h72q-7 29-36 29t-36-29" fill="url(#legal-brass)"/><path d="M49 140h58" stroke="#fceac7" strokeWidth="2"/></g>
  <g className="justice-pan justice-pan-right"><path d="m242 64-30 72m30-72 30 72" fill="none" stroke="#d2b47d" strokeWidth="2"/><path d="M206 136h72q-7 29-36 29t-36-29" fill="url(#legal-brass)"/><path d="M213 140h58" stroke="#fceac7" strokeWidth="2"/></g>
 </g>
 <path className="legal-glint" d="m158 31 2-6 2 6 6 2-6 2-2 6-2-6-6-2z" fill="#fff3d4"/>
</svg>}

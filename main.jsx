import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowUpRight,ArrowRight,ArrowUp,Menu,X,Mail,Phone,MapPin,Scale,FileText,Globe2,Landmark,BookOpen,Settings,IdCard,HeartPulse,MessageSquare,ShieldCheck,Clock3,CheckCircle2,ChevronDown,Check,ExternalLink,Cookie,LockKeyhole,BriefcaseBusiness} from 'lucide-react';
import {translations} from './i18n';
import {contact,prices,paymentMethods,brandLogo} from './data';
import '@fontsource-variable/manrope';
import '@fontsource-variable/playfair-display';
import './style.css';
import {HeroFlow, FlagRibbon} from './HeroFlow';
import WorldGlobe from './WorldGlobe';

// ============================================================
// 1. LANGUAGE & PAGE SETTINGS
// Three real URLs: / (Russian), /en/ (English), /az/ (Azerbaijani).
// ============================================================
const path=window.location.pathname;
const lang=path.startsWith('/en')?'en':path.startsWith('/az')?'az':'ru';
const t=translations[lang];
const city={ru:'Баку, Азербайджан',en:'Baku, Azerbaijan',az:'Bakı, Azərbaycan'}[lang];
const labels=['RU','EN','AZ'];
const languageLinks=['/','/en/','/az/'];
const ids=['top','services','about','prices','why','contact'];
const serviceIcons=[Scale,Globe2,Landmark,BookOpen,Settings,IdCard,HeartPulse,MessageSquare];
const year=2026;

// Set brandLogo to an approved local asset path in data.js when the logo arrives.
function Mark(){const [failed,setFailed]=useState(false);return <a href="#top" className="brand" aria-label="Zaur Bayramov — AZEPEREVOD"><span className="brand-logo-slot" aria-hidden="true">{brandLogo&&!failed&&<img src={brandLogo} alt="" onError={()=>setFailed(true)}/>}</span><span className="brand-name">AZEPEREVOD<small>ZAUR BAYRAMOV · BAKU</small></span></a>}
function Title({eyebrow,children,light=false}){return <div className={`section-heading ${light?'light':''}`}><span className="overline">{eyebrow}</span><h2>{children}</h2></div>}
function Language(){return <div className="lang-switch" aria-label="Language / Язык / Dil">{labels.map((label,i)=><a key={label} href={languageLinks[i]} lang={label.toLowerCase()==='ru'?'ru':label.toLowerCase()} className={(label.toLowerCase()===lang)?'selected':''} aria-current={label.toLowerCase()===lang?'page':undefined}><img src={`/assets/flags/${["ru","gb","az"][i]}.svg`} alt="" width="20" height="15"/><span>{label}</span></a>)}</div>}
function Header(){const [mobile,setMobile]=useState(false);
// Close mobile navigation with Escape, including for keyboard users.
useEffect(()=>{if(!mobile)return;const close=e=>{if(e.key==='Escape')setMobile(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[mobile]);
return <header className="header"><div className="container header-in"><Mark/><nav id="primary-navigation" className={mobile?'nav nav-open':'nav'} aria-label="Main navigation">{t.nav.map((item,i)=><a onClick={()=>setMobile(false)} key={item} href={'#'+ids[i]}>{item}</a>)}</nav><div className="header-right"><Language/><a className="header-mail" href={'mailto:'+contact.email} aria-label={contact.email}><Mail size={23}/></a><button className="menu-toggle" aria-expanded={mobile} aria-controls="primary-navigation" aria-label={mobile?t.close:t.menu} onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button></div></div></header>}
function Hero(){return <section id="top" className="hero"><HeroFlow lang={lang}/><div className="container hero-inner"><div className="hero-copy"><p className="hero-eyebrow"><span className="eyebrow-line"/>{t.eyebrow}</p><h1><span>{t.heroA}</span><strong>{t.heroB}</strong></h1><p className="hero-desc">{t.heroText}</p><div className="hero-actions"><a className="button outline-button" href="#services"><span className="button-label">{t.explore}</span><ArrowRight size={18}/></a></div><div className="hero-location"><MapPin size={16}/> {city}</div></div></div><div className="container"><div className="trust-strip">{[t.trust1,t.trust2,t.trust3].map((v,i)=>{let I=[Globe2,Scale,ShieldCheck][i];return <div key={i} className="trust-item"><I size={23}/><span>{v}</span></div>})}</div></div></section>}
function Services(){return <section id="services" className="services-section section-pad"><div className="container"><div className="heading-flex"><Title eyebrow={t.servicesK}>{t.servicesTitle}</Title><p>{t.servicesText}</p></div><div className="services-grid">{t.services.map((s,i)=>{const Icon=serviceIcons[i];return <a key={i} className="service-card" href="#contact"><span className="service-scan" aria-hidden="true"/><div className="service-icon"><Icon size={26} strokeWidth={1.8}/></div><h3>{s}</h3><p>{t.serviceDesc[i]}</p><span className="service-arrow"><ArrowUpRight size={18}/></span></a>})}</div><div className="legal-feature"><a className="legal-symbol legal-stamp" href="https://yuristvbaku.com/" target="_blank" rel="noopener noreferrer" aria-label={t.legalMore}><Scale size={37}/></a><div><span className="overline">{t.legalTag}</span><h3>{t.legalTitle}</h3><p>{t.legalText}</p></div><a className="legal-link" href="https://yuristvbaku.com/" target="_blank" rel="noopener noreferrer">{t.legalMore}<ArrowUpRight size={18}/></a></div></div></section>}
function About(){const aboutFactIcons=[Clock3,BriefcaseBusiness,Scale];return <section id="about" className="about-section section-pad"><div className="container about-layout"><div className="portrait-card"><img className="portrait-photo" width={1529} height={2048} src="/assets/zaur.jpg" alt={t.aboutTitle} loading="lazy" onError={e=>{e.currentTarget.parentElement.classList.add("portrait-no-photo")}}/><div className="portrait-corner"><Scale size={26}/></div></div><div className="about-copy"><div className="about-head"><Title eyebrow={t.aboutK}>{t.aboutTitle}</Title><div className="about-rule" aria-hidden="true"/><p className="about-role">{t.aboutRole}</p><div className="about-facts">{t.aboutFacts.map((fact,index)=>{const Icon=aboutFactIcons[index]||CheckCircle2;return <span key={fact} className="about-fact"><Icon size={15}/>{fact}</span>})}</div></div><div className="about-body">{t.aboutText.split("\n\n").map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><a className="text-link" href="#contact">{t.order}<ArrowUpRight size={18}/></a></div></div></section>}
function Prices(){return <section id="prices" className="price-section section-pad"><div className="container"><div className="heading-flex"><Title eyebrow={t.pricingK}>{t.pricingTitle}</Title><p>{t.pricingIntro}</p></div><div className="table-scroll"><table className="price-table"><thead><tr><th>{t.priceLang}</th><th>{t.priceFrom}</th><th>{t.priceTo}</th></tr></thead><tbody>{prices.map(row=><tr key={row.id}><td>{row[lang]}</td><td>{row.from.toLocaleString(lang==='ru'?'ru-RU':'en-US')} {t.page}</td><td>{row.to.toLocaleString(lang==='ru'?'ru-RU':'en-US')} {t.page}</td></tr>)}</tbody></table></div><div className="price-mobile-list">{prices.map((row,i)=><article className="price-mobile-item" key={row.id}><span className="price-mobile-index">{String(i+1).padStart(2,"0")}</span><h3>{row[lang]}</h3><div className="price-mobile-values"><div><span>{t.priceFrom}</span><strong>{row.from.toLocaleString(lang==='ru'?'ru-RU':'en-US')} {t.page}</strong></div><div><span>{t.priceTo}</span><strong>{row.to.toLocaleString(lang==='ru'?'ru-RU':'en-US')} {t.page}</strong></div></div></article>)}</div><div className="price-details"><div><Check size={19}/><span>{t.pageRule}</span></div><div><Check size={19}/><span>{t.discount}</span></div></div><div className="price-lower"><div className="price-side"><h3>{t.extras}</h3><div className="price-line"><span>{t.handwritten}</span><strong>{t.extraRate}</strong></div><div className="price-line"><span>{t.urgent}</span><strong>{t.extraRate}</strong></div></div></div></div></section>}
// ============================================================
// 6. WHY CHOOSE US — four benefits. Client logos and letters retired.
// ============================================================
function Why(){return <section id="why" className="clients-section section-pad"><div className="container"><div className="why-wrap"><Title eyebrow={t.whyK}>{t.whyTitle}</Title><div className="why-grid">{t.why.map((description,i)=>{const Icon=[Clock3,Scale,FileText,ShieldCheck][i];return <article key={i} className="why-card"><div className="why-card-head"><span className="why-count">0{i+1}</span><Icon size={24} strokeWidth={1.5}/></div><h3>{t.whyHeadings[i]}</h3><p>{description}</p></article>})}</div></div></div></section>}
function Payments(){return <section className="payment-section"><div className="container payment-inner"><div><span className="overline">{t.paymentsK}</span><h2>{t.paymentsTitle}</h2><p>{t.paymentsNote}</p></div><div className="payments-icons">{paymentMethods.map(p=><span key={p}>{p}</span>)}</div></div></section>}
function Contact(){const [form,setForm]=useState({name:'',email:'',message:'',ok:false});const [error,setError]=useState(false);function submit(e){e.preventDefault();if(!form.name.trim()||!/^\S+@\S+\.\S+$/.test(form.email)||!form.message.trim()||!form.ok){setError(true);return}setError(false);const subject=lang==='ru'?'Заявка с сайта AZEPEREVOD':lang==='az'?'AZEPEREVOD saytından sorğu':'AZEPEREVOD website inquiry';const body=`Name / Имя: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;window.location.href=`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;}return <section id="contact" className="contact-section section-pad"><div className="container contact-layout"><div className="contact-copy"><Title eyebrow={t.contactK} light>{t.contactTitle}</Title><p>{t.contactText}</p><div className="contact-links"><a href={'mailto:'+contact.email}><Mail size={21}/>{contact.email}</a><a href={'tel:'+contact.phone}><Phone size={21}/>{contact.phoneLabel}</a><span><MapPin size={21}/>{t.location}: {city}</span></div></div><div className="form-card"><form onSubmit={submit} noValidate><label>{t.name}<input id="contact-name" name="name" required maxLength="120" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t.name} autoComplete="name"/></label><label>{t.email}<input id="contact-email" name="email" type="email" required maxLength="254" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com" autoComplete="email"/></label><label>{t.message}<textarea id="contact-message" name="message" rows="5" required maxLength="5000" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder={t.messageHint}/></label><label className="form-check"><input id="contact-consent" name="consent" type="checkbox" required checked={form.ok} onChange={e=>setForm({...form,ok:e.target.checked})}/><span>{t.consent}</span></label>{error&&<p className="form-error" role="alert">{t.formErr}</p>}<button type="submit" className="button gold-button form-submit"><span className="button-label">{t.send}</span><ArrowUpRight size={19}/></button><p className="form-note">{t.mailNotice}</p></form></div></div></section>}
// ============================================================
// 9. FOOTER & ACCESSIBLE INFORMATION DIALOGS
// Keep focus inside a dialog, close with Escape and restore focus.
// ============================================================
function Footer(){
 const [privacy,setPrivacy]=useState(false);
 const [cookieOpen,setCookieOpen]=useState(false);
 const [accessOpen,setAccessOpen]=useState(false);
 const dialogRef=useRef(null);
 const previousFocus=useRef(null);
 const opened=privacy||cookieOpen||accessOpen;
 const close=()=>{setPrivacy(false);setCookieOpen(false);setAccessOpen(false)};
 useEffect(()=>{
  if(!opened)return;
  previousFocus.current=document.activeElement;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  dialogRef.current?.querySelector('button')?.focus();
  const onKey=e=>{
   if(e.key==='Escape'){e.preventDefault();close();return}
   if(e.key!=='Tab'||!dialogRef.current)return;
   const nodes=[...dialogRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')];
   if(!nodes.length)return;
   const first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',onKey);
  return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;previousFocus.current?.focus?.()}
 },[opened]);
 const accessTitle=lang==='ru'?'Доступность сайта':lang==='az'?'Saytın əlçatanlığı':'Website accessibility';
 const accessText=lang==='ru'?'Мы стремимся сделать сайт удобным для всех посетителей, в том числе для пользователей клавиатуры и вспомогательных технологий. Мы учитываем рекомендации WCAG 2.2, но полная проверка соответствия пока не проведена. Если вы обнаружили проблему доступности, напишите на info@azeperevod.ru с описанием страницы и проблемы. Мы постараемся предложить доступный способ получения информации.':lang==='az'?'Saytın bütün ziyarətçilər üçün rahat olmasına çalışırıq. WCAG 2.2 tövsiyələrini nəzərə alırıq, lakin tam uyğunluq yoxlaması hələ aparılmayıb. Əlçatanlıq problemi barədə info@azeperevod.ru ünvanına yazın.':'We aim to make this website usable by everyone, including keyboard and assistive-technology users. We follow WCAG 2.2 guidance where possible, but a full accessibility assessment has not yet been completed. Please report accessibility barriers to info@azeperevod.ru; we will try to offer an accessible alternative.';
 return <><footer className="footer"><div className="container footer-main"><Mark/><p>{t.footer}</p><a href="#top" className="back-top">{t.toTop}<ArrowUp size={17}/></a></div><div className="container footer-bottom"><span>© 2026 {contact.name} / {city} / {t.rights}</span><div><button onClick={()=>setPrivacy(true)}>{t.privacy}</button><button onClick={()=>setCookieOpen(true)}>{t.cookieTitle}</button><button onClick={()=>setAccessOpen(true)}>{lang==='ru'?'Доступность':lang==='az'?'Əlçatanlıq':'Accessibility'}</button></div></div></footer>{opened&&<div className="modal-back" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="site-dialog-title"><button className="modal-close" onClick={close} aria-label={t.close}><X size={20}/></button><h2 id="site-dialog-title">{accessOpen?accessTitle:privacy?t.privacyTitle:t.cookieTitle}</h2><div className="policy-copy">{(accessOpen?accessText:privacy?t.privacyBody:t.cookieText).split("\n\n").map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></div></div>}</>
}
function SEO(){useEffect(()=>{document.documentElement.lang=lang;const data={'@context':'https://schema.org','@type':'ProfessionalService',name:'Zaur Bayramov — AZEPEREVOD',url:'https://azeperevod.ru/',email:contact.email,telephone:contact.phone,address:{'@type':'PostalAddress',addressLocality:'Baku',addressCountry:'AZ'},availableLanguage:['Russian','Azerbaijani','English'],hasOfferCatalog:{'@type':'OfferCatalog',name:'Translation services',itemListElement:t.services.map(name=>({'@type':'OfferCatalog',name}))}};let s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(data);document.head.appendChild(s);return ()=>s.remove()},[]);return null}
// ============================================================
// 10. MOTION AND PAGE ASSEMBLY
// Observe individual elements. Content remains readable if JS is slow.
// ============================================================
function Motion(){useEffect(()=>{
 // Retire the obsolete future-analytics consent preference from previous versions.
 try{localStorage.removeItem('azeperevod_cookie_v1')}catch{}
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
 const elements=document.querySelectorAll('.service-card,.why-card,.price-mobile-item,.portrait-card,.legal-feature,.references,.heading-flex');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}
 }),{threshold:0.06,rootMargin:'0px 0px -24px 0px'});
 elements.forEach(el=>observer.observe(el));
 return ()=>observer.disconnect();
},[]);return null}
function App(){return <><SEO/><Motion/><a className="skip-link" href="#services">{lang==='ru'?'Перейти к содержимому':lang==='az'?'Məzmuna keç':'Skip to content'}</a><Header/><main><Hero/><FlagRibbon lang={lang}/><Services/><WorldGlobe lang={lang}/><About/><Prices/><Why/><Payments/><Contact/></main><Footer/></>}
createRoot(document.getElementById('root')).render(<App/>);

//Bismillah
//Allah xeyirli və düşərli etsin
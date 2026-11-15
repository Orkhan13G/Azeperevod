// ============================================================
//  SEO BUILD STEP — generates separate HTML entry pages for EN/AZ.
//  Each page has language-specific titles, descriptions, and JSON-LD.
//  NOTE: React page body renders on the client; for stronger crawlability
//  consider prerendering full content with a static-site generator later.
// ============================================================
import fs from 'node:fs';
const file='dist/index.html';
const base=fs.readFileSync(file,'utf8');
const entries={
 en:{title:'Zaur Bayramov — Azerbaijani document translation in Baku',description:'Professional Azerbaijani translation, legal document translation, technical and medical translation, in Baku, Azerbaijan.'},
 az:{title:'Zaur Bayramov — Azərbaycanda peşəkar sənəd tərcüməsi',description:'Azərbaycan dilindən və Azərbaycan dilinə peşəkar tərcümə, hüquqi və tibbi sənədlər, texniki tərcümə və sənədlərin tərcüməsi.'}
};
for(const [lang,meta] of Object.entries(entries)){
 const path='/'+lang+'/';
 const dir='dist/'+lang;fs.mkdirSync(dir,{recursive:true});
 const html=base.replace('<html lang="ru">',`<html lang="${lang}">`)
  .replace(/<title>.*?<\/title>/,`<title>${meta.title}</title>`)
  .replace(/<meta name="description" content="[^"]*"\/>/,`<meta name="description" content="${meta.description}"/>`)
  .replace('href="https://azeperevod.ru/"/><link rel="alternate"',`href="https://azeperevod.ru${path}"/><link rel="alternate"`)
  .replace(/<meta property="og:title" content="[^"]*"\/>/,`<meta property="og:title" content="${meta.title}"/>`)
  .replace(/<meta property="og:description" content="[^"]*"\/>/,`<meta property="og:description" content="${meta.description}"/>`)
  .replace(/<meta property="og:url" content="[^"]*"\/>/,`<meta property="og:url" content="https://azeperevod.ru${path}"/>`);
 fs.writeFileSync(dir+'/index.html',html);
}
console.log('Generated SEO language pages: /, /en/, /az/');

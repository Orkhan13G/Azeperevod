import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
const source=(await fs.readFile('src/main.jsx','utf8')).replace("createRoot(document.getElementById('root')).render(<App/>);",'export default App;');
const compiled=await build({stdin:{contents:source.replace(/import '@fontsource-variable\/[^']+';/g,''),resolveDir:process.cwd()+'/src',loader:'jsx'},bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},write:false});
await fs.writeFile('.qa.mjs',compiled.outputFiles[0].text);
for(const [path,heading] of [['/','Услуги'],['/en/','Services'],['/az/','Xidmətlər']]){
 globalThis.window={location:{pathname:path},matchMedia:()=>({matches:false})};
 const {default:App}=await import('./.qa.mjs?lang='+encodeURIComponent(path));
 const html=renderToStaticMarkup(App());
 assert(html.includes(heading));assert(!html.includes('<form'));assert(!html.includes('why-count'));assert(!html.includes('hero-desc'));assert(html.includes('11 '));assert.equal((html.match(/class="surcharge-row"/g)||[]).length,2);assert(html.includes('yuristvbaku.com'));assert(!html.includes('form-card'));assert(!html.includes('lucide-pause'));assert(!html.includes('lucide-play'));assert(!html.includes('Немного любопытства'));
 console.log('PASS content:',path);
}
await fs.unlink('.qa.mjs');
const {default:language}=await import('./netlify/edge-functions/language.js');
const request=(path='/',cookie='')=>new Request('https://example.com'+path,{headers:{cookie}});
const context=(country)=>({geo:{country:{code:country}},next:async()=>new Response('page')});
for(const [country,target] of [['AZ','/az/'],['RU','/'],['KZ','/'],['US','/en/'],['DE','/en/']]){
 const r=await language(request(),context(country));assert.equal(r.status,target==='/'?200:302);if(target!=='/')assert.equal(new URL(r.headers.get('location')).pathname,target);assert(r.headers.get('set-cookie'));console.log('PASS geolocation:',country,target);
}
assert.equal((await language(request('/','aze_language=ru'),context('US'))).status,200);
assert.equal((await language(request('/en/'),context('AZ'))).status,200);
assert.equal((await language(request(),context(undefined))).status,200);
assert.equal((await language(new Request('https://example.com/',{headers:{'user-agent':'Googlebot'}}),context('US'))).status,200);
console.log('PASS manual preference, explicit URL, unknown country, crawler');

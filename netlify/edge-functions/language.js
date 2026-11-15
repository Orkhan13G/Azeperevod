// Netlify supplies country geolocation; no third-party IP lookup is made.
export default async function language(request, context) {
  const url = new URL(request.url);
  if (!['/', '/en/', '/az/'].includes(url.pathname)) return context.next();
  if (!['GET', 'HEAD'].includes(request.method)) return context.next();
  const cookies = request.headers.get('cookie') || '';
  if (/(?:^|;\s*)aze_language=(ru|en|az)(?:;|$)/.test(cookies)) return context.next();
  // Keep explicit language URLs and search crawlers on the requested page.
  const bot = /bot|crawler|spider|slurp/i.test(request.headers.get('user-agent') || '');
  if (bot) return context.next();
  const country = context.geo?.country?.code;
  if (!country) return context.next();
  const cis = new Set(['RU','BY','AM','KZ','KG','MD','TJ','TM','UZ','UA']);
  const chosen = url.pathname === '/en/' ? 'en' : url.pathname === '/az/' ? 'az' : country === 'AZ' ? 'az' : cis.has(country) ? 'ru' : 'en';
  const target = {ru:'/', en:'/en/', az:'/az/'}[chosen];
  const cookie = `aze_language=${chosen}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  if (target !== url.pathname) {
    url.pathname = target;
    return new Response(null, {status:302, headers:{Location:url.href, 'Set-Cookie':cookie, 'Cache-Control':'private, no-store'}});
  }
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie',cookie);
  headers.set('Cache-Control','private, no-store');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
export const config = {path:['/','/en/','/az/']};

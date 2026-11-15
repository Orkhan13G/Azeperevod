import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [{
    name: 'development-csp',
    apply: 'serve',
    // Vite's development CSS injection needs inline styles. Keep the production
    // CSP intact in index.html and public/_headers; omit this meta only in dev.
    transformIndexHtml(html) {
      return html.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*\/>/i, '');
    },
  }],
});

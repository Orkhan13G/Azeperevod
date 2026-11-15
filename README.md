# Azeperevod

React/Vite source restored from supplied files, with local assets recovered from the previous Netlify deployment.

## Work locally

Use Node.js 22 or newer. Run `npm ci`, then `npm run dev`. To produce the website, run `npm run build`. `npm run preview` previews the built website. Open this folder in VS Code if desired; it is optional.

## Netlify

Deploy this source using a Git repository connected to the existing Netlify project. The included netlify.toml sets build command `npm run build` and publish folder `dist`.

For manual static deployment, upload the CONTENTS of dist. This updates the appearance but does not install the IP-based language Edge Function. To enable geolocation, deploy the source via Netlify's Git integration, or use the Netlify CLI from the project root with `netlify deploy --build --prod` after selecting the existing project.

The Edge Function uses Netlify country data: Azerbaijan → AZ; RU, BY, AM, KZ, KG, MD, TJ, TM, UZ, UA → RU; other known countries → EN. Explicit /en/ and /az/ URLs are retained. Manual language selection is remembered for one year using a necessary cookie. Unknown country falls back to the requested URL. Crawlers are not redirected. No external IP lookup service is used.

## Changes

Centered hero with the original deployed 3D ribbon restored from the supplied ZIP; simplified passive flag strip; larger typography; gradient headings; rectangular service cards; compact legal link with signature hover animation; 11-year experience and updated credentials; integrated surcharge table; highlighted page and discount notes; diagonal two-color benefits grid; compact payment wordmarks; direct contact information without an inquiry form. Updated RU, EN and AZ content and privacy text. The interactive globe is restored below Services, with anchored country labels that remain readable at 100–300% zoom. Click or tap to pin a country; zoom centers it, while the label retains a fixed text size. Touch pinch preserves the selection. Globe imagery and map data load only when the globe enters view.

## Validation

`npm run build` and `node check.mjs` pass. Content rendering checked for all three languages. Edge logic checked for Azerbaijan, CIS countries, international countries, explicit URLs, manual cookie preference, unknown country and crawler behavior.

Browser checks passed at 1280, 768, 390 and 320px widths: no horizontal overflow, centered header flags, compact language labels, readable contacts and legal link. Screenshots were reviewed at desktop and mobile sizes. The recovered WebGL ribbon changes frames during playback, freezes when paused, and retains its matching poster under reduced motion. RU, EN and AZ mobile rendering passed without browser errors. Actual Netlify geolocation still requires production verification. The renderer and palette attribution were recovered from the original deployment; see public/assets/ribbon-credits.txt.

Globe regression verification: desktop and emulated mobile sizes (1280, 390, 320px), pinned labels at all zoom levels, touch pinch, hover exit, keyboard selection/clear, reset, and lazy asset loading passed in Chromium. Real phone hardware was not tested.

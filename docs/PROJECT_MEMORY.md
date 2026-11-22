# Azeperevod: design and working memory

This is the durable project handoff requested by the owner after approving the second design iteration. Read it before changing the site. It records the approved baseline and the reasons behind it; future explicit user instructions take precedence. Do not claim to remember work outside the available conversation or this repository.

## Project and publication

- Website: https://azeperevod.netlify.app
- Repository: https://github.com/Orkhan13G/Azeperevod
- Production branch: `codex/complete-website-source`. Netlify publishes pushes to this branch automatically. Do not assume `main` is production.
- Approved visual iteration: commit `d9a3067`. The owner responded “good. really, good.” and requested this record.
- React 19, Vite, Manrope variable font, Lucide icons, d3-geo; Node 22+ recommended. VS Code is optional. Work directly on source, never generated dist bundles.
- `npm ci`, `npm run dev`, `npm run build`, `npm run preview`; Netlify build `npm run build`, publish `dist`. Postbuild generates language/SEO pages.
- Prior source was recovered from uploaded files and a deployed ZIP. The original ribbon renderer was recovered from that deployment. Keep its attribution in `public/assets/ribbon-credits.txt`.

## Owner preferences and lessons

The owner wants implementation and publication, with concise progress updates and little repeated setup or confirmation. Inspect the actual site and code rather than giving generic directions. Preserve existing good behavior while improving layout. Describe the concrete outcome and verification honestly. A normal approved site update has previously included pushing the production branch; assess any new destructive or unrelated action separately.

Earlier replacements were rejected: a generic blue blurred background instead of the original colorful ribbon; huge language selectors and misaligned flags; low-contrast contact text; a separate flag section; a square-looking globe, unreadable country labels, missing wheel zoom, lag and a blue loading circle. These are regression risks, not desired alternatives.

## Reference synthesis

These are inspirations, not a claim of pixel-identical reproduction:

- Stripe: dimensional moving ribbon, changing text gradients, marquee and rich color. Preserve the recovered three-dimensional orange/pink/lilac ribbon geometry and palette. A CSS blue blur is not equivalent.
- RushTranslate: warm milk/beige surfaces, centered headings, sophisticated multicolor accents.
- Vertero: clean first screen, gentle curved transitions, restrained footer with social and legal links.
- Multilingual Connections: compact, information-rich B2B layout; avoid large empty areas.

The result combines a warm quiet reading surface with a lively ribbon. Color sits behind content or inside selected headings; body text remains dark and legible. Avoid turning every surface into a loud animation.

## Color and gradient rationale

Source of truth: `src/iteration2.css` (loaded after older styles). Values below document the actual approved implementation and design reasoning, not colors sampled from reference websites.

- Milk `#fbf8f1`, deeper milk `#f1ebde`: warmth and a consistent canvas instead of the old cold blue-white sections.
- Ink `#263b41`, muted `#536565`: dark green/slate text holds contrast against cream and moving colors.
- Premium heading gradient, 110deg: `#a87c39` gold at 0%, `#415b78` slate blue at 32%, `#777a73` mineral gray at 60%, `#68784d` sage/olive at 82%, gold again at 100%. Gold adds warmth, blue gives professional structure, gray moderates saturation, sage connects to the legal/benefit palette. Repeated gold makes the sweep feel cohesive.
- Hero letter gradient, 110deg: `#314e79` blue, `#6d427d` plum, `#9c572b` copper, `#4a6b4c` green, blue again. Deeper colors keep letters readable over the bright ribbon; the repeating endpoints permit a smooth 16-second ease-in-out background-position animation. Background size is 220%.
- Service hover: gold and blue radial lights over a cream/sage/lilac linear wash. Multiple hues fulfill the request for a colorful glow while a pale base protects body-copy contrast. Small upward movement and restrained shadow complement the glow.
- Legal feature: dark evergreen radial surface (`#344f4b`, `#183739`, `#112c32`) with brass/gold accents. It distinguishes legal assistance and makes the sculpted scales feel substantial. Gentle balance tilt and passing sheen replace the earlier unsuitable animation.
- Benefits: alternating translucent cream and sage surfaces; all four cards respond consistently to hover.

## Continuous animation architecture

`src/HeroFlow.jsx`, `src/RibbonRenderer.js`, `src/iteration2.css`, and the ribbon WebP assets implement ONE shared ribbon behind the entire page. `HeroFlow` is outside main, before Header. `.page-wave` is fixed, pointer-events:none, z-index:0; root isolation and content z-index establish layering. A translucent milk shade softens the wave for readability. Section backgrounds are transparent or warm translucent washes.

Critical cascade lesson: an old opaque blue gradient on `main` initially hid the full-page wave. The final `main{background:transparent}` override is deliberate. If the animation disappears below the hero, inspect computed backgrounds and stacking, not just the renderer.

The matching poster displays immediately, during loading, on unsupported WebGL, and under reduced motion. Handle context loss/restoration and clean up listeners/RAF/resources. Desktop frame budget 40ms (~25fps), phones 50ms (~20fps); resolution capped by device ratio, 1.25 and 1700/canvas width. Hidden tabs stop drawing. Do not create one WebGL canvas per section or stretch a massive page-height canvas.

Flags belong INSIDE the hero/ribbon area. The duplicated strip loops continuously in 90 seconds (previously 60: 1.5 times slower), pauses when offscreen/hidden, and has a reduced-motion fallback. Decorative duplicate is aria-hidden. No pause/play buttons anywhere, per explicit owner request.

## Approved layout and content

- Header: compact centered flag/language controls, no mail icon. Navigation uses RU “Тарифы”, EN “Rates”, AZ “Tariflər”.
- Hero: centered, much larger type (~1.5 times previous desktop size), max 87px with responsive clamp. Narrow phones need smaller type to fit long Russian words; do not apply desktop scaling blindly.
- Services: centered gradient heading; eight rectangular non-link article cards on the left; no top-right arrows or misleading destinations. Two card columns on desktop. Legal square sits on the right and stacks below at narrow widths.
- Legal: custom `src/LegalArt.jsx` vector brass scales, hover/focus motion, external legal-site destination retained. Ensure art/title/link fit inside padding at 320px.
- About: wider copy column, current portrait retained. Replacement photograph is the one known pending item; owner said Zaur would supply it later. Do not invent a replacement portrait.
- Tariffs: centered heading; original prices and surcharge data preserved. On phones, amounts and units are separate block spans to prevent overlap. Check Russian, English and Azerbaijani units. Table header uses smaller mobile text with natural word boundaries.
- Why choose me: centered heading, larger two-by-two cards (one column on phones), simple icons removed. New bespoke artwork was deferred, not fabricated as an approved requirement.
- Payment methods: thin horizontal band, centered heading above genuine Sber, Western Union, YooMoney, SBP, Visa and Mastercard logos. Phones may wrap into a compact grid. No white/yellow text badges. Original shapes and brand colors retained. Source URLs and trademark notes: `public/assets/payments/credits.txt`. Inline SVG CSS was converted to presentation attributes for CSP compatibility.
- Contact: readable email, phone, location; no large white order-translation CTA. Do not reintroduce low-contrast blue text on dark blue.
- Footer: compact copyright, social icons, legal/privacy controls. Keep existing VK/Facebook destinations; exact owner-supplied LinkedIn URL is https://www.linkedin.com/in/zaurbayramov/en/ . Do not guess social URLs.

## Globe: preserve the fixes

Files: `src/WorldGlobe.jsx`, `src/EarthTexture.js`, globe data/assets. Keep the globe below Services. A circular canvas mask must remain circular even at 300% zoom: clip radius is size * .435, independent of magnification. CSS border-radius alone previously allowed square imagery when enlarged.

Support mouse wheel, trackpad scroll and Ctrl-wheel pinch, touch pinch, drag, keyboard, +/- and reset. Wheel handling is non-passive only inside the sphere; scrolling outside it must move the page. Coalesce wheel input into RAF rather than redraw per event. Cache the Earth surface so hovering country labels does not rerender the expensive texture. Detail imagery settles after gestures.

Country labels are HTML at a fixed readable text size (16px), anchored near the chosen country rather than stranded at the bottom. Click/tap pins selection; zoom recenters it; pinch preserves it. Prefetch data/textures with 700px root margin. A matching globe poster prevents the empty blue loading circle. Offscreen and hidden-tab motion stops. Keep the removed sentence “Немного любопытства — целый мир открытий.” and its translations absent. Do not add pause/play controls.

## Languages, privacy and assets

Real routes: RU `/`, EN `/en/`, AZ `/az/`. `src/i18n.js` has language copy, `src/data.js` shared data. Update all three when changing meaning. Avoid accidental changes to prices/contact details.

`netlify/edge-functions/language.js` chooses language from Netlify country data, with manual preference cookie remembered for a year. AZ → AZ; configured CIS countries → RU; other known countries → EN. Explicit language routes/manual choices win; unknown countries retain route; crawlers are not redirected. Preserve and test these rules. Static dist upload alone does not install the Edge Function.

Reuse local assets and respect CSP; do not weaken security headers to make an SVG work. Preserve font files, logo proportions, fallback images and asset attribution. Never store tokens in source or documentation.

## Workflow and meaningful checks

1. Read this guide, inspect git status/branch and existing code. Preserve unrelated changes. Confirm the remote production head before pushing; reconcile concurrent changes rather than force-push.
2. Use the existing architecture and targeted CSS overrides. Check computed styles when old cascade rules obscure new behavior. A successful build does not verify appearance.
3. Run `npm run build`, `node check.mjs`, `git diff --check`. The check script covers content in all routes and language routing logic.
4. Inspect rendered desktop and emulated mobile, including 1440/1280, 768, 390 and 320px. Test RU/EN/AZ: no horizontal overflow, centered headings/flags, readable text and logos, legal content fitting its square, mobile menu, tariff values/units, footer links and privacy dialog/Escape.
5. Verify ribbon changes frames at the hero AND footer, poster fallback/reduced motion, no visible pause/play buttons, full-page warm background and no opaque main gradient. Hover all service/benefit cards; allow CSS transitions to settle before asserting opacity (do not assert exactly 1 mid-transition).
6. For globe changes, verify circular alpha mask at 100–300%, wheel/Ctrl-wheel/pinch, pinned labels, reset, outside page scroll, coalesced wheel bursts, cached hover, and delayed texture/poster. Do not call emulation a real-device test.
7. Review screenshots, not only DOM bounds. A table can have no page overflow while text overlaps inside cells; this occurred at 320px and was corrected by stacked amount/unit spans.
8. Commit and push the intended production branch using available authenticated Git tooling. Never expose credentials. Poll live HTML with a cache-busting query until it references the exact newly built JS asset; then test the actual Netlify site at desktop and narrow phone sizes. A successful push is not evidence the new build is live.
9. Report the published link, material changes and pending portrait. State limitations when relevant.

## Past validation evidence and tooling portability

The second iteration passed builds/content checks, layouts in all three languages at 320–1440px, hover/legal/menu/privacy/reduced-motion interactions, globe wheel/pinch regressions, and live Netlify checks at 1440 and 320px. Real phone hardware was not tested. Browser screenshots were visually reviewed. These are historical results, not a substitute for checking a future change.

During this session Chromium was driven with Playwright in a headless environment; temporary test scripts/screenshots lived under `/workspace/work/scripts` and `/workspace/work`. Those paths and the runtime Playwright import are environment-specific, not repository dependencies. Recreate equivalent checks with available browser tooling rather than assuming these scratch files persist. Useful flags in that environment were `--no-sandbox --enable-unsafe-swiftshader --use-angle=swiftshader`; certificate bypass was needed only for the environment's proxy, never as a production site setting. Some injected `about:srcdoc` frames emitted unrelated CSP console messages; inspect origin/source before classifying errors and never broadly suppress application errors.

This document is the portable memory. Keep it current when the owner approves a material change; distinguish approved choices, experimental ideas and pending inputs.

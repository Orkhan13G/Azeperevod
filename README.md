# AZEPEREVOD — motion update — interactive globe and document-scan cards

Built from the files supplied on October 26, 2026. This is a complete project,
not a replacement design. Existing copy, pricing, portrait, payments, language
routes, contact flow and section structure are retained.

## Run locally

Use Node.js 22 LTS. Open a terminal in this folder:

```sh
npm ci
npm run build
npm run preview
```

Open the localhost URL printed by Vite. For editing with automatic reload:

```sh
npm run dev
```

The development-only Vite plugin omits the strict CSP meta so Vite can inject
styles. The production build retains the original CSP and security headers.

## What changed

- Removed the former translation-paper animation and its component/style files.
- Added an original animated blue ribbon canvas inspired by the supplied Stripe
  reference. Navy #062b53, cobalt #2461ce, azure #389dd8 and ice #b6ddf5.
- Expanded the hero text area, disabled heading hyphenation/forced breaks,
  and tuned font sizes for narrow screens and larger laptops.
- Added local SVG flags for all 249 ISO country/territory entries supplied by
  flag-icons 7.6.0. Flags are illustrative, not a claim of service coverage.
  Country names are bundled in RU/EN/AZ so they work even when a browser lacks Azerbaijani locale data.
- Flags are 48 × 36 px on desktop and 40 × 30 px on phones, moving at roughly
  18 px/sec and 14 px/sec respectively. The full collection loops seamlessly.
  Hover/focus pauses the strip; its control pauses it persistently. The strip
  can be scrolled horizontally, including when reduced motion is enabled.
- Buttons use a directional light sweep, arrow movement and restrained press
  feedback. Text links receive an animated underline.
- Reduced general section padding from 108 to 90 px, 80 to 68 px on tablets,
  and 70 to 58 px on phones; adjusted special hero/services/contact spacing.
- Canvas rendering is capped at about 30 fps and 1400 px wide. It stops while
  offscreen, in hidden tabs, paused, or under reduced-motion preferences.
- A static gradient remains if canvas is unavailable. Reduced-motion users
  receive a static canvas frame and manually scrollable flags.
- Portrait error handling uses a CSS class rather than an inline display style.

## Key files

- `src/main.jsx`: page integration and existing components.
- `src/HeroFlow.jsx`: ribbon canvas, pause controls, flag strip.
- `src/motion.css`: new palette, dimensions, interactions and responsive rules.
- `src/countries.json`: ordered ISO country/territory list; Azerbaijan first.
- `public/assets/flags/`: self-hosted SVG flags and their MIT license.
- `src/style.css`, `src/i18n.js`, `src/data.js`: retained baseline styling/content.

## Verification

- Production build and RU/EN/AZ HTML generation passed.
- Browser layout checked at 320, 390, 768, 1024 and 1440 px in each language:
  no page overflow or heading overflow in these 15 checks.
- Mobile hero and desktop hero visually inspected.
- Reduced-motion rules and animation cleanup inspected in source.
- This is browser-based responsive QA, not a benchmark on physical devices.

## Latest revision: globe and service-card effects

The former country fan has been replaced with a medium-size canvas globe.
Drag to rotate; hover a country to highlight it and display its flag/name.
On phones, drag and tap. The globe slowly turns at 2 degrees per second;
hover, keyboard focus and dragging interrupt automatic rotation. Pause,
left/right and reset controls are included. Arrow keys rotate the focused globe.
Reduced-motion preferences disable automatic rotation. Rendering stops offscreen
and in hidden tabs. This is a playful decoration, not a service coverage map.
The simplified world-atlas 110m map has 177 country geometries; very small
countries/islands are omitted at this resolution. Map and flags are self-hosted.

Service cards sweep a light beam across their face and unfold a corner on desktop hover.
Card and icon geometry remains stable to prevent hover jitter. Main buttons retain
the prominent blue fill and light streak. Keyboard focus receives feedback.
The Why section has a subtle diagonal background pattern, blue card highlights
and animated icon accents. Header icons are larger and language controls include
flags. Hero motion and the flag ribbon move more slowly.

Files: src/WorldGlobe.jsx, src/refinements.css, src/button-effects.css,
public/assets/world-countries.json and its adjacent world-atlas license.

Validation: production build passed; desktop country selection, dragging,
pause/reset and service-card hover checked in browser. Layout checked at
320/390/768/1024/1440px in RU/EN/AZ without horizontal overflow.
This is browser responsive QA, not physical-device testing. No live deployment.

## Netlify

Nothing has been deployed. For a manual deployment after review, upload the
**contents of `dist/`** produced by `npm run build`. For repository deployment,
use build command `npm run build` and publish directory `dist`.

## Color and mobile fixes

Hero ribbons now blend violet, cobalt and teal over the existing navy background.
The globe uses a pastel country palette, deep indigo oceans and soft atmospheric glow.
Touch selection persists after pointer release/leave, with the selected country
above the globe on phones. Small-country touch hits have a modest proximity tolerance.
Cancelled gestures release drag state. Header links are 15px on wide screens,
with larger 17px menu links on compact screens. Location is localized in the hero,
contact area and footer: Баку, Азербайджан / Baku, Azerbaijan / Bakı, Azərbaycan.
Removed pointer-driven card tilting and icon transforms that could jitter on hover;
kept color, light-sweep, fold and highlight feedback.

Validation: production build passed. RU/EN/AZ layouts checked at 320, 1024 and
1440px without overflow. A simulated touch pointerdown/up/leave sequence retained
the selected country. Physical phone testing was not performed.

## Realistic Earth revision

Replaced the colored atlas surface with a locally hosted NASA/Goddard SVS
Earth texture including natural terrain, oceans and cloud cover. Added subtle
atmospheric rim lighting and retained a soft floating shadow. Country outlines
appear only on selection. Rotation, drag, pause, reset, keyboard controls and
persistent mobile selection remain available. The hero palette is unchanged.

src/EarthTexture.js renders the texture using WebGL, with a bounded 280px
software fallback when WebGL is unavailable. No new runtime dependencies.
Imagery source and credits: public/assets/earth-imagery-CREDITS.txt.
This is a static cloud composite, not live weather.

Validation: production build passed; rendered texture orientation and Libya
selection alignment checked in the browser.

## Soft textured hero, zoom and logo reservation

Replaced visible hero ribbons with five softly blended moving color fields and
one reusable fine-grain tile. Muted the left side to slate blue; increased the
motion range and pace while retaining frame/resolution limits and pause behavior.

Globe +/− controls zoom from 100% to 180% in 20% steps. Reset restores 100%.
Zoom reuses the same image and fixed renderer resolution; no new tiles, network
requests or larger buffers. Country hit testing follows the zoomed projection.

Reserved logo slots: header 72x54px on wide screens (responsive smaller slots),
footer 96x70px. To add the logo, put the file in public/assets and set brandLogo
in src/data.js to its /assets/ path. Existing wordmark remains beside the slot.

Validation: production build passed; zoom steps, upper bound and reset checked
in browser. RU/EN/AZ header and page widths checked at 320/390/1024/1440px with
no horizontal overflow. Physical-device performance has not been benchmarked.

## Gradient restored

Restored the previous flowing multicolor hero gradient and removed the grain
texture. Globe zoom and reserved logo space remain.

## Current revision: refined ribbons and pinch zoom

Preserves the restored multicolor ribbons, with 25% faster motion, a slightly
wider sweep, a faded leading edge and softer transitions. No grain texture.

Globe controls now support 100–200% zoom, superseding the earlier 180% limit.
Phones support two-finger pinch zoom, one-finger rotation and persistent country
taps. Gesture cancellation clears drag state. Reset restores 100%.
On capable WebGL devices, a 4096×2048 NASA texture loads only after zooming;
the initial 2048px texture remains lightweight. Rendering stays at the existing
capped buffer size and reprojects the texture at each zoom level. Software
fallback remains lower resolution. This is bounded zoom, not unlimited map detail.

Validation: production build passed; simulated touch gestures verified the 100%
and 200% bounds, continuation with one finger, cancellation cleanup and country
tapping afterward. Desktop zoom controls reached 200%; hero and zoomed Earth
visually inspected. Physical phone testing/performance benchmarking not performed.
No deployment.

## Current revision: coordinated ribbon wave

Narrowed the hero band to roughly half its previous top width. Both top and
bottom travel on a shared approximately 12.6-second wave, with the lower end
following slightly behind. Intermediate curve points follow the same phase
to produce a continuous bend. Both edges fade softly into navy. Rendering
uses fewer strokes (88 instead of 110); existing frame caps, pause, reduced
motion and visibility controls remain. Globe and other page features unchanged.

Validation: production build passed; browser inspection confirmed narrower
ribbon and visible motion at both ends.

## Current revision: breathing ribbon

The ribbon gently expands and contracts by 25% around its centerline, while
retaining the coordinated top/bottom wave. Movement is approximately 17% slower
than the previous revision (about 15 seconds per sway cycle). Width changes
complete a cycle in about 19 seconds. Palette, controls and globe unchanged.
Validation: production build passed.

## Current revision: continuously transforming ribbon

Replaced synchronized sinusoidal breathing with smoothly interpolated wandering
values for position, tilt, curvature and four local widths. No short repeating
timeline or reset; upper/lower widths evolve independently while connected by
one continuous surface. Reduced saturation from 85–88% to 53–55% and lowered
blue lightness. Existing frame limits, pause and reduced-motion behavior remain.
Pace is a visual approximation, not a measured match to Stripe.
Validation: production build passed; desktop motion and palette inspected.

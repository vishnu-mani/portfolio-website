# Architecture notes

Implementation detail for `portfolio-website`, kept out of the README so the
README stays a quick start. Most of what follows documents a bug that was
actually hit — treat each one as a rule, not trivia.

## Technical skills & logos

The four groups (Frontend / Backend / Database / Tools) and their 22 entries
mirror vishnu-mani.netlify.app exactly, using the same `devicon` icon names.

The section is a **pinned horizontal rail**: four full-height panels — Frontend,
Backend, Database, Tools — that scroll sideways as you scroll down, using the
same ScrollTrigger pin as `ExperienceSection`.

- Each panel has its heading, a count, and **all of its icons on one row** at
  ~3x the usual logo size (~69px), vertically centred, with a fixed **50px**
  gap between icons.
- The section header stays put while the rail scrolls sideways — it lives
  inside the pinned viewport, so it is fixed for the whole horizontal travel.
- There are no borders anywhere in the rail. The only rule is a single
  hairline between adjacent panels (`.panel + .panel { border-left }`), so
  three lines separate four panels.
- The rail is given an explicit height when pinned so those separators read as
  full column rules instead of short ticks sized to the tallest group.

### Fallbacks

Below 861px, and under `prefers-reduced-motion`, the pin is never created and
the rail **changes shape**: the four panels stack vertically, separated by a
horizontal hairline instead of a vertical one, and each panel's single icon row
becomes a wrapped grid (`repeat(auto-fill, minmax(4.25rem, 1fr))`, four columns
on a phone). Nothing scrolls sideways — horizontal scroll is desktop only.

This is keyed off `.stack:not(.is-pinned)` rather than a width query, so CSS and
JS cannot disagree about which mode is live, and a pin torn down by a resize
lands in the grid automatically.

Two details that are easy to get wrong:

- The rail lives **outside** `.shell`, so the stacked track has to carry its own
  `padding-inline: var(--gutter)`. Without it the panels sit flush against the
  viewport edge while the section heading above them is indented.
- The drag affordances (`touch-action: pan-y`, `cursor: grab`) must be cleared
  in this state, and `overflow-x` returned to `visible`. `useDragScroll` checks
  `overflow-x` before engaging, so it then no-ops rather than showing a grab
  cursor that does nothing.

Note this differs from `ExperienceSection`, which keeps its horizontal rail at
every width (it pins on phones too). Skills goes to a grid on phones because
its panels are far wider than a viewport — Frontend alone is ~1350px.

### Making those rails scroll at all under Lenis

Native touch scrolling of a nested overflow container proved unreliable on real
devices under Lenis, so **the horizontal axis is driven explicitly** by
`app/composables/useDragScroll.ts` rather than left to the browser:

- The rail gets `touch-action: pan-y` when unpinned. The browser keeps vertical
  panning (the page still scrolls) and hands us everything horizontal. With
  `touch-action: auto` the browser claims the gesture and fires
  `pointercancel`, killing the drag.
- `useDragScroll` waits ~6px to read intent. Horizontal wins and it sets
  `scrollLeft` directly; vertical releases the pointer so the page scrolls.
- It only engages when the element is a *real* scroll container (computed
  `overflow-x` is auto/scroll). While pinned the rail is `overflow-x: visible`,
  where `scrollWidth` still exceeds `clientWidth` but `scrollLeft` cannot move
  — without that check a drag there would show a grabbing cursor and do
  nothing.
- Pointer Events are identical for touch, pen and mouse, so the rails are also
  mouse-draggable whenever they are not pinned.

Lenis is additionally configured with **`allowNestedScroll: true`** (it
defaults to false and otherwise consumes these gestures) and each rail carries
**`data-lenis-prevent-horizontal`** — the horizontal-only variant on purpose,
so vertical gestures still reach Lenis and the page scrolls normally when you
swipe up/down on a rail.

## Always opening at the top

Browsers restore the previous scroll offset on reload, which drops you mid-pin
with stale ScrollTrigger positions and a half-scrolled rail. The plugin sets
`history.scrollRestoration = 'manual'` and forces the offset to 0, re-asserting
it on `app:mounted` and on `window.load` — something downstream sets
`scrollRestoration` back to `'auto'`, so a single assignment is not enough, and
the forced scroll is what actually does the work.

## Two pinned sections on one page

Note the conditions differ: `SkillsSection` pins at `(min-width: 861px)`,
`ExperienceSection` pins at any width but only when the section actually fits
(see below). On a tablet the roles rail is pinned while the skills rail is a
drag-scroll — deliberate, because only the roles section was asked to work
this way on touch.

`SkillsSection` and `ExperienceSection` both pin and scrub a horizontal rail.
Stacking two pins caused a visible glitch that took three separate fixes; if
you add a third pinned section, apply all of them.

- **`refreshPriority` is mandatory.** Without it the lower section measured its
  start *before* the upper section's pin spacer existed, cached a start ~570px
  too high, and unpinned 453px early — mid-travel, with the last cards still
  offscreen, snapping the section upward. Stack gets `refreshPriority: 1`,
  Experience `-1`: higher refreshes first, so each measures against finished
  geometry above it.
- **`scrub: true`, never a lag value.** With `scrub: 0.6` the rail was still
  easing toward its target when ScrollTrigger unpinned at the end, so it
  arrived short (`x = -776` of `-1003`) and the release snapped. Lenis already
  smooths the scroll; the scrub does not need to.
- **No `anticipatePin`.** It pinned ~130px early and jumped the section up by
  that much. It exists to hide lag on native fast-flick scrolling, but Lenis
  drives ScrollTrigger from the same ticker, so there is no lag to hide.
- **Set both pins up through `gsap.matchMedia()`, never a one-off
  `matchMedia(...).matches` check in `onMounted`.** A plain check decides once
  at page load and never again, so a window resized across the breakpoint
  leaves the section stuck in whichever mode it loaded in — load narrow then
  maximise and neither section pins at all. `gsap.matchMedia` builds and tears
  down on every flip, and the teardown must `clearProps: 'x'` so the rail does
  not keep a leftover transform in native-scroll mode.
- **Key the native-scroll CSS off `:not(.is-pinned)`, not a width query.** The
  class reflects what the JS actually did; a width query is a second, separate
  opinion that can disagree with it after a resize.

The invariants to check after touching any of this, at a few scroll speeds:
while pinned the section's `top` must stay constant; at release `top` must
equal its natural position (`spacerStart + distance - scrollY`); and the track
must reach its full distance before the release. All three hold now, with
engage and release within 2px.

## Live CSSBattle rank

The `#nn` stat in the About section is fetched live, with the last known value
(`#32`) as the static fallback.

`cssbattle.dev` has no documented API, but its own player page calls a public,
unauthenticated Cloud Function:

```
GET https://us-central1-cssbattleapp.cloudfunctions.net/getRank?userId=<uid>
→ { rank, playedCount, totalPlayers, score }
```

`server/api/cssbattle.get.ts` proxies it because it sends no CORS headers (the
browser cannot call it directly) and so the response can be cached — one hour,
stale-while-revalidate, so visitors don't each hit their function.

On failure the handler **throws** rather than returning an error object:
`defineCachedEventHandler` caches what is returned, so a returned failure would
pin an outage in cache for a full hour. A thrown error is not cached and the UI
just keeps the static value.

Because this is an undocumented internal endpoint, it can change without
notice. If the rank stops updating, check that endpoint first; the site
degrades to the static number rather than breaking.

**Deployment note:** on SSR hosting (the default Nitro output, incl. Netlify
and Vercel) the rank is genuinely live. Under `npm run generate` the route is
prerendered, so the number is frozen at build time — rebuild to refresh.

```

## Motion

Every animation is gated behind `prefers-reduced-motion`. When it is set, Lenis
is never instantiated, the preloader resolves immediately and all reveal states
render in their final position.

### Two rules worth keeping

**Always `fromTo`, never `from`, with ScrollTrigger.** A `from` tween renders
its start state immediately and then races its own ScrollTrigger; in this
project that left a whole grid stuck at `opacity: 0` in the production build.
`useReveal` is the single reveal path — use it rather than hand-rolling a tween.

**Never tween two competing transforms on one element.** `MarqueeStrip`
animates `x` on `.marquee__track` and the scroll-velocity skew on a separate
`.marquee__skew` wrapper. Putting both on one element (especially with
`overwrite: true`) kills the looping tween the moment you scroll.

### Custom cursor

`AppCursor` is behind `v-if="enabled"`, and `enabled` is only set after the
pointer-capability check. The GSAP `quickTo` setters therefore have to be bound
**after `await nextTick()`** — binding them in the same tick binds them to
`null` and the cursor silently never moves. It is hidden entirely on touch
devices and under reduced motion, and uses `mix-blend-mode: difference` against
`--blend-fg` so it stays visible over every surface in both themes.

### Selected roles

`ExperienceSection` pins itself for one viewport height and translates the card
rail horizontally as you scroll vertically (GSAP ScrollTrigger `pin` + `scrub`).
Pin distance is derived from the real track width via `invalidateOnRefresh`, so
it stays correct across resizes and late font loads.

**It pins on phones too**, unlike `SkillsSection`, which is still desktop-only.
Two things make that safe:

- The pinned box is `100svh`, which is sized to the largest browser UI, so
  showing or hiding the address bar cannot change its height mid-scroll. Paired
  with `ScrollTrigger.config({ ignoreMobileResize: true })` in the gsap plugin,
  an address-bar toggle no longer refreshes (and jumps) a pinned section.
- **A runtime fit check**, not a hardcoded height threshold. The pinned
  viewport is a fixed `100svh` box with `overflow: hidden`, so a section that
  does not fit gets part of every card clipped. After `nextTick` (once
  `is-pinned` is applied and the box is real) the component measures
  `head.height + rail.height` against `viewport.clientHeight`; if it does not
  fit it sets `pinned = false` and never creates the ScrollTrigger, so CSS
  falls back to the drag rail.

  This replaced a `(min-height: 560px)` media guard, which went stale the
  moment the bullet font size changed: the card's height depends on both the
  viewport width and the type size, so one number cannot describe it. At 14px
  bullets the section needs 593px at 375px wide but 724px at 320px wide — no
  single threshold covers both. The query keeps a cheap `(min-height: 560px)`
  pre-filter only so it re-evaluates on rotation.

To buy that fit, the phone-pinned layout drops the intro note and tightens card
padding and leading (`.work.is-pinned` inside the `max-width: 860px` block),
and keeps bullets at 14px where the base size is 16px.
That took the section from 806px to 533px tall, so it clears a 560px viewport
with room instead of overflowing by default.

Under `prefers-reduced-motion`, and below the height guard, the pin is never
created and the rail falls back to drag-to-scroll.

## `overflow-x` belongs on `<html>`, not `<body>`

The page clips horizontal overflow (marquees and the hero disc deliberately
run past the edge). That clip **must** be declared on `<html>`.

With `overflow-x: hidden` on `<body>`, a `position: fixed` element is sized to
the viewport *including* the scrollbar gutter while the layout viewport
excludes it. On a 375px phone the fixed header measured 427px, which pushed the
menu button to x=375–407 — completely off-screen and impossible to tap.
`overflow-x: clip` on the body has the same bug; only moving the rule to
`<html>` makes the header match the document width (375 = 375).

If a fixed element ever looks wider than the page again, check this first.

## The footer wordmark

`© madd.developer` is an inline `<svg>`, not styled text. The `<text>` element
carries `textLength="1000"` with `lengthAdjust="spacing"` against a
`0 0 1000 120` viewBox, so the string is tracked to exactly the viewBox width
and the SVG scales to its container.

That makes it span the content column exactly at any resolution — verified at
375px, 1280px and 1920px — and the fit does not depend on the webfont having
loaded. The previous `font-size: clamp(2.5rem, 13vw, 11rem)` with `white-space:
nowrap` overflowed phones and under-filled wide screens.

## Role card sizing

- `.job` is `clamp(40rem, 72vw, 64rem)` — deliberately 2x the original
  `clamp(20rem, 36vw, 32rem)` at every width, giving a 922px card at 1280px.
  This only applies from 861px up; both `max-width: 860px` blocks set their own
  width. Wider cards wrap less, so they are also *shorter* — the rail went from
  537px to 453px tall at 1280px.
- `.job__point` is 16px, except on phone-pinned cards where it is 14px. 16px
  there makes the tallest card 700px at 375px wide and 843px at 320px — taller
  than any phone viewport, which would fail the fit check above and drop the
  mobile horizontal scroll entirely.

## Color & theming

Light and dark mode mirror vishnu-mani.netlify.app, including its most
distinctive trait: **the primary colour changes with the theme.**

|            | light     | dark      |
| ---------- | --------- | --------- |
| background | `#f1f0ec` | `#202020` |
| text       | `#202020` | `#f1f0ec` |
| primary    | `#673ab7` | `#40b883` |

All tokens live in `app/assets/css/main.css` on `:root` and `:root.dark`.
Components never hardcode a colour — they use the semantic tokens:

- `--bg` / `--bg-alt` / `--fg` / `--fg-soft` / `--fg-faint` / `--line`
- `--inv-bg` / `--inv-fg` / `--inv-line` — panels that deliberately invert
  against the page (preloader, contact, inverted marquee, the closing role
  card). These flip with the theme, so the composition's light/dark rhythm
  survives in both modes: in dark mode the contact block becomes the light one.
- `--accent` plus three companions, because one purple/green cannot serve every
  background: `--on-accent` (text on an accent fill), `--accent-deep` (small
  text on `--bg`), `--accent-inv` (small text on `--inv-bg`).
- `--blend-fg` — a constant light value for the two `mix-blend-mode: difference`
  elements (header bar, custom cursor). It must **not** flip: difference against
  a constant light colour is already legible over both themes.

Every foreground/background pair in both themes meets WCAG AA (≥4.5:1); the
lowest is 4.65:1.

### How the theme is chosen

1. A blocking inline script in `nuxt.config.ts` runs before first paint: it
   reads `localStorage['vm-color-scheme']`, falls back to
   `prefers-color-scheme`, and sets `.dark` on `<html>`. This is what prevents
   a flash of the wrong theme.
2. `useTheme()` **adopts** whatever that script decided rather than deciding
   again — deciding twice would cause a hydration mismatch.
3. The OS preference is followed only until the visitor picks a theme
   explicitly; after that their choice wins and persists.

If you change the storage key, change it in both `nuxt.config.ts` and
`app/composables/useTheme.ts` — they are intentionally duplicated because the
inline script cannot import anything.

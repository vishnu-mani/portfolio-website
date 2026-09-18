# portfolio-website

Personal portfolio for **Vishnu M** — Senior Frontend Engineer.

An editorial, motion-led single page: oversized type, scroll-driven horizontal
rails, a live CSSBattle rank, and a light/dark theme where the primary colour
changes with the mode.

**Links** · [GitHub](https://github.com/vishnu-mani) ·
[CSSBattle](https://cssbattle.dev/player/robocoder) ·
[Current site](https://vishnu-mani.netlify.app) ·
[Email](mailto:vishnumani1993@gmail.com)

---

## Stack

| | |
| --- | --- |
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, SSR) |
| Animation | [GSAP](https://gsap.com) + ScrollTrigger, [SplitType](https://github.com/lukePeavey/SplitType) |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) |
| Icons | [@nuxt/icon](https://github.com/nuxt/icon) with local `devicon` + `logos` sets |
| Styling | Plain CSS with custom properties — no UI framework |

## Requirements

Node **20+**. The repo pins `24.20.0` in `.nvmrc`:

```bash
nvm use
```

## Getting started

```bash
npm install
npm run dev
```

The dev server prints its URL (default `http://localhost:3000`).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | SSR production build into `.output/` |
| `npm run preview` | Serve the production build |
| `npm run generate` | Fully static output |

To run the production build directly:

```bash
node .output/server/index.mjs
```

## Features

- **Scroll-driven horizontal rails** — Technical Skills and Selected Roles pin
  and scrub sideways as you scroll down. Skills becomes a stacked grid on
  phones; Roles keeps its rail at every size.
- **Live CSSBattle rank** — the stat in About is fetched at runtime and cached
  server-side, not hardcoded.
- **Light / dark mode** — the whole palette swaps, including the primary
  colour (purple in light, Vue green in dark), with no flash on load.
- **Motion throughout** — preloader, split-character headline, velocity-
  reactive marquees, scroll-scrubbed kinetic type, custom cursor.
- **Reduced-motion and touch aware** — every animation is gated behind
  `prefers-reduced-motion`, and pinning is skipped where it would fight touch
  scrolling or clip content.
- **Accessible colour** — every foreground/background pair in both themes
  meets WCAG AA (lowest measured 4.65:1).

## Project structure

```
app/
  app.vue                    shell: preloader, cursor, header, page
  pages/index.vue            section order
  assets/css/main.css        design tokens + type scale
  data/
    skills.ts                skill groups + the icon list nuxt.config bundles
  composables/
    useSiteData.ts           ALL copy lives here — edit this, not components
    useTheme.ts              light/dark state + persistence
    useReveal.ts             scroll-triggered entrance (the only reveal path)
    useDragScroll.ts         pointer-driven horizontal rails
    useMagnetic.ts           cursor-magnet helper
  plugins/
    gsap.client.ts           GSAP + ScrollTrigger + Lenis
  components/
    AppPreloader.vue         counter + curtain
    AppCursor.vue            custom dot/ring cursor (pointer:fine only)
    SiteHeader.vue           blend-mode nav + theme toggle
    HeroSection.vue          split-char headline + parallax disc
    MarqueeStrip.vue         velocity-reactive marquee
    AboutSection.vue         bio + stats (incl. the live rank)
    KineticBanner.vue        scroll-scrubbed scattered letters
    SkillsSection.vue        pinned horizontal rail, one panel per layer
    CraftSection.vue         capability grid
    ExperienceSection.vue    pinned horizontal role rail
    ContactSection.vue       CTA, socials, footer wordmark
server/
  api/cssbattle.get.ts       cached proxy for the live CSSBattle rank
docs/
  ARCHITECTURE.md            implementation notes and hard-won gotchas
```

## Editing content

**All copy lives in [`app/composables/useSiteData.ts`](app/composables/useSiteData.ts)** —
profile, stats, capabilities, experience, social links and nav. Nothing is
hardcoded in components. Skills and their icons live in
[`app/data/skills.ts`](app/data/skills.ts).

### Profile links

`socialLinks` drives the footer. An entry with `href: null` is filtered out
rather than rendered as a dead link — fill one in and it appears automatically:

```ts
const socialLinks = [
  { label: 'GitHub',     href: 'https://github.com/vishnu-mani' },
  { label: 'CSSBattle',  href: 'https://cssbattle.dev/player/robocoder' },
  { label: 'LinkedIn',   href: null },  // <- add your profile URL
  { label: 'HackerRank', href: null },  // <- add your profile URL
  { label: 'Email',      href: `mailto:${profile.email}` },
]
```

### Adding a skill

Add it to the right group in `app/data/skills.ts` with an icon name from the
`devicon` or `logos` Iconify sets. `nuxt.config.ts` imports the icon list from
that file, so the new icon is bundled automatically — don't switch the icon
config back to whole collections, it adds ~13 MB to the build.

## Deployment

The default Nitro output is SSR and works as-is on Netlify, Vercel or any Node
host. On SSR hosting the CSSBattle rank is genuinely live (cached one hour).

Under `npm run generate` the API route is prerendered, so the rank is frozen at
build time — rebuild to refresh it.

## Architecture notes

Motion, theming, the pinned rails and the live-rank proxy each have sharp edges
that caused real bugs. They are written up in
**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — read it before changing any
of that code.

## Known gaps

- LinkedIn and HackerRank URLs are not set (see *Profile links* above). They
  are not on the current site and could not be verified, so they are omitted
  rather than guessed.
- The capability tags in `useSiteData.ts` are inferred from résumé copy — the
  source site renders its skill chips client-side, so they could not be
  scraped exactly. Adjust to taste.

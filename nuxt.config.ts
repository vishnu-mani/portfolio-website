// https://nuxt.com/docs/api/configuration/nuxt-config
import { SKILL_ICON_NAMES } from './app/data/skills'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon'],
  icon: {
    // Inline SVG rather than the default CSS-mask mode: the brand logos are
    // multi-colour, and a mask would flatten them to a single colour.
    mode: 'svg',
    // Bundle EXACTLY the icons we use, from the locally installed
    // @iconify-json collections. Bundling whole collections instead added
    // ~13 MB to the build; there is no runtime call to the Iconify API either
    // way. The list comes from app/data/skills.ts so it cannot drift.
    clientBundle: { icons: SKILL_ICON_NAMES, sizeLimitKb: 512 },
    serverBundle: false,
    provider: 'iconify',
  },
  routeRules: {
    // `defineCachedEventHandler` caches in-process, which on a serverless
    // platform means per-instance and lost on cold start. These headers let
    // Vercel's CDN hold the response instead, so the upstream Cloud Function
    // is hit about once an hour per region rather than once per instance.
    '/api/cssbattle': {
      headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Vishnu M — Senior Frontend Engineer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Vishnu M — Senior Frontend Engineer with 7+ years building Vue 3 / Nuxt architecture, leading teams and shipping products at 15,000+ user scale.',
        },
        { property: 'og:title', content: 'Vishnu M — Senior Frontend Engineer' },
        {
          property: 'og:description',
          content: 'Vue 3 / Nuxt architecture, performance engineering and team leadership.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#f1f0ec', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#202020', media: '(prefers-color-scheme: dark)' },
      ],
      script: [
        {
          // Runs before first paint so the theme never flashes. Must stay in
          // sync with THEME_STORAGE_KEY in app/composables/useTheme.ts.
          innerHTML:
            "(function(){try{var k='vm-color-scheme',s=localStorage.getItem(k)," +
            "d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;" +
            "var r=document.documentElement;r.classList.toggle('dark',d);" +
            "r.style.colorScheme=d?'dark':'light'}catch(e){}})()",
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap',
        },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },
})

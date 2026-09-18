import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  // Mobile browsers fire resize when the address bar shows/hides. Without this
  // every such toggle refreshes ScrollTrigger and can jump a pinned section
  // mid-scroll. Pinned sections use 100svh, so their height never actually
  // changes when the bar moves.
  ScrollTrigger.config({ ignoreMobileResize: true })

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis: Lenis | null = null

  if (!reduced) {
    lenis = new Lenis({
      duration: 1.1,
      lerp: 0.1,
      smoothWheel: true,
      // Native scrolling on touch devices feels better than an emulated one.
      syncTouch: false,
      // Let gestures that land on a nested scroll container (the horizontal
      // rails in the stack and experience sections) go to that container
      // instead of being consumed here. Defaults to false, which is why
      // swiping those rails sideways did nothing. Lenis re-checks the node's
      // real overflow per gesture, so it correctly stops deferring when a rail
      // is pinned and no longer scrollable.
      allowNestedScroll: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => lenis!.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  /**
   * Always open at the top. Browsers restore the previous offset on reload,
   * which drops you mid-pin with stale ScrollTrigger positions and a
   * half-scrolled rail. Re-asserted on the router and load hooks because
   * something downstream (vue-router's own history handling) sets
   * scrollRestoration back to 'auto' after this plugin runs.
   */
  const forceTop = () => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true, force: true })
  }

  forceTop()
  nuxtApp.hook('app:mounted', forceTop)
  window.addEventListener('load', forceTop, { once: true })

  // Anchor links should ride the smooth scroller too.
  const scrollTo = (target: string | HTMLElement, offset = 0) => {
    if (lenis) return lenis.scrollTo(target, { offset, duration: 1.3 })
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return {
    provide: {
      gsap,
      ScrollTrigger,
      lenis,
      scrollTo,
      reducedMotion: reduced,
    },
  }
})

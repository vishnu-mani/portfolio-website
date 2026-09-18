import type { Ref } from 'vue'

type RevealOptions = {
  /** Selector for the elements to stagger in. Defaults to `[data-reveal]`. */
  selector?: string
  stagger?: number
  y?: number
  start?: string
  /** Optional pop-in scale. Omit for a plain fade/rise. */
  scale?: number
  staggerFrom?: 'start' | 'center' | 'end' | 'random'
  duration?: number
}

/**
 * Scroll-triggered entrance for any `[data-reveal]` inside the given root.
 * No-ops on the server and under `prefers-reduced-motion`.
 */
export const useReveal = (root: Ref<HTMLElement | null>, options: RevealOptions = {}) => {
  const { $gsap, $ScrollTrigger, $reducedMotion } = useNuxtApp()
  const {
    selector = '[data-reveal]',
    stagger = 0.08,
    y = 28,
    start = 'top 82%',
    scale,
    staggerFrom = 'start',
    duration = 0.95,
  } = options

  onMounted(() => {
    if (!root.value || $reducedMotion) return

    const targets = root.value.querySelectorAll(selector)
    if (!targets.length) return

    // Always fromTo, never `from`: a `from` tween renders immediately and then
    // fights its own ScrollTrigger, which can leave targets stuck at opacity 0.
    const tween = $gsap.fromTo(
      targets,
      { opacity: 0, y, ...(scale === undefined ? {} : { scale }) },
      {
        opacity: 1,
        y: 0,
        ...(scale === undefined ? {} : { scale: 1 }),
        duration,
        ease: 'expo.out',
        stagger: { each: stagger, from: staggerFrom },
        scrollTrigger: { trigger: root.value, start, once: true },
      },
    )

    onBeforeUnmount(() => {
      tween.scrollTrigger?.kill()
      tween.kill()
    })
  })

  onMounted(() => {
    // Layout settles after fonts land; keep trigger positions honest.
    document.fonts?.ready.then(() => $ScrollTrigger?.refresh())
  })
}

<script setup lang="ts">
import SplitType from 'split-type'

const { profile } = useSiteData()
const { $gsap, $ScrollTrigger, $reducedMotion, $scrollTo } = useNuxtApp()

const props = defineProps<{ ready: boolean }>()

const root = ref<HTMLElement | null>(null)
const disc = ref<HTMLElement | null>(null)

let splits: SplitType[] = []

const play = () => {
  if (!root.value || $reducedMotion) return

  splits = Array.from(root.value.querySelectorAll<HTMLElement>('[data-split]')).map(
    (node) => new SplitType(node, { types: 'chars', charClass: 'hero__char' }),
  )

  const tl = $gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.from('.hero__char', {
    yPercent: 120,
    duration: 1.25,
    stagger: { each: 0.018, from: 'start' },
  })
    .from('[data-hero-fade]', { opacity: 0, y: 18, duration: 0.9, stagger: 0.09 }, '-=0.85')
    .from(disc.value, { scale: 0.2, opacity: 0, duration: 1.4, ease: 'expo.out' }, '-=1.2')
}

onMounted(() => {
  if ($reducedMotion || !root.value) return

  // Parallax: the headline drifts up slower than the page, the disc faster.
  $gsap.to('[data-hero-type]', {
    yPercent: -18,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
  })

  $gsap.to(disc.value, {
    yPercent: 55,
    rotate: 120,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
  })

  $gsap.to('[data-hero-veil]', {
    opacity: 1,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'center top', end: 'bottom top', scrub: true },
  })
})

watch(
  () => props.ready,
  (value) => value && nextTick(play),
  { immediate: true },
)

onBeforeUnmount(() => {
  splits.forEach((split) => split.revert())
  $ScrollTrigger?.getAll().forEach((trigger) => {
    if (root.value?.contains(trigger.trigger as Node)) trigger.kill()
  })
})
</script>

<template>
  <section id="top" ref="root" class="hero">
    <div ref="disc" class="hero__disc" aria-hidden="true" />

    <div class="hero__top shell">
      <p data-hero-fade class="meta hero__status">
        <span class="hero__dot" :class="{ 'is-live': profile.available }" />
        Available for work — {{ profile.location }}
      </p>
      <p data-hero-fade class="meta hero__year">© 2026 / {{ profile.handle }}</p>
    </div>

    <div class="hero__type shell" data-hero-type>
      <h1 class="display hero__headline">
        <span class="line-mask"><span data-split>Senior</span></span>
        <span class="line-mask"><span data-split>Frontend</span></span>
        <span class="line-mask hero__headline-last">
          <span data-split>Engineer</span>
          <em data-hero-fade class="italic-serif hero__since">since 2015</em>
        </span>
      </h1>
    </div>

    <div class="hero__bottom shell">
      <p data-hero-fade class="lede hero__intro">{{ profile.intro }}</p>

      <button data-hero-fade class="hero__cue meta" data-cursor @click="$scrollTo('#about', -8)">
        <span>Scroll down</span>
        <span class="hero__cue-line" aria-hidden="true" />
      </button>
    </div>

    <div data-hero-veil class="hero__veil" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: calc(var(--header-h) + 1rem) clamp(1.5rem, 4vh, 3rem);
  overflow: hidden;
}

.hero__disc {
  position: absolute;
  top: 8%;
  right: -6vw;
  width: clamp(16rem, 34vw, 34rem);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, var(--disc-hi) 0%, var(--accent) 45%, var(--disc-lo) 100%);
  filter: blur(0.5px);
  z-index: 0;
  will-change: transform;
}

.hero__top,
.hero__bottom {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.hero__status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--fg);
}

.hero__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fg-faint);
}

.hero__dot.is-live {
  background: #3fae4b;
  box-shadow: 0 0 0 0 rgba(63, 174, 75, 0.6);
  animation: pulse 2.4s infinite;
}

@keyframes pulse {
  70% {
    box-shadow: 0 0 0 10px rgba(63, 174, 75, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 174, 75, 0);
  }
}

.hero__type {
  position: relative;
  z-index: 2;
  will-change: transform;
}

.hero__headline {
  margin: 0;
}

.hero__headline :deep(.hero__char) {
  display: inline-block;
  will-change: transform;
}

.hero__headline-last {
  display: flex !important;
  align-items: baseline;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 2vw, 2rem);
  overflow: visible;
}

.hero__since {
  font-size: clamp(0.95rem, 1.6vw, 1.6rem);
  color: var(--fg-faint);
  letter-spacing: -0.01em;
}

.hero__intro {
  max-width: 34ch;
}

.hero__cue {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--fg);
  flex-shrink: 0;
}

.hero__cue-line {
  width: 3.5rem;
  height: 1px;
  background: var(--fg);
  position: relative;
  overflow: hidden;
}

.hero__cue-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateX(-100%);
  animation: sweep 2.2s var(--ease-out) infinite;
}

@keyframes sweep {
  50%,
  100% {
    transform: translateX(100%);
  }
}

.hero__veil {
  position: absolute;
  inset: auto 0 0 0;
  height: 30vh;
  background: linear-gradient(to bottom, transparent, var(--bg));
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

@media (max-width: 760px) {
  .hero__top,
  .hero__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  .hero__year {
    display: none;
  }
  .hero__disc {
    top: 3%;
    right: -26vw;
    width: clamp(11rem, 52vw, 18rem);
  }
}
</style>

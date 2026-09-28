<script setup lang="ts">
const { $gsap, $reducedMotion, $lenis } = useNuxtApp()

const root = ref<HTMLElement | null>(null)
const curve = ref<SVGPathElement | null>(null)
const done = ref(false)

const emit = defineEmits<{ complete: [] }>()

// Shown one after the other; English lands last so the reveal ends on the
// name the rest of the site uses.
const names = [
  { text: 'വിഷ്ണു', lang: 'ml' },
  { text: 'विष्णु', lang: 'hi' },
  { text: 'விஷ்ணு', lang: 'ta' },
  { text: 'ವಿಷ್ಣು', lang: 'kn' },
  { text: 'Вишну', lang: 'ru' },
  { text: 'Βίσνου', lang: 'el' },
  { text: 'فيشنو', lang: 'ar' },
  { text: 'ヴィシュヌ', lang: 'ja' },
  { text: '비슈누', lang: 'ko' },
  { text: 'Vishnu', lang: 'en' },
]

// The curve hangs below the panel. It starts bowed and flattens as the panel
// lifts, so the bottom edge looks like it is being dragged up.
const CURVE_DEPTH = 300
const CURVED = `M0 0 L1000 0 Q500 ${CURVE_DEPTH} 0 0 Z`
const FLAT = 'M0 0 L1000 0 Q500 0 0 0 Z'

const finish = () => {
  done.value = true
  $lenis?.start()
  document.documentElement.classList.remove('is-loading')
}

onMounted(() => {
  if ($reducedMotion) {
    done.value = true
    emit('complete')
    return
  }

  $lenis?.stop()
  document.documentElement.classList.add('is-loading')

  const words = root.value!.querySelectorAll<HTMLElement>('[data-preloader-word]')
  const tl = $gsap.timeline({ onComplete: finish })

  tl.from('[data-preloader-name]', { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out' })

  words.forEach((word, i) => {
    const first = i === 0
    const last = i === words.length - 1
    // First and last names linger; the ones in between flick past.
    const hold = first ? 0.4 : last ? 0.5 : 0.2
    tl.set(word, { autoAlpha: 1 }, first ? 0 : '>')
    if (!last) tl.set(word, { autoAlpha: 0 }, `>${hold}`)
    else tl.to({}, { duration: hold })
  })

  tl.to('[data-preloader-name]', { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' })
    .addLabel('lift', '-=0.1')
    .to(
      root.value,
      {
        // Clear the viewport plus the curve hanging beneath it.
        y: () => -(window.innerHeight + CURVE_DEPTH),
        duration: 1.1,
        ease: 'power3.inOut',
      },
      'lift',
    )
    .to(curve.value, { attr: { d: FLAT }, duration: 1.1, ease: 'power3.inOut' }, 'lift')
    // Let the hero start its intro while the panel is still clearing it.
    .call(() => emit('complete'), undefined, 'lift+=0.45')
})
</script>

<template>
  <div v-show="!done" ref="root" class="preloader" aria-hidden="true">
    <div data-preloader-name class="preloader__name">
      <span
        v-for="n in names"
        :key="n.lang"
        data-preloader-word
        :lang="n.lang"
        class="preloader__word"
      >{{ n.text }}</span>
    </div>

    <svg
      class="preloader__curve"
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
      :style="{ height: `${CURVE_DEPTH}px` }"
    >
      <path ref="curve" :d="CURVED" />
    </svg>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--inv-bg);
  color: var(--inv-fg);
  display: grid;
  place-items: center;
  will-change: transform;
}

.preloader__name {
  display: grid;
}

.preloader__word {
  grid-area: 1 / 1;
  justify-self: center;
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1.5vw, 1rem);
  visibility: hidden;
  opacity: 0;
  font-size: clamp(2.5rem, 9vw, 6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  white-space: nowrap;
  text-transform: uppercase;
}

.preloader__curve {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  display: block;
  fill: var(--inv-bg);
  /* Covers the hairline seam some browsers render between panel and svg. */
  margin-top: -1px;
  pointer-events: none;
}
</style>

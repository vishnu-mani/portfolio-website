<script setup lang="ts">
const { $gsap, $reducedMotion } = useNuxtApp()

const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const enabled = ref(false)
const label = ref('')

onMounted(async () => {
  if ($reducedMotion) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  enabled.value = true
  // The markup is behind `v-if="enabled"`, so the refs do not exist until Vue
  // has re-rendered. Binding quickTo before this tick binds it to null and the
  // cursor silently never moves.
  await nextTick()
  if (!dot.value || !ring.value) return

  const setDotX = $gsap.quickTo(dot.value, 'x', { duration: 0.12, ease: 'power3.out' })
  const setDotY = $gsap.quickTo(dot.value, 'y', { duration: 0.12, ease: 'power3.out' })
  const setRingX = $gsap.quickTo(ring.value, 'x', { duration: 0.5, ease: 'power3.out' })
  const setRingY = $gsap.quickTo(ring.value, 'y', { duration: 0.5, ease: 'power3.out' })

  const move = (event: PointerEvent) => {
    setDotX(event.clientX)
    setDotY(event.clientY)
    setRingX(event.clientX)
    setRingY(event.clientY)
  }

  const over = (event: PointerEvent) => {
    const target = (event.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]')
    if (!target) return
    label.value = target.dataset.cursor || ''
    $gsap.to(ring.value, { scale: label.value ? 3.4 : 2.2, duration: 0.4, ease: 'power3.out' })
  }

  const out = (event: PointerEvent) => {
    if (!(event.target as HTMLElement)?.closest?.('[data-cursor]')) return
    label.value = ''
    $gsap.to(ring.value, { scale: 1, duration: 0.4, ease: 'power3.out' })
  }

  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerover', over)
  window.addEventListener('pointerout', out)

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerover', over)
    window.removeEventListener('pointerout', out)
  })
})
</script>

<template>
  <div v-if="enabled" class="cursor" aria-hidden="true">
    <div ref="ring" class="cursor__ring">
      <span v-if="label" class="cursor__label">{{ label }}</span>
    </div>
    <div ref="dot" class="cursor__dot" />
  </div>
</template>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 190;
  pointer-events: none;
  /* Difference blend keeps the cursor visible over the page background AND
     over the inverted panels, in both themes, without any theme logic. */
  mix-blend-mode: difference;
  color: var(--blend-fg);
}

.cursor__dot,
.cursor__ring {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  will-change: transform;
}

.cursor__dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: currentColor;
}

.cursor__ring {
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border: 1px solid currentColor;
  opacity: 0.55;
  display: grid;
  place-items: center;
}

.cursor__label {
  font-family: var(--font-mono);
  font-size: 3px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: currentColor;
  white-space: nowrap;
}

@media (hover: none) {
  .cursor {
    display: none;
  }
}
</style>

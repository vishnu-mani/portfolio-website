<script setup lang="ts">
const { $gsap, $reducedMotion, $lenis } = useNuxtApp()

const root = ref<HTMLElement | null>(null)
const counter = ref(0)
const done = ref(false)

const emit = defineEmits<{ complete: [] }>()

onMounted(() => {
  if ($reducedMotion) {
    counter.value = 100
    done.value = true
    emit('complete')
    return
  }

  $lenis?.stop()
  document.documentElement.classList.add('is-loading')

  const progress = { value: 0 }
  const tl = $gsap.timeline({
    onComplete: () => {
      done.value = true
      $lenis?.start()
      document.documentElement.classList.remove('is-loading')
      emit('complete')
    },
  })

  tl.to(progress, {
    value: 100,
    duration: 1.6,
    ease: 'power2.inOut',
    onUpdate: () => (counter.value = Math.round(progress.value)),
  })
    .to('[data-preloader-text]', { yPercent: -110, duration: 0.7, ease: 'expo.inOut' }, '-=0.1')
    .to(
      root.value,
      { yPercent: -100, duration: 1, ease: 'expo.inOut' },
      '-=0.45',
    )
})
</script>

<template>
  <div v-show="!done" ref="root" class="preloader" aria-hidden="true">
    <div class="preloader__inner">
      <span data-preloader-text class="preloader__word">Vishnu&nbsp;M</span>
      <span data-preloader-text class="preloader__word preloader__word--muted">
        Senior Frontend Engineer
      </span>
    </div>
    <span class="preloader__count">{{ String(counter).padStart(3, '0') }}</span>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--inv-bg);
  color: var(--inv-fg);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: var(--gutter);
  will-change: transform;
}

.preloader__inner {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow: hidden;
}

.preloader__word {
  display: block;
  /* Scales with the viewport rather than flooring at a fixed size: the name
     and the counter share one row, so a large floor collides on narrow
     phones (at 375px a 2.75rem floor left 1px of clearance). */
  font-size: clamp(1.9rem, 11vw, 6.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
  will-change: transform;
}

.preloader__word--muted {
  font-family: var(--font-mono);
  /* Kept just under the name's width so it never wraps mid-phrase. */
  font-size: clamp(0.7rem, 3.2vw, 1.25rem);
  font-weight: 400;
  letter-spacing: 0.18em;
  color: var(--accent-inv);
  padding-top: 0.75rem;
}

.preloader__count {
  font-family: var(--font-mono);
  font-size: clamp(1.75rem, 9vw, 5rem);
  line-height: 1;
  color: var(--inv-fg);
  font-variant-numeric: tabular-nums;
}
</style>

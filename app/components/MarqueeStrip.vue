<script setup lang="ts">
const props = withDefaults(
  defineProps<{ items: string[]; speed?: number; invert?: boolean }>(),
  { speed: 22, invert: false },
)

const { $gsap, $ScrollTrigger, $reducedMotion } = useNuxtApp()
const root = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!root.value || $reducedMotion) return

  const track = root.value.querySelector<HTMLElement>('.marquee__track')!
  const skewer = root.value.querySelector<HTMLElement>('.marquee__skew')!

  const loop = $gsap.to(track, {
    xPercent: -50,
    duration: props.speed,
    ease: 'none',
    repeat: -1,
  })

  // Scroll velocity nudges the speed and skews the type — the "kinetic" bit.
  // The skew goes on a SEPARATE wrapper: tweening it on `track` (even without
  // `overwrite`) competes with the looping transform above.
  const trigger = $ScrollTrigger.create({
    trigger: root.value,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const velocity = $gsap.utils.clamp(-2.6, 2.6, self.getVelocity() / 420)
      loop.timeScale(1 + Math.abs(velocity))
      $gsap.to(skewer, {
        skewX: velocity * 3,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    },
  })

  onBeforeUnmount(() => {
    trigger.kill()
    loop.kill()
  })
})
</script>

<template>
  <div ref="root" class="marquee" :class="{ 'marquee--invert': invert }" aria-hidden="true">
    <div class="marquee__skew">
      <div class="marquee__track">
        <span v-for="n in 2" :key="n" class="marquee__group">
          <span v-for="item in items" :key="`${n}-${item}`" class="marquee__item">
            {{ item }}
            <span class="marquee__sep">✳</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  border-block: 1px solid var(--line);
  padding-block: clamp(0.85rem, 2vw, 1.5rem);
  background: var(--bg-alt);
}

.marquee--invert {
  background: var(--bg-alt);
  color: var(--fg);
  border-color: var(--line);
}

.marquee__skew {
  will-change: transform;
}

.marquee__track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.marquee__group {
  display: flex;
}

.marquee__item {
  display: inline-flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.75rem);
  padding-right: clamp(1rem, 3vw, 2.75rem);
  font-size: clamp(1.4rem, 3.4vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  text-transform: uppercase;
  white-space: nowrap;
}

.marquee__sep {
  color: var(--accent);
  font-size: 0.5em;
}

.marquee--invert .marquee__sep {
  color: var(--accent-inv);
}
</style>

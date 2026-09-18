<script setup lang="ts">
const props = defineProps<{ lines: string[] }>()
const { $gsap, $ScrollTrigger, $reducedMotion } = useNuxtApp()

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!root.value || $reducedMotion) return

  const chars = root.value.querySelectorAll<HTMLElement>('.kinetic__char')

  // Each letter carries its own random offset; scroll scrubs them into alignment.
  chars.forEach((char) => {
    $gsap.set(char, {
      yPercent: $gsap.utils.random(-70, 70),
      rotate: $gsap.utils.random(-14, 14),
      scale: $gsap.utils.random(0.78, 1.18),
    })
  })

  const tween = $gsap.to(chars, {
    yPercent: 0,
    rotate: 0,
    scale: 1,
    ease: 'none',
    stagger: { each: 0.01, from: 'random' },
    scrollTrigger: {
      trigger: root.value,
      start: 'top bottom',
      end: 'center center',
      scrub: 0.8,
    },
  })

  onBeforeUnmount(() => {
    tween.scrollTrigger?.kill()
    tween.kill()
  })
})
</script>

<template>
  <div ref="root" class="kinetic" role="img" :aria-label="props.lines.join(' ')">
    <p v-for="(line, i) in props.lines" :key="i" class="kinetic__line" aria-hidden="true">
      <span
        v-for="(char, j) in line.split('')"
        :key="`${i}-${j}`"
        class="kinetic__char"
        :class="{ 'is-space': char === ' ' }"
        >{{ char === ' ' ? ' ' : char }}</span
      >
    </p>
  </div>
</template>

<style scoped>
.kinetic {
  padding-block: clamp(4rem, 12vh, 9rem);
  text-align: center;
  overflow: hidden;
}

.kinetic__line {
  font-size: clamp(2.6rem, 12vw, 11rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.kinetic__char {
  display: inline-block;
  will-change: transform;
}

.kinetic__char.is-space {
  width: 0.28em;
}
</style>

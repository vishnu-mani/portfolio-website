/**
 * Pulls an element toward the cursor while hovered. Pointer-fine only.
 */
export const useMagnetic = (strength = 0.35) => {
  const { $gsap, $reducedMotion } = useNuxtApp()
  const el = ref<HTMLElement | null>(null)

  onMounted(() => {
    const node = el.value
    if (!node || $reducedMotion) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const move = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const x = (event.clientX - (rect.left + rect.width / 2)) * strength
      const y = (event.clientY - (rect.top + rect.height / 2)) * strength
      $gsap.to(node, { x, y, duration: 0.6, ease: 'power3.out' })
    }

    const reset = () => $gsap.to(node, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })

    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', reset)

    onBeforeUnmount(() => {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', reset)
    })
  })

  return el
}

import type { Ref } from 'vue'

/**
 * Drag-to-scroll for a horizontal rail, driven by Pointer Events.
 *
 * Native touch scrolling of a nested overflow container proved unreliable on
 * real devices underneath Lenis, so the horizontal axis is driven explicitly
 * here instead. Pointer Events are identical for touch, pen and mouse, so this
 * also makes the rails mouse-draggable when they are not pinned.
 *
 * Pairs with `touch-action: pan-y` on the element: the browser keeps vertical
 * panning (so the page still scrolls) and hands us everything horizontal. With
 * `touch-action: auto` the browser would claim the gesture and fire
 * pointercancel, killing the drag.
 */
export const useDragScroll = (el: Ref<HTMLElement | null>) => {
  /** How far the finger must travel before we decide the gesture is ours. */
  const THRESHOLD = 6

  onMounted(() => {
    const node = el.value
    if (!node) return

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let startLeft = 0
    let engaged = false

    /**
     * Must be a real scroll container, not merely wider than its box. While
     * pinned the rail is `overflow-x: visible`, so scrollWidth still exceeds
     * clientWidth even though scrollLeft cannot move — without the overflow
     * check a drag there would show a grabbing cursor and do nothing.
     */
    const scrollable = () => {
      const overflow = getComputedStyle(node).overflowX
      return (
        (overflow === 'auto' || overflow === 'scroll') &&
        node.scrollWidth > node.clientWidth + 1
      )
    }

    const release = () => {
      try {
        if (pointerId !== null && node.hasPointerCapture(pointerId)) {
          node.releasePointerCapture(pointerId)
        }
      } catch {
        // Pointer already gone; nothing to release.
      }
      pointerId = null
      engaged = false
      node.classList.remove('is-dragging')
    }

    const onDown = (event: PointerEvent) => {
      if (!scrollable() || pointerId !== null) return
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      startLeft = node.scrollLeft
      engaged = false
    }

    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      if (!engaged) {
        if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return
        // Vertical intent: hand the gesture back so the page scrolls.
        if (Math.abs(dx) <= Math.abs(dy)) {
          pointerId = null
          return
        }
        engaged = true
        try {
          node.setPointerCapture(event.pointerId)
        } catch {
          // Capture is an optimisation, not a requirement — keep dragging.
        }
        // Snapping mid-drag fights a direct scrollLeft, so it is disabled
        // while dragging and restored on release.
        node.classList.add('is-dragging')
      }

      node.scrollLeft = startLeft - dx
    }

    node.addEventListener('pointerdown', onDown)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerup', release)
    node.addEventListener('pointercancel', release)
    node.addEventListener('lostpointercapture', release)

    onBeforeUnmount(() => {
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerup', release)
      node.removeEventListener('pointercancel', release)
      node.removeEventListener('lostpointercapture', release)
    })
  })
}

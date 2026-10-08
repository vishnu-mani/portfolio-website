<script setup lang="ts">
const { skillGroups } = useSiteData()
const { $gsap, $ScrollTrigger, $reducedMotion } = useNuxtApp()

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const rail = ref<HTMLElement | null>(null)
const pinned = ref(false)
const progress = ref(0)

// Horizontal axis is driven by pointer events, not native touch scrolling.
useDragScroll(rail)

/** Horizontal distance the track has to travel to show the last panel. */
const distance = () => {
  if (!track.value || !viewport.value) return 0
  return Math.max(0, track.value.scrollWidth - viewport.value.clientWidth)
}

useReveal(root, { selector: '[data-reveal]', stagger: 0.06 })

onMounted(() => {
  if (!root.value || !track.value) return

  // gsap.matchMedia sets this up and tears it down as the query flips, so a
  // resize across the breakpoint is handled. The previous code decided once at
  // mount, which left the section stuck in whichever mode it loaded in.
  const mm = $gsap.matchMedia()

  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    // Class comes from a ref, not classList.add: the root also carries a Vue
    // binding, and Vue's class patching would wipe an imperative class.
    pinned.value = true
    // The class switches the viewport to a full-height stage, so the trigger's
    // start is only correct once Vue has applied it.
    nextTick(() => $ScrollTrigger.refresh())

    const tween = $gsap.to(track.value, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        // No anticipatePin: it pins ~130px early here and snaps the section up.
        // It exists to hide lag on native fast-flick scrolling, but Lenis drives
        // ScrollTrigger from the same ticker, so there is no lag to hide.
        invalidateOnRefresh: true,
        // First pin on the page: refreshed before the experience pin below, so
        // that one measures its start against this pin's finished spacer.
        refreshPriority: 1,
        onUpdate: (self) => (progress.value = self.progress),
      },
    })

    return () => {
      pinned.value = false
      progress.value = 0
      // matchMedia reverts the tween itself; clear the inline transform so the
      // rail starts from 0 in native-scroll mode.
      $gsap.set(track.value, { clearProps: 'x' })
      tween.scrollTrigger?.kill()
    }
  })

  onBeforeUnmount(() => mm.revert())
})

onMounted(() => {
  document.fonts?.ready.then(() => $ScrollTrigger?.refresh())
})
</script>

<template>
  <section id="stack" ref="root" class="stack" :class="{ 'is-pinned': pinned }">
    <div ref="viewport" class="stack__viewport">
      <header class="stack__head shell">
        <div class="stack__head-left">
          <p data-reveal class="meta">(02) — Stack</p>
          <h2 data-reveal class="display display--md stack__title">Technical skills</h2>
        </div>
        <div class="stack__head-right">
          <p data-reveal class="body stack__note">
            Twenty-two tools across four layers — the ones I reach for without thinking, and the
            ones I bring in when the problem asks for them.
          </p>
          <div class="stack__progress" aria-hidden="true">
            <span
              class="stack__progress-bar"
              :style="{ transform: `scaleX(${progress || 0.02})` }"
            />
          </div>
        </div>
      </header>

      <div ref="rail" class="stack__rail" data-lenis-prevent-horizontal>
        <div ref="track" class="stack__track">
          <section v-for="group in skillGroups" :key="group.id" class="panel">
            <header class="panel__head">
              <h3 class="panel__title">{{ group.label }}</h3>
              <span class="meta panel__count">{{
                String(group.items.length).padStart(2, '0')
              }}</span>
            </header>

            <ul class="panel__grid">
              <li
                v-for="item in group.items"
                :key="item.name"
                class="cell"
                :class="{ 'cell--dim': item.dim }"
                data-cursor
              >
                <span class="cell__logo">
                  <Icon :name="item.icon" aria-hidden="true" />
                </span>
                <span class="cell__name">{{ item.name }}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stack {
  position: relative;
  padding-block: clamp(5rem, 12vh, 10rem);
}

.stack.is-pinned {
  padding-block: 0;
}

.stack.is-pinned .stack__viewport {
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
  overflow: hidden;
}

/* --- head ------------------------------------------------------- */
.stack__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem clamp(2rem, 6vw, 6rem);
  align-items: end;
  margin-bottom: clamp(1.75rem, 4vw, 3rem);
}

.stack.is-pinned .stack__head {
  margin-bottom: 0;
}

.stack__head-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stack__title {
  font-size: clamp(2.2rem, 5vw, 4.5rem);
}

.stack__head-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stack__note {
  max-width: 46ch;
}

.stack__progress {
  height: 2px;
  width: 100%;
  background: var(--line);
  overflow: hidden;
}

.stack__progress-bar {
  display: block;
  height: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- rail ------------------------------------------------------- */
.stack__rail {
  width: 100%;
}

/* Give the rail real height so the panel dividers read as full column rules
   rather than short ticks sized to the tallest group's content. */
.stack.is-pinned .stack__rail {
  height: clamp(16rem, 46vh, 24rem);
}

.stack__track {
  display: flex;
  align-items: stretch;
  padding-inline: var(--gutter);
  width: max-content;
  height: 100%;
  will-change: transform;
}

/* --- panel ------------------------------------------------------ */
.panel {
  flex: 0 0 auto;
  /* Width follows the single row of icons rather than a fixed column. */
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  padding-inline: clamp(1.5rem, 3vw, 3rem);
}

/* The only rule in the whole rail: a hairline between adjacent panels. */
.panel + .panel {
  border-left: 1px solid var(--line);
}

.panel__head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.panel__title {
  font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
}

/* --- icon grid -------------------------------------------------- */
.panel__grid {
  display: flex;
  flex-wrap: nowrap;
  /* Fill the panel so the dividers run full height, with the icon row centred
     in whatever space the heading leaves. */
  flex: 1;
  align-items: center;
  gap: 100px;
}

.cell {
  flex: 0 0 auto;
  width: clamp(4.5rem, 7vw, 6.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.cell__logo {
  display: grid;
  place-items: center;
  /* ~3x the previous size. */
  font-size: clamp(3.4rem, 5.4vw, 6rem);
  line-height: 1;
  /* Single-colour devicons (Express) inherit this. */
  color: var(--fg);
  transition: transform 0.4s var(--ease-out);
}

.cell:hover .cell__logo {
  transform: translateY(-4px) scale(1.3);
}

:root.dark .cell--dim .cell__logo {
  filter: brightness(1.85) saturate(1.1);
}

.cell__name {
  font-size: clamp(0.7rem, 0.9vw, 0.85rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--fg-soft);
  transition: color 0.35s var(--ease-out);
}

.cell:hover .cell__name {
  color: var(--fg);
}

/* --- below 861px and reduced motion ----------------------------
   Mirrors ExperienceSection: the rail stays ONE horizontal strip of panels,
   swiped natively with scroll snapping instead of scrubbed by a pin. Same
   composition as desktop — vertical dividers and single icon rows — only the
   scroll mechanism changes. Pinning is what fights touch scrolling, not the
   horizontal layout. */
@media (max-width: 860px) {
  .stack__head {
    grid-template-columns: 1fr;
  }
  .stack__progress {
    display: none;
  }
  .cell__logo {
    font-size: 3rem;
  }
}

/* Whenever the pin is NOT active — narrow viewport, reduced motion, or a
   resize that tore it down — the rail becomes a plain vertical grid: the four
   panels stack, each wrapping its icons. Keyed off the class rather than a
   width query so CSS and JS cannot disagree about which mode is live.
   Nothing scrolls sideways here, so the drag affordances are cleared too;
   useDragScroll checks overflow-x before engaging, so it no-ops. */
.stack:not(.is-pinned) .stack__rail {
  overflow: visible;
  touch-action: auto;
  cursor: auto;
}

.stack:not(.is-pinned) .stack__track {
  flex-direction: column;
  width: 100%;
  height: auto;
  /* The rail lives outside `.shell`, so it carries its own gutter — without
     this the stacked panels sit flush against the viewport edge while the
     section heading above them is indented. */
  padding-inline: var(--gutter);
}

.stack:not(.is-pinned) .panel {
  width: 100%;
  padding-inline: 0;
  padding-block: clamp(1.5rem, 5vw, 2.25rem);
}

/* Separator turns horizontal when the panels stack. */
.stack:not(.is-pinned) .panel + .panel {
  border-left: 0;
  border-top: 1px solid var(--line);
}

.stack:not(.is-pinned) .panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.25rem, 1fr));
  gap: 1.75rem 1rem;
  flex: none;
}

.stack:not(.is-pinned) .cell {
  width: auto;
}

</style>

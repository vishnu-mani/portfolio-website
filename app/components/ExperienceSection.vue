<script setup lang="ts">
const { experience } = useSiteData()
const { $gsap, $ScrollTrigger, $reducedMotion } = useNuxtApp()

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const rail = ref<HTMLElement | null>(null)
const pinned = ref(false)
const progress = ref(0)

// Horizontal axis is driven by pointer events, not native touch scrolling.
useDragScroll(rail)

/** Horizontal distance the track has to travel to show its last card. */
const distance = () => {
  if (!track.value || !viewport.value) return 0
  return Math.max(0, track.value.scrollWidth - viewport.value.clientWidth)
}

onMounted(() => {
  if (!root.value || !track.value) return

  // Responsive setup/teardown: see SkillsSection. Deciding once at mount left
  // the section stuck in whichever mode the page happened to load in.
  const mm = $gsap.matchMedia()

  // Pins on touch devices too, not just desktop. `100svh` is what makes that
  // safe: it is sized to the largest browser UI, so showing/hiding the address
  // bar cannot change the pinned height mid-scroll.
  const setup = () => {
    pinned.value = true

    let tween: gsap.core.Tween | null = null
    let reverted = false

    // Measure after Vue applies `is-pinned`: that class is what turns the
    // viewport into the fixed 100svh box we have to fit inside.
    nextTick(() => {
      if (reverted || !viewport.value || !track.value) return

      const available = viewport.value.clientHeight
      const needed =
        (root.value?.querySelector('.work__head')?.getBoundingClientRect().height ?? 0) +
        (rail.value?.getBoundingClientRect().height ?? 0)

      // The viewport clips overflow, so pinning a section that does not fit
      // would hide part of every card. Fall back to the drag rail instead.
      if (needed > available) {
        pinned.value = false
        return
      }

      tween = $gsap.to(track.value, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          // `scrub: true`, not a lag value: a lagging scrub is still catching
          // up when ScrollTrigger unpins at the end, so the rail arrives short
          // and the release snaps.
          scrub: true,
          // No anticipatePin: it pins ~130px early here and snaps the section up.
          invalidateOnRefresh: true,
          // This section sits BELOW the stack pin. Lower priority = refreshed
          // later, so it measures its start after that pin's spacer exists.
          refreshPriority: -1,
          onUpdate: (self) => (progress.value = self.progress),
        },
      })

      $ScrollTrigger.refresh()
    })

    return () => {
      reverted = true
      pinned.value = false
      progress.value = 0
      $gsap.set(track.value, { clearProps: 'x' })
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }

  // Registered for two complementary height ranges rather than one
  // `min-height` guard. Whether the section fits is decided at runtime below,
  // but matchMedia only re-runs a callback when its query result CHANGES — so
  // with a single always-true query, rotating a phone would never re-run the
  // fit check and a section that fitted in portrait would stay pinned (and
  // clipped) in landscape. Splitting at 560px means any rotation crosses a
  // boundary, tearing one down and setting the other up.
  mm.add('(prefers-reduced-motion: no-preference) and (min-height: 560px)', setup)
  mm.add('(prefers-reduced-motion: no-preference) and (max-height: 559px)', setup)

  onBeforeUnmount(() => mm.revert())
})

onMounted(() => {
  document.fonts?.ready.then(() => $ScrollTrigger?.refresh())
})
</script>

<template>
  <section id="work" ref="root" class="work" :class="{ 'is-pinned': pinned }">
    <div ref="viewport" class="work__viewport">
      <header class="work__head shell">
        <div class="work__head-left">
          <p class="meta">(04) — Experience</p>
          <h2 class="display display--md work__title">Selected roles</h2>
        </div>
        <div class="work__head-right">
          <p class="body work__note">
            Four roles, one throughline: take something creaking, modernise it, and leave the team
            faster than I found them.
          </p>
          <div class="work__progress" aria-hidden="true">
            <span class="work__progress-bar" :style="{ transform: `scaleX(${progress || 0.02})` }" />
          </div>
        </div>
      </header>

        <!-- See SkillsSection: horizontal gestures belong to this rail. -->
      <div ref="rail" class="work__rail" data-lenis-prevent-horizontal>
        <ol ref="track" class="work__track">
          <li
            v-for="(job, i) in experience"
            :key="`${job.company}-${job.period}`"
            class="job"
          >
            <div class="job__top">
              <span class="job__no meta">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="job__year">{{ job.year }}</span>
            </div>

            <h3 class="job__company">{{ job.company }}</h3>
            <p class="job__role">{{ job.role }}</p>
            <p class="meta job__period">{{ job.period }}</p>

            <ul class="job__points">
              <li v-for="(point, p) in job.points" :key="p" class="body job__point">
                <span class="job__marker" aria-hidden="true" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </li>

          <li class="job job--end">
            <p class="job__end-text">
              Next<br /><em class="italic-serif">chapter?</em>
            </p>
            <a class="job__end-link" href="#contact" data-cursor="Say hi">
              Let's talk <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.work {
  position: relative;
  padding-block: clamp(5rem, 12vh, 10rem);
}

/* When pinned, the viewport owns a full screen and the rail scrolls inside it. */
.work.is-pinned {
  padding-block: 0;
}

.work.is-pinned .work__viewport {
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.25rem, 3vh, 2.25rem);
  overflow: hidden;
}

.work__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem clamp(2rem, 6vw, 6rem);
  align-items: end;
  margin-bottom: clamp(1.75rem, 4vw, 3rem);
}

.work.is-pinned .work__head {
  margin-bottom: 0;
}

.work__head-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* The pinned viewport is height-constrained, so the heading runs smaller
   here than the display scale used by the unpinned sections. */
.work__title {
  font-size: clamp(2.2rem, 5vw, 4.5rem);
}

.work__head-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.work__note {
  max-width: 44ch;
}

.work__progress {
  height: 2px;
  width: 100%;
  background: var(--line);
  overflow: hidden;
}

.work__progress-bar {
  display: block;
  height: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- rail ------------------------------------------------------ */
.work__rail {
  width: 100%;
}

.work.is-pinned .work__rail {
  overflow: visible;
}

.work__track {
  display: flex;
  align-items: stretch;
  gap: clamp(1rem, 1.6vw, 1.75rem);
  padding-inline: var(--gutter);
  width: max-content;
  will-change: transform;
}

/* --- card ------------------------------------------------------ */
.job {
  flex: 0 0 auto;
  /* 2x the previous clamp(20rem, 36vw, 32rem) at every width. Only applies
     from 861px up — the mobile blocks below set their own width. */
  width: clamp(40rem, 72vw, 64rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: clamp(1.3rem, 2.1vw, 1.9rem);
  border: 1px solid var(--line);
  background: var(--bg);
  transition: border-color 0.45s var(--ease-out);
}

.job:hover {
  border-color: var(--accent);
}
.job:hover .job__company{
  color: var(--accent);
}

.job__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.9rem;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid var(--line);
}

.job__year {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--accent-deep);
}

.job__company {
  font-size: clamp(1.75rem, 3vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.98;
  text-transform: uppercase;
}

.job__role {
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  font-weight: 600;
  color: var(--fg-soft);
}

.job__period {
  margin-bottom: 0.5rem;
}

.job__points {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--line);
}

.job__point {
  display: grid;
  grid-template-columns: 0.9rem minmax(0, 1fr);
  gap: 0.6rem;
  align-items: start;
  font-size: 1rem;
  line-height: 1.5;
}

.job__marker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 0.5em;
}

/* --- closing card ---------------------------------------------- */
.job--end {
  width: clamp(15rem, 20vw, 19rem);
  background: var(--inv-bg);
  color: var(--inv-fg);
  border-color: var(--inv-bg);
  justify-content: space-between;
  gap: 2rem;
}

.job--end:hover {
  border-color: var(--accent);
}

.job__end-text {
  font-size: clamp(2rem, 3.6vw, 3.25rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.job__end-text em {
  color: var(--accent-inv);
}

.job__end-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: 100px;
  padding: 0.75rem 1.4rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: background 0.35s var(--ease-out);
}

.job__end-link:hover {
  background: var(--accent-soft);
}

/* --- fallback: native horizontal swipe on small screens -------- */
@media (max-width: 860px) {
  .work__head {
    grid-template-columns: 1fr;
  }
  .work__progress {
    display: none;
  }
  .work__track {
    padding-inline: var(--gutter);
  }
  .job {
    width: min(82vw, 24rem);
    scroll-snap-align: start;
  }
  .job--end {
    width: min(70vw, 20rem);
  }
}

/* Same as SkillsSection: no pin means a native horizontal scroller, keyed off
   the class so it always matches what the JS actually did. */
.work:not(.is-pinned) .work__rail {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.work:not(.is-pinned) .work__rail::-webkit-scrollbar {
  display: none;
}

/* The browser keeps vertical panning; horizontal belongs to useDragScroll. */
.work:not(.is-pinned) .work__rail {
  touch-action: pan-y;
  cursor: grab;
}

.work__rail.is-dragging {
  scroll-snap-type: none;
  cursor: grabbing;
  scroll-behavior: auto;
}

/* --- pinned on phones ------------------------------------------
   The pinned viewport is a fixed 100svh box with `overflow: hidden`, so the
   header plus the tallest card has to fit inside it or content is clipped.
   The Photon card (four bullets) is the constraint, so at this width the
   section trades the intro note and some leading for guaranteed fit. */
@media (max-width: 860px) {
  .work.is-pinned .work__note {
    display: none;
  }

  .work.is-pinned .work__head {
    gap: 0.75rem;
  }

  .work.is-pinned .job {
    width: min(88vw, 26rem);
    padding: 1.05rem;
    gap: 0.45rem;
  }

  .work.is-pinned .job__company {
    font-size: 1.55rem;
  }

  .work.is-pinned .job__top {
    padding-bottom: 0.6rem;
    margin-bottom: 0.2rem;
  }

  .work.is-pinned .job__period {
    margin-bottom: 0.2rem;
  }

  .work.is-pinned .job__points {
    gap: 0.45rem;
    padding-top: 0.6rem;
  }

  /* 16px (the base size) makes this card 700px tall at 375px wide and 843px at
     320px — taller than any phone viewport, which would clip it and force the
     whole section back to the swipe fallback. 14px is the largest that still
     fits a pinned 100svh box on a phone. */
  .work.is-pinned .job__point {
    font-size: 0.875rem;
    line-height: 1.45;
  }

  /* The closing card is a short CTA, not a role, so it does not need the role
     cards' width. Needs the `.is-pinned` prefix to outrank `.work.is-pinned
     .job`, which would otherwise make it 88vw like the rest. */
  .work.is-pinned .job--end {
    width: min(56vw, 15rem);
  }
}

/* --- short viewports (landscape phones, ~956x440) ----------------
   The pinned box is a fixed 100svh with `overflow: hidden`, so the header plus
   the tallest card has to fit inside it or the runtime fit check refuses to
   pin and the section drops to drag-scroll. At 440px tall the default layout
   needs 544px, so this trims it to fit — same trade as the phone-pinned
   block, driven by height instead of width. */
@media (max-height: 560px) {
  .work.is-pinned .work__note {
    display: none;
  }

  .work.is-pinned .work__head {
    gap: 0.6rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 14rem);
  }

  .work.is-pinned .work__title {
    font-size: clamp(1.75rem, 3.6vw, 2.75rem);
  }

  .work.is-pinned .job {
    padding: 1rem 1.15rem;
    gap: 0.4rem;
  }

  .work.is-pinned .job__company {
    font-size: clamp(1.4rem, 2.6vw, 2rem);
  }

  .work.is-pinned .job__top {
    padding-bottom: 0.55rem;
    margin-bottom: 0.15rem;
  }

  .work.is-pinned .job__period {
    margin-bottom: 0.15rem;
  }

  .work.is-pinned .job__points {
    gap: 0.4rem;
    padding-top: 0.6rem;
  }

  .work.is-pinned .job__point {
    line-height: 1.38;
  }
}
</style>

<script setup lang="ts">
const { profile, socials } = useSiteData()
const root = ref<HTMLElement | null>(null)
const magnet = useMagnetic(0.3)

useReveal(root, { stagger: 0.09 })

const copied = ref(false)
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.email)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    window.location.href = `mailto:${profile.email}`
  }
}

const year = new Date().getFullYear()
const { $scrollTo } = useNuxtApp()
</script>

<template>
  <section id="contact" ref="root" class="section contact">
    <div class="shell contact__inner">
      <p data-reveal class="meta contact__label">(05) — Contact</p>

      <h2 data-reveal class="display contact__title">
        Let's work<br /><em class="italic-serif">together</em>
      </h2>

      <div data-reveal class="contact__actions">
        <a
          ref="magnet"
          class="contact__cta"
          :href="`mailto:${profile.email}`"
          data-cursor="Say hi"
        >
          <span>Start a project</span>
          <span class="contact__cta-arrow" aria-hidden="true">↗</span>
        </a>

        <button class="contact__copy" data-cursor @click="copyEmail">
          <span class="meta">{{ copied ? 'Copied to clipboard' : profile.email }}</span>
        </button>
      </div>

      <ul data-reveal class="contact__socials">
        <li v-for="social in socials" :key="social.label">
          <a
            class="contact__social"
            :href="social.href"
            target="_blank"
            rel="noopener"
            data-cursor
          >
            {{ social.label }}
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>

      <div class="contact__foot">
        <span class="meta">© {{ year }} {{ profile.name }}</span>
        <span class="meta">Built with Nuxt 4, GSAP &amp; Lenis</span>
        <button class="to-top" type="button" data-cursor @click="$scrollTo('#top', 0)">
          <span class="to-top__arrow" aria-hidden="true">↑</span>
          <span>Back to top</span>
        </button>
      </div>

      <!-- SVG rather than text: `textLength` forces the string to exactly the
           viewBox width, so the wordmark spans the container at every
           resolution instead of overflowing on phones and under-filling on
           wide screens. It also means the fit does not depend on the webfont
           having loaded. -->
      <svg
        class="wordmark"
        viewBox="0 0 1000 120"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <text
          class="wordmark__text"
          x="0"
          y="96"
          textLength="1000"
          lengthAdjust="spacing"
        >&#169;&#160;{{ profile.handle }}</text>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: var(--inv-bg);
  color: var(--inv-fg);
  padding-bottom: clamp(2rem, 5vh, 3rem);
}

.contact__inner {
  display: flex;
  flex-direction: column;
  gap: clamp(1.75rem, 4vw, 3rem);
}

.contact__label,
.contact :deep(.meta) {
  color: color-mix(in srgb, var(--inv-fg) 58%, transparent);
}

.contact__title em {
  color: var(--accent-inv);
}

.contact__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(1rem, 3vw, 2.5rem);
}

.contact__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: 100px;
  padding: 1.05rem 2.1rem;
  font-weight: 700;
  font-size: clamp(0.95rem, 1.3vw, 1.15rem);
  letter-spacing: -0.015em;
  will-change: transform;
  transition: background 0.35s var(--ease-out);
}

.contact__cta:hover {
  background: var(--accent-soft);
}

.contact__cta-arrow {
  transition: transform 0.4s var(--ease-out);
}

.contact__cta:hover .contact__cta-arrow {
  transform: translate(3px, -3px);
}

.contact__copy {
  text-align: left;
}

.contact__socials {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  background: var(--inv-line);
  border-block: 1px solid var(--inv-line);
  margin-top: clamp(1rem, 4vw, 3rem);
}

.contact__socials li {
  flex: 1 1 10rem;
  background: var(--inv-bg);
}

.contact__social {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: clamp(1rem, 2.4vw, 1.6rem) clamp(0.9rem, 2vw, 1.5rem);
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  font-weight: 600;
  transition: background 0.35s var(--ease-out), color 0.35s var(--ease-out);
}

.contact__social:hover {
  background: var(--accent);
  color: var(--on-accent);
}

.contact__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: clamp(1.5rem, 4vw, 3rem);
}

.to-top {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 1.05rem;
  border: 1px solid var(--inv-line);
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: background 0.35s var(--ease-out), color 0.35s var(--ease-out),
    border-color 0.35s var(--ease-out);
}

.to-top:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.to-top__arrow {
  transition: transform 0.4s var(--ease-out);
}

.to-top:hover .to-top__arrow {
  transform: translateY(-3px);
}

/* Oversized muted wordmark closing the page. */
.wordmark {
  display: block;
  width: 100%;
  height: auto;
  margin-top: clamp(2rem, 6vw, 4rem);
  overflow: visible;
  user-select: none;
}

.wordmark__text {
  font-family: var(--font-display);
  font-size: 110px; /* user units; the viewBox scales it to the container */
  font-weight: 800;
  fill: color-mix(in srgb, var(--inv-fg) 20%, transparent);
}
</style>

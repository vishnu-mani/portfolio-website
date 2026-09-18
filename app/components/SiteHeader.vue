<script setup lang="ts">
const { profile, nav } = useSiteData()
const { $scrollTo } = useNuxtApp()
const { theme, mounted: themeReady, toggle: toggleTheme } = useTheme()

const hidden = ref(false)
const open = ref(false)

const go = (hash: string) => {
  open.value = false
  $scrollTo(hash, -16)
}

onMounted(() => {
  let last = window.scrollY
  const onScroll = () => {
    const y = window.scrollY
    // Hide on the way down, reveal the moment the user reverses.
    hidden.value = y > 160 && y > last
    last = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
})
</script>

<template>
  <header class="header" :class="{ 'is-hidden': hidden && !open, 'is-open': open }">
    <div class="header__bar shell">
      <a class="header__brand" href="#top" data-cursor @click.prevent="go('#top')">
        <span class="header__name">{{ profile.name }}</span>
        <span class="header__role">{{ profile.role }}</span>
      </a>

      <nav class="header__nav" aria-label="Primary">
        <a
          v-for="item in nav"
          :key="item.hash"
          class="header__link"
          :href="item.hash"
          data-cursor
          @click.prevent="go(item.hash)"
        >
          <span class="header__link-inner">
            <span>{{ item.label }}</span>
            <span aria-hidden="true">{{ item.label }}</span>
          </span>
        </a>
      </nav>

      <button
        class="header__theme"
        type="button"
        data-cursor
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        :aria-pressed="theme === 'dark'"
        @click="toggleTheme"
      >
        <span class="header__theme-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <template v-if="themeReady && theme === 'dark'">
              <circle cx="12" cy="12" r="4.2" />
              <path
                d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
                stroke-linecap="round"
              />
            </template>
            <path v-else d="M20 14.2A8.4 8.4 0 1 1 9.8 4a6.9 6.9 0 0 0 10.2 10.2Z" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="header__theme-text">{{ themeReady && theme === 'dark' ? 'Light' : 'Dark' }}</span>
      </button>

      <button
        class="header__toggle"
        :aria-expanded="open"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        {{ open ? 'Close' : 'Menu' }}
      </button>
    </div>

    <Transition name="sheet">
      <div v-if="open" class="header__sheet">
        <a
          v-for="item in nav"
          :key="item.hash"
          class="header__sheet-link"
          :href="item.hash"
          @click.prevent="go(item.hash)"
        >
          {{ item.label }}
        </a>

        <button class="header__sheet-theme" type="button" @click="toggleTheme">
          <span>{{ themeReady && theme === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
          <span aria-hidden="true">{{ themeReady && theme === 'dark' ? '☀' : '☾' }}</span>
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  transition: transform 0.5s var(--ease-out);
  /* Difference blend keeps the bar legible over both the page and the inverted
     sections. It must sit on the fixed header itself — moving it to a child
     would blend against the header's own stacking context instead of the page. */
  mix-blend-mode: difference;
  color: var(--blend-fg);
}

/* The open menu sheet is opaque ink, so the blend has to come off. */
.header.is-open {
  mix-blend-mode: normal;
  background: var(--inv-bg);
  color: var(--inv-fg);
}

.header.is-hidden {
  transform: translateY(-110%);
}

.header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: var(--header-h);
}

.header__brand {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
}

.header__name {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.header__role {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.header__nav {
  display: flex;
  gap: clamp(1rem, 2.5vw, 2.5rem);
}

.header__link {
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  display: block;
  height: 1.2em;
}

.header__link-inner {
  display: flex;
  flex-direction: column;
  transition: transform 0.45s var(--ease-out);
}

.header__link-inner > span {
  line-height: 1.2;
}

.header__link:hover .header__link-inner {
  transform: translateY(-1.2em);
}

.header__theme {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid currentColor;
  border-radius: 100px;
  padding: 0.38rem 0.8rem 0.38rem 0.6rem;
  opacity: 0.85;
  transition: opacity 0.35s var(--ease-out);
}

.header__theme:hover {
  opacity: 1;
}

.header__theme-icon svg {
  width: 15px;
  height: 15px;
}

.header__sheet-theme {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--inv-line);
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header__toggle {
  display: none;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header__sheet {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem var(--gutter) 2.5rem;
  background: var(--inv-bg);
  color: var(--inv-fg);
}

.header__sheet-link {
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  padding-block: 0.35rem;
  border-bottom: 1px solid var(--inv-line);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease, transform 0.35s var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

@media (max-width: 760px) {
  .header__nav,
  .header__theme {
    display: none;
  }
  .header__toggle,
  .header__sheet {
    display: flex;
  }
  .header__role {
    display: none;
  }
}
</style>

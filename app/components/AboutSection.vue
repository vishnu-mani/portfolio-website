<script setup lang="ts">
const { profile, stats } = useSiteData()
const root = ref<HTMLElement | null>(null)
useReveal(root, { stagger: 0.1 })

// Live CSSBattle standing. The server route is cached and never throws, so a
// third-party outage just leaves the last known static value in place.
const { data: battle } = await useFetch('/api/cssbattle', {
  key: 'cssbattle',
  default: () => null,
})

const displayStats = computed(() =>
  stats.map((stat) => {
    if (stat.live !== 'cssbattle' || !battle.value?.ok || !battle.value.rank) return stat
    return { ...stat, value: `#${battle.value.rank}`, isLive: true }
  }),
)

const rankNote = computed(() => {
  const total = battle.value?.totalPlayers
  return total ? `of ${total.toLocaleString('en-US')} players` : null
})
</script>

<template>
  <section id="about" ref="root" class="section about">
    <div class="shell">
      <div class="about__grid">
        <div class="about__aside">
          <p data-reveal class="meta">(01) — About</p>
          <p data-reveal class="about__kicker">
            Bonjour,<br />
            I'm Vishnu.
          </p>
        </div>

        <div class="about__body">
          <p data-reveal class="lede about__lede">
            I build <em class="italic-serif">interfaces</em> that stay fast, legible and
            maintainable long after the launch post.
          </p>
          <p v-for="(para, i) in profile.bio" :key="i" data-reveal class="body about__para">
            {{ para }}
          </p>
        </div>
      </div>

      <ul class="about__stats">
        <li v-for="stat in displayStats" :key="stat.label" data-reveal class="about__stat">
          <component
            :is="stat.href ? 'a' : 'div'"
            :href="stat.href"
            :target="stat.href ? '_blank' : undefined"
            :rel="stat.href ? 'noopener' : undefined"
            class="about__stat-inner"
            :data-cursor="stat.href ? 'Visit' : undefined"
          >
            <span class="about__stat-value">{{ stat.value }}</span>
            <span class="meta about__stat-label">
              {{ stat.label }}
              <span v-if="stat.isLive" class="about__live" :title="rankNote || 'Live from cssbattle.dev'">
                <span class="about__live-dot" aria-hidden="true" />
                live
              </span>
            </span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.about__aside {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  position: sticky;
  top: calc(var(--header-h) + 2rem);
}

.about__kicker {
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.about__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about__lede {
  max-width: 24ch;
  margin-bottom: 0.5rem;
}

.about__lede em {
  color: var(--fg-faint);
}

.about__para {
  max-width: 62ch;
}

.about__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: clamp(3.5rem, 9vw, 7rem);
  background: var(--line);
  border-block: 1px solid var(--line);
}

.about__stat {
  background: var(--bg);
}

.about__stat-inner {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: clamp(1.25rem, 3vw, 2.25rem) clamp(0.75rem, 2vw, 1.75rem);
  height: 100%;
  transition: background 0.4s var(--ease-out);
}

a.about__stat-inner:hover {
  background: var(--accent);
  color: var(--on-accent);
}

.about__stat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.about__live {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--accent-deep);
}

.about__live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  animation: live-pulse 2.4s ease-in-out infinite;
}

@keyframes live-pulse {
  50% {
    opacity: 0.25;
  }
}

a.about__stat-inner:hover .about__live {
  color: var(--on-accent);
}

.about__stat-value {
  font-size: clamp(2.2rem, 5.5vw, 4.25rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.05em;
}

@media (max-width: 860px) {
  .about__grid {
    grid-template-columns: 1fr;
  }
  .about__aside {
    position: static;
  }
  .about__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

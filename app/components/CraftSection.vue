<script setup lang="ts">
const { capabilities } = useSiteData()
const root = ref<HTMLElement | null>(null)
useReveal(root, { selector: '[data-reveal]', stagger: 0.06 })
</script>

<template>
  <section id="craft" ref="root" class="section craft">
    <div class="shell">
      <header class="craft__head">
        <p data-reveal class="meta">(03) — Craft</p>
        <h2 data-reveal class="display display--md craft__title">
          What I<br /><em class="italic-serif">actually</em> do
        </h2>
      </header>

      <ul class="craft__list">
        <li v-for="item in capabilities" :key="item.index" data-reveal class="craft__card">
          <span class="meta craft__index">{{ item.index }}</span>
          <h3 class="craft__card-title">{{ item.title }}</h3>
          <p class="body craft__card-body">{{ item.body }}</p>
          <ul class="craft__tags">
            <li v-for="tag in item.tags" :key="tag" class="craft__tag">{{ tag }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.craft {
  background: var(--bg-alt);
}

.craft__head {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: clamp(2.5rem, 7vw, 5rem);
}

.craft__title {
  max-width: 12ch;
}

.craft__title em {
  color: var(--fg-faint);
}

.craft__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}

.craft__card {
  background: var(--bg-alt);
  padding: clamp(1.5rem, 3vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 19rem;
  transition: background 0.5s var(--ease-out), color 0.5s var(--ease-out);
}

.craft__card:hover {
  background: var(--inv-bg);
  color: var(--inv-fg);
}

.craft__card:hover .body,
.craft__card:hover .meta {
  color: color-mix(in srgb, var(--inv-fg) 72%, transparent);
}

.craft__card:hover .craft__tag {
  border-color: var(--inv-line);
}

.craft__card-title {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.craft__card-body {
  flex: 1;
}

.craft__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.craft__tag {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  padding: 0.28rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 100px;
}

@media (max-width: 1000px) {
  .craft__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .craft__list {
    grid-template-columns: 1fr;
  }
  .craft__card {
    min-height: 0;
  }
}
</style>

<script setup lang="ts">
defineProps<{ ready: boolean }>()
const { marquee } = useSiteData()
</script>

<template>
  <div>
    <HeroSection :ready="ready" />
    <MarqueeStrip :items="marquee" :speed="26" />
    <AboutSection />
    <KineticBanner :lines="['Vue', 'Obsessed']" />
    <SkillsSection />
    <CraftSection />
    <ExperienceSection />
    <MarqueeStrip :items="['Let\'s build something', 'Open to Lead roles', 'Say hello']" :speed="20" invert />
    <ContactSection />
  </div>
</template>

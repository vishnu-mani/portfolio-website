/**
 * Technical skills, mirroring the four groups on vishnu-mani.netlify.app.
 *
 * Single source of truth: `nuxt.config.ts` imports SKILL_ICON_NAMES from here
 * so the icon bundle contains exactly these icons and nothing else. Add a
 * skill here and it is bundled automatically.
 *
 * Icon names resolve against the locally installed @iconify-json/devicon and
 * @iconify-json/logos collections — no runtime calls to the Iconify API.
 */
export type Skill = { name: string; icon: string; dim?: boolean }
export type SkillGroup = { id: string; label: string; note: string; items: Skill[] }

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    note: 'Where I go deepest: Vue 3 architecture, design systems, and the performance work that keeps them fast.',
    items: [
      { name: 'Vue 3', icon: 'devicon:vuejs' },
      { name: 'Nuxt', icon: 'devicon:nuxt' },
      { name: 'JavaScript', icon: 'devicon:javascript' },
      { name: 'Pinia', icon: 'logos:pinia' },
      { name: 'TypeScript', icon: 'devicon:typescript' },
      { name: 'Vite', icon: 'devicon:vitejs' },
      { name: 'HTML5', icon: 'devicon:html5' },
      { name: 'CSS3', icon: 'devicon:css3' },
      { name: 'Bootstrap', icon: 'devicon:bootstrap' },
      { name: 'Tailwind', icon: 'devicon:tailwindcss' },
      { name: 'Sass', icon: 'devicon:sass' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    note: "Enough depth to design the API I'm consuming — and to argue about it productively.",
    items: [
      { name: 'Node.js', icon: 'devicon:nodejs' },
      { name: 'Express', icon: 'devicon:express' },
      { name: 'Python', icon: 'devicon:python' },
      { name: 'PHP', icon: 'devicon:php' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    note: 'Relational modelling from the LAMP years, through schema design for a platform at 15,000-user scale.',
    items: [
      // #00618a is close to the dark-mode background; `dim` lifts it there.
      { name: 'MySQL', icon: 'devicon:mysql', dim: true },
      { name: 'MongoDB', icon: 'devicon:mongodb' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    note: 'Release automation and review discipline: Fastlane, CI/CD pipelines and zero-touch TestFlight deploys.',
    items: [
      { name: 'Git', icon: 'devicon:git' },
      { name: 'Postman', icon: 'devicon:postman' },
      { name: 'Figma', icon: 'devicon:figma' },
      { name: 'Jira', icon: 'devicon:jira' },
      { name: 'GitHub Actions', icon: 'devicon:githubactions' },
    ],
  },
]

export const SKILL_ICON_NAMES: string[] = skillGroups.flatMap((g) => g.items.map((i) => i.icon))

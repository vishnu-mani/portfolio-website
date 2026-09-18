/**
 * Single source of truth for everything the site renders.
 * Sourced from vishnu-mani.netlify.app.
 */
import { skillGroups } from '~/data/skills'

export const useSiteData = () => {
  const profile = {
    name: 'Vishnu M',
    handle: 'madd.developer',
    role: 'Senior Frontend Engineer',
    location: 'India — working worldwide',
    available: true,
    email: 'vishnumani1993@gmail.com',
    intro:
      'I cherish clean architecture, a touch of craziness, and pixel-perfect interfaces that hold up under real traffic.',
    bio: [
      'Senior Frontend Engineer with 7+ years specialising in Vue 3 / Nuxt architecture — migrating legacy platforms to modern stacks, leading engineering teams of up to 10, and shipping products at 15,000+ user scale across 150+ institutions.',
      'Known for measurable impact: 40% performance gains, 50% API reduction, and zero-touch CI/CD release pipelines. I lean on AI-powered developer tooling to accelerate delivery without loosening the quality bar.',
      'Currently targeting Lead / Senior Frontend roles where technical depth and team leadership intersect.',
    ],
  }

  const marquee = [
    'Vue 3',
    'Nuxt',
    'TypeScript',
    'Design Systems',
    'Performance',
    'Capacitor',
    'CI/CD',
    'Team Leadership',
  ]

  const stats = [
    { value: '7+', label: 'Years of experience' },
    { value: '10+', label: 'Products shipped' },
    { value: '15K+', label: 'Users at peak scale' },
    {
      value: '#32',
      label: 'Global rank, CSSBattle',
      href: 'https://cssbattle.dev/player/robocoder',
      live: 'cssbattle', // replaced at runtime by /api/cssbattle
    },
  ]



  const capabilities = [
    {
      index: '01',
      title: 'Frontend architecture',
      body: 'Vue 3, Nuxt, TypeScript, Pinia, Vite. Composable-first structure that survives a team of ten and three years of feature creep.',
      tags: ['Vue 3', 'Nuxt', 'TypeScript', 'Pinia', 'Vite'],
    },
    {
      index: '02',
      title: 'Performance engineering',
      body: 'Bundle surgery, render profiling and request batching. 40% faster loads and 50% fewer API calls on a legacy platform migration.',
      tags: ['Core Web Vitals', 'Profiling', 'Caching', 'RWD'],
    },
    {
      index: '03',
      title: 'Cross-platform delivery',
      body: 'Vue 3 + Capacitor apps for iOS and Android from one modular codebase, with state management that scales past the prototype.',
      tags: ['Capacitor', 'iOS', 'Android', 'PWA'],
    },
    {
      index: '04',
      title: 'Release automation',
      body: 'Fastlane and CI/CD pipelines wired to zero-touch TestFlight deploys — saving 3–4 hours of manual work per release cycle.',
      tags: ['Fastlane', 'CI/CD', 'TestFlight', 'Git'],
    },
    {
      index: '05',
      title: 'Engineering leadership',
      body: 'Architectural reviews, coding standards and mentorship that cut PR revision cycles by ~30% across a 5–7 engineer team.',
      tags: ['Mentorship', 'Code review', 'Hiring', 'Standards'],
    },
    {
      index: '06',
      title: 'Backend & data',
      body: 'REST API design, PHP/LAMP heritage and relational modelling — enough depth to argue productively with the backend team.',
      tags: ['REST', 'Node', 'PHP', 'MySQL'],
    },
  ]

  const experience = [
    {
      company: 'Photon',
      role: 'Senior Software Engineer II',
      period: 'Nov 2024 — Present',
      year: '2024',
      points: [
        'Led end-to-end modernisation of a legacy frontend platform, migrating to Vue 3 and improving application performance by 40% while significantly reducing technical debt.',
        'Directed a team of 5–7 engineers through structured architectural reviews and mentorship, establishing coding standards that cut PR revision cycles by ~30%.',
        'Delivered cross-platform mobile apps (iOS & Android) using Vue 3 + Capacitor with modular architecture and scalable state management.',
        'Automated iOS release workflows via Fastlane integrated with CI/CD, saving 3–4 hours per release and enabling seamless TestFlight deployments.',
      ],
    },
    {
      company: 'Pro Start Me',
      role: 'Senior Software Engineer II',
      period: 'Jan 2023 — Aug 2023',
      year: '2023',
      points: [
        'Redesigned the UI component layer of a no-code platform with Vue 3 and Capacitor, measurably improving usability and interactivity.',
        'Led the technical upgrade to Vue 3 with TypeScript for core product modules, applying responsive design principles to reduce load time by 35%.',
        'Introduced a standardised code review process that lifted best-practice adherence across the team by 25%.',
      ],
    },
    {
      company: 'Linways',
      role: 'Senior Software Engineer III',
      period: 'Jun 2018 — Dec 2022',
      year: '2018',
      points: [
        'Designed and developed the system architecture for an Academic Management System serving 10,000+ active users across 150+ colleges.',
        'Reduced development effort by 50% through a data migrator and code generator that removed repetitive scaffolding work.',
        'Mentored junior developers, directed peer code reviews and led interview processes for a team of 10.',
      ],
    },
    {
      company: 'Linways',
      role: 'Software Engineer',
      period: 'Jun 2015 — Jul 2016',
      year: '2015',
      points: [
        'Built applications on the LAMP stack with RESTful APIs for enhanced functionality and integration.',
        'Worked across the full SDLC, from conception through to deployment.',
      ],
    },
  ]

  /**
   * Profile links. `href: null` means "not confirmed yet" — those entries are
   * filtered out before render rather than shipped as a dead link. Fill one in
   * and it appears automatically, in this order.
   */
  const socialLinks: { label: string; href: string | null }[] = [
    { label: 'GitHub', href: 'https://github.com/vishnu-mani' },
    { label: 'CSSBattle', href: 'https://cssbattle.dev/player/robocoder' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vishnum93' },
    { label: 'HackerRank', href: 'https://www.hackerrank.com/profile/vishnum' },
    { label: 'Email', href: `mailto:${profile.email}` },
  ]

  const socials = socialLinks.filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  )

  const nav = [
    { label: 'Work', hash: '#work' },
    { label: 'About', hash: '#about' },
    { label: 'Stack', hash: '#stack' },
    { label: 'Craft', hash: '#craft' },
    { label: 'Contact', hash: '#contact' },
  ]

  return { profile, marquee, stats, skillGroups, capabilities, experience, socials, socialLinks, nav }
}

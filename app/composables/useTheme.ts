export type Theme = 'light' | 'dark'

/** Kept in sync with the inline boot script in nuxt.config.ts. */
export const THEME_STORAGE_KEY = 'vm-color-scheme'

/**
 * Light/dark mode, mirroring vishnu-mani.netlify.app: the whole palette —
 * including the primary colour — swaps via a `dark` class on <html>.
 *
 * The class is set by a blocking inline script before first paint, so this
 * composable adopts whatever that decided rather than deciding again (which
 * would cause a hydration mismatch and a flash).
 */
export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'light')
  const mounted = useState<boolean>('theme-mounted', () => false)

  const apply = (value: Theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', value === 'dark')
    root.style.colorScheme = value
  }

  const set = (value: Theme) => {
    theme.value = value
    apply(value)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {
      // Private mode / storage disabled — the choice just won't persist.
    }
  }

  const toggle = () => set(theme.value === 'dark' ? 'light' : 'dark')

  onMounted(() => {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    mounted.value = true

    // Follow the OS only while the visitor hasn't made an explicit choice.
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY)
      } catch {
        stored = null
      }
      if (stored) return
      theme.value = event.matches ? 'dark' : 'light'
      apply(theme.value)
    }
    query.addEventListener('change', onChange)
    onBeforeUnmount(() => query.removeEventListener('change', onChange))
  })

  return { theme, mounted, set, toggle }
}

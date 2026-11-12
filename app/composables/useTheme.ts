const THEME_KEY = 'roadready-theme'

export type ColorScheme = 'light' | 'dark'

export function useTheme() {
  const scheme = useState<ColorScheme>('roadready-theme', () => 'light')

  function apply(next: ColorScheme) {
    scheme.value = next
    if (!import.meta.client) return

    const root = document.documentElement
    if (next === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')

    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* storage blocked — session-only preference */
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', next === 'dark' ? '#101315' : '#f5f4f0')
  }

  function toggle() {
    apply(scheme.value === 'dark' ? 'light' : 'dark')
  }

  /** Reads the value the head bootstrap already applied, without a second paint. */
  function sync() {
    if (!import.meta.client) return
    scheme.value = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  }

  return { scheme, apply, toggle, sync }
}

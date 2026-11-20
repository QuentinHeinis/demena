export function useTheme() {
  const isDark = useState<boolean>('theme-dark', () => false)

  function apply() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('demena-theme')
    isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('demena-theme', isDark.value ? 'dark' : 'light')
    }
    apply()
  }

  return { isDark, init, toggle }
}

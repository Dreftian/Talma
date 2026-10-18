export type AppTheme = 'dark' | 'dim' | 'light';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem('talma_theme');
    if (saved === 'light' || saved === 'dim' || saved === 'dark') {
      return saved;
    }
  } catch {}
  return 'dark';
}

export function setAppTheme(theme: AppTheme) {
  try {
    localStorage.setItem('talma_theme', theme);
  } catch {}
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    document.documentElement.classList.add('theme-light');
    document.documentElement.classList.remove('theme-dim', 'theme-dark');
  } else if (theme === 'dim') {
    document.documentElement.classList.add('theme-dim');
    document.documentElement.classList.remove('theme-light', 'theme-dark');
  } else {
    document.documentElement.classList.add('theme-dark');
    document.documentElement.classList.remove('theme-light', 'theme-dim');
  }
}

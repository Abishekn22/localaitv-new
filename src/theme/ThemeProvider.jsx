import React from 'react';
import { T_DARK, T_LIGHT, getStoredTheme, setTheme as setTokensTheme } from './tokens.js';

// ── THEME CONTEXT & HOOK ──────────────────────────────────────
const ThemeContext = React.createContext({ T: T_DARK, isDark: true, toggleTheme: ()=>{} });

function useAppTheme() {
  return React.useContext(ThemeContext);
}

// Theme provider — wraps the whole app.
// Phase 2+ components can call useAppTheme() to get current T.
// Phase 1 components keep using the global T (no change needed yet).
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = React.useState(() => getStoredTheme() !== 'light');

  // Keep global T binding in sync so legacy `import { T }` consumers work.
  setTokensTheme(isDark);

  // Apply theme to DOM immediately on mount
  React.useEffect(() => {
    applyThemeToDom(isDark);
  }, [isDark]);

  function applyThemeToDom(dark) {
    const theme = dark ? T_DARK : T_LIGHT;
    try {
      // CSS variables
      document.documentElement.style.setProperty('--app-bg',   theme.bg);
      document.documentElement.style.setProperty('--app-text', theme.text);
      // Body background + class for CSS overrides
      document.body.style.background = theme.bg;
      document.body.classList.toggle('theme-light', !dark);
      document.body.classList.toggle('theme-dark',   dark);
      // Meta theme-color — Android status bar + browser chrome
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = theme.bg2; // white on light, navy on dark
    } catch (e) {}
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    setTokensTheme(next);
    try { window.localStorage?.setItem('localaitv_theme', next ? 'dark' : 'light'); } catch (e) {}
    applyThemeToDom(next);
  }

  const value = React.useMemo(() => ({
    T: isDark ? T_DARK : T_LIGHT,
    isDark,
    toggleTheme,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext, useAppTheme, ThemeProvider };

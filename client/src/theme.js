export const THEMES = { amber: '#ffc857', mint: '#8ee3c8', coral: '#ff8a7a', violet: '#b8a2ff' };

export function applyTheme(name) {
  const color = THEMES[name];
  if (!color) return false;
  document.documentElement.style.setProperty('--amber', color);
  try { localStorage.setItem('accent', name); } catch { /* storage unavailable */ }
  return true;
}

export function loadTheme() {
  try { applyTheme(localStorage.getItem('accent') || 'amber'); } catch { /* ignore */ }
}

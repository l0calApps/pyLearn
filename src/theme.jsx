import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

// All theme tokens live here — CSS vars are applied on <html>
const TOKENS = {
  dark: {
    // ── Accent: soft indigo (interaction) / amber kept for gamification ──
    '--accent':           '#818cf8',   // indigo-400 — buttons, active states
    '--accent-dim':       '#4338ca',   // indigo-700 — gradient start
    '--accent-light':     '#a5b4fc',   // indigo-300 — hover, lighter tints
    '--accent-glow':      'rgba(129,140,248,0.22)',
    '--amber':            '#f59e0b',   // kept only for XP bar, streak, hint
    '--amber-light':      '#fbbf24',
    '--amber-dim':        '#78350f',
    // ── Semantic ──
    '--success':          '#34d399',   // emerald — slightly cooler than lime
    '--error':            '#f87171',   // rose-400
    // ── Backgrounds: deep space grays, slightly blue-tinted ──
    '--bg-base':          '#0d0f14',   // deep space — not brown, not pure black
    '--bg-surface':       '#131720',   // main surface
    '--bg-raised':        '#1a1f2e',   // elevated panels, pills
    '--bg-editor':        '#090b10',   // code editor — near-black
    '--bg-overlay':       'rgba(13,15,20,0.92)',
    // ── Borders: cool, subtle ──
    '--border':           '#1e2333',   // default — barely visible
    '--border-warm':      '#2a3044',   // hover / active border
    // ── Text: slate scale — cool, readable ──
    '--text-primary':     '#e2e8f0',   // slate-200 — not stark white
    '--text-secondary':   '#94a3b8',   // slate-400
    '--text-muted':       '#475569',   // slate-600
    '--text-code':        '#c4b5fd',   // violet-300 — soft on dark bg
    // ── Component tokens ──
    '--card-bg':          '#131720',
    '--card-border':      '#1e2333',
    '--input-bg':         '#090b10',
    '--progress-track':   'rgba(255,255,255,0.07)',
    '--dot-empty':        '#1e2333',
    '--scrollbar-thumb':  '#2a3044',
    '--modal-bg':         '#131720',
    '--status-bar':       '#07090d',
    '--editor-toolbar':   '#0f1118',
    '--line-num-border':  '#131720',
  },
  light: {
    '--accent':           '#4f46e5',   // indigo-600 — deeper for light bg contrast
    '--accent-dim':       '#3730a3',
    '--accent-light':     '#818cf8',
    '--accent-glow':      'rgba(79,70,229,0.18)',
    '--amber':            '#d97706',
    '--amber-light':      '#f59e0b',
    '--amber-dim':        '#92400e',
    '--success':          '#059669',
    '--error':            '#e11d48',
    '--bg-base':          '#fdf8ef',
    '--bg-surface':       '#fff9f2',
    '--bg-raised':        '#fef3e2',
    '--bg-editor':        '#0c0a08',
    '--bg-overlay':       'rgba(253,248,239,0.95)',
    '--border':           '#e0cba8',
    '--border-warm':      '#c9aa80',
    '--text-primary':     '#1c1208',
    '--text-secondary':   '#5c3d20',
    '--text-muted':       '#9a7450',
    '--text-code':        '#fde68a',
    '--card-bg':          '#fffaf3',
    '--card-border':      '#e0cba8',
    '--input-bg':         '#0c0a08',
    '--progress-track':   'rgba(0,0,0,0.08)',
    '--dot-empty':        '#ddc99a',
    '--scrollbar-thumb':  '#c9aa80',
    '--modal-bg':         '#fffaf3',
    '--status-bar':       '#0a0806',
    '--editor-toolbar':   '#120f0d',
    '--line-num-border':  '#1a1612',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('pylearn_theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    const tokens = TOKENS[theme];
    Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('pylearn_theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

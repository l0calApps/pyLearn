import React from 'react';
import { LEVELS } from '../data/levels';
import { useTheme } from '../theme.jsx';

function StatPill({ icon, value, label, color, glow }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '7px',
      background: 'var(--bg-raised)', border: `1px solid ${glow || 'var(--border)'}`,
      borderRadius: '99px', padding: '5px 14px', height: '36px',
      boxShadow: glow ? `0 0 10px ${glow}` : 'none',
      transition: 'all 0.25s ease',
    }}>
      <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '14px', color: color || 'var(--text-primary)', lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'var(--text-muted)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginTop: '1px',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'var(--bg-raised)', border: '1px solid var(--border-warm)',
        borderRadius: '99px', padding: '5px 12px', height: '36px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-warm)'}
    >
      <span style={{ fontSize: '14px', lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default function Header({ completedLevels, streak, currentLevel }) {
  const pct = Math.round((completedLevels.length / LEVELS.length) * 100);

  return (
    <header style={{
      background: 'var(--bg-overlay)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 200,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      {/* XP bar */}
      <div style={{ height: '3px', background: 'var(--progress-track)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #92400e, #f59e0b, #fbbf24)',
          backgroundSize: '200% auto',
          animation: 'shimmer 2.5s linear infinite',
          width: `${pct}%`,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 6px rgba(245,158,11,0.5)',
          borderRadius: '0 99px 99px 0',
        }} />
      </div>

      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '16px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
            borderRadius: '10px', fontSize: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px var(--accent-glow)',
          }}>🐍</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px',
              color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>PyLearn</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px',
            }}>python journey</div>
          </div>
        </div>

        {/* Right stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'nowrap' }}>
          <StatPill
            icon="⚡" value={`${completedLevels.length}/${LEVELS.length}`} label="levels"
            color="var(--accent-light)"
            glow={completedLevels.length > 0 ? 'var(--accent-glow)' : undefined}
          />
          <StatPill icon="📈" value={`${pct}%`} label="done" color="var(--success)" />
          <StatPill
            icon={streak >= 3 ? '🔥' : streak > 0 ? '✨' : '💤'}
            value={streak} label="streak"
            color={streak >= 3 ? '#fb923c' : streak > 0 ? 'var(--amber-light)' : 'var(--text-muted)'}
            glow={streak >= 3 ? 'rgba(251,146,60,0.25)' : undefined}
          />
          {/* Level badge — accent/indigo tint */}
          <div style={{
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)',
            borderRadius: '99px', padding: '5px 14px', height: '36px',
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-light)' }}>
              LVL <strong style={{ fontFamily: 'var(--font-display)', fontSize: '13px' }}>{currentLevel}</strong>
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 3px' }} />

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

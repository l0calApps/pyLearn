import React, { useState } from 'react';
import { LEVELS, CATEGORIES } from '../data/levels';

function getStatus(level, completedLevels, currentLevel) {
  if (completedLevels.includes(level.id)) return 'done';
  if (level.id === currentLevel) return 'active';
  const maxUnlocked = Math.max(1, ...completedLevels, currentLevel);
  if (level.id <= maxUnlocked + 1) return 'open';
  return 'locked';
}

export default function LevelSelector({ currentLevel, completedLevels, onSelect }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Object.keys(CATEGORIES)];
  const visible = filter === 'All' ? LEVELS : LEVELS.filter(l => l.category === filter);
  const pct = Math.round(completedLevels.length / LEVELS.length * 100);

  return (
    /*
      No position:sticky, no maxHeight, no overflow:hidden here.
      The parent sidebar wrapper in App.jsx is the sticky/scroll container.
    */
    <div className="card" style={{ width: '100%', flexShrink: 0 }}>

      {/* ── Panel header ── */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '10px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>Levels</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-secondary)', fontWeight: 600,
          }}>
            {completedLevels.length}/{LEVELS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="xp-bar-track" style={{ marginBottom: '12px' }}>
          <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Category filter chips — horizontal scroll */}
        <div style={{
          display: 'flex', gap: '4px',
          overflowX: 'auto', paddingBottom: '2px',
          /* hide scrollbar on webkit */
          msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
          {categories.map(cat => {
            const info = CATEGORIES[cat];
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  flexShrink: 0,
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  padding: '3px 9px', borderRadius: '99px',
                  border: `1px solid ${active ? (info?.color || 'var(--amber)') : 'var(--border)'}`,
                  background: active ? (info?.bg || 'rgba(245,158,11,0.12)') : 'transparent',
                  color: active ? (info?.color || 'var(--amber)') : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Level list — no internal scroll; parent sidebar scrolls ── */}
      <div style={{ padding: '8px 8px 4px' }}>
        {visible.map(level => {
          const status   = getStatus(level, completedLevels, currentLevel);
          const catInfo  = CATEGORIES[level.category] || {};
          const isDone   = status === 'done';
          const isActive = status === 'active';
          const isLocked = status === 'locked';

          return (
            <button
              key={level.id}
              className={`level-node${isActive ? ' active-node' : ''}`}
              onClick={() => !isLocked && onSelect(level.id)}
              disabled={isLocked}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '9px 10px', marginBottom: '2px',
                borderRadius: '10px', border: '1px solid',
                borderColor: isActive
                  ? 'rgba(129,140,248,0.35)'
                  : isDone
                  ? 'rgba(52,211,153,0.2)'
                  : 'transparent',
                background: isActive
                  ? 'rgba(129,140,248,0.09)'
                  : isDone
                  ? 'rgba(52,211,153,0.05)'
                  : 'transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.3 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Number bubble */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: isDone ? '13px' : '11px',
                background: isDone
                  ? 'rgba(52,211,153,0.15)'
                  : isActive
                  ? 'rgba(129,140,248,0.18)'
                  : 'var(--bg-raised)',
                border: `1px solid ${isDone ? 'rgba(52,211,153,0.35)' : isActive ? 'rgba(129,140,248,0.45)' : 'var(--border)'}`,
                color: isDone ? 'var(--success)' : isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                boxShadow: isActive ? '0 0 10px rgba(129,140,248,0.22)' : 'none',
              }}>
                {isLocked ? '🔒' : isDone ? '✓' : level.id}
              </div>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500,
                  fontSize: '12px', lineHeight: 1.25, marginBottom: '2px',
                  color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {level.title}
                </div>
                <div style={{
                  fontSize: '9.5px', fontFamily: 'var(--font-mono)',
                  color: catInfo.color || 'var(--text-muted)', opacity: 0.85,
                }}>
                  {level.category}
                </div>
              </div>

              <span style={{ fontSize: '13px', flexShrink: 0 }}>{level.icon}</span>
            </button>
          );
        })}
      </div>

      {/* ── Dot mini-map ── */}
      <div style={{
        padding: '10px 14px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '4px', flexWrap: 'wrap',
      }}>
        {LEVELS.map(l => (
          <div
            key={l.id}
            title={`Level ${l.id}: ${l.title}`}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: completedLevels.includes(l.id) ? 'var(--success)'
                : l.id === currentLevel ? 'var(--accent)'
                : 'var(--dot-empty)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

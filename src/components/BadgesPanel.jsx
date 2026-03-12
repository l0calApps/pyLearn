import React from 'react';
import { BADGES } from '../data/levels';

export default function BadgesPanel({ completedLevels, streak }) {
  const earned = BADGES.filter(b => b.condition(completedLevels.length, streak, completedLevels));

  return (
    <div className="card" style={{ padding: '14px 16px', width: '100%', flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Achievements
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {earned.length}/{BADGES.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '7px' }}>
        {BADGES.map(badge => {
          const unlocked = badge.condition(completedLevels.length, streak, completedLevels);
          return (
            <div
              key={badge.id}
              title={`${badge.name}: ${badge.desc}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                padding: '10px 6px', borderRadius: '10px',
                background: unlocked ? 'rgba(129,140,248,0.09)' : 'var(--bg-raised)',
                border: `1px solid ${unlocked ? 'rgba(129,140,248,0.28)' : 'var(--border)'}`,
                opacity: unlocked ? 1 : 0.4,
                transition: 'all 0.2s ease',
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: '20px', filter: unlocked ? 'none' : 'grayscale(100%)' }}>
                {badge.icon}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '8.5px',
                color: unlocked ? 'var(--accent-light)' : 'var(--text-muted)',
                textAlign: 'center', lineHeight: 1.25,
              }}>
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>

      {earned.length === 0 && (
        <p style={{
          textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)',
          marginTop: '10px', fontStyle: 'italic',
        }}>
          Complete levels to unlock badges
        </p>
      )}
    </div>
  );
}

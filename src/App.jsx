import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LevelSelector from './components/LevelSelector';
import LevelView from './components/LevelView';
import BadgesPanel from './components/BadgesPanel';
import { LEVELS } from './data/levels';

const STORAGE_KEY = 'pylearn_progress_v2';

function load() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (_) {}
  return { completed: [], streak: 0, currentLevel: 1 };
}
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch (_) {} }

/* ── Streak toast ─────────────────────────────────────────────────── */
function StreakToast({ streak, visible }) {
  if (!visible || streak < 2) return null;
  const msg =
    streak >= 10 ? '🌟 Legendary!' :
    streak >= 5  ? '⚡ Unstoppable!' :
    streak >= 3  ? '🔥 On fire!'  :
                   '🎉 Nice pair!';
  return (
    <div className="toast" style={{
      background: 'linear-gradient(135deg, #78350f, #f59e0b)',
      color: '#0f0d0b', borderRadius: '12px', padding: '11px 20px',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
      display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 6px 28px rgba(245,158,11,0.45)',
    }}>
      {msg} — {streak} in a row!
    </div>
  );
}

/* ── Reset modal ──────────────────────────────────────────────────── */
function ResetModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="card anim-pop"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '420px', width: '92%', padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px', margin: '0 auto 14px',
            background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>🗑️</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
            color: 'var(--text-primary)', margin: '0 0 10px',
          }}>Reset all progress?</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
            This clears all completed levels, badges, and your streak.
            You'll return to Level 1.{' '}
            <strong style={{ color: 'var(--error)' }}>This cannot be undone.</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: 'linear-gradient(135deg, #7f1d1d, #fb7185)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 0',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13.5px',
              cursor: 'pointer', boxShadow: '0 2px 14px rgba(251,113,133,0.3)',
            }}
          >
            Yes, reset everything
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [progress, setProgress]   = useState(load);
  const [toastVisible, setToast]  = useState(false);
  const [showReset, setShowReset] = useState(false);
  const toastTimer                = useRef(null);

  const { completed, streak, currentLevel } = progress;
  const levelData = LEVELS.find(l => l.id === currentLevel) || LEVELS[0];

  useEffect(() => { save(progress); }, [progress]);

  const handleComplete = (id) => {
    setProgress(prev => {
      if (prev.completed.includes(id)) return prev;
      const newStreak = prev.streak + 1;
      if (newStreak >= 2) {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 2900);
      }
      return { ...prev, completed: [...prev.completed, id], streak: newStreak };
    });
  };

  const handleSelectLevel = (id) => setProgress(p => ({ ...p, currentLevel: id }));

  const handleNext = () => {
    const next = Math.min(currentLevel + 1, LEVELS.length);
    setProgress(p => ({ ...p, currentLevel: next }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLevel = (id) =>
    setProgress(p => ({ ...p, completed: p.completed.filter(x => x !== id), streak: 0 }));

  const handleResetAll = () => {
    const fresh = { completed: [], streak: 0, currentLevel: 1 };
    setProgress(fresh); save(fresh); setShowReset(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', transition: 'background 0.25s ease' }}>
      <Header completedLevels={completed} streak={streak} currentLevel={currentLevel} />
      <StreakToast streak={streak} visible={toastVisible} />
      {showReset && <ResetModal onConfirm={handleResetAll} onCancel={() => setShowReset(false)} />}

      <main style={{
        maxWidth: '1400px', margin: '0 auto', padding: '24px',
        display: 'flex', gap: '24px', alignItems: 'flex-start',
      }}>

        {/*
          ── SIDEBAR ──────────────────────────────────────────────────
          Sticky container wraps ALL three sections (levels, badges,
          reset). Nothing inside is sticky — this wrapper handles it.
          overflow-y: auto allows the whole sidebar to scroll as one
          unit if the viewport is shorter than the content.
        */}
        <div style={{
          width: '260px',
          flexShrink: 0,
          position: 'sticky',
          top: '76px',
          maxHeight: 'calc(100vh - 92px)',
          overflowY: 'auto',
          overflowX: 'visible',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingBottom: '16px',
          /* hide scrollbar visually but keep it functional */
          scrollbarWidth: 'thin',
        }}>
          <LevelSelector
            currentLevel={currentLevel}
            completedLevels={completed}
            onSelect={handleSelectLevel}
          />

          <BadgesPanel completedLevels={completed} streak={streak} />

          {/* Reset section — always visible at bottom of sidebar */}
          <div style={{
            background: 'rgba(251,113,133,0.05)',
            border: '1px solid rgba(251,113,133,0.18)',
            borderRadius: '12px',
            padding: '14px',
            flexShrink: 0,
          }}>
            <p style={{
              fontSize: '11.5px', color: 'var(--text-muted)',
              margin: '0 0 10px', lineHeight: 1.55,
            }}>
              Want to start fresh? This resets all levels, badges and your streak.
            </p>
            <button className="btn-danger" onClick={() => setShowReset(true)}>
              🗑️ Reset all progress
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: '48px' }}>
          <LevelView
            key={currentLevel}
            level={levelData}
            isCompleted={completed.includes(currentLevel)}
            onComplete={handleComplete}
            onNext={handleNext}
            onReset={handleResetLevel}
            isLastLevel={currentLevel === LEVELS.length}
          />
        </div>
      </main>
    </div>
  );
}

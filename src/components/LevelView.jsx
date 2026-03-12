import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import FeedbackPanel from './FeedbackPanel';
import { CATEGORIES } from '../data/levels';
import { runPython } from '../utils/pyRunner';

export default function LevelView({ level, isCompleted, onComplete, onNext, onReset, isLastLevel }) {
  const [code, setCode]           = useState(level.starterCode);
  const [result, setResult]       = useState(null);
  const [showHint, setShowHint]   = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const cat = CATEGORIES[level.category] || { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };

  useEffect(() => {
    setCode(level.starterCode);
    setResult(null);
    setShowHint(false);
  }, [level.id]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const userOutput = runPython(code).trim();
      const correct    = userOutput === level.expectedOutput.trim();
      setResult({ correct, userOutput, expected: level.expectedOutput });
      if (correct) onComplete(level.id);
      setIsRunning(false);
    }, 320);
  }, [code, level, onComplete]);

  const handleReset = () => {
    setCode(level.starterCode);
    setResult(null);
    setShowHint(false);
    onReset(level.id);
  };

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleRun]);

  return (
    <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Level header ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${cat.color}60, ${cat.color})` }} />
        <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0,
            background: cat.bg, border: `1px solid ${cat.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>
            {level.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Level {level.id}
              </span>
              <span className="cat-pill" style={{ color: cat.color, borderColor: `${cat.color}35`, background: cat.bg }}>
                {level.category}
              </span>
              {isCompleted && (
                <span style={{
                  fontSize: '10px', color: '#4ade80', fontFamily: 'var(--font-mono)',
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.28)',
                  borderRadius: '99px', padding: '2px 10px',
                }}>
                  ✓ completed
                </span>
              )}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '21px',
              color: 'var(--text-primary)', margin: '0 0 7px', letterSpacing: '-0.02em',
            }}>
              {level.title}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
              {level.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Concept + Task ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px' }}>📖</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>Concept</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
            {level.concept}
          </p>
        </div>

        <div style={{
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderLeft: '3px solid rgba(245,158,11,0.6)',
          borderRadius: '14px', padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px' }}>🎯</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>Your Task</span>
          </div>
          <p style={{
            fontSize: '13.5px', color: 'var(--text-primary)',
            margin: '0 0 14px', lineHeight: 1.65, fontWeight: 600,
          }}>
            {level.task}
          </p>
          <div>
            <div style={{
              fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
            }}>
              Expected output
            </div>
            <div className="output-block" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)' }}>
              {level.expectedOutput}
            </div>
          </div>
        </div>
      </div>

      {/* ── Code Editor ── */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>Code Editor</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            Tab = 4 spaces · Ctrl+Enter to run
          </span>
        </div>
        <CodeEditor value={code} onChange={setCode} disabled={isRunning} />
      </div>

      {/* ── Hint ── */}
      {showHint && (
        <div className="hint-box">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>🔦</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
                color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '5px',
              }}>Hint</div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                {level.hint}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback ── */}
      {result && <FeedbackPanel result={result} level={level} />}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '4px' }}>
        <button className="btn-primary" onClick={handleRun} disabled={isRunning}>
          {isRunning
            ? <><span className="anim-spin" style={{ display: 'inline-block' }}>⟳</span> Running…</>
            : <>▶ Run Code</>}
        </button>

        <button
          className="btn-ghost"
          onClick={() => setShowHint(v => !v)}
          style={showHint ? { color: 'var(--accent-light)', borderColor: 'rgba(129,140,248,0.4)' } : {}}
        >
          {showHint ? '🔦 Hide hint' : '💡 Hint'}
        </button>

        <button className="btn-ghost" onClick={handleReset}>
          ↺ Reset
        </button>

        {result?.correct && !isLastLevel && (
          <button className="btn-success anim-pop" onClick={onNext} style={{ marginLeft: 'auto' }}>
            Next Level →
          </button>
        )}

        {result?.correct && isLastLevel && (
          <div className="anim-pop" style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #78350f, #f59e0b)',
            color: '#0f0d0b', borderRadius: '10px', padding: '11px 22px',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          }}>
            🏆 Course Complete!
          </div>
        )}
      </div>
    </div>
  );
}

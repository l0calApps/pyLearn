import React, { useRef } from 'react';

export default function CodeEditor({ value, onChange, disabled }) {
  const taRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end } = e.target;
      const next = value.slice(0, s) + '    ' + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        if (taRef.current) {
          taRef.current.selectionStart = taRef.current.selectionEnd = s + 4;
        }
      });
    }
  };

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, 8);

  return (
    <div style={{
      borderRadius: '12px', overflow: 'hidden',
      border: '1px solid #2e271f',
      background: '#0c0a08',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 14px',
        background: '#120f0d',
        borderBottom: '1px solid #1e1a16',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Window dots */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#fb7185','#fbbf24','#4ade80'].map((c, i) => (
              <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '11px', color: '#5c4f3d' }}>
            solution.py
          </span>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          {['Python 3', 'UTF-8', 'spaces:4'].map(t => (
            <span key={t} style={{ fontFamily: "'Fira Code', monospace", fontSize: '9.5px', color: '#3d3328' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Editor body */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Line numbers */}
        <div style={{
          padding: '14px 0', width: '42px', flexShrink: 0,
          background: '#0c0a08', borderRight: '1px solid #1a1612',
          userSelect: 'none', textAlign: 'right',
        }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} style={{
              fontFamily: "'Fira Code', monospace", fontSize: '12px',
              lineHeight: '1.75', color: '#3d3328', paddingRight: '10px',
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={taRef}
          className="code-editor"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={lineCount + 1}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: '13.5px', lineHeight: '1.75',
            background: '#0c0a08', color: '#fde68a',
            border: 'none', padding: '14px 16px',
            resize: 'none', outline: 'none', flex: 1, width: '100%',
            caretColor: '#f59e0b',
          }}
        />
      </div>

      {/* Status bar */}
      <div style={{
        padding: '5px 14px', background: '#0a0806', borderTop: '1px solid #1a1612',
        display: 'flex', gap: '16px', alignItems: 'center',
      }}>
        {[
          `Ln ${lines.length}`,
          `Col ${(lines[lines.length - 1]?.length || 0) + 1}`,
          disabled ? '⏳ running' : '● ready',
        ].map(t => (
          <span key={t} style={{ fontFamily: "'Fira Code', monospace", fontSize: '9.5px', color: '#3d3328' }}>{t}</span>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'Fira Code', monospace", fontSize: '9.5px', color: '#3d3328' }}>
          ctrl+enter to run
        </span>
      </div>
    </div>
  );
}

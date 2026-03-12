import React from 'react';

export default function FeedbackPanel({ result, level }) {
  if (!result) return null;
  const { correct, userOutput, expected } = result;

  return (
    <div className={correct ? 'feedback-success' : 'feedback-error'} style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        background: correct ? 'rgba(74,222,128,0.07)' : 'rgba(251,113,133,0.07)',
        borderBottom: `1px solid ${correct ? 'rgba(74,222,128,0.2)' : 'rgba(251,113,133,0.2)'}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: correct ? 'rgba(74,222,128,0.15)' : 'rgba(251,113,133,0.15)',
          border: `1px solid ${correct ? 'rgba(74,222,128,0.35)' : 'rgba(251,113,133,0.35)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '17px', fontWeight: 700,
          color: correct ? '#4ade80' : '#fb7185',
        }}>
          {correct ? '✓' : '✗'}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
            color: correct ? '#4ade80' : '#fb7185',
          }}>
            {correct ? 'Correct! Great work.' : 'Not quite — keep trying!'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {correct ? 'Your output matches perfectly.' : 'Compare your output with the expected below.'}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Output comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
            }}>Your output</div>
            <div className="output-block" style={{
              color: correct ? '#4ade80' : '#fb7185',
              borderColor: correct ? 'rgba(74,222,128,0.25)' : 'rgba(251,113,133,0.25)',
            }}>
              {userOutput || <em style={{ opacity: 0.4 }}>no output</em>}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
            }}>Expected output</div>
            <div className="output-block" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)' }}>
              {expected}
            </div>
          </div>
        </div>

        {/* Solution reveal on failure */}
        {!correct && (
          <div>
            <div style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
            }}>One valid solution</div>
            <div className="output-block" style={{ color: '#93c5fd', borderColor: 'rgba(147,197,253,0.25)' }}>
              {level.solution}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div style={{
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
          borderRadius: '8px', padding: '12px 14px',
        }}>
          <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
            {level.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

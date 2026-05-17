import { useState, useMemo } from 'react';
import { useGraph, IDEAS } from '../store/graphStore';
import { Idea, Tradition } from '../types';

const TRADITION_COLORS: Record<Tradition, string> = {
  Western:       '#4a9eff',
  African:       '#ffaa4a',
  'East Asian':  '#ff6eb0',
  'South Asian': '#9aff4a',
  Indigenous:    '#ffd84a',
  'Global South':'#4affdd',
  Islamic:       '#ff9a4a',
  Other:         '#888',
};

function IdeaListItem({ idea, onClick }: { idea: Idea; onClick: () => void }) {
  const tradColor = TRADITION_COLORS[idea.tradition];
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '14px 18px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = 'rgba(255,255,255,0.055)';
        el.style.borderColor = 'rgba(255,255,255,0.14)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = 'rgba(255,255,255,0.025)';
        el.style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 5 }}>
          {idea.title}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 10, color: tradColor, background: `${tradColor}22`, padding: '2px 7px', borderRadius: 4 }}>
            {idea.tradition}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{idea.era}</span>
          {idea.originType === 'ORAL' && (
            <span style={{ fontSize: 9, color: '#c04aff', background: '#c04aff22', padding: '2px 6px', borderRadius: 4 }}>oral</span>
          )}
          {idea.originType === 'COLLECTIVE' && (
            <span style={{ fontSize: 9, color: '#4affaa', background: '#4affaa22', padding: '2px 6px', borderRadius: 4 }}>collective</span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</span>
    </button>
  );
}

export function SearchScreen() {
  const { dispatch } = useGraph();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return IDEAS;
    return IDEAS.filter(
      idea =>
        idea.title.toLowerCase().includes(q) ||
        idea.tradition.toLowerCase().includes(q) ||
        idea.era.toLowerCase().includes(q) ||
        idea.summary.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080814', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '56px 40px 32px',
        maxWidth: 680,
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>
            IdeaGraph
          </span>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 40 }}>
          Ideas — not the people who held them — are the unit of knowledge.
          <br />Tap any idea to begin navigating its ancestry and divergence.
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <input
            type="text"
            placeholder="Search ideas, traditions, eras…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '14px 18px',
              fontSize: 14,
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                fontSize: 16, cursor: 'pointer', padding: 4,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation legend */}
        <div style={{
          display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Ancestry', desc: '↑ vertical', color: '#4a9eff' },
            { label: 'Challenges', desc: '← left', color: '#ff5a5a' },
            { label: 'Descendants', desc: '→ right', color: '#4affaa' },
          ].map(({ label, desc, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</strong> {desc}
              </span>
            </div>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '20px 0' }}>
            No ideas match "{query}".
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!query && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: '0.1em' }}>
                ALL IDEAS — {filtered.length}
              </div>
            )}
            {filtered.map(idea => (
              <IdeaListItem
                key={idea.id}
                idea={idea}
                onClick={() => dispatch({ type: 'NAVIGATE', ideaId: idea.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

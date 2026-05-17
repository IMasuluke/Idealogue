import { useGraph } from '../store/graphStore';
import { CONN_META } from './IdeaNode';
import { Tradition } from '../types';

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

export function ThreadView() {
  const { state, dispatch } = useGraph();

  const allIds = [...state.thread, ...(state.centerId ? [state.centerId] : [])];
  const ideas = allIds.map(id => state.ideas.get(id)).filter(Boolean);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080814', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '16px 24px',
        background: 'rgba(8,8,20,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'graph' })} style={btnStyle}>
          ← Graph
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Thread</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''} explored
          </div>
        </div>
      </div>

      {/* Thread body */}
      <div style={{ padding: '32px 40px', maxWidth: 640, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {ideas.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            No thread yet. Navigate the graph to build one.
          </div>
        )}

        {ideas.map((idea, i) => {
          if (!idea) return null;
          const isCurrent = i === ideas.length - 1;
          const tradColor = TRADITION_COLORS[idea.tradition];

          // Connection between this node and the next
          const nextIdea = ideas[i + 1];
          const conn = nextIdea
            ? state.connections.find(
                c =>
                  (c.fromId === idea.id && c.toId === nextIdea.id) ||
                  (c.fromId === nextIdea.id && c.toId === idea.id)
              )
            : undefined;

          return (
            <div key={`${idea.id}-${i}`}>
              {/* Idea card */}
              <div
                onClick={() => dispatch({ type: 'JUMP_TO_THREAD_NODE', index: i })}
                style={{
                  background: isCurrent ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12,
                  padding: '16px 20px',
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (isCurrent) return;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  if (isCurrent) return;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                      {idea.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, color: tradColor, background: `${tradColor}22`, padding: '2px 7px', borderRadius: 4 }}>
                        {idea.tradition}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{idea.era}</span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 12, flexShrink: 0 }}>
                      current
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  {idea.summary}
                </div>
              </div>

              {/* Connector between ideas */}
              {i < ideas.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '6px 0 6px 24px', gap: 2 }}>
                  <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
                  {conn && (
                    <div style={{
                      fontSize: 10,
                      color: CONN_META[conn.type].color,
                      background: `${CONN_META[conn.type].color}18`,
                      padding: '2px 10px',
                      borderRadius: 10,
                    }}>
                      {CONN_META[conn.type].label}
                    </div>
                  )}
                  <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
                </div>
              )}
            </div>
          );
        })}

        {/* AI summary placeholder */}
        {ideas.length >= 3 && (
          <div style={{
            marginTop: 40,
            padding: '20px 24px',
            background: 'rgba(74,158,255,0.05)',
            border: '1px solid rgba(74,158,255,0.15)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, color: '#4a9eff', marginBottom: 8, letterSpacing: '0.1em' }}>
              CLAUDE SUMMARY
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
              In the full app, Claude would write a prose essay tracing your path through these ideas — surfacing the throughlines, tensions, and divergences in the thread you've built.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.55)',
  padding: '6px 14px',
  fontSize: 12,
  cursor: 'pointer',
};

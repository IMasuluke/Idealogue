import { useGraph } from '../store/graphStore';

export function ThreadBar() {
  const { state, dispatch } = useGraph();

  if (state.thread.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,8,20,0.92)',
      backdropFilter: 'blur(14px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflowX: 'auto',
    }}>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginRight: 6, flexShrink: 0, letterSpacing: '0.12em' }}>
        THREAD
      </span>
      {state.thread.map((id, i) => {
        const idea = state.ideas.get(id);
        if (!idea) return null;
        return (
          <button
            key={`${id}-${i}`}
            onClick={() => dispatch({ type: 'JUMP_TO_THREAD_NODE', index: i })}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '4px 12px',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 11,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            {idea.title}
          </button>
        );
      })}
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>→ here</span>
    </div>
  );
}

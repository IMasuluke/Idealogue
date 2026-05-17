import { Idea, Connection, ConnectionType, Tradition } from '../types';

export const CONN_META: Record<ConnectionType, { label: string; color: string; dashArray?: string }> = {
  INFLUENCED:      { label: 'influenced',     color: '#4a9eff' },
  CHALLENGED:      { label: 'challenged',     color: '#ff5a5a',  dashArray: '6,4' },
  PARALLEL:        { label: 'parallel',       color: '#ffd84a',  dashArray: '8,4' },
  CONTESTED:       { label: 'contested',      color: '#ff9a4a',  dashArray: '4,3' },
  TRANSMITTED_VIA: { label: 'transmitted via',color: '#aa6aff' },
  ORAL_TRADITION:  { label: 'oral tradition', color: '#c04aff',  dashArray: '8,4' },
  RUPTURE:         { label: 'rupture',        color: '#ff4a88',  dashArray: '2,4' },
  RECLAMATION:     { label: 'reclaims',       color: '#4affaa' },
  RESPONDED_TO:    { label: 'responded to',   color: '#4adfff' },
  SILENT_INFLUENCE:{ label: 'silent influence',color: '#777',    dashArray: '12,6' },
  CONVERGENT:      { label: 'converges',      color: '#aaff4a' },
};

const TRADITION_COLORS: Record<Tradition, string> = {
  Western:      '#4a9eff',
  African:      '#ffaa4a',
  'East Asian': '#ff6eb0',
  'South Asian':'#9aff4a',
  Indigenous:   '#ffd84a',
  'Global South':'#4affdd',
  Islamic:      '#ff9a4a',
  Other:        '#888',
};

interface Props {
  idea: Idea;
  isCenter?: boolean;
  connection?: Connection;
  position?: 'ancestor' | 'challenger' | 'descendant';
  onClick?: () => void;
}

export function IdeaNode({ idea, isCenter, connection, onClick }: Props) {
  const tradColor = TRADITION_COLORS[idea.tradition];
  const connMeta = connection ? CONN_META[connection.type] : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: isCenter ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isCenter ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12,
        padding: isCenter ? '18px 22px' : '11px 14px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isCenter ? '0 0 60px rgba(255,255,255,0.04)' : 'none',
        backdropFilter: 'blur(10px)',
        transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
        userSelect: 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.09)';
        el.style.borderColor = 'rgba(255,255,255,0.25)';
        el.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={e => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = isCenter ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)';
        el.style.borderColor = isCenter ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)';
        el.style.transform = 'scale(1)';
      }}
    >
      {connMeta && (
        <div style={{
          fontSize: 9,
          color: connMeta.color,
          marginBottom: 5,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}>
          {connMeta.label}
          {connection && (
            <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 6, fontWeight: 400 }}>
              {Math.round(connection.confidence * 100)}%
            </span>
          )}
        </div>
      )}

      <div style={{
        fontSize: isCenter ? 17 : 13,
        fontWeight: isCenter ? 600 : 500,
        color: '#fff',
        lineHeight: 1.3,
        marginBottom: 6,
      }}>
        {idea.title}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10,
          color: tradColor,
          background: `${tradColor}22`,
          padding: '2px 7px',
          borderRadius: 4,
          fontWeight: 500,
        }}>
          {idea.tradition}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          {idea.era}
        </span>
        {idea.originType === 'ORAL' && (
          <span style={{ fontSize: 9, color: '#c04aff', background: '#c04aff22', padding: '2px 6px', borderRadius: 4 }}>
            oral
          </span>
        )}
        {idea.originType === 'COLLECTIVE' && (
          <span style={{ fontSize: 9, color: '#4affaa', background: '#4affaa22', padding: '2px 6px', borderRadius: 4 }}>
            collective
          </span>
        )}
      </div>

      {isCenter && (
        <div style={{
          marginTop: 12,
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6,
        }}>
          {idea.summary}
        </div>
      )}
    </div>
  );
}

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGraph, getGraphNodes, GraphNodeItem } from '../store/graphStore';
import { IdeaNode, CONN_META } from './IdeaNode';
import { ThreadBar } from './ThreadBar';
import { ConnectionType } from '../types';

// Layout constants — sizes in px
const CENTER_W = 270;
const CENTER_H = 200;   // approximate; content can exceed this
const NODE_W = 175;
const NODE_H = 95;
const GAP = 22;

// Distance from center-center to first satellite-center
const FIRST_H = CENTER_W / 2 + GAP + NODE_W / 2;   // ~258
const FIRST_V = CENTER_H / 2 + GAP + NODE_H / 2;   // ~169

// Distance between consecutive satellite centers
const H_STEP = NODE_W + GAP;    // ~197
const V_STEP = NODE_H + GAP;    // ~117

const MAX_PER_AXIS = 3;

function connStyle(type: ConnectionType) {
  const m = CONN_META[type];
  return { stroke: m.color + '88', dashArray: m.dashArray };
}

function OverflowChip({ count, label }: { count: number; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20,
      padding: '4px 10px',
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
    }}>
      +{count} {label}
    </div>
  );
}

export function GraphView() {
  const { state, dispatch } = useGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1000, h: 700 });
  const [graphOpacity, setGraphOpacity] = useState(1);
  const navigating = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const navigate = useCallback((ideaId: string) => {
    if (navigating.current) return;
    navigating.current = true;
    setGraphOpacity(0);
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', ideaId });
      setTimeout(() => {
        setGraphOpacity(1);
        navigating.current = false;
      }, 40);
    }, 220);
  }, [dispatch]);

  const centerIdea = state.centerId ? state.ideas.get(state.centerId) : null;
  const { ancestors, challengers, descendants } = getGraphNodes(state);

  if (!centerIdea) return null;

  // Center is horizontally centred, shifted down slightly for ancestor headroom
  const cx = dims.w / 2;
  const cy = Math.max(dims.h * 0.52, FIRST_V + (MAX_PER_AXIS - 1) * V_STEP + NODE_H / 2 + 80);

  // Cap visible nodes
  const visAnc = ancestors.slice(0, MAX_PER_AXIS);
  const visChal = challengers.slice(0, MAX_PER_AXIS);
  const visDesc = descendants.slice(0, MAX_PER_AXIS);
  const extraAnc = ancestors.length - visAnc.length;
  const extraChal = challengers.length - visChal.length;
  const extraDesc = descendants.length - visDesc.length;

  // Satellite center positions
  const ancPos = visAnc.map((_, i) => ({ x: cx, y: cy - FIRST_V - V_STEP * i }));
  const chalPos = visChal.map((_, i) => ({ x: cx - FIRST_H - H_STEP * i, y: cy }));
  const descPos = visDesc.map((_, i) => ({ x: cx + FIRST_H + H_STEP * i, y: cy }));

  // SVG line endpoints (edge of center → edge of satellite)
  const topEdge = cy - CENTER_H / 2;
  const leftEdge = cx - CENTER_W / 2;
  const rightEdge = cx + CENTER_W / 2;

  function renderSatellite(item: GraphNodeItem, pos: { x: number; y: number }, w: number, h: number, position: 'ancestor' | 'challenger' | 'descendant') {
    return (
      <div
        key={item.idea.id}
        style={{
          position: 'absolute',
          left: pos.x - w / 2,
          top: pos.y - h / 2,
          width: w,
        }}
      >
        <IdeaNode
          idea={item.idea}
          connection={item.connection}
          position={position}
          onClick={() => navigate(item.idea.id)}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080814', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(8,8,20,0.98) 70%, transparent)',
      }}>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'search' })} style={btnStyle}>
          ← Search
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.03em' }}>
          IdeaGraph
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'thread' })}
          style={{ ...btnStyle, background: state.thread.length > 0 ? 'rgba(255,255,255,0.06)' : 'transparent' }}
        >
          Thread {state.thread.length > 0 ? `(${state.thread.length})` : ''}
        </button>
      </div>

      {/* Graph canvas */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', opacity: graphOpacity, transition: 'opacity 0.22s ease' }}
      >
        {/* SVG connection lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Vertical axis line (full) */}
          {visAnc.length > 0 && (
            <line
              x1={cx} y1={topEdge}
              x2={cx} y2={ancPos[visAnc.length - 1].y + NODE_H / 2}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1}
            />
          )}
          {/* Horizontal axis line (full) */}
          {(visChal.length > 0 || visDesc.length > 0) && (
            <line
              x1={visChal.length > 0 ? chalPos[visChal.length - 1].x - NODE_W / 2 : leftEdge}
              y1={cy}
              x2={visDesc.length > 0 ? descPos[visDesc.length - 1].x + NODE_W / 2 : rightEdge}
              y2={cy}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1}
            />
          )}

          {/* Ancestor lines */}
          {visAnc.map((item, i) => {
            const s = connStyle(item.connection.type);
            const endY = ancPos[i].y + NODE_H / 2;
            const startY = i === 0 ? topEdge : ancPos[i - 1].y - NODE_H / 2;
            return (
              <line key={item.idea.id}
                x1={cx} y1={startY} x2={cx} y2={endY}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray}
              />
            );
          })}

          {/* Challenger lines */}
          {visChal.map((item, i) => {
            const s = connStyle(item.connection.type);
            const endX = chalPos[i].x + NODE_W / 2;
            const startX = i === 0 ? leftEdge : chalPos[i - 1].x - NODE_W / 2;
            return (
              <line key={item.idea.id}
                x1={startX} y1={cy} x2={endX} y2={cy}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray}
              />
            );
          })}

          {/* Descendant lines */}
          {visDesc.map((item, i) => {
            const s = connStyle(item.connection.type);
            const endX = descPos[i].x - NODE_W / 2;
            const startX = i === 0 ? rightEdge : descPos[i - 1].x + NODE_W / 2;
            return (
              <line key={item.idea.id}
                x1={startX} y1={cy} x2={endX} y2={cy}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray}
              />
            );
          })}

          {/* Axis label — ancestry */}
          {visAnc.length > 0 && (
            <text
              x={cx + 10}
              y={(topEdge + cy) / 2}
              fill="rgba(255,255,255,0.15)"
              fontSize={9}
              textAnchor="start"
              dominantBaseline="middle"
              style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              ANCESTRY
            </text>
          )}
          {/* Axis label — challengers */}
          {visChal.length > 0 && (
            <text
              x={(chalPos[visChal.length - 1].x + (visChal.length > 1 ? chalPos[visChal.length - 2].x : leftEdge)) / 2}
              y={cy - 12}
              fill="rgba(255,255,255,0.15)"
              fontSize={9}
              textAnchor="middle"
              style={{ letterSpacing: '0.15em' }}
            >
              CHALLENGES
            </text>
          )}
          {/* Axis label — descendants */}
          {visDesc.length > 0 && (
            <text
              x={(descPos[visDesc.length - 1].x + (visDesc.length > 1 ? descPos[visDesc.length - 2].x : rightEdge)) / 2}
              y={cy - 12}
              fill="rgba(255,255,255,0.15)"
              fontSize={9}
              textAnchor="middle"
              style={{ letterSpacing: '0.15em' }}
            >
              DESCENDANTS
            </text>
          )}
        </svg>

        {/* Center node */}
        <div style={{ position: 'absolute', left: cx - CENTER_W / 2, top: cy - CENTER_H / 2, width: CENTER_W }}>
          <IdeaNode idea={centerIdea} isCenter />
        </div>

        {/* Satellite nodes */}
        {visAnc.map((item, i) => renderSatellite(item, ancPos[i], NODE_W, NODE_H, 'ancestor'))}
        {visChal.map((item, i) => renderSatellite(item, chalPos[i], NODE_W, NODE_H, 'challenger'))}
        {visDesc.map((item, i) => renderSatellite(item, descPos[i], NODE_W, NODE_H, 'descendant'))}

        {/* Overflow indicators */}
        {extraAnc > 0 && (
          <div style={{ position: 'absolute', left: cx - 50, top: ancPos[visAnc.length - 1].y - NODE_H / 2 - 36 }}>
            <OverflowChip count={extraAnc} label="more" />
          </div>
        )}
        {extraChal > 0 && (
          <div style={{ position: 'absolute', left: chalPos[visChal.length - 1].x - NODE_W / 2 - 80, top: cy - 16 }}>
            <OverflowChip count={extraChal} label="more" />
          </div>
        )}
        {extraDesc > 0 && (
          <div style={{ position: 'absolute', left: descPos[visDesc.length - 1].x + NODE_W / 2 + 8, top: cy - 16 }}>
            <OverflowChip count={extraDesc} label="more" />
          </div>
        )}

        {/* Empty-state hints */}
        {visAnc.length === 0 && visChal.length === 0 && visDesc.length === 0 && (
          <div style={{
            position: 'absolute',
            left: cx + CENTER_W / 2 + 20,
            top: cy,
            color: 'rgba(255,255,255,0.2)',
            fontSize: 12,
            maxWidth: 180,
            lineHeight: 1.6,
          }}>
            No connections mapped yet. In the full app, Claude would populate these automatically.
          </div>
        )}
      </div>

      <ThreadBar />
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
  transition: 'all 0.15s',
};

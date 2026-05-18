import { useRef, useState, useEffect, useCallback } from 'react';
import { useGraph, getGraphNodes, GraphNodeItem, GraphState } from '../store/graphStore';
import { IdeaNode, CONN_META } from './IdeaNode';
import { ThreadBar } from './ThreadBar';
import { ConnectionType, Idea, Connection } from '../types';

// ── Layout constants ────────────────────────────────────────────────────────
const CENTER_W = 270;
const CENTER_H = 200;
const NODE_W   = 175;
const NODE_H   = 95;
const GAP      = 22;
const FIRST_H  = CENTER_W / 2 + GAP + NODE_W / 2;   // ~258
const FIRST_V  = CENTER_H / 2 + GAP + NODE_H / 2;   // ~169
const H_STEP   = NODE_W + GAP;                        // ~197
const V_STEP   = NODE_H + GAP;                        // ~117
const MAX_AXIS = 3;

const OFF_W    = 148;
const OFF_H    = 62;

// ── Off-axis computation ────────────────────────────────────────────────────
interface OffAxisItem {
  idea: Idea;
  connection: Connection;
  pos: { x: number; y: number };
  parentPos: { x: number; y: number };
}

type Pos = { x: number; y: number };

function computeOffAxis(
  state: GraphState,
  visAnc:  GraphNodeItem[], ancPos:  Pos[],
  visChal: GraphNodeItem[], chalPos: Pos[],
  visDesc: GraphNodeItem[], descPos: Pos[],
  cx: number, cy: number,
): OffAxisItem[] {
  const primaryIds = new Set<string>([
    state.centerId!,
    ...visAnc.map(n => n.idea.id),
    ...visChal.map(n => n.idea.id),
    ...visDesc.map(n => n.idea.id),
  ]);
  const addedIds = new Set<string>(primaryIds);
  const result: OffAxisItem[] = [];

  function getSecs(ideaId: string) {
    const out: Array<{ idea: Idea; connection: Connection }> = [];
    for (const conn of state.connections) {
      let otherId: string | null = null;
      if (conn.fromId === ideaId && !addedIds.has(conn.toId))  otherId = conn.toId;
      if (conn.toId   === ideaId && !addedIds.has(conn.fromId)) otherId = conn.fromId;
      if (otherId) {
        const idea = state.ideas.get(otherId);
        if (idea) out.push({ idea, connection: conn });
      }
    }
    return out.slice(0, 2);
  }

  // Ancestor → off-axis goes RIGHT, at the ancestor's y-level
  visAnc.forEach((item, i) => {
    getSecs(item.idea.id).forEach((sec, j) => {
      if (addedIds.has(sec.idea.id)) return;
      addedIds.add(sec.idea.id);
      result.push({
        idea: sec.idea, connection: sec.connection,
        pos: { x: cx + FIRST_H + H_STEP * j, y: ancPos[i].y },
        parentPos: ancPos[i],
      });
    });
  });

  // Challenger → off-axis goes ABOVE, at the challenger's x-level
  visChal.forEach((item, i) => {
    getSecs(item.idea.id).forEach((sec, j) => {
      if (addedIds.has(sec.idea.id)) return;
      addedIds.add(sec.idea.id);
      result.push({
        idea: sec.idea, connection: sec.connection,
        pos: { x: chalPos[i].x, y: cy - FIRST_V - V_STEP * j },
        parentPos: chalPos[i],
      });
    });
  });

  // Descendant → off-axis goes BELOW, at the descendant's x-level
  visDesc.forEach((item, i) => {
    getSecs(item.idea.id).forEach((sec, j) => {
      if (addedIds.has(sec.idea.id)) return;
      addedIds.add(sec.idea.id);
      result.push({
        idea: sec.idea, connection: sec.connection,
        pos: { x: descPos[i].x, y: cy + FIRST_V + V_STEP * j },
        parentPos: descPos[i],
      });
    });
  });

  return result;
}

// ── Connection line style ───────────────────────────────────────────────────
function connStyle(type: ConnectionType, faded = false) {
  const m = CONN_META[type];
  const alpha = faded ? '33' : '88';
  return { stroke: m.color + alpha, dashArray: m.dashArray };
}

// ── Component ───────────────────────────────────────────────────────────────
export function GraphView() {
  const { state, dispatch } = useGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1000, h: 700 });
  const [graphOpacity, setGraphOpacity] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragRef  = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const didDrag  = useRef(false);
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

  // Reset pan on navigation
  useEffect(() => { setPan({ x: 0, y: 0 }); }, [state.centerId]);

  // Global pointer-up so fast drags that leave the container still end cleanly
  useEffect(() => {
    const end = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setTimeout(() => { didDrag.current = false; }, 50);
    };
    window.addEventListener('pointerup', end);
    return () => window.removeEventListener('pointerup', end);
  }, []);

  const navigate = useCallback((ideaId: string) => {
    if (didDrag.current || navigating.current) return;
    navigating.current = true;
    setGraphOpacity(0);
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE', ideaId });
      setTimeout(() => { setGraphOpacity(1); navigating.current = false; }, 40);
    }, 220);
  }, [dispatch]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Let node clicks pass through
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    didDrag.current = false;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, [pan.x, pan.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setTimeout(() => { didDrag.current = false; }, 50);
  }, []);

  const centerIdea = state.centerId ? state.ideas.get(state.centerId) : null;
  const { ancestors, challengers, descendants } = getGraphNodes(state);

  if (!centerIdea) return null;

  const cx = dims.w / 2;
  const cy = Math.max(dims.h * 0.52, FIRST_V + (MAX_AXIS - 1) * V_STEP + NODE_H / 2 + 80);

  const visAnc  = ancestors.slice(0, MAX_AXIS);
  const visChal = challengers.slice(0, MAX_AXIS);
  const visDesc = descendants.slice(0, MAX_AXIS);
  const extraAnc  = ancestors.length  - visAnc.length;
  const extraChal = challengers.length - visChal.length;
  const extraDesc = descendants.length - visDesc.length;

  const ancPos  = visAnc.map( (_, i) => ({ x: cx,                         y: cy - FIRST_V - V_STEP * i }));
  const chalPos = visChal.map((_, i) => ({ x: cx - FIRST_H - H_STEP * i, y: cy }));
  const descPos = visDesc.map((_, i) => ({ x: cx + FIRST_H + H_STEP * i, y: cy }));

  const offAxis = computeOffAxis(
    state,
    visAnc, ancPos, visChal, chalPos, visDesc, descPos,
    cx, cy,
  );

  const isPanned = pan.x !== 0 || pan.y !== 0;

  function renderSatellite(item: GraphNodeItem, pos: Pos, position: 'ancestor' | 'challenger' | 'descendant') {
    return (
      <div
        key={item.idea.id}
        data-node="true"
        style={{ position: 'absolute', left: pos.x - NODE_W / 2, top: pos.y - NODE_H / 2, width: NODE_W }}
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
        pointerEvents: 'none',
      }}>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'search' })} style={{ ...btnStyle, pointerEvents: 'all' }}>
          ← Search
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.03em' }}>
          IdeaGraph
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'thread' })}
          style={{ ...btnStyle, background: state.thread.length > 0 ? 'rgba(255,255,255,0.06)' : 'transparent', pointerEvents: 'all' }}
        >
          Thread {state.thread.length > 0 ? `(${state.thread.length})` : ''}
        </button>
      </div>

      {/* Graph canvas — drag target */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: didDrag.current ? 'grabbing' : 'grab' }}
      >
        {/* Pan + opacity layer */}
        <div style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          width: '100%', height: '100%',
          position: 'relative',
          opacity: graphOpacity,
          transition: 'opacity 0.22s ease',
        }}>

          {/* SVG lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>

            {/* Faint axis guide lines */}
            {visAnc.length > 0 && (
              <line x1={cx} y1={cy - CENTER_H / 2} x2={cx} y2={ancPos[visAnc.length - 1].y + NODE_H / 2}
                stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            )}
            {(visChal.length > 0 || visDesc.length > 0) && (
              <line
                x1={visChal.length > 0 ? chalPos[visChal.length - 1].x - NODE_W / 2 : cx - CENTER_W / 2}
                y1={cy}
                x2={visDesc.length > 0 ? descPos[visDesc.length - 1].x + NODE_W / 2 : cx + CENTER_W / 2}
                y2={cy}
                stroke="rgba(255,255,255,0.05)" strokeWidth={1}
              />
            )}

            {/* Primary axis connection lines */}
            {visAnc.map((item, i) => {
              const s = connStyle(item.connection.type);
              const y0 = i === 0 ? cy - CENTER_H / 2 : ancPos[i - 1].y - NODE_H / 2;
              return <line key={item.idea.id} x1={cx} y1={y0} x2={cx} y2={ancPos[i].y + NODE_H / 2}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray} />;
            })}
            {visChal.map((item, i) => {
              const s = connStyle(item.connection.type);
              const x0 = i === 0 ? cx - CENTER_W / 2 : chalPos[i - 1].x + NODE_W / 2;
              return <line key={item.idea.id} x1={x0} y1={cy} x2={chalPos[i].x + NODE_W / 2} y2={cy}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray} />;
            })}
            {visDesc.map((item, i) => {
              const s = connStyle(item.connection.type);
              const x0 = i === 0 ? cx + CENTER_W / 2 : descPos[i - 1].x - NODE_W / 2;
              return <line key={item.idea.id} x1={x0} y1={cy} x2={descPos[i].x - NODE_W / 2} y2={cy}
                stroke={s.stroke} strokeWidth={1.5} strokeDasharray={s.dashArray} />;
            })}

            {/* Off-axis connection lines (faint) */}
            {offAxis.map(item => {
              const s = connStyle(item.connection.type, true);
              return (
                <line key={item.idea.id}
                  x1={item.parentPos.x} y1={item.parentPos.y}
                  x2={item.pos.x} y2={item.pos.y}
                  stroke={s.stroke} strokeWidth={1} strokeDasharray="4,4"
                />
              );
            })}

            {/* Axis labels */}
            {visAnc.length > 0 && (
              <text x={cx + 10} y={(cy - CENTER_H / 2 + (ancPos[visAnc.length - 1]?.y ?? cy - FIRST_V)) / 2}
                fill="rgba(255,255,255,0.13)" fontSize={9} textAnchor="start" dominantBaseline="middle"
                style={{ letterSpacing: '0.15em' }}>ANCESTRY</text>
            )}
            {visChal.length > 0 && (
              <text x={chalPos[0].x + NODE_W / 2 - 10} y={cy - 13}
                fill="rgba(255,255,255,0.13)" fontSize={9} textAnchor="end"
                style={{ letterSpacing: '0.15em' }}>CHALLENGES</text>
            )}
            {visDesc.length > 0 && (
              <text x={descPos[0].x - NODE_W / 2 + 10} y={cy - 13}
                fill="rgba(255,255,255,0.13)" fontSize={9} textAnchor="start"
                style={{ letterSpacing: '0.15em' }}>DESCENDANTS</text>
            )}
          </svg>

          {/* Off-axis nodes (rendered first so they appear behind primary) */}
          {offAxis.map(item => (
            <div
              key={item.idea.id}
              data-node="true"
              style={{ position: 'absolute', left: item.pos.x - OFF_W / 2, top: item.pos.y - OFF_H / 2, width: OFF_W, opacity: 0.38 }}
            >
              <IdeaNode
                idea={item.idea}
                connection={item.connection}
                isOffAxis
                onClick={() => navigate(item.idea.id)}
              />
            </div>
          ))}

          {/* Primary satellite nodes */}
          {visAnc.map( (item, i) => renderSatellite(item, ancPos[i],  'ancestor'))}
          {visChal.map((item, i) => renderSatellite(item, chalPos[i], 'challenger'))}
          {visDesc.map((item, i) => renderSatellite(item, descPos[i], 'descendant'))}

          {/* Center node */}
          <div style={{ position: 'absolute', left: cx - CENTER_W / 2, top: cy - CENTER_H / 2, width: CENTER_W }}>
            <IdeaNode idea={centerIdea} isCenter />
          </div>

          {/* Overflow chips */}
          {extraAnc > 0 && <OverflowChip count={extraAnc} x={cx - 30} y={ancPos[visAnc.length - 1].y - NODE_H / 2 - 30} />}
          {extraChal > 0 && <OverflowChip count={extraChal} x={chalPos[visChal.length - 1].x - NODE_W / 2 - 72} y={cy - 14} />}
          {extraDesc > 0 && <OverflowChip count={extraDesc} x={descPos[visDesc.length - 1].x + NODE_W / 2 + 8} y={cy - 14} />}

          {/* Empty state */}
          {visAnc.length === 0 && visChal.length === 0 && visDesc.length === 0 && (
            <div style={{
              position: 'absolute', left: cx + CENTER_W / 2 + 20, top: cy,
              color: 'rgba(255,255,255,0.2)', fontSize: 12, maxWidth: 200, lineHeight: 1.6,
            }}>
              No connections mapped yet — in the full app Claude would populate these.
            </div>
          )}
        </div>

        {/* Pan reset hint */}
        {isPanned && (
          <button
            onClick={() => setPan({ x: 0, y: 0 })}
            style={{
              position: 'absolute', bottom: 72, right: 20, zIndex: 20,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, color: 'rgba(255,255,255,0.5)',
              padding: '6px 12px', fontSize: 11, cursor: 'pointer',
            }}
          >
            ⊕ Re-centre
          </button>
        )}
      </div>

      <ThreadBar />
    </div>
  );
}

function OverflowChip({ count, x, y }: { count: number; x: number; y: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20, padding: '3px 10px',
      fontSize: 10, color: 'rgba(255,255,255,0.35)',
    }}>
      +{count} more
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: 'rgba(255,255,255,0.55)',
  padding: '6px 14px', fontSize: 12, cursor: 'pointer',
  transition: 'all 0.15s',
};

import React, { createContext, useContext, useReducer } from 'react';
import { Idea, Connection, Screen, ConnectionType } from '../types';
import { IDEAS, CONNECTIONS, IDEAS_MAP } from '../data/seed';

export interface GraphState {
  ideas: Map<string, Idea>;
  connections: Connection[];
  centerId: string | null;
  thread: string[];
  screen: Screen;
}

type Action =
  | { type: 'NAVIGATE'; ideaId: string }
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'JUMP_TO_THREAD_NODE'; index: number };

const initialState: GraphState = {
  ideas: IDEAS_MAP,
  connections: CONNECTIONS,
  centerId: null,
  thread: [],
  screen: 'search',
};

function reducer(state: GraphState, action: Action): GraphState {
  switch (action.type) {
    case 'NAVIGATE': {
      const newThread = state.centerId
        ? [...state.thread, state.centerId]
        : state.thread;
      return { ...state, centerId: action.ideaId, thread: newThread, screen: 'graph' };
    }
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'JUMP_TO_THREAD_NODE': {
      const newCenterId = state.thread[action.index];
      const newThread = state.thread.slice(0, action.index);
      return { ...state, centerId: newCenterId, thread: newThread, screen: 'graph' };
    }
  }
}

const ANCESTOR_TYPES = new Set<ConnectionType>([
  'INFLUENCED', 'TRANSMITTED_VIA', 'SILENT_INFLUENCE', 'ORAL_TRADITION',
]);
const CHALLENGER_TYPES = new Set<ConnectionType>([
  'CHALLENGED', 'CONTESTED', 'RUPTURE',
]);
const DESCENDANT_TYPES = new Set<ConnectionType>([
  'INFLUENCED', 'RECLAMATION', 'RESPONDED_TO', 'CONVERGENT', 'PARALLEL',
]);

export interface GraphNodeItem {
  idea: Idea;
  connection: Connection;
}

export interface GraphNodes {
  ancestors: GraphNodeItem[];
  challengers: GraphNodeItem[];
  descendants: GraphNodeItem[];
}

export function getGraphNodes(state: GraphState): GraphNodes {
  if (!state.centerId) return { ancestors: [], challengers: [], descendants: [] };

  const { centerId, connections, ideas } = state;
  const ancestors: GraphNodeItem[] = [];
  const challengers: GraphNodeItem[] = [];
  const descendants: GraphNodeItem[] = [];

  for (const conn of connections) {
    if (conn.toId === centerId && ANCESTOR_TYPES.has(conn.type)) {
      const idea = ideas.get(conn.fromId);
      if (idea) ancestors.push({ idea, connection: conn });
    }
    if (conn.toId === centerId && CHALLENGER_TYPES.has(conn.type)) {
      const idea = ideas.get(conn.fromId);
      if (idea) challengers.push({ idea, connection: conn });
    }
    if (conn.fromId === centerId && DESCENDANT_TYPES.has(conn.type)) {
      const idea = ideas.get(conn.toId);
      if (idea) descendants.push({ idea, connection: conn });
    }
    // PARALLEL and CONVERGENT: show from either direction on the right
    if (conn.toId === centerId && (conn.type === 'PARALLEL' || conn.type === 'CONVERGENT')) {
      const idea = ideas.get(conn.fromId);
      if (idea && !descendants.find(d => d.idea.id === idea.id)) {
        descendants.push({ idea, connection: conn });
      }
    }
  }

  // Sort by confidence descending so best matches show first
  const byConf = (a: GraphNodeItem, b: GraphNodeItem) =>
    b.connection.confidence - a.connection.confidence;
  ancestors.sort(byConf);
  challengers.sort(byConf);
  descendants.sort(byConf);

  return { ancestors, challengers, descendants };
}

export { IDEAS };

interface GraphContextType {
  state: GraphState;
  dispatch: React.Dispatch<Action>;
}

const GraphContext = createContext<GraphContextType | null>(null);

export function GraphProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph() {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error('useGraph must be used within GraphProvider');
  return ctx;
}

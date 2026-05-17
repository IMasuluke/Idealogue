export type ConnectionType =
  | 'INFLUENCED'
  | 'CHALLENGED'
  | 'PARALLEL'
  | 'CONTESTED'
  | 'TRANSMITTED_VIA'
  | 'ORAL_TRADITION'
  | 'RUPTURE'
  | 'RECLAMATION'
  | 'RESPONDED_TO'
  | 'SILENT_INFLUENCE'
  | 'CONVERGENT';

export type OriginType = 'TEXT' | 'ORAL' | 'COLLECTIVE';

export type Tradition =
  | 'Western'
  | 'African'
  | 'East Asian'
  | 'South Asian'
  | 'Indigenous'
  | 'Global South'
  | 'Islamic'
  | 'Other';

export interface Idea {
  id: string;
  title: string;
  summary: string;
  tradition: Tradition;
  era: string;
  originType: OriginType;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  confidence: number;
  description?: string;
}

export type Screen = 'search' | 'graph' | 'thread';

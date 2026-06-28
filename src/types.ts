export interface GraphNode {
  id: string;
  type: 'domain' | 'subject' | 'insight' | 'deep_dive';
  title: string;
  subtitle?: string;
  content: string;
  parentId?: string;
  childrenIds?: string[];
  
  // Signal-to-Noise Metadata
  readingTimeMin: number;
  cognitiveLoad: number; // 1-10
  signalScore: number; // Percentage
  utilityValue: number; // 0-10
  humanVerifications: number;
  citations: string[];
  takeaways?: string[];
}

export interface SuspendedSession {
  id: string;
  nodeId: string;
  nodeTitle: string;
  suspendedAt: Date;
  scrollPercentage: number;
  readingDurationSec: number;
  userNotes: string;
}

export interface UserStats {
  cognitivePoints: number;
  proofsOfEffort: number;
  sessionsCompleted: number;
  activeStreak: number;
}

export type CircadianPhase = 'morning_focus' | 'afternoon_deep' | 'evening_reflection';

export interface CircadianConfig {
  phase: CircadianPhase;
  label: string;
  timeString: string;
  themeClass: string;
  bgHex: string;
  accentColor: string;
  description: string;
}

export interface PRDSectionData {
  id: string;
  title: string;
  content: string;
}

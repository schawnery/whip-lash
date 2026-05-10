export type GameState = 'setup' | 'count-in' | 'tap' | 'results';

export interface TapData {
  timestamp: number;
  expectedTimestamp: number;
  errorMs: number;
  isEarly: boolean;
  score: number;
  achievedBPM: number;
}

export interface GameResults {
  overallScore: number;
  accuracy: number;
  averageError: number;
  bestTap: TapData | null;
  worstTap: TapData | null;
  earlyCount: number;
  lateCount: number;
  taps: TapData[];
  averageBPM: number;
}

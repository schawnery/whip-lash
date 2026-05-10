import type { TapData, GameResults } from "./types";

export function calculateScoreForTap(errorMs: number): number {
  const absError = Math.abs(errorMs);
  if (absError <= 20) return 100;
  if (absError <= 50) return 80;
  if (absError <= 100) return 50;
  if (absError <= 150) return 20;
  return 0;
}

export function calculateResults(taps: TapData[]): GameResults {
  if (taps.length === 0) {
    return {
      overallScore: 0,
      accuracy: 0,
      averageError: 0,
      bestTap: null,
      worstTap: null,
      earlyCount: 0,
      lateCount: 0,
      taps: [],
      averageBPM: 0
    };
  }

  let totalScore = 0;
  let totalError = 0;
  let earlyCount = 0;
  let lateCount = 0;
  let bestTap = taps[0];
  let worstTap = taps[0];
  let totalBPM = 0;

  taps.forEach(tap => {
    totalScore += tap.score;
    totalError += Math.abs(tap.errorMs);
    totalBPM += tap.achievedBPM;
    if (tap.isEarly) earlyCount++;
    if (!tap.isEarly && tap.errorMs > 0) lateCount++;

    if (Math.abs(tap.errorMs) < Math.abs(bestTap.errorMs)) {
      bestTap = tap;
    }
    if (Math.abs(tap.errorMs) > Math.abs(worstTap.errorMs)) {
      worstTap = tap;
    }
  });

  const overallScore = totalScore / taps.length;
  const averageError = totalError / taps.length;
  const accuracy = overallScore;
  const averageBPM = totalBPM / taps.length;

  return {
    overallScore: Math.round(overallScore),
    accuracy: Math.round(accuracy),
    averageError: Math.round(averageError),
    bestTap,
    worstTap,
    earlyCount,
    lateCount,
    taps,
    averageBPM: Math.round(averageBPM * 10) / 10
  };
}

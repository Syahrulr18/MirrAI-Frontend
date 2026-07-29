export interface RawSessionMetrics {
  durationActualSeconds: number;
  eyeContactGoodSec: number;
  eyeContactBadSec: number;
  fillerWordCount: number;
  avgWpm: number;
  postureFlagsCount: number;
  scriptAccuracy?: number;
}

export interface CalculatedScores {
  totalScore: number;
  bodyLanguageScore: number;
  voiceFluencyScore: number;
  eyeContactPercentage: number;
  wpmScore: number;
  fillerScore: number;
  postureScore: number;
}

export function calculateScorecard(metrics: RawSessionMetrics): CalculatedScores {
  const totalSec = Math.max(metrics.durationActualSeconds, 1);
  const totalEyeSec = metrics.eyeContactGoodSec + metrics.eyeContactBadSec;

  // 1. Eye Contact percentage (0-100)
  const eyeContactPercentage = totalEyeSec > 0
    ? Math.min(100, Math.max(0, Math.round((metrics.eyeContactGoodSec / totalEyeSec) * 100)))
    : 100;

  // 2. Posture score (0-100) - starts at 100, -10 per posture violation flag per minute
  const posturePenaltyRate = (metrics.postureFlagsCount / totalSec) * 60;
  const postureScore = Math.max(0, Math.min(100, Math.round(100 - posturePenaltyRate * 12)));

  // Body Language Score = 60% Eye Contact + 40% Posture
  const bodyLanguageScore = Math.round(eyeContactPercentage * 0.6 + postureScore * 0.4);

  // 3. WPM Score (ideal: 100-160)
  let wpmScore = 100;
  if (metrics.avgWpm < 100) {
    wpmScore = Math.max(30, Math.round(100 - (100 - metrics.avgWpm) * 0.9));
  } else if (metrics.avgWpm > 160) {
    wpmScore = Math.max(30, Math.round(100 - (metrics.avgWpm - 160) * 0.8));
  }

  // 4. Filler score - starts at 100, -5 per filler per minute
  const fillersPerMin = (metrics.fillerWordCount / totalSec) * 60;
  const fillerScore = Math.max(0, Math.min(100, Math.round(100 - fillersPerMin * 8)));

  // Voice & Fluency Score = 50% WPM + 50% Filler score
  const voiceFluencyScore = Math.round(wpmScore * 0.5 + fillerScore * 0.5);

  // Overall Score (Incorporate script accuracy if present)
  let totalScore = 0;
  if (metrics.scriptAccuracy !== undefined && metrics.scriptAccuracy !== null) {
    // 35% Body Language + 35% Voice & Fluency + 30% Script Accuracy
    totalScore = Math.round(
      bodyLanguageScore * 0.35 + voiceFluencyScore * 0.35 + metrics.scriptAccuracy * 0.30
    );
  } else {
    // 50% Body Language + 50% Voice & Fluency
    totalScore = Math.round(bodyLanguageScore * 0.5 + voiceFluencyScore * 0.5);
  }

  return {
    totalScore,
    bodyLanguageScore,
    voiceFluencyScore,
    eyeContactPercentage,
    wpmScore,
    fillerScore,
    postureScore,
  };
}

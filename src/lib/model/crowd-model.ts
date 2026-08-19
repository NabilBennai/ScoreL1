import type { ScoreProbability } from "./score-grid"

export type CrowdScoreProbability = {
  home: number
  away: number
  probability: number
}

export function estimateCrowd(
  scores: ScoreProbability[],
  alpha = 1,
): CrowdScoreProbability[] {
  if (!Number.isFinite(alpha) || alpha <= 0) {
    throw new Error("alpha must be greater than 0")
  }

  const weighted = scores.map((score) => ({
    home: score.home,
    away: score.away,
    weight: Math.pow(score.probability, alpha),
  }))

  const totalWeight = weighted.reduce((sum, score) => sum + score.weight, 0)

  if (totalWeight <= 0) {
    throw new Error("Unable to build crowd distribution")
  }

  return weighted.map((score) => ({
    home: score.home,
    away: score.away,
    probability: score.weight / totalWeight,
  }))
}

export function getConditionalCrowdShare(
  crowd: CrowdScoreProbability[],
  home: number,
  away: number,
): number {
  const targetOutcome = home > away ? "HOME" : home < away ? "AWAY" : "DRAW"

  let denominator = 0
  let numerator = 0

  for (const score of crowd) {
    const outcome =
      score.home > score.away
        ? "HOME"
        : score.home < score.away
          ? "AWAY"
          : "DRAW"

    if (outcome !== targetOutcome) {
      continue
    }

    denominator += score.probability

    if (score.home === home && score.away === away) {
      numerator = score.probability
    }
  }

  if (denominator <= 0) {
    return 0
  }

  return numerator / denominator
}

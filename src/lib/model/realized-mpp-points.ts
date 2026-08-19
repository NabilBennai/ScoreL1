import {
  getRarityBonus,
  sameOutcome,
  type MppRules,
  type Score,
} from "./mpp-rules"

export type RealizedMppPoints = {
  points: number
  correctOutcome: boolean
  exactScore: boolean
  rarityBonus: number
}

export function calculateRealizedMppPoints(
  predicted: Score,
  actual: Score,
  predictedCrowdShare: number,
  rules: MppRules,
): RealizedMppPoints {
  if (
    !Number.isFinite(predictedCrowdShare) ||
    predictedCrowdShare < 0 ||
    predictedCrowdShare > 1
  ) {
    throw new Error("predictedCrowdShare must be between 0 and 1")
  }

  const correctOutcome = sameOutcome(predicted, actual)

  if (!correctOutcome) {
    return {
      points: 0,
      correctOutcome: false,
      exactScore: false,
      rarityBonus: 0,
    }
  }

  const exactScore =
    predicted.home === actual.home && predicted.away === actual.away

  if (!exactScore) {
    return {
      points: rules.correctOutcomePoints,
      correctOutcome: true,
      exactScore: false,
      rarityBonus: 0,
    }
  }

  const rarityBonus = getRarityBonus(predictedCrowdShare, rules)

  return {
    points: rules.correctOutcomePoints + rarityBonus,
    correctOutcome: true,
    exactScore: true,
    rarityBonus,
  }
}

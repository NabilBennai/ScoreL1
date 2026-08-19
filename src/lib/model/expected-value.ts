import type { ScoreProbability } from "./score-grid"
import type { CrowdScoreProbability } from "./crowd-model"
import { getConditionalCrowdShare } from "./crowd-model"
import {
  getRarityBonus,
  sameOutcome,
  type MppRules,
  type Score,
} from "./mpp-rules"

export type ScoreExpectedValue = {
  home: number
  away: number
  probability: number
  crowdShare: number
  conditionalCrowdShare: number
  rarityBonus: number
  expectedPoints: number
}

export function calculateExpectedValues(
  football: ScoreProbability[],
  crowd: CrowdScoreProbability[],
  rules: MppRules,
): ScoreExpectedValue[] {
  return football.map((prediction) => {
    const predictedScore: Score = {
      home: prediction.home,
      away: prediction.away,
    }

    const crowdEntry = crowd.find(
      (score) =>
        score.home === prediction.home && score.away === prediction.away,
    )

    const crowdShare = crowdEntry?.probability ?? 0

    const conditionalCrowdShare = getConditionalCrowdShare(
      crowd,
      prediction.home,
      prediction.away,
    )

    const rarityBonus = getRarityBonus(conditionalCrowdShare, rules)

    let expectedPoints = 0

    for (const actual of football) {
      const actualScore: Score = {
        home: actual.home,
        away: actual.away,
      }

      let points = 0

      if (sameOutcome(predictedScore, actualScore)) {
        points += rules.correctOutcomePoints
      }

      if (
        predictedScore.home === actualScore.home &&
        predictedScore.away === actualScore.away
      ) {
        points += rarityBonus
      }

      expectedPoints += actual.probability * points
    }

    return {
      home: prediction.home,
      away: prediction.away,
      probability: prediction.probability,
      crowdShare,
      conditionalCrowdShare,
      rarityBonus,
      expectedPoints,
    }
  })
}

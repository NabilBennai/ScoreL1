import type { HistoricalMarketRow } from "./historical-market"
import { calculateFootballModel } from "./football-model"
import { estimateCrowd } from "./crowd-model"
import { calculateExpectedValues } from "./expected-value"
import { DEV_MPP_CONFIG } from "./mpp-config"
import { chooseBalanced, chooseChallenger, chooseLeader } from "./strategies"
import type { HistoricalPrediction } from "./backtest"

export type HistoricalPredictionResult = {
  prediction: HistoricalPrediction

  model: {
    lambdaHome: number
    lambdaAway: number
    rho: number
    marketFitLoss: number
  }
}

function getCrowdShare(
  crowd: Array<{
    home: number
    away: number
    probability: number
  }>,
  score: {
    home: number
    away: number
  },
): number {
  const row = crowd.find(
    (candidate) =>
      candidate.home === score.home && candidate.away === score.away,
  )

  if (!row) {
    throw new Error(
      `Missing crowd probability for score ${score.home}-${score.away}`,
    )
  }

  return row.probability
}

export function calculateHistoricalPrediction(
  row: HistoricalMarketRow,
): HistoricalPredictionResult {
  const model = calculateFootballModel({
    oneXTwoOdds: row.odds.oneXTwo,
    over25Odds: row.odds.over25,
    bttsOdds: row.odds.btts,
  })

  const crowd = estimateCrowd(
    model.scoreProbabilities,
    DEV_MPP_CONFIG.crowdAlpha,
  )

  const expectedValues = calculateExpectedValues(
    model.scoreProbabilities,
    crowd,
    DEV_MPP_CONFIG.rules,
  )

  const leader = chooseLeader(expectedValues)

  const balanced = chooseBalanced(expectedValues)

  const challenger = chooseChallenger(expectedValues, balanced)

  return {
    prediction: {
      matchId: row.matchId,

      actualScore: {
        home: row.finalScore.home,
        away: row.finalScore.away,
      },

      leader: {
        home: leader.home,
        away: leader.away,
      },

      balanced: {
        home: balanced.home,
        away: balanced.away,
      },

      challenger: {
        home: challenger.home,
        away: challenger.away,
      },

      crowdShares: {
        leader: getCrowdShare(crowd, leader),

        balanced: getCrowdShare(crowd, balanced),

        challenger: getCrowdShare(crowd, challenger),
      },
    },

    model: {
      lambdaHome: model.lambdaHome,
      lambdaAway: model.lambdaAway,
      rho: model.rho,
      marketFitLoss: model.fitLoss,
    },
  }
}

export function calculateHistoricalPredictions(
  rows: HistoricalMarketRow[],
): HistoricalPredictionResult[] {
  return rows.map(calculateHistoricalPrediction)
}

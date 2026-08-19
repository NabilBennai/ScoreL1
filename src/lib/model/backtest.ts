import { DEV_MPP_CONFIG } from "./mpp-config"
import {
  evaluatePrediction,
  type FinalScore,
  type StrategyScore,
} from "./prediction-evaluation"
import { calculateRealizedMppPoints } from "./realized-mpp-points"

export type HistoricalPrediction = {
  matchId: string

  actualScore: FinalScore

  leader: StrategyScore
  balanced: StrategyScore
  challenger: StrategyScore

  crowdShares: {
    leader: number
    balanced: number
    challenger: number
  }
}

export type BacktestStrategySummary = {
  exactScores: number
  correctOutcomes: number
  totalPoints: number
}

export type BacktestSummary = {
  matches: number

  leader: BacktestStrategySummary
  balanced: BacktestStrategySummary
  challenger: BacktestStrategySummary
}

function createStrategySummary(): BacktestStrategySummary {
  return {
    exactScores: 0,
    correctOutcomes: 0,
    totalPoints: 0,
  }
}

export function runBacktest(matches: HistoricalPrediction[]): BacktestSummary {
  const summary: BacktestSummary = {
    matches: matches.length,
    leader: createStrategySummary(),
    balanced: createStrategySummary(),
    challenger: createStrategySummary(),
  }

  for (const match of matches) {
    const evaluation = evaluatePrediction(match.actualScore, {
      leader: match.leader,
      balanced: match.balanced,
      challenger: match.challenger,
    })

    const leaderPoints = calculateRealizedMppPoints(
      match.leader,
      match.actualScore,
      match.crowdShares.leader,
      DEV_MPP_CONFIG.rules,
    )

    const balancedPoints = calculateRealizedMppPoints(
      match.balanced,
      match.actualScore,
      match.crowdShares.balanced,
      DEV_MPP_CONFIG.rules,
    )

    const challengerPoints = calculateRealizedMppPoints(
      match.challenger,
      match.actualScore,
      match.crowdShares.challenger,
      DEV_MPP_CONFIG.rules,
    )

    if (evaluation.leader.exactScore) {
      summary.leader.exactScores += 1
    }

    if (evaluation.leader.correctOutcome) {
      summary.leader.correctOutcomes += 1
    }

    summary.leader.totalPoints += leaderPoints.points

    if (evaluation.balanced.exactScore) {
      summary.balanced.exactScores += 1
    }

    if (evaluation.balanced.correctOutcome) {
      summary.balanced.correctOutcomes += 1
    }

    summary.balanced.totalPoints += balancedPoints.points

    if (evaluation.challenger.exactScore) {
      summary.challenger.exactScores += 1
    }

    if (evaluation.challenger.correctOutcome) {
      summary.challenger.correctOutcomes += 1
    }

    summary.challenger.totalPoints += challengerPoints.points
  }

  return summary
}

import { supabaseServer } from "@/lib/data/supabase/server"
import { DEV_MPP_CONFIG } from "@/lib/model/mpp-config"
import {
  evaluatePrediction,
  parseScore,
} from "@/lib/model/prediction-evaluation"
import { calculateRealizedMppPoints } from "@/lib/model/realized-mpp-points"

type CrowdProbability = {
  home: number
  away: number
  probability: number
}

type FinishedMatchRow = {
  id: string
  home_goals: number | null
  away_goals: number | null

  predictions: Array<{
    id: string
    calculated_at: string
    leader_score: string | null
    balanced_score: string | null
    challenger_score: string | null
    crowd_probabilities: unknown
  }> | null
}

export type StrategyEvaluationSummary = {
  exactScores: number
  correctOutcomes: number
  totalPoints: number
}

export type EvaluationSummary = {
  matchesEvaluated: number

  leader: StrategyEvaluationSummary
  balanced: StrategyEvaluationSummary
  challenger: StrategyEvaluationSummary
}

function createStrategySummary(): StrategyEvaluationSummary {
  return {
    exactScores: 0,
    correctOutcomes: 0,
    totalPoints: 0,
  }
}

function isCrowdProbability(value: unknown): value is CrowdProbability {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const row = value as Record<string, unknown>

  return (
    Number.isInteger(row.home) &&
    Number.isInteger(row.away) &&
    typeof row.probability === "number" &&
    Number.isFinite(row.probability) &&
    row.probability >= 0 &&
    row.probability <= 1
  )
}

function parseCrowdProbabilities(value: unknown): CrowdProbability[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isCrowdProbability)
}

function getCrowdShare(
  probabilities: CrowdProbability[],
  score: {
    home: number
    away: number
  },
): number | null {
  const row = probabilities.find(
    (probability) =>
      probability.home === score.home && probability.away === score.away,
  )

  return row?.probability ?? null
}

export async function getPredictionEvaluationSummary(): Promise<EvaluationSummary> {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      id,
      home_goals,
      away_goals,
      predictions (
        id,
        calculated_at,
        leader_score,
        balanced_score,
        challenger_score,
        crowd_probabilities
      )
    `,
    )
    .eq("status", "FINISHED")
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)

  if (error) {
    throw new Error(`Unable to load finished matches: ${error.message}`)
  }

  const summary: EvaluationSummary = {
    matchesEvaluated: 0,
    leader: createStrategySummary(),
    balanced: createStrategySummary(),
    challenger: createStrategySummary(),
  }

  for (const match of (data ?? []) as FinishedMatchRow[]) {
    if (match.home_goals === null || match.away_goals === null) {
      continue
    }

    const predictions = match.predictions ?? []

    if (predictions.length === 0) {
      continue
    }

    const latestPrediction = [...predictions].sort(
      (a, b) =>
        new Date(b.calculated_at).getTime() -
        new Date(a.calculated_at).getTime(),
    )[0]

    if (
      !latestPrediction.leader_score ||
      !latestPrediction.balanced_score ||
      !latestPrediction.challenger_score
    ) {
      continue
    }

    const leader = parseScore(latestPrediction.leader_score)

    const balanced = parseScore(latestPrediction.balanced_score)

    const challenger = parseScore(latestPrediction.challenger_score)

    const actual = {
      home: match.home_goals,
      away: match.away_goals,
    }

    const evaluation = evaluatePrediction(actual, {
      leader,
      balanced,
      challenger,
    })

    const crowdProbabilities = parseCrowdProbabilities(
      latestPrediction.crowd_probabilities,
    )

    const leaderCrowdShare = getCrowdShare(crowdProbabilities, leader)

    const balancedCrowdShare = getCrowdShare(crowdProbabilities, balanced)

    const challengerCrowdShare = getCrowdShare(crowdProbabilities, challenger)

    if (
      leaderCrowdShare === null ||
      balancedCrowdShare === null ||
      challengerCrowdShare === null
    ) {
      continue
    }

    const leaderPoints = calculateRealizedMppPoints(
      leader,
      actual,
      leaderCrowdShare,
      DEV_MPP_CONFIG.rules,
    )

    const balancedPoints = calculateRealizedMppPoints(
      balanced,
      actual,
      balancedCrowdShare,
      DEV_MPP_CONFIG.rules,
    )

    const challengerPoints = calculateRealizedMppPoints(
      challenger,
      actual,
      challengerCrowdShare,
      DEV_MPP_CONFIG.rules,
    )

    summary.matchesEvaluated += 1

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

import { supabaseServer } from "@/lib/data/supabase/server"
import {
  evaluatePrediction,
  parseScore,
} from "@/lib/model/prediction-evaluation"

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
  }> | null
}

export type EvaluationSummary = {
  matchesEvaluated: number

  leader: {
    exactScores: number
    correctOutcomes: number
  }

  balanced: {
    exactScores: number
    correctOutcomes: number
  }

  challenger: {
    exactScores: number
    correctOutcomes: number
  }
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
        challenger_score
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

    leader: {
      exactScores: 0,
      correctOutcomes: 0,
    },

    balanced: {
      exactScores: 0,
      correctOutcomes: 0,
    },

    challenger: {
      exactScores: 0,
      correctOutcomes: 0,
    },
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

    const evaluation = evaluatePrediction(
      {
        home: match.home_goals,
        away: match.away_goals,
      },
      {
        leader: parseScore(latestPrediction.leader_score),
        balanced: parseScore(latestPrediction.balanced_score),
        challenger: parseScore(latestPrediction.challenger_score),
      },
    )

    summary.matchesEvaluated += 1

    if (evaluation.leader.exactScore) {
      summary.leader.exactScores += 1
    }

    if (evaluation.leader.correctOutcome) {
      summary.leader.correctOutcomes += 1
    }

    if (evaluation.balanced.exactScore) {
      summary.balanced.exactScores += 1
    }

    if (evaluation.balanced.correctOutcome) {
      summary.balanced.correctOutcomes += 1
    }

    if (evaluation.challenger.exactScore) {
      summary.challenger.exactScores += 1
    }

    if (evaluation.challenger.correctOutcome) {
      summary.challenger.correctOutcomes += 1
    }
  }

  return summary
}

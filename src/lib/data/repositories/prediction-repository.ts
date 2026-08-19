import { createHash } from "node:crypto"
import { supabaseServer } from "@/lib/data/supabase/server"
import type { CalculatePredictionInput } from "@/lib/validation/calculate-prediction"
import type { FootballModelResult } from "@/lib/model/football-model"
import type { CrowdScoreProbability } from "@/lib/model/crowd-model"
import type { ScoreExpectedValue } from "@/lib/model/expected-value"

export const MODEL_VERSION = "mpp-l1-0.1.0"

type MppPredictionData = {
  crowd: CrowdScoreProbability[]
  expectedValues: ScoreExpectedValue[]
  leaderScore: string
  balancedScore: string
  challengerScore: string
}

type SnapshotOptions = {
  reuseByContent?: boolean
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

export async function getOrCreateOddsSnapshot(
  input: CalculatePredictionInput,
  options: SnapshotOptions = {},
): Promise<string> {
  const contentHash = hashPayload(input.odds)

  let lookup = supabaseServer
    .from("odds_snapshots")
    .select("id")
    .eq("match_id", input.matchId)
    .eq("provider", input.provider)
    .eq("bookmaker", input.bookmaker ?? null)
    .eq("content_hash", contentHash)

  if (!options.reuseByContent) {
    lookup = lookup.eq("captured_at", input.capturedAt)
  }

  const { data: existingSnapshot, error: existingSnapshotError } = await lookup
    .order("captured_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (existingSnapshotError) {
    throw new Error(
      `Unable to look up odds snapshot: ${existingSnapshotError.message}`,
    )
  }

  if (existingSnapshot) {
    return existingSnapshot.id
  }

  const { data: snapshot, error: snapshotError } = await supabaseServer
    .from("odds_snapshots")
    .insert({
      match_id: input.matchId,
      provider: input.provider,
      bookmaker: input.bookmaker ?? null,
      captured_at: input.capturedAt,
      market_payload: input.odds,
      content_hash: contentHash,
    })
    .select("id")
    .single()

  if (snapshotError || !snapshot) {
    throw new Error(
      `Unable to persist odds snapshot: ${snapshotError?.message ?? "unknown error"}`,
    )
  }

  return snapshot.id
}

export async function getOrCreateModelVersion(
  result?: FootballModelResult,
): Promise<string> {
  const config = result
    ? {
        rho: result.rho,
        gridMaxGoals: 12,
        devig: "POWER",
      }
    : {
        rho: 0,
        gridMaxGoals: 12,
        devig: "POWER",
      }

  const { data, error } = await supabaseServer
    .from("model_versions")
    .upsert(
      {
        version: MODEL_VERSION,
        config,
      },
      {
        onConflict: "version",
      },
    )
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(
      `Unable to persist model version: ${error?.message ?? "unknown error"}`,
    )
  }

  return data.id
}

export async function getExistingPrediction(
  matchId: string,
  oddsSnapshotId: string,
  modelVersionId: string,
) {
  const { data, error } = await supabaseServer
    .from("predictions")
    .select(
      `
      id,
      leader_score,
      balanced_score,
      challenger_score
    `,
    )
    .eq("match_id", matchId)
    .eq("odds_snapshot_id", oddsSnapshotId)
    .eq("model_version_id", modelVersionId)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to look up existing prediction: ${error.message}`)
  }

  return data
}

export async function persistPrediction(
  input: CalculatePredictionInput,
  result: FootballModelResult,
  mpp: MppPredictionData,
  prepared?: {
    oddsSnapshotId?: string
    modelVersionId?: string
  },
) {
  const oddsSnapshotId =
    prepared?.oddsSnapshotId ?? (await getOrCreateOddsSnapshot(input))

  const modelVersionId =
    prepared?.modelVersionId ?? (await getOrCreateModelVersion(result))

  const existingPrediction = await getExistingPrediction(
    input.matchId,
    oddsSnapshotId,
    modelVersionId,
  )

  if (existingPrediction) {
    return {
      predictionId: existingPrediction.id,
      oddsSnapshotId,
      modelVersionId,
      predictionCreated: false,
    }
  }

  const now = new Date().toISOString()

  const { data: prediction, error: predictionError } = await supabaseServer
    .from("predictions")
    .insert({
      match_id: input.matchId,
      odds_snapshot_id: oddsSnapshotId,
      model_version_id: modelVersionId,
      calculated_at: now,
      cutoff_at: input.capturedAt,
      lambda_home: result.lambdaHome,
      lambda_away: result.lambdaAway,
      rho: result.rho,
      market_fit_loss: result.fitLoss,
      score_probabilities: result.scoreProbabilities,
      crowd_probabilities: mpp.crowd,
      expected_points: mpp.expectedValues,
      leader_score: mpp.leaderScore,
      balanced_score: mpp.balancedScore,
      challenger_score: mpp.challengerScore,
    })
    .select("id")
    .single()

  if (predictionError || !prediction) {
    if (predictionError?.code === "23505") {
      const concurrentPrediction = await getExistingPrediction(
        input.matchId,
        oddsSnapshotId,
        modelVersionId,
      )

      if (concurrentPrediction) {
        return {
          predictionId: concurrentPrediction.id,
          oddsSnapshotId,
          modelVersionId,
          predictionCreated: false,
        }
      }
    }

    throw new Error(
      `Unable to persist prediction: ${predictionError?.message ?? "unknown error"}`,
    )
  }

  return {
    predictionId: prediction.id,
    oddsSnapshotId,
    modelVersionId,
    predictionCreated: true,
  }
}

import { createHash } from "node:crypto"
import { supabaseServer } from "@/lib/data/supabase/server"
import type { CalculatePredictionInput } from "@/lib/validation/calculate-prediction"
import type { FootballModelResult } from "@/lib/model/football-model"
import type { CrowdScoreProbability } from "@/lib/model/crowd-model"
import type { ScoreExpectedValue } from "@/lib/model/expected-value"

const MODEL_VERSION = "mpp-l1-0.1.0"

type MppPredictionData = {
  crowd: CrowdScoreProbability[]
  expectedValues: ScoreExpectedValue[]
  leaderScore: string
  balancedScore: string
  challengerScore: string
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

async function getOrCreateOddsSnapshot(
  input: CalculatePredictionInput,
): Promise<string> {
  const contentHash = hashPayload(input.odds)

  const { data: existingSnapshot, error: existingSnapshotError } =
    await supabaseServer
      .from("odds_snapshots")
      .select("id")
      .eq("match_id", input.matchId)
      .eq("provider", input.provider)
      .eq("captured_at", input.capturedAt)
      .eq("content_hash", contentHash)
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

export async function persistPrediction(
  input: CalculatePredictionInput,
  result: FootballModelResult,
  mpp: MppPredictionData,
) {
  const oddsSnapshotId = await getOrCreateOddsSnapshot(input)

  const { data: modelVersion, error: modelVersionError } = await supabaseServer
    .from("model_versions")
    .upsert(
      {
        version: MODEL_VERSION,
        config: {
          rho: result.rho,
          gridMaxGoals: 12,
          devig: "POWER",
        },
      },
      {
        onConflict: "version",
      },
    )
    .select("id")
    .single()

  if (modelVersionError || !modelVersion) {
    throw new Error(
      `Unable to persist model version: ${modelVersionError?.message ?? "unknown error"}`,
    )
  }

  const now = new Date().toISOString()

  const { data: prediction, error: predictionError } = await supabaseServer
    .from("predictions")
    .insert({
      match_id: input.matchId,
      odds_snapshot_id: oddsSnapshotId,
      model_version_id: modelVersion.id,
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
    throw new Error(
      `Unable to persist prediction: ${predictionError?.message ?? "unknown error"}`,
    )
  }

  return {
    predictionId: prediction.id,
    oddsSnapshotId,
    modelVersionId: modelVersion.id,
  }
}

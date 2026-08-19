import { createHash } from "node:crypto"
import { supabaseServer } from "@/lib/data/supabase/server"
import type { CalculatePredictionInput } from "@/lib/validation/calculate-prediction"
import type { FootballModelResult } from "@/lib/model/football-model"

const MODEL_VERSION = "mpp-l1-0.1.0"

function hashPayload(payload: unknown): string {
    return createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex")
}

export async function persistPrediction(
    input: CalculatePredictionInput,
    result: FootballModelResult,
) {
    const contentHash = hashPayload(input.odds)

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

    const { data: modelVersion, error: modelVersionError } =
        await supabaseServer
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
            odds_snapshot_id: snapshot.id,
            model_version_id: modelVersion.id,
            calculated_at: now,
            cutoff_at: input.capturedAt,
            lambda_home: result.lambdaHome,
            lambda_away: result.lambdaAway,
            rho: result.rho,
            market_fit_loss: result.fitLoss,
            score_probabilities: result.scoreProbabilities,
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
        oddsSnapshotId: snapshot.id,
        modelVersionId: modelVersion.id,
    }
}
import { supabaseServer } from "@/lib/data/supabase/server"

export async function getLatestPredictionForMatch(matchId: string) {
  const { data, error } = await supabaseServer
    .from("predictions")
    .select(
      `
      id,
      calculated_at,
      cutoff_at,
      lambda_home,
      lambda_away,
      rho,
      market_fit_loss,
      score_probabilities,
      crowd_probabilities,
      expected_points,
      leader_score,
      balanced_score,
      challenger_score,
      matches (
        id,
        kickoff_at,
        round,
        home_team:teams!matches_home_team_id_fkey (
          id,
          name,
          short_name
        ),
        away_team:teams!matches_away_team_id_fkey (
          id,
          name,
          short_name
        )
      )
    `,
    )
    .eq("match_id", matchId)
    .order("calculated_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load prediction: ${error.message}`)
  }

  return data
}

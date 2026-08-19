import { supabaseServer } from "@/lib/data/supabase/server"

export async function getRoundMatches(round: number) {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      id,
      round,
      kickoff_at,
      status,
      home_goals,
      away_goals,

      home_team:teams!matches_home_team_id_fkey (
        id,
        name,
        short_name
      ),

      away_team:teams!matches_away_team_id_fkey (
        id,
        name,
        short_name
      ),

      predictions (
        id,
        calculated_at,
        cutoff_at,
        leader_score,
        balanced_score,
        challenger_score
      ),

      odds_snapshots (
        bookmaker,
        captured_at,
        provider
      )
    `,
    )
    .eq("round", round)
    .order("kickoff_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(`Unable to load round matches: ${error.message}`)
  }

  return data
}

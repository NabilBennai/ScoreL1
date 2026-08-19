import { supabaseServer } from "@/lib/data/supabase/server"
import { LIGUE1_2026_2027_FIXTURES } from "@/lib/data/fixtures/ligue1-2026-2027"

type TeamRelation = {
  slug: string
}

type MatchRow = {
  id: string
  round: number | null
  external_id: string | null
  home_team: TeamRelation | TeamRelation[] | null
  away_team: TeamRelation | TeamRelation[] | null
}

export type AssignMatchRoundsResult = {
  matchesFound: number
  matched: number
  updated: number
  unchanged: number
  unmatched: Array<{
    matchId: string
    homeSlug: string | null
    awaySlug: string | null
  }>
}

function getSingleTeam(
  value: TeamRelation | TeamRelation[] | null,
): TeamRelation | null {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? (value[0] ?? null) : value
}

function fixtureKey(homeSlug: string, awaySlug: string): string {
  return `${homeSlug}|${awaySlug}`
}

export async function assignMatchRounds(): Promise<AssignMatchRoundsResult> {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      id,
      round,
      external_id,
      home_team:teams!matches_home_team_id_fkey (
        slug
      ),
      away_team:teams!matches_away_team_id_fkey (
        slug
      )
    `,
    )
    .not("external_id", "is", null)

  if (error) {
    throw new Error(
      `Unable to load matches for round assignment: ${error.message}`,
    )
  }

  const matches = (data ?? []) as MatchRow[]

  const fixtureIndex = new Map(
    LIGUE1_2026_2027_FIXTURES.map((fixture) => [
      fixtureKey(fixture.homeSlug, fixture.awaySlug),
      fixture.round,
    ]),
  )

  const updates: Array<{
    id: string
    round: number
  }> = []

  const unmatched: AssignMatchRoundsResult["unmatched"] = []

  let matched = 0
  let unchanged = 0

  for (const match of matches) {
    const homeTeam = getSingleTeam(match.home_team)
    const awayTeam = getSingleTeam(match.away_team)

    const homeSlug = homeTeam?.slug ?? null
    const awaySlug = awayTeam?.slug ?? null

    if (!homeSlug || !awaySlug) {
      unmatched.push({
        matchId: match.id,
        homeSlug,
        awaySlug,
      })

      continue
    }

    const round = fixtureIndex.get(fixtureKey(homeSlug, awaySlug))

    if (round === undefined) {
      unmatched.push({
        matchId: match.id,
        homeSlug,
        awaySlug,
      })

      continue
    }

    matched += 1

    if (match.round === round) {
      unchanged += 1
      continue
    }

    updates.push({
      id: match.id,
      round,
    })
  }

  if (updates.length > 0) {
    for (const update of updates) {
      const { error: updateError } = await supabaseServer
        .from("matches")
        .update({
          round: update.round,
        })
        .eq("id", update.id)

      if (updateError) {
        throw new Error(
          `Unable to assign round to match ${update.id}: ${updateError.message}`,
        )
      }
    }
  }

  return {
    matchesFound: matches.length,
    matched,
    updated: updates.length,
    unchanged,
    unmatched,
  }
}

import { createHash } from "node:crypto"
import { supabaseServer } from "@/lib/data/supabase/server"
import type { ProviderOdds } from "@/lib/data/providers/odds-provider"
import { getTeamSlugForProviderName } from "@/lib/data/providers/team-name"

type DatabaseTeam = {
  id: string
  slug: string
  name: string
}

type SyncFixtureResult = {
  matchId: string
  createdOrUpdated: boolean
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

export async function getSeasonId(code: string): Promise<string> {
  const { data, error } = await supabaseServer
    .from("seasons")
    .select("id")
    .eq("code", code)
    .single()

  if (error || !data) {
    throw new Error(
      `Unable to find season ${code}: ${error?.message ?? "not found"}`,
    )
  }

  return data.id
}

export async function loadTeamIndex(): Promise<Map<string, DatabaseTeam>> {
  const { data, error } = await supabaseServer
    .from("teams")
    .select("id, slug, name")
    .eq("active", true)

  if (error) {
    throw new Error(`Unable to load teams: ${error.message}`)
  }

  const index = new Map<string, DatabaseTeam>()

  for (const team of data ?? []) {
    index.set(team.slug, team)
  }

  return index
}

export function resolveProviderTeam(
  providerName: string,
  teams: Map<string, DatabaseTeam>,
): DatabaseTeam | null {
  const slug = getTeamSlugForProviderName(providerName)

  if (!slug) {
    return null
  }

  return teams.get(slug) ?? null
}

export async function upsertProviderFixture(params: {
  seasonId: string
  externalId: string
  commenceTime: string
  homeTeamId: string
  awayTeamId: string
}): Promise<SyncFixtureResult> {
  const { data, error } = await supabaseServer
    .from("matches")
    .upsert(
      {
        season_id: params.seasonId,
        external_id: params.externalId,
        round: null,
        kickoff_at: params.commenceTime,
        home_team_id: params.homeTeamId,
        away_team_id: params.awayTeamId,
        status: "SCHEDULED",
      },
      {
        onConflict: "external_id",
      },
    )
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(
      `Unable to upsert fixture ${params.externalId}: ${error?.message ?? "unknown error"}`,
    )
  }

  return {
    matchId: data.id,
    createdOrUpdated: true,
  }
}

export async function persistProviderOddsSnapshot(
  matchId: string,
  odds: ProviderOdds,
): Promise<{
  id: string
  created: boolean
}> {
  const marketPayload = {
    oneXTwo: odds.oneXTwo ?? null,
    over25: odds.over25 ?? null,
  }

  const contentHash = hashPayload(marketPayload)

  const { data: existing, error: lookupError } = await supabaseServer
    .from("odds_snapshots")
    .select("id")
    .eq("match_id", matchId)
    .eq("provider", "the-odds-api")
    .eq("bookmaker", odds.bookmaker)
    .eq("captured_at", odds.capturedAt)
    .eq("content_hash", contentHash)
    .maybeSingle()

  if (lookupError) {
    throw new Error(`Unable to check odds snapshot: ${lookupError.message}`)
  }

  if (existing) {
    return {
      id: existing.id,
      created: false,
    }
  }

  const { data, error } = await supabaseServer
    .from("odds_snapshots")
    .insert({
      match_id: matchId,
      provider: "the-odds-api",
      bookmaker: odds.bookmaker,
      captured_at: odds.capturedAt,
      market_payload: marketPayload,
      content_hash: contentHash,
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(
      `Unable to persist odds snapshot: ${error?.message ?? "unknown error"}`,
    )
  }

  return {
    id: data.id,
    created: true,
  }
}

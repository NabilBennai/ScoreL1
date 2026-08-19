import { createHash } from "node:crypto"
import { supabaseServer } from "@/lib/data/supabase/server"
import type { ProviderOdds } from "@/lib/data/providers/odds-provider"
import { getTeamSlugForProviderName } from "@/lib/data/providers/team-name"

type DatabaseTeam = {
  id: string
  slug: string
  name: string
}

export type ResolvedProviderFixture = {
  externalId: string
  commenceTime: string
  homeTeamId: string
  awayTeamId: string
}

export type SyncedFixture = {
  id: string
  externalId: string
}

export type SnapshotCandidate = {
  matchId: string
  odds: ProviderOdds
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

function normalizeTimestamp(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`)
  }

  return date.toISOString()
}

function snapshotKey(params: {
  matchId: string
  bookmaker: string
  capturedAt: string
  contentHash: string
}): string {
  return [
    params.matchId,
    "the-odds-api",
    params.bookmaker,
    normalizeTimestamp(params.capturedAt),
    params.contentHash,
  ].join("|")
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

export async function upsertProviderFixtures(
  seasonId: string,
  fixtures: ResolvedProviderFixture[],
): Promise<SyncedFixture[]> {
  if (fixtures.length === 0) {
    return []
  }

  const rows = fixtures.map((fixture) => ({
    season_id: seasonId,
    external_id: fixture.externalId,
    round: null,
    kickoff_at: fixture.commenceTime,
    home_team_id: fixture.homeTeamId,
    away_team_id: fixture.awayTeamId,
    status: "SCHEDULED",
  }))

  const { error } = await supabaseServer.from("matches").upsert(rows, {
    onConflict: "external_id",
  })

  if (error) {
    throw new Error(`Unable to upsert fixtures: ${error.message}`)
  }

  const externalIds = fixtures.map((fixture) => fixture.externalId)

  const { data, error: lookupError } = await supabaseServer
    .from("matches")
    .select("id, external_id")
    .in("external_id", externalIds)

  if (lookupError) {
    throw new Error(`Unable to load synced fixtures: ${lookupError.message}`)
  }

  return (data ?? [])
    .filter(
      (
        match,
      ): match is {
        id: string
        external_id: string
      } => match.external_id !== null,
    )
    .map((match) => ({
      id: match.id,
      externalId: match.external_id,
    }))
}

export async function persistProviderOddsSnapshots(
  candidates: SnapshotCandidate[],
): Promise<{
  created: number
  reused: number
}> {
  if (candidates.length === 0) {
    return {
      created: 0,
      reused: 0,
    }
  }

  const prepared = candidates.map(({ matchId, odds }) => {
    const marketPayload = {
      oneXTwo: odds.oneXTwo ?? null,
      over25: odds.over25 ?? null,
    }

    const contentHash = hashPayload(marketPayload)

    const capturedAt = normalizeTimestamp(odds.capturedAt)

    return {
      key: snapshotKey({
        matchId,
        bookmaker: odds.bookmaker,
        capturedAt,
        contentHash,
      }),
      row: {
        match_id: matchId,
        provider: "the-odds-api",
        bookmaker: odds.bookmaker,
        captured_at: capturedAt,
        market_payload: marketPayload,
        content_hash: contentHash,
      },
    }
  })

  const uniquePrepared = new Map<string, (typeof prepared)[number]>()

  for (const item of prepared) {
    uniquePrepared.set(item.key, item)
  }

  const uniqueCandidates = [...uniquePrepared.values()]

  const matchIds = [
    ...new Set(uniqueCandidates.map((candidate) => candidate.row.match_id)),
  ]

  const { data: existing, error: existingError } = await supabaseServer
    .from("odds_snapshots")
    .select(
      `
          match_id,
          bookmaker,
          captured_at,
          content_hash
        `,
    )
    .eq("provider", "the-odds-api")
    .in("match_id", matchIds)

  if (existingError) {
    throw new Error(
      `Unable to load existing odds snapshots: ${existingError.message}`,
    )
  }

  const existingKeys = new Set(
    (existing ?? []).map((snapshot) =>
      snapshotKey({
        matchId: snapshot.match_id,
        bookmaker: snapshot.bookmaker ?? "",
        capturedAt: snapshot.captured_at,
        contentHash: snapshot.content_hash,
      }),
    ),
  )

  const rowsToInsert = uniqueCandidates.filter(
    (candidate) => !existingKeys.has(candidate.key),
  )

  if (rowsToInsert.length === 0) {
    return {
      created: 0,
      reused: uniqueCandidates.length,
    }
  }

  const { error: insertError } = await supabaseServer
    .from("odds_snapshots")
    .upsert(
      rowsToInsert.map((candidate) => candidate.row),
      {
        onConflict: "match_id,provider,bookmaker,captured_at,content_hash",
        ignoreDuplicates: true,
      },
    )

  if (insertError) {
    throw new Error(`Unable to persist odds snapshots: ${insertError.message}`)
  }

  return {
    created: rowsToInsert.length,
    reused: uniqueCandidates.length - rowsToInsert.length,
  }
}

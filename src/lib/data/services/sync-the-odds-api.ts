import { TheOddsApiProvider } from "@/lib/data/providers/the-odds-api"
import {
  getSeasonId,
  loadTeamIndex,
  persistProviderOddsSnapshots,
  resolveProviderTeam,
  upsertProviderFixtures,
  type ResolvedProviderFixture,
  type SnapshotCandidate,
} from "@/lib/data/repositories/provider-sync-repository"

const SEASON_CODE = "2026-2027"

export type OddsSyncResult = {
  providerRows: number
  eventsSeen: number
  fixturesSynced: number
  snapshotsCreated: number
  snapshotsReused: number
  skippedRows: number
  unmappedTeams: string[]
}

export async function syncTheOddsApi(): Promise<OddsSyncResult> {
  const provider = new TheOddsApiProvider()

  const oddsRows = await provider.getOdds()

  const seasonId = await getSeasonId(SEASON_CODE)
  const teams = await loadTeamIndex()

  const unmappedTeams = new Set<string>()

  const fixtureMap = new Map<string, ResolvedProviderFixture>()

  let skippedRows = 0

  for (const odds of oddsRows) {
    const homeTeam = resolveProviderTeam(odds.homeTeam, teams)

    const awayTeam = resolveProviderTeam(odds.awayTeam, teams)

    if (!homeTeam) {
      unmappedTeams.add(odds.homeTeam)
    }

    if (!awayTeam) {
      unmappedTeams.add(odds.awayTeam)
    }

    if (!homeTeam || !awayTeam) {
      skippedRows += 1
      continue
    }

    if (!fixtureMap.has(odds.externalId)) {
      fixtureMap.set(odds.externalId, {
        externalId: odds.externalId,
        commenceTime: odds.commenceTime,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      })
    }
  }

  const fixtures = await upsertProviderFixtures(seasonId, [
    ...fixtureMap.values(),
  ])

  const matchIdByExternalId = new Map(
    fixtures.map((fixture) => [fixture.externalId, fixture.id]),
  )

  const snapshotCandidates: SnapshotCandidate[] = []

  for (const odds of oddsRows) {
    const matchId = matchIdByExternalId.get(odds.externalId)

    if (!matchId) {
      continue
    }

    snapshotCandidates.push({
      matchId,
      odds,
    })
  }

  const snapshots = await persistProviderOddsSnapshots(snapshotCandidates)

  return {
    providerRows: oddsRows.length,
    eventsSeen: new Set(oddsRows.map((odds) => odds.externalId)).size,
    fixturesSynced: fixtures.length,
    snapshotsCreated: snapshots.created,
    snapshotsReused: snapshots.reused,
    skippedRows,
    unmappedTeams: [...unmappedTeams].sort(),
  }
}

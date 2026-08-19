import { TheOddsApiProvider } from "@/lib/data/providers/the-odds-api"
import {
  getSeasonId,
  loadTeamIndex,
  persistProviderOddsSnapshot,
  resolveProviderTeam,
  upsertProviderFixture,
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

  const eventIds = new Set<string>()
  const syncedFixtureIds = new Set<string>()
  const unmappedTeams = new Set<string>()

  let snapshotsCreated = 0
  let snapshotsReused = 0
  let skippedRows = 0

  for (const odds of oddsRows) {
    eventIds.add(odds.externalId)

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

    const fixture = await upsertProviderFixture({
      seasonId,
      externalId: odds.externalId,
      commenceTime: odds.commenceTime,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
    })

    syncedFixtureIds.add(fixture.matchId)

    const snapshot = await persistProviderOddsSnapshot(fixture.matchId, odds)

    if (snapshot.created) {
      snapshotsCreated += 1
    } else {
      snapshotsReused += 1
    }
  }

  return {
    providerRows: oddsRows.length,
    eventsSeen: eventIds.size,
    fixturesSynced: syncedFixtureIds.size,
    snapshotsCreated,
    snapshotsReused,
    skippedRows,
    unmappedTeams: [...unmappedTeams].sort(),
  }
}

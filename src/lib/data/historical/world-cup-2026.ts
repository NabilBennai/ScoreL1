import type { HistoricalMarketRow } from "../../model/historical-market"

type CsvRow = Record<string, string>

export type WorldCup2026ImportInput = {
  scheduleCsv: string
  resultsCsv: string
  oddsCsv: string
  scheduleKnockoutCsv: string
  resultsKnockoutCsv: string
  oddsKnockoutCsv: string
}

export type WorldCup2026ImportResult = {
  rows: HistoricalMarketRow[]

  rejected: Array<{
    matchId: string
    reason: string
  }>
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []

  let current = ""
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        quoted = !quoted
      }

      continue
    }

    if (character === "," && !quoted) {
      values.push(current)
      current = ""
      continue
    }

    current += character
  }

  values.push(current)

  return values
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return []
  }

  const headers = parseCsvLine(lines[0])

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)

    const row: CsvRow = {}

    headers.forEach((header, index) => {
      row[header] = values[index] ?? ""
    })

    return row
  })
}

function parseOdd(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 1) {
    return null
  }

  return parsed
}

function parseGoals(value: string | undefined): number | null {
  if (value === undefined || value === "") {
    return null
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function rowsByMatchId(rows: CsvRow[]): Map<string, CsvRow> {
  return new Map(
    rows.filter((row) => row.match_id).map((row) => [row.match_id, row]),
  )
}

function sameTeams(first: CsvRow, second: CsvRow): boolean {
  return first.team_a === second.team_a && first.team_b === second.team_b
}

export function importWorldCup2026(
  input: WorldCup2026ImportInput,
): WorldCup2026ImportResult {
  const schedules = [
    ...parseCsv(input.scheduleCsv),
    ...parseCsv(input.scheduleKnockoutCsv),
  ]

  const results = rowsByMatchId([
    ...parseCsv(input.resultsCsv),
    ...parseCsv(input.resultsKnockoutCsv),
  ])

  const odds = rowsByMatchId([
    ...parseCsv(input.oddsCsv),
    ...parseCsv(input.oddsKnockoutCsv),
  ])

  const rows: HistoricalMarketRow[] = []
  const rejected: WorldCup2026ImportResult["rejected"] = []

  for (const schedule of schedules) {
    const matchId = schedule.match_id

    if (!matchId) {
      continue
    }

    const result = results.get(matchId)
    const market = odds.get(matchId)

    if (!result) {
      rejected.push({
        matchId,
        reason: "Missing result",
      })

      continue
    }

    if (!market) {
      rejected.push({
        matchId,
        reason: "Missing odds",
      })

      continue
    }

    if (!sameTeams(schedule, result) || !sameTeams(schedule, market)) {
      rejected.push({
        matchId,
        reason: "Team mismatch between datasets",
      })

      continue
    }

    const homeOdd = parseOdd(market.odds_home_dec)

    const drawOdd = parseOdd(market.odds_draw_dec)

    const awayOdd = parseOdd(market.odds_away_dec)

    if (homeOdd === null || drawOdd === null || awayOdd === null) {
      rejected.push({
        matchId,
        reason: "Invalid 1X2 odds",
      })

      continue
    }

    const homeGoals = parseGoals(result.final_score_a)

    const awayGoals = parseGoals(result.final_score_b)

    if (homeGoals === null || awayGoals === null) {
      rejected.push({
        matchId,
        reason: "Invalid final score",
      })

      continue
    }

    const date = schedule.date

    if (!date) {
      rejected.push({
        matchId,
        reason: "Missing match date",
      })

      continue
    }

    rows.push({
      matchId,

      kickoffAt: `${date}T00:00:00.000Z`,

      homeTeam: schedule.team_a,
      awayTeam: schedule.team_b,

      odds: {
        oneXTwo: {
          home: homeOdd,
          draw: drawOdd,
          away: awayOdd,
        },
      },

      finalScore: {
        home: homeGoals,
        away: awayGoals,
      },
    })
  }

  return {
    rows,
    rejected,
  }
}

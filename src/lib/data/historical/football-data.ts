import type { HistoricalMarketRow } from "../../model/historical-market"

export type FootballDataImportResult = {
  rows: HistoricalMarketRow[]

  rejected: Array<{
    line: number
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

function parseDecimalOdd(value: string | undefined): number | null {
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

function parseKickoff(
  date: string | undefined,
  time: string | undefined,
): string | null {
  if (!date) {
    return null
  }

  const parts = date.split("/")

  if (parts.length !== 3) {
    return null
  }

  const day = Number(parts[0])
  const month = Number(parts[1])
  const year = Number(parts[2])

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return null
  }

  const timeParts = (time || "00:00").split(":")

  const hour = Number(timeParts[0])
  const minute = Number(timeParts[1] ?? "0")

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null
  }

  const kickoff = new Date(Date.UTC(year, month - 1, day, hour, minute))

  if (Number.isNaN(kickoff.getTime())) {
    return null
  }

  return kickoff.toISOString()
}

function createMatchId(
  kickoffAt: string,
  homeTeam: string,
  awayTeam: string,
): string {
  const date = kickoffAt.slice(0, 10)

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  return [date, normalize(homeTeam), normalize(awayTeam)].join("-")
}

export function importFootballDataCsv(csv: string): FootballDataImportResult {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return {
      rows: [],
      rejected: [],
    }
  }

  const headers = parseCsvLine(lines[0])

  const rows: HistoricalMarketRow[] = []
  const rejected: FootballDataImportResult["rejected"] = []

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCsvLine(lines[lineIndex])

    const record: Record<string, string> = {}

    headers.forEach((header, columnIndex) => {
      record[header] = values[columnIndex] ?? ""
    })

    const homeTeam = record.HomeTeam?.trim()

    const awayTeam = record.AwayTeam?.trim()

    if (!homeTeam || !awayTeam) {
      rejected.push({
        line: lineIndex + 1,
        reason: "Missing teams",
      })

      continue
    }

    const kickoffAt = parseKickoff(record.Date, record.Time)

    if (!kickoffAt) {
      rejected.push({
        line: lineIndex + 1,
        reason: "Invalid kickoff date",
      })

      continue
    }

    const homeGoals = parseGoals(record.FTHG)

    const awayGoals = parseGoals(record.FTAG)

    if (homeGoals === null || awayGoals === null) {
      rejected.push({
        line: lineIndex + 1,
        reason: "Missing or invalid final score",
      })

      continue
    }

    const homeOdd = parseDecimalOdd(record.AvgCH)

    const drawOdd = parseDecimalOdd(record.AvgCD)

    const awayOdd = parseDecimalOdd(record.AvgCA)

    if (homeOdd === null || drawOdd === null || awayOdd === null) {
      rejected.push({
        line: lineIndex + 1,
        reason: "Missing or invalid closing 1X2 odds",
      })

      continue
    }

    const over25 = parseDecimalOdd(record["AvgC>2.5"])

    const under25 = parseDecimalOdd(record["AvgC<2.5"])

    const odds: HistoricalMarketRow["odds"] = {
      oneXTwo: {
        home: homeOdd,
        draw: drawOdd,
        away: awayOdd,
      },
    }

    if (over25 !== null && under25 !== null) {
      odds.over25 = {
        over: over25,
        under: under25,
      }
    }

    rows.push({
      matchId: createMatchId(kickoffAt, homeTeam, awayTeam),

      kickoffAt,

      homeTeam,
      awayTeam,

      odds,

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

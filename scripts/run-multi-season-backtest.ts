import { readFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import { importFootballDataCsv } from "../src/lib/data/historical/football-data"
import { runValidatedHistoricalBacktest } from "../src/lib/model/historical-backtest"
import type { BacktestStrategySummary } from "../src/lib/model/backtest"

type SeasonSummary = {
  season: string
  matches: number
  rejected: number

  leader: BacktestStrategySummary
  balanced: BacktestStrategySummary
  challenger: BacktestStrategySummary
}

const defaultFiles = [
  "data/historical/F1-2021-2022.csv",
  "data/historical/F1-2022-2023.csv",
  "data/historical/F1-2023-2024.csv",
  "data/historical/F1-2024-2025.csv",
  "data/historical/F1-2025-2026.csv",
]

const files = process.argv.length > 2 ? process.argv.slice(2) : defaultFiles

function seasonFromFilename(filename: string): string {
  return basename(filename)
    .replace(/^F1-/, "")
    .replace(/\.csv$/i, "")
}

function percentage(value: number, total: number): string {
  if (total === 0) {
    return "0.0%"
  }

  return `${((value / total) * 100).toFixed(1)}%`
}

function pointsPerMatch(points: number, matches: number): number {
  if (matches === 0) {
    return 0
  }

  return Number((points / matches).toFixed(2))
}

function loadSeason(filename: string): SeasonSummary {
  const path = resolve(process.cwd(), filename)

  const csv = readFileSync(path, "utf8")

  const imported = importFootballDataCsv(csv)

  const result = runValidatedHistoricalBacktest(imported.rows)

  return {
    season: seasonFromFilename(filename),
    matches: result.summary.matches,
    rejected: imported.rejected.length,
    leader: result.summary.leader,
    balanced: result.summary.balanced,
    challenger: result.summary.challenger,
  }
}

function addStrategy(
  target: BacktestStrategySummary,
  source: BacktestStrategySummary,
) {
  target.exactScores += source.exactScores

  target.correctOutcomes += source.correctOutcomes

  target.totalPoints += source.totalPoints
}

function emptyStrategy(): BacktestStrategySummary {
  return {
    exactScores: 0,
    correctOutcomes: 0,
    totalPoints: 0,
  }
}

const seasons = files.map(loadSeason)

console.log("")
console.log("=== Backtest Ligue 1 multi-saisons ===")
console.log("")

for (const season of seasons) {
  console.log(
    `${season.season} — ${season.matches} matchs — ${season.rejected} rejet(s)`,
  )

  console.table([
    {
      strategy: "Leader",
      exactRate: percentage(season.leader.exactScores, season.matches),
      outcomeRate: percentage(season.leader.correctOutcomes, season.matches),
      pointsPerMatch: pointsPerMatch(season.leader.totalPoints, season.matches),
    },

    {
      strategy: "Équilibré",
      exactRate: percentage(season.balanced.exactScores, season.matches),
      outcomeRate: percentage(season.balanced.correctOutcomes, season.matches),
      pointsPerMatch: pointsPerMatch(
        season.balanced.totalPoints,
        season.matches,
      ),
    },

    {
      strategy: "Challenger",
      exactRate: percentage(season.challenger.exactScores, season.matches),
      outcomeRate: percentage(
        season.challenger.correctOutcomes,
        season.matches,
      ),
      pointsPerMatch: pointsPerMatch(
        season.challenger.totalPoints,
        season.matches,
      ),
    },
  ])

  console.log("")
}

const aggregate = {
  matches: 0,
  rejected: 0,
  leader: emptyStrategy(),
  balanced: emptyStrategy(),
  challenger: emptyStrategy(),
}

for (const season of seasons) {
  aggregate.matches += season.matches
  aggregate.rejected += season.rejected

  addStrategy(aggregate.leader, season.leader)

  addStrategy(aggregate.balanced, season.balanced)

  addStrategy(aggregate.challenger, season.challenger)
}

console.log("=== TOTAL 5 SAISONS ===")
console.log(`${aggregate.matches} matchs — ${aggregate.rejected} rejet(s)`)
console.log("")

console.table([
  {
    strategy: "Leader",

    exactScores: aggregate.leader.exactScores,

    exactRate: percentage(aggregate.leader.exactScores, aggregate.matches),

    correctOutcomes: aggregate.leader.correctOutcomes,

    outcomeRate: percentage(
      aggregate.leader.correctOutcomes,
      aggregate.matches,
    ),

    totalPoints: aggregate.leader.totalPoints,

    pointsPerMatch: pointsPerMatch(
      aggregate.leader.totalPoints,
      aggregate.matches,
    ),
  },

  {
    strategy: "Équilibré",

    exactScores: aggregate.balanced.exactScores,

    exactRate: percentage(aggregate.balanced.exactScores, aggregate.matches),

    correctOutcomes: aggregate.balanced.correctOutcomes,

    outcomeRate: percentage(
      aggregate.balanced.correctOutcomes,
      aggregate.matches,
    ),

    totalPoints: aggregate.balanced.totalPoints,

    pointsPerMatch: pointsPerMatch(
      aggregate.balanced.totalPoints,
      aggregate.matches,
    ),
  },

  {
    strategy: "Challenger",

    exactScores: aggregate.challenger.exactScores,

    exactRate: percentage(aggregate.challenger.exactScores, aggregate.matches),

    correctOutcomes: aggregate.challenger.correctOutcomes,

    outcomeRate: percentage(
      aggregate.challenger.correctOutcomes,
      aggregate.matches,
    ),

    totalPoints: aggregate.challenger.totalPoints,

    pointsPerMatch: pointsPerMatch(
      aggregate.challenger.totalPoints,
      aggregate.matches,
    ),
  },
])

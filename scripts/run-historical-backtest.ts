import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { importFootballDataCsv } from "../src/lib/data/historical/football-data"
import { runValidatedHistoricalBacktest } from "../src/lib/model/historical-backtest"

const filename = process.argv[2] ?? "data/historical/F1-2025-2026.csv"

const absolutePath = resolve(process.cwd(), filename)

const csv = readFileSync(absolutePath, "utf8")

const imported = importFootballDataCsv(csv)

const result = runValidatedHistoricalBacktest(imported.rows)

function percentage(value: number, total: number): string {
  if (total === 0) {
    return "0.0%"
  }

  return `${((value / total) * 100).toFixed(1)}%`
}

function strategySummary(
  name: string,
  strategy: {
    exactScores: number
    correctOutcomes: number
    totalPoints: number
  },
) {
  const matches = result.summary.matches

  return {
    strategy: name,

    exactScores: strategy.exactScores,

    exactRate: percentage(strategy.exactScores, matches),

    correctOutcomes: strategy.correctOutcomes,

    outcomeRate: percentage(strategy.correctOutcomes, matches),

    totalPoints: strategy.totalPoints,

    pointsPerMatch:
      matches === 0 ? 0 : Number((strategy.totalPoints / matches).toFixed(2)),
  }
}

console.log("")
console.log(`Dataset : ${absolutePath}`)
console.log(`Matchs importés : ${imported.rows.length}`)
console.log(`Lignes rejetées : ${imported.rejected.length}`)
console.log("")

console.table([
  strategySummary("Leader", result.summary.leader),

  strategySummary("Équilibré", result.summary.balanced),

  strategySummary("Challenger", result.summary.challenger),
])

if (imported.rejected.length > 0) {
  console.log("")
  console.log("Premières lignes rejetées :")

  console.table(imported.rejected.slice(0, 10))
}

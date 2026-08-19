import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { importWorldCup2026 } from "../src/lib/data/historical/world-cup-2026"
import { runValidatedHistoricalBacktest } from "../src/lib/model/historical-backtest"

const baseDirectory = resolve(process.cwd(), "data/historical/world-cup-2026")

function load(filename: string): string {
  return readFileSync(resolve(baseDirectory, filename), "utf8")
}

const imported = importWorldCup2026({
  scheduleCsv: load("schedule.csv"),
  resultsCsv: load("results.csv"),
  oddsCsv: load("odds.csv"),

  scheduleKnockoutCsv: load("schedule_knockout.csv"),

  resultsKnockoutCsv: load("results_knockout.csv"),

  oddsKnockoutCsv: load("odds_knockout.csv"),
})

console.log("")
console.log("=== CDM 2026 — benchmark MPP L1 ===")
console.log("")

console.log(`Matchs importés : ${imported.rows.length}`)

console.log(`Matchs rejetés : ${imported.rejected.length}`)

if (imported.rejected.length > 0) {
  console.table(imported.rejected)
}

if (imported.rows.length !== 104) {
  throw new Error(`Expected 104 World Cup matches, got ${imported.rows.length}`)
}

const result = runValidatedHistoricalBacktest(imported.rows)

function percentage(value: number): string {
  return `${((value / result.summary.matches) * 100).toFixed(1)}%`
}

function strategyRow(
  strategy: string,
  summary: {
    exactScores: number
    correctOutcomes: number
    totalPoints: number
  },
) {
  return {
    strategy,

    bons: summary.correctOutcomes,

    bonsPct: percentage(summary.correctOutcomes),

    exacts: summary.exactScores,

    exactsPct: percentage(summary.exactScores),

    devPoints: summary.totalPoints,

    devPointsPerMatch: Number(
      (summary.totalPoints / result.summary.matches).toFixed(2),
    ),
  }
}

console.log("")
console.log("=== MODÈLE ===")
console.log("")

console.table([
  strategyRow("Leader", result.summary.leader),

  strategyRow("Équilibré", result.summary.balanced),

  strategyRow("Challenger", result.summary.challenger),
])

const nabilCorrectOutcomes = 72
const nabilExactScores = 11

console.log("")
console.log("=== RÉFÉRENCE NABIL ===")
console.log("")

console.table([
  {
    joueur: "Nabil",

    bons: nabilCorrectOutcomes,

    bonsPct: `${((nabilCorrectOutcomes / 104) * 100).toFixed(1)}%`,

    exacts: nabilExactScores,

    exactsPct: `${((nabilExactScores / 104) * 100).toFixed(1)}%`,

    pointsMPP: 5219,
  },
])

console.log("")
console.log(
  "Note : les devPoints du modèle utilisent le barème MPP DEV du projet.",
)

console.log(
  "Ils ne sont pas directement comparables aux 5 219 points MPP réels.",
)

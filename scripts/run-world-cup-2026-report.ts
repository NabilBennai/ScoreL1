import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { importWorldCup2026 } from "../src/lib/data/historical/world-cup-2026"
import { runValidatedHistoricalBacktest } from "../src/lib/model/historical-backtest"

type Score = {
  home: number
  away: number
}

const baseDirectory = resolve(process.cwd(), "data/historical/world-cup-2026")

function load(filename: string): string {
  return readFileSync(resolve(baseDirectory, filename), "utf8")
}

function scoreText(score: Score): string {
  return `${score.home}-${score.away}`
}

function outcome(score: Score): "1" | "N" | "2" {
  if (score.home > score.away) {
    return "1"
  }

  if (score.home < score.away) {
    return "2"
  }

  return "N"
}

function isExact(predicted: Score, actual: Score): boolean {
  return predicted.home === actual.home && predicted.away === actual.away
}

function isCorrectOutcome(predicted: Score, actual: Score): boolean {
  return outcome(predicted) === outcome(actual)
}

function yesNo(value: boolean): string {
  return value ? "OUI" : "NON"
}

const imported = importWorldCup2026({
  scheduleCsv: load("schedule.csv"),
  resultsCsv: load("results.csv"),
  oddsCsv: load("odds.csv"),

  scheduleKnockoutCsv: load("schedule_knockout.csv"),

  resultsKnockoutCsv: load("results_knockout.csv"),

  oddsKnockoutCsv: load("odds_knockout.csv"),
})

if (imported.rejected.length > 0) {
  console.table(imported.rejected)

  throw new Error(`${imported.rejected.length} World Cup matches rejected`)
}

if (imported.rows.length !== 104) {
  throw new Error(`Expected 104 matches, got ${imported.rows.length}`)
}

const result = runValidatedHistoricalBacktest(imported.rows)

console.log("")
console.log("=== CDM 2026 — RAPPORT MATCH PAR MATCH ===")
console.log("")

const report = result.predictions.map((predictionResult, index) => {
  const source = imported.rows[index]
  const prediction = predictionResult.prediction

  const actual = prediction.actualScore

  const leader = prediction.leader

  const balanced = prediction.balanced

  const challenger = prediction.challenger

  return {
    match: source.matchId,

    rencontre: `${source.homeTeam} - ${source.awayTeam}`,

    réel: scoreText(actual),

    leader: scoreText(leader),

    leader1N2: yesNo(isCorrectOutcome(leader, actual)),

    leaderExact: yesNo(isExact(leader, actual)),

    équilibré: scoreText(balanced),

    équilibré1N2: yesNo(isCorrectOutcome(balanced, actual)),

    équilibréExact: yesNo(isExact(balanced, actual)),

    challenger: scoreText(challenger),

    challenger1N2: yesNo(isCorrectOutcome(challenger, actual)),

    challengerExact: yesNo(isExact(challenger, actual)),
  }
})

console.table(report)

const divergent = result.predictions
  .map((predictionResult, index) => {
    const source = imported.rows[index]

    const prediction = predictionResult.prediction

    const leader = prediction.leader

    const balanced = prediction.balanced

    const challenger = prediction.challenger

    return {
      source,
      actual: prediction.actualScore,
      leader,
      balanced,
      challenger,
    }
  })
  .filter(
    ({ leader, balanced, challenger }) =>
      leader.home !== balanced.home ||
      leader.away !== balanced.away ||
      balanced.home !== challenger.home ||
      balanced.away !== challenger.away,
  )

console.log("")
console.log("=== MATCHS AVEC DIVERGENCE DE STRATÉGIE ===")
console.log("")

console.log(`Divergences : ${divergent.length} / 104`)

console.log("")

console.table(
  divergent.map(({ source, actual, leader, balanced, challenger }) => ({
    match: source.matchId,

    rencontre: `${source.homeTeam} - ${source.awayTeam}`,

    réel: scoreText(actual),

    leader: scoreText(leader),

    leaderBon: yesNo(isCorrectOutcome(leader, actual)),

    équilibré: scoreText(balanced),

    équilibréBon: yesNo(isCorrectOutcome(balanced, actual)),

    challenger: scoreText(challenger),

    challengerBon: yesNo(isCorrectOutcome(challenger, actual)),
  })),
)

const leaderWinsOverBalanced = divergent.filter(
  ({ actual, leader, balanced }) =>
    isCorrectOutcome(leader, actual) && !isCorrectOutcome(balanced, actual),
)

const balancedWinsOverLeader = divergent.filter(
  ({ actual, leader, balanced }) =>
    !isCorrectOutcome(leader, actual) && isCorrectOutcome(balanced, actual),
)

const leaderExactOnly = divergent.filter(
  ({ actual, leader, balanced }) =>
    isExact(leader, actual) && !isExact(balanced, actual),
)

const balancedExactOnly = divergent.filter(
  ({ actual, leader, balanced }) =>
    !isExact(leader, actual) && isExact(balanced, actual),
)

const challengerDifferentFromBalanced = divergent.filter(
  ({ balanced, challenger }) =>
    balanced.home !== challenger.home || balanced.away !== challenger.away,
)

console.log("")
console.log("=== SYNTHÈSE DES DIVERGENCES ===")
console.log("")

console.table([
  {
    mesure: "Leader bon 1N2 / Équilibré faux",

    matchs: leaderWinsOverBalanced.length,
  },

  {
    mesure: "Équilibré bon 1N2 / Leader faux",

    matchs: balancedWinsOverLeader.length,
  },

  {
    mesure: "Exact Leader uniquement",

    matchs: leaderExactOnly.length,
  },

  {
    mesure: "Exact Équilibré uniquement",

    matchs: balancedExactOnly.length,
  },

  {
    mesure: "Challenger différent d'Équilibré",

    matchs: challengerDifferentFromBalanced.length,
  },
])

console.log("")
console.log("=== RAPPEL BENCHMARK ===")
console.log("")

console.table([
  {
    stratégie: "Leader",

    bons: result.summary.leader.correctOutcomes,

    exacts: result.summary.leader.exactScores,
  },

  {
    stratégie: "Équilibré",

    bons: result.summary.balanced.correctOutcomes,

    exacts: result.summary.balanced.exactScores,
  },

  {
    stratégie: "Challenger",

    bons: result.summary.challenger.correctOutcomes,

    exacts: result.summary.challenger.exactScores,
  },

  {
    stratégie: "Nabil",

    bons: 72,

    exacts: 11,
  },
])

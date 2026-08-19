import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { importFootballDataCsv } from "../src/lib/data/historical/football-data"
import { calculateFootballModel } from "../src/lib/model/football-model"
import { estimateCrowd } from "../src/lib/model/crowd-model"
import { calculateExpectedValues } from "../src/lib/model/expected-value"
import { DEV_MPP_CONFIG } from "../src/lib/model/mpp-config"
import { calculateRealizedMppPoints } from "../src/lib/model/realized-mpp-points"
import {
  chooseBalanced,
  chooseChallenger,
  chooseLeader,
} from "../src/lib/model/strategies"
import type { HistoricalMarketRow } from "../src/lib/model/historical-market"

type PreparedMatch = {
  row: HistoricalMarketRow

  scores: Array<{
    home: number
    away: number
    probability: number
  }>
}

type StrategySummary = {
  exactScores: number
  correctOutcomes: number
  totalPoints: number
}

type AlphaResult = {
  alpha: number
  matches: number
  leader: StrategySummary
  balanced: StrategySummary
  challenger: StrategySummary
}

const TRAIN_FILES = [
  "data/historical/F1-2021-2022.csv",
  "data/historical/F1-2022-2023.csv",
  "data/historical/F1-2023-2024.csv",
]

const VALIDATION_FILES = [
  "data/historical/F1-2024-2025.csv",
  "data/historical/F1-2025-2026.csv",
]

const ALPHAS = [0.8, 1, 1.15, 1.25, 1.35, 1.5, 1.75, 2]

function loadRows(filenames: string[]): HistoricalMarketRow[] {
  const rows: HistoricalMarketRow[] = []

  for (const filename of filenames) {
    const absolutePath = resolve(process.cwd(), filename)

    const csv = readFileSync(absolutePath, "utf8")

    const imported = importFootballDataCsv(csv)

    if (imported.rejected.length > 0) {
      throw new Error(`${filename}: ${imported.rejected.length} rejected rows`)
    }

    rows.push(...imported.rows)
  }

  return rows
}

function prepareMatches(rows: HistoricalMarketRow[]): PreparedMatch[] {
  return rows.map((row) => {
    const model = calculateFootballModel({
      oneXTwoOdds: row.odds.oneXTwo,
      over25Odds: row.odds.over25,
      bttsOdds: row.odds.btts,
    })

    return {
      row,
      scores: model.scoreProbabilities,
    }
  })
}

function emptySummary(): StrategySummary {
  return {
    exactScores: 0,
    correctOutcomes: 0,
    totalPoints: 0,
  }
}

function evaluateStrategy(
  summary: StrategySummary,
  predicted: {
    home: number
    away: number
    crowdShare: number
  },
  actual: {
    home: number
    away: number
  },
) {
  const result = calculateRealizedMppPoints(
    {
      home: predicted.home,
      away: predicted.away,
    },
    actual,
    predicted.crowdShare,
    DEV_MPP_CONFIG.rules,
  )

  if (result.exactScore) {
    summary.exactScores += 1
  }

  if (result.correctOutcome) {
    summary.correctOutcomes += 1
  }

  summary.totalPoints += result.points
}

function evaluateAlpha(matches: PreparedMatch[], alpha: number): AlphaResult {
  const leader = emptySummary()
  const balanced = emptySummary()
  const challenger = emptySummary()

  for (const match of matches) {
    const crowd = estimateCrowd(match.scores, alpha)

    const expectedValues = calculateExpectedValues(
      match.scores,
      crowd,
      DEV_MPP_CONFIG.rules,
    )

    const leaderPick = chooseLeader(expectedValues)

    const balancedPick = chooseBalanced(expectedValues)

    const challengerPick = chooseChallenger(expectedValues, balancedPick)

    const actual = {
      home: match.row.finalScore.home,
      away: match.row.finalScore.away,
    }

    evaluateStrategy(leader, leaderPick, actual)

    evaluateStrategy(balanced, balancedPick, actual)

    evaluateStrategy(challenger, challengerPick, actual)
  }

  return {
    alpha,
    matches: matches.length,
    leader,
    balanced,
    challenger,
  }
}

function percentage(value: number, matches: number): string {
  if (matches === 0) {
    return "0.0%"
  }

  return `${((value / matches) * 100).toFixed(1)}%`
}

function pointsPerMatch(points: number, matches: number): number {
  if (matches === 0) {
    return 0
  }

  return Number((points / matches).toFixed(3))
}

function tableRow(result: AlphaResult) {
  return {
    alpha: result.alpha,

    balancedExact: percentage(result.balanced.exactScores, result.matches),

    balanced1N2: percentage(result.balanced.correctOutcomes, result.matches),

    balancedPts: pointsPerMatch(result.balanced.totalPoints, result.matches),

    challengerPts: pointsPerMatch(
      result.challenger.totalPoints,
      result.matches,
    ),
  }
}

console.log("")
console.log("Préparation des modèles football...")

const train = prepareMatches(loadRows(TRAIN_FILES))

const validation = prepareMatches(loadRows(VALIDATION_FILES))

console.log(`Train : ${train.length} matchs`)

console.log(`Validation : ${validation.length} matchs`)

console.log("")
console.log("=== CALIBRATION TRAIN ===")
console.log("")

const trainResults = ALPHAS.map((alpha) => evaluateAlpha(train, alpha))

console.table(trainResults.map(tableRow))

const bestTrain = [...trainResults].sort((a, b) => {
  const aPoints = a.balanced.totalPoints / a.matches

  const bPoints = b.balanced.totalPoints / b.matches

  if (bPoints !== aPoints) {
    return bPoints - aPoints
  }

  return (
    Math.abs(a.alpha - DEV_MPP_CONFIG.crowdAlpha) -
    Math.abs(b.alpha - DEV_MPP_CONFIG.crowdAlpha)
  )
})[0]

console.log("")
console.log(`Meilleur alpha sur TRAIN : ${bestTrain.alpha}`)

console.log(
  `Équilibré TRAIN : ${pointsPerMatch(
    bestTrain.balanced.totalPoints,
    bestTrain.matches,
  )} pts/match`,
)

console.log("")
console.log("=== VALIDATION ===")
console.log("")

const validationResults = ALPHAS.map((alpha) =>
  evaluateAlpha(validation, alpha),
)

console.table(validationResults.map(tableRow))

const selectedValidation = validationResults.find(
  (result) => result.alpha === bestTrain.alpha,
)

const currentValidation = validationResults.find(
  (result) => result.alpha === DEV_MPP_CONFIG.crowdAlpha,
)

if (!selectedValidation || !currentValidation) {
  throw new Error("Missing validation result")
}

console.log("")
console.log("=== DÉCISION HORS ÉCHANTILLON ===")

console.log(`Alpha actuel : ${DEV_MPP_CONFIG.crowdAlpha}`)

console.log(`Alpha sélectionné sur train : ${bestTrain.alpha}`)

console.log("")

console.log(
  `Validation alpha actuel : ${pointsPerMatch(
    currentValidation.balanced.totalPoints,
    currentValidation.matches,
  )} pts/match`,
)

console.log(
  `Validation alpha sélectionné : ${pointsPerMatch(
    selectedValidation.balanced.totalPoints,
    selectedValidation.matches,
  )} pts/match`,
)

console.log("")

const delta =
  selectedValidation.balanced.totalPoints / selectedValidation.matches -
  currentValidation.balanced.totalPoints / currentValidation.matches

console.log(`Gain validation : ${delta.toFixed(3)} pts/match`)

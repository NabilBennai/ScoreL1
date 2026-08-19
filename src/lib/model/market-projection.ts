import type { ScoreGrid } from "./score-grid"

export type OneXTwoProbabilities = {
  home: number
  draw: number
  away: number
}

export type TotalsProbabilities = {
  over: number
  under: number
}

export type BttsProbabilities = {
  yes: number
  no: number
}

export function projectOneXTwo(grid: ScoreGrid): OneXTwoProbabilities {
  let home = 0
  let draw = 0
  let away = 0

  for (const score of grid.scores) {
    if (score.home > score.away) {
      home += score.probability
    } else if (score.home === score.away) {
      draw += score.probability
    } else {
      away += score.probability
    }
  }

  return { home, draw, away }
}

export function projectTotals(
  grid: ScoreGrid,
  line = 2.5,
): TotalsProbabilities {
  if (!Number.isFinite(line) || line < 0) {
    throw new Error("Totals line must be a finite non-negative number")
  }

  let over = 0
  let under = 0

  for (const score of grid.scores) {
    const totalGoals = score.home + score.away

    if (totalGoals > line) {
      over += score.probability
    } else {
      under += score.probability
    }
  }

  return { over, under }
}

export function projectBtts(grid: ScoreGrid): BttsProbabilities {
  let yes = 0

  for (const score of grid.scores) {
    if (score.home > 0 && score.away > 0) {
      yes += score.probability
    }
  }

  return {
    yes,
    no: 1 - yes,
  }
}

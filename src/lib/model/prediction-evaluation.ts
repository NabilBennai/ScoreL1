export type FinalScore = {
  home: number
  away: number
}

export type StrategyScore = {
  home: number
  away: number
}

export type StrategyEvaluation = {
  exactScore: boolean
  correctOutcome: boolean
}

export type PredictionEvaluation = {
  leader: StrategyEvaluation
  balanced: StrategyEvaluation
  challenger: StrategyEvaluation
}

function outcome(score: FinalScore | StrategyScore) {
  if (score.home > score.away) {
    return "HOME"
  }

  if (score.home < score.away) {
    return "AWAY"
  }

  return "DRAW"
}

function evaluateStrategy(
  predicted: StrategyScore,
  actual: FinalScore,
): StrategyEvaluation {
  return {
    exactScore:
      predicted.home === actual.home && predicted.away === actual.away,

    correctOutcome: outcome(predicted) === outcome(actual),
  }
}

export function parseScore(value: string): StrategyScore {
  const parts = value.split("-")

  if (parts.length !== 2) {
    throw new Error(`Invalid score: ${value}`)
  }

  const home = Number(parts[0])
  const away = Number(parts[1])

  if (
    !Number.isInteger(home) ||
    !Number.isInteger(away) ||
    home < 0 ||
    away < 0
  ) {
    throw new Error(`Invalid score: ${value}`)
  }

  return {
    home,
    away,
  }
}

export function evaluatePrediction(
  actual: FinalScore,
  strategies: {
    leader: StrategyScore
    balanced: StrategyScore
    challenger: StrategyScore
  },
): PredictionEvaluation {
  return {
    leader: evaluateStrategy(strategies.leader, actual),

    balanced: evaluateStrategy(strategies.balanced, actual),

    challenger: evaluateStrategy(strategies.challenger, actual),
  }
}

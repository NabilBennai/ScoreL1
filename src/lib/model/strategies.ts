import type { ScoreExpectedValue } from "./expected-value"

export type StrategyPick = ScoreExpectedValue

function stableSort(a: ScoreExpectedValue, b: ScoreExpectedValue): number {
  if (b.expectedPoints !== a.expectedPoints) {
    return b.expectedPoints - a.expectedPoints
  }

  if (b.probability !== a.probability) {
    return b.probability - a.probability
  }

  if (a.crowdShare !== b.crowdShare) {
    return a.crowdShare - b.crowdShare
  }

  if (a.home !== b.home) {
    return a.home - b.home
  }

  return a.away - b.away
}

export function chooseLeader(scores: ScoreExpectedValue[]): StrategyPick {
  if (scores.length === 0) {
    throw new Error("No scores available")
  }

  return [...scores].sort((a, b) => {
    if (b.probability !== a.probability) {
      return b.probability - a.probability
    }

    return stableSort(a, b)
  })[0]
}

export function chooseBalanced(scores: ScoreExpectedValue[]): StrategyPick {
  if (scores.length === 0) {
    throw new Error("No scores available")
  }

  return [...scores].sort(stableSort)[0]
}

export type ChallengerConfig = {
  minProbability: number
  minExpectedValueRatio: number
  edgeWeight: number
}

export function chooseChallenger(
  scores: ScoreExpectedValue[],
  balanced: StrategyPick,
  config: ChallengerConfig = {
    minProbability: 0.025,
    minExpectedValueRatio: 0.6,
    edgeWeight: 0.8,
  },
): StrategyPick {
  const candidates = scores.filter(
    (score) =>
      score.probability >= config.minProbability &&
      score.expectedPoints >=
        balanced.expectedPoints * config.minExpectedValueRatio,
  )

  if (candidates.length === 0) {
    return balanced
  }

  const epsilon = 1e-12

  const scored = candidates.map((score) => {
    const edge = Math.log(
      (score.probability + epsilon) / (score.crowdShare + epsilon),
    )

    return {
      score,
      utility: score.expectedPoints + config.edgeWeight * edge,
    }
  })

  scored.sort((a, b) => {
    if (b.utility !== a.utility) {
      return b.utility - a.utility
    }

    return stableSort(a.score, b.score)
  })

  return scored[0].score
}

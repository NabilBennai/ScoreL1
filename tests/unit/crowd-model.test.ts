import { describe, expect, it } from "vitest"
import {
  estimateCrowd,
  getConditionalCrowdShare,
} from "../../src/lib/model/crowd-model"
import {
  buildPoissonScoreGrid,
  normalizeScoreGrid,
} from "../../src/lib/model/score-grid"

describe("estimateCrowd", () => {
  it("returns a normalized distribution", () => {
    const football = normalizeScoreGrid(buildPoissonScoreGrid(1.8, 1.1, 12))

    const crowd = estimateCrowd(football.scores, 1.5)

    const total = crowd.reduce((sum, score) => sum + score.probability, 0)

    expect(Math.abs(total - 1)).toBeLessThan(1e-10)
  })

  it("returns the football distribution when alpha is 1", () => {
    const football = normalizeScoreGrid(buildPoissonScoreGrid(1.8, 1.1, 12))

    const crowd = estimateCrowd(football.scores, 1)

    expect(crowd[0].probability).toBeCloseTo(football.scores[0].probability, 12)
  })

  it("computes conditional crowd share", () => {
    const crowd = [
      { home: 1, away: 0, probability: 0.2 },
      { home: 2, away: 0, probability: 0.1 },
      { home: 1, away: 1, probability: 0.3 },
      { home: 0, away: 1, probability: 0.4 },
    ]

    expect(getConditionalCrowdShare(crowd, 1, 0)).toBeCloseTo(2 / 3, 12)
  })
})

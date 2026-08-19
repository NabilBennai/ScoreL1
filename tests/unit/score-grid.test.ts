import { describe, expect, it } from "vitest"
import {
  buildPoissonScoreGrid,
  normalizeScoreGrid,
} from "../../src/lib/model/score-grid"

describe("buildPoissonScoreGrid", () => {
  it("creates the expected number of score cells", () => {
    const grid = buildPoissonScoreGrid(1.5, 1.1, 12)

    expect(grid.scores).toHaveLength(13 * 13)
  })

  it("captures almost all probability mass", () => {
    const grid = buildPoissonScoreGrid(1.5, 1.1, 12)

    expect(grid.totalProbability).toBeGreaterThan(0.999999)
    expect(grid.totalProbability).toBeLessThanOrEqual(1)
  })

  it("assigns positive probabilities", () => {
    const grid = buildPoissonScoreGrid(1.5, 1.1, 12)

    expect(grid.scores.every((score) => score.probability >= 0)).toBe(true)
  })

  it("normalizes the grid to 1", () => {
    const grid = buildPoissonScoreGrid(1.5, 1.1, 12)
    const normalized = normalizeScoreGrid(grid)

    const total = normalized.scores.reduce(
      (sum, score) => sum + score.probability,
      0,
    )

    expect(total).toBeCloseTo(1, 12)
  })
})

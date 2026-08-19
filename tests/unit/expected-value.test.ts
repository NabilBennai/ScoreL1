import { describe, expect, it } from "vitest"
import { calculateExpectedValues } from "../../src/lib/model/expected-value"
import { estimateCrowd } from "../../src/lib/model/crowd-model"
import type { MppRules } from "../../src/lib/model/mpp-rules"

const rules: MppRules = {
  correctOutcomePoints: 10,
  rarityTiers: [
    { maxShareExclusive: 0.05, bonus: 70 },
    { maxShareExclusive: 0.2, bonus: 50 },
    { maxShareExclusive: 0.3, bonus: 30 },
    { maxShareExclusive: 1.01, bonus: 20 },
  ],
}

describe("calculateExpectedValues", () => {
  it("computes finite expected values", () => {
    const football = [
      { home: 1, away: 0, probability: 0.5 },
      { home: 2, away: 0, probability: 0.3 },
      { home: 1, away: 1, probability: 0.2 },
    ]

    const crowd = estimateCrowd(football, 1)

    const result = calculateExpectedValues(football, crowd, rules)

    expect(result).toHaveLength(3)

    for (const score of result) {
      expect(Number.isFinite(score.expectedPoints)).toBe(true)
      expect(score.expectedPoints).toBeGreaterThanOrEqual(0)
    }
  })

  it("rewards a correct outcome even without exact score", () => {
    const football = [
      { home: 1, away: 0, probability: 0.5 },
      { home: 2, away: 0, probability: 0.5 },
    ]

    const crowd = estimateCrowd(football, 1)

    const result = calculateExpectedValues(football, crowd, rules)

    const oneNil = result.find((score) => score.home === 1 && score.away === 0)

    expect(oneNil?.expectedPoints).toBeGreaterThan(10)
  })
})

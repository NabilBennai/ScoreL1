import { describe, expect, it } from "vitest"
import {
  chooseBalanced,
  chooseChallenger,
  chooseLeader,
} from "../../src/lib/model/strategies"
import type { ScoreExpectedValue } from "../../src/lib/model/expected-value"

const scores: ScoreExpectedValue[] = [
  {
    home: 2,
    away: 0,
    probability: 0.18,
    crowdShare: 0.3,
    conditionalCrowdShare: 0.45,
    rarityBonus: 20,
    expectedPoints: 18,
  },
  {
    home: 3,
    away: 0,
    probability: 0.14,
    crowdShare: 0.08,
    conditionalCrowdShare: 0.12,
    rarityBonus: 50,
    expectedPoints: 24,
  },
  {
    home: 3,
    away: 1,
    probability: 0.08,
    crowdShare: 0.02,
    conditionalCrowdShare: 0.03,
    rarityBonus: 70,
    expectedPoints: 20,
  },
]

describe("strategies", () => {
  it("chooses the most probable score as Leader", () => {
    expect(chooseLeader(scores)).toMatchObject({
      home: 2,
      away: 0,
    })
  })

  it("chooses max EV as Balanced", () => {
    expect(chooseBalanced(scores)).toMatchObject({
      home: 3,
      away: 0,
    })
  })

  it("chooses a differentiated Challenger", () => {
    const balanced = chooseBalanced(scores)

    const challenger = chooseChallenger(scores, balanced)

    expect(challenger).toBeDefined()
    expect(challenger.probability).toBeGreaterThanOrEqual(0.025)
  })
})

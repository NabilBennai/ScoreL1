import { describe, expect, it } from "vitest"
import { estimateCrowd } from "../../src/lib/model/crowd-model"

describe("crowd model calibration", () => {
  const football = [
    {
      home: 1,
      away: 1,
      probability: 0.2,
    },
    {
      home: 1,
      away: 0,
      probability: 0.15,
    },
    {
      home: 2,
      away: 0,
      probability: 0.08,
    },
    {
      home: 3,
      away: 1,
      probability: 0.03,
    },
  ]

  it("alpha 1 reproduces the normalized football distribution", () => {
    const crowd = estimateCrowd(football, 1)

    const totalFootball = football.reduce(
      (sum, score) => sum + score.probability,
      0,
    )

    for (const score of crowd) {
      const footballScore = football.find(
        (candidate) =>
          candidate.home === score.home && candidate.away === score.away,
      )

      expect(footballScore).toBeDefined()

      expect(score.probability).toBeCloseTo(
        footballScore!.probability / totalFootball,
      )
    }
  })

  it("alpha above 1 concentrates the crowd on popular scores", () => {
    const neutral = estimateCrowd(football, 1)
    const concentrated = estimateCrowd(football, 1.35)

    const neutralTop = neutral.find(
      (score) => score.home === 1 && score.away === 1,
    )

    const concentratedTop = concentrated.find(
      (score) => score.home === 1 && score.away === 1,
    )

    expect(neutralTop).toBeDefined()
    expect(concentratedTop).toBeDefined()

    expect(concentratedTop!.probability).toBeGreaterThan(
      neutralTop!.probability,
    )
  })

  it("alpha above 1 reduces crowd share for rarer scores", () => {
    const neutral = estimateCrowd(football, 1)
    const concentrated = estimateCrowd(football, 1.35)

    const neutralRare = neutral.find(
      (score) => score.home === 3 && score.away === 1,
    )

    const concentratedRare = concentrated.find(
      (score) => score.home === 3 && score.away === 1,
    )

    expect(neutralRare).toBeDefined()
    expect(concentratedRare).toBeDefined()

    expect(concentratedRare!.probability).toBeLessThan(neutralRare!.probability)
  })

  it("always normalizes the crowd distribution", () => {
    const crowd = estimateCrowd(football, 1.35)

    const total = crowd.reduce((sum, score) => sum + score.probability, 0)

    expect(Math.abs(total - 1)).toBeLessThan(1e-12)
  })
})

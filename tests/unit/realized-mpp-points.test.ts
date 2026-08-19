import { describe, expect, it } from "vitest"
import { DEV_MPP_CONFIG } from "../../src/lib/model/mpp-config"
import { calculateRealizedMppPoints } from "../../src/lib/model/realized-mpp-points"

describe("calculateRealizedMppPoints", () => {
  it("returns zero for an incorrect outcome", () => {
    const result = calculateRealizedMppPoints(
      {
        home: 2,
        away: 0,
      },
      {
        home: 0,
        away: 1,
      },
      0.1,
      DEV_MPP_CONFIG.rules,
    )

    expect(result).toEqual({
      points: 0,
      correctOutcome: false,
      exactScore: false,
      rarityBonus: 0,
    })
  })

  it("returns outcome points for a correct 1N2 without exact score", () => {
    const result = calculateRealizedMppPoints(
      {
        home: 2,
        away: 0,
      },
      {
        home: 3,
        away: 1,
      },
      0.1,
      DEV_MPP_CONFIG.rules,
    )

    expect(result.points).toBe(DEV_MPP_CONFIG.rules.correctOutcomePoints)

    expect(result.correctOutcome).toBe(true)

    expect(result.exactScore).toBe(false)

    expect(result.rarityBonus).toBe(0)
  })

  it("adds the rarity bonus for an exact score", () => {
    const result = calculateRealizedMppPoints(
      {
        home: 2,
        away: 1,
      },
      {
        home: 2,
        away: 1,
      },
      0.1,
      DEV_MPP_CONFIG.rules,
    )

    expect(result.correctOutcome).toBe(true)

    expect(result.exactScore).toBe(true)

    expect(result.rarityBonus).toBe(50)

    expect(result.points).toBe(60)
  })

  it("uses the highest rarity bonus for a very rare exact score", () => {
    const result = calculateRealizedMppPoints(
      {
        home: 4,
        away: 3,
      },
      {
        home: 4,
        away: 3,
      },
      0.004,
      DEV_MPP_CONFIG.rules,
    )

    expect(result.rarityBonus).toBe(100)

    expect(result.points).toBe(110)
  })

  it("handles an exact draw", () => {
    const result = calculateRealizedMppPoints(
      {
        home: 1,
        away: 1,
      },
      {
        home: 1,
        away: 1,
      },
      0.25,
      DEV_MPP_CONFIG.rules,
    )

    expect(result.correctOutcome).toBe(true)

    expect(result.exactScore).toBe(true)

    expect(result.rarityBonus).toBe(30)

    expect(result.points).toBe(40)
  })

  it("rejects an invalid crowd share", () => {
    expect(() =>
      calculateRealizedMppPoints(
        {
          home: 1,
          away: 0,
        },
        {
          home: 1,
          away: 0,
        },
        1.5,
        DEV_MPP_CONFIG.rules,
      ),
    ).toThrow("predictedCrowdShare must be between 0 and 1")
  })
})

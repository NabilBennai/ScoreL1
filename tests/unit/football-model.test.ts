import { describe, expect, it } from "vitest"
import { calculateFootballModel } from "../../src/lib/model/football-model"

describe("calculateFootballModel", () => {
    it("builds a complete model from raw odds", () => {
        const result = calculateFootballModel({
            oneXTwoOdds: {
                home: 1.75,
                draw: 3.8,
                away: 4.8,
            },
            over25Odds: {
                over: 1.85,
                under: 1.95,
            },
            bttsOdds: {
                yes: 1.8,
                no: 2.0,
            },
        })

        expect(result.lambdaHome).toBeGreaterThan(0)
        expect(result.lambdaAway).toBeGreaterThan(0)
        expect(result.scoreProbabilities.length).toBe(13 * 13)

        const totalProbability = result.scoreProbabilities.reduce(
            (sum, score) => sum + score.probability,
            0,
        )

        expect(totalProbability).toBeCloseTo(1, 10)
    })

    it("preserves the favourite direction", () => {
        const result = calculateFootballModel({
            oneXTwoOdds: {
                home: 1.35,
                draw: 5.2,
                away: 8.5,
            },
            over25Odds: {
                over: 1.65,
                under: 2.2,
            },
        })

        expect(result.lambdaHome).toBeGreaterThan(
            result.lambdaAway,
        )

        expect(
            result.projections.oneXTwo.home,
        ).toBeGreaterThan(
            result.projections.oneXTwo.away,
        )
    })

    it("works with 1X2 only", () => {
        const result = calculateFootballModel({
            oneXTwoOdds: {
                home: 2.2,
                draw: 3.3,
                away: 3.4,
            },
        })

        expect(Number.isFinite(result.fitLoss)).toBe(true)
        expect(result.fairMarkets.over25).toBeUndefined()
        expect(result.fairMarkets.bttsYes).toBeUndefined()
    })

    it("returns fair 1X2 probabilities summing to 1", () => {
        const result = calculateFootballModel({
            oneXTwoOdds: {
                home: 1.9,
                draw: 3.5,
                away: 4.1,
            },
        })

        const total =
            result.fairMarkets.oneXTwo.home +
            result.fairMarkets.oneXTwo.draw +
            result.fairMarkets.oneXTwo.away

        expect(total).toBeCloseTo(1, 10)
    })
})
import {describe, expect, it} from "vitest"
import {fitGoalModel} from "../../src/lib/model/optimizer"
import {applyDixonColes} from "../../src/lib/model/dixon-coles"
import {projectBtts, projectOneXTwo, projectTotals,} from "../../src/lib/model/market-projection"
import {buildPoissonScoreGrid, normalizeScoreGrid,} from "../../src/lib/model/score-grid"

function buildSyntheticMarkets(
    lambdaHome: number,
    lambdaAway: number,
    rho = 0,
) {
    const poisson = normalizeScoreGrid(
        buildPoissonScoreGrid(lambdaHome, lambdaAway, 12),
    )

    const grid = applyDixonColes(
        poisson,
        lambdaHome,
        lambdaAway,
        rho,
    )

    const oneXTwo = projectOneXTwo(grid)
    const totals = projectTotals(grid, 2.5)
    const btts = projectBtts(grid)

    return {
        oneXTwo,
        over25: totals.over,
        under25: totals.under,
        bttsYes: btts.yes,
        bttsNo: btts.no,
    }
}

describe("fitGoalModel", () => {
    it("recovers synthetic lambdas", () => {
        const markets = buildSyntheticMarkets(1.8, 1.1)

        const fit = fitGoalModel(markets)

        expect(fit.lambdaHome).toBeCloseTo(1.8, 1)
        expect(fit.lambdaAway).toBeCloseTo(1.1, 1)
        expect(fit.loss).toBeLessThan(0.01)
    })

    it("keeps the favourite direction", () => {
        const markets = buildSyntheticMarkets(2.2, 0.8)

        const fit = fitGoalModel(markets)

        expect(fit.lambdaHome).toBeGreaterThan(fit.lambdaAway)
    })

    it("works with 1X2 only", () => {
        const fullMarkets = buildSyntheticMarkets(1.6, 1.2)

        const fit = fitGoalModel({
            oneXTwo: fullMarkets.oneXTwo,
        })

        expect(fit.lambdaHome).toBeGreaterThan(0)
        expect(fit.lambdaAway).toBeGreaterThan(0)
        expect(Number.isFinite(fit.loss)).toBe(true)
    })

    it("rejects invalid 1X2 probabilities", () => {
        expect(() =>
            fitGoalModel({
                oneXTwo: {
                    home: 0.5,
                    draw: 0.3,
                    away: 0.3,
                },
            }),
        ).toThrow()
    })
})
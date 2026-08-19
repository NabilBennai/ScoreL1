import {describe, expect, it} from "vitest"
import {projectBtts, projectOneXTwo, projectTotals,} from "../../src/lib/model/market-projection"
import {buildPoissonScoreGrid, normalizeScoreGrid,} from "../../src/lib/model/score-grid"
import {applyDixonColes} from "../../src/lib/model/dixon-coles"

function buildTestGrid() {
    const poisson = normalizeScoreGrid(
        buildPoissonScoreGrid(1.8, 1.1, 12),
    )

    return applyDixonColes(
        poisson,
        1.8,
        1.1,
        -0.08,
    )
}

describe("projectOneXTwo", () => {
    it("returns probabilities that sum to 1", () => {
        const result = projectOneXTwo(buildTestGrid())

        expect(
            result.home + result.draw + result.away,
        ).toBeCloseTo(1, 12)
    })

    it("favours the home team when lambdaHome is larger", () => {
        const result = projectOneXTwo(buildTestGrid())

        expect(result.home).toBeGreaterThan(result.away)
    })
})

describe("projectTotals", () => {
    it("returns over and under probabilities that sum to 1", () => {
        const result = projectTotals(buildTestGrid(), 2.5)

        expect(result.over + result.under).toBeCloseTo(1, 12)
    })

    it("rejects invalid totals lines", () => {
        expect(() => projectTotals(buildTestGrid(), -1)).toThrow()
        expect(() => projectTotals(buildTestGrid(), Number.NaN)).toThrow()
    })
})

describe("projectBtts", () => {
    it("returns probabilities that sum to 1", () => {
        const result = projectBtts(buildTestGrid())

        expect(result.yes + result.no).toBeCloseTo(1, 12)
    })

    it("returns probabilities between 0 and 1", () => {
        const result = projectBtts(buildTestGrid())

        expect(result.yes).toBeGreaterThanOrEqual(0)
        expect(result.yes).toBeLessThanOrEqual(1)
        expect(result.no).toBeGreaterThanOrEqual(0)
        expect(result.no).toBeLessThanOrEqual(1)
    })
})
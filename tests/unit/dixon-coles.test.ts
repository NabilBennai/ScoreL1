import { describe, expect, it } from "vitest"
import {
    applyDixonColes,
    dixonColesTau,
} from "../../src/lib/model/dixon-coles"
import {
    buildPoissonScoreGrid,
    normalizeScoreGrid,
} from "../../src/lib/model/score-grid"

describe("dixonColesTau", () => {
    it("returns 1 outside low-score corrections", () => {
        expect(dixonColesTau(2, 1, 1.5, 1.2, -0.1)).toBe(1)
        expect(dixonColesTau(3, 3, 1.5, 1.2, -0.1)).toBe(1)
    })

    it("computes the 0-0 correction", () => {
        const result = dixonColesTau(0, 0, 1.5, 1.2, -0.1)

        expect(result).toBeCloseTo(1.18, 12)
    })

    it("computes the 0-1 correction", () => {
        const result = dixonColesTau(0, 1, 1.5, 1.2, -0.1)

        expect(result).toBeCloseTo(0.85, 12)
    })

    it("computes the 1-0 correction", () => {
        const result = dixonColesTau(1, 0, 1.5, 1.2, -0.1)

        expect(result).toBeCloseTo(0.88, 12)
    })

    it("computes the 1-1 correction", () => {
        const result = dixonColesTau(1, 1, 1.5, 1.2, -0.1)

        expect(result).toBeCloseTo(1.1, 12)
    })
})

describe("applyDixonColes", () => {
    it("returns the Poisson grid when rho is 0", () => {
        const poisson = normalizeScoreGrid(
            buildPoissonScoreGrid(1.5, 1.2, 12),
        )

        const corrected = applyDixonColes(
            poisson,
            1.5,
            1.2,
            0,
        )

        corrected.scores.forEach((score, index) => {
            expect(score.probability).toBeCloseTo(
                poisson.scores[index].probability,
                12,
            )
        })
    })

    it("returns a normalized grid", () => {
        const poisson = normalizeScoreGrid(
            buildPoissonScoreGrid(1.5, 1.2, 12),
        )

        const corrected = applyDixonColes(
            poisson,
            1.5,
            1.2,
            -0.1,
        )

        const total = corrected.scores.reduce(
            (sum, score) => sum + score.probability,
            0,
        )

        expect(total).toBeCloseTo(1, 12)
    })

    it("changes low-score probabilities when rho is non-zero", () => {
        const poisson = normalizeScoreGrid(
            buildPoissonScoreGrid(1.5, 1.2, 12),
        )

        const corrected = applyDixonColes(
            poisson,
            1.5,
            1.2,
            -0.1,
        )

        const poisson00 = poisson.scores.find(
            (score) => score.home === 0 && score.away === 0,
        )

        const corrected00 = corrected.scores.find(
            (score) => score.home === 0 && score.away === 0,
        )

        expect(corrected00?.probability).not.toBeCloseTo(
            poisson00?.probability ?? 0,
            10,
        )
    })

    it("rejects invalid corrections", () => {
        const poisson = normalizeScoreGrid(
            buildPoissonScoreGrid(1.5, 1.2, 12),
        )

        expect(() =>
            applyDixonColes(
                poisson,
                1.5,
                1.2,
                10,
            ),
        ).toThrow()
    })
})
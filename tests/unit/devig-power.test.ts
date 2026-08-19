import { describe, expect, it } from "vitest"
import { devigPower } from "../../src/lib/model/devig-power"

describe("devigPower", () => {
    it("returns probabilities that sum to 1", () => {
        const result = devigPower([1.8, 3.6, 4.8])

        const total = result.probabilities.reduce(
            (sum, probability) => sum + probability,
            0,
        )

        expect(total).toBeCloseTo(1, 10)
    })

    it("preserves the ordering of implied probabilities", () => {
        const result = devigPower([1.5, 4, 7])

        expect(result.probabilities[0]).toBeGreaterThan(
            result.probabilities[1],
        )

        expect(result.probabilities[1]).toBeGreaterThan(
            result.probabilities[2],
        )
    })

    it("returns an exponent close to 1 for a fair market", () => {
        const odds = [2, 3, 6]
        const result = devigPower(odds)

        expect(result.exponent).toBeCloseTo(1, 10)
    })

    it("rejects invalid odds", () => {
        expect(() => devigPower([1, 2, 3])).toThrow()
        expect(() => devigPower([0, 2, 3])).toThrow()
        expect(() => devigPower([Number.NaN, 2, 3])).toThrow()
    })

    it("rejects a single odd", () => {
        expect(() => devigPower([2])).toThrow()
    })
})
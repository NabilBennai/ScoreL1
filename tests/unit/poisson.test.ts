import { describe, expect, it } from "vitest"
import { poissonPmf } from "../../src/lib/model/poisson"

describe("poissonPmf", () => {
  it("computes P(X = 0)", () => {
    expect(poissonPmf(0, 1)).toBeCloseTo(Math.exp(-1), 12)
  })

  it("computes known probabilities", () => {
    expect(poissonPmf(1, 1)).toBeCloseTo(Math.exp(-1), 12)
    expect(poissonPmf(2, 1)).toBeCloseTo(Math.exp(-1) / 2, 12)
  })

  it("rejects invalid k", () => {
    expect(() => poissonPmf(-1, 1)).toThrow()
    expect(() => poissonPmf(1.5, 1)).toThrow()
  })

  it("rejects invalid lambda", () => {
    expect(() => poissonPmf(1, 0)).toThrow()
    expect(() => poissonPmf(1, -1)).toThrow()
    expect(() => poissonPmf(1, Number.NaN)).toThrow()
  })
})

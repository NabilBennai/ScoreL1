export type PowerDevigResult = {
    probabilities: number[]
    exponent: number
}

export function devigPower(odds: number[]): PowerDevigResult {
    if (odds.length < 2) {
        throw new Error("At least two odds are required")
    }

    if (odds.some((odd) => !Number.isFinite(odd) || odd <= 1)) {
        throw new Error("Odds must be finite decimal values greater than 1")
    }

    const implied = odds.map((odd) => 1 / odd)

    const objective = (k: number) =>
        implied.reduce((sum, value) => sum + Math.pow(value, k), 0) - 1

    let low = 0.01
    let high = 10

    const lowValue = objective(low)
    const highValue = objective(high)

    if (lowValue < 0 || highValue > 0) {
        throw new Error("Unable to bracket POWER exponent")
    }

    for (let iteration = 0; iteration < 200; iteration++) {
        const mid = (low + high) / 2
        const value = objective(mid)

        if (Math.abs(value) < 1e-12) {
            low = mid
            high = mid
            break
        }

        if (value > 0) {
            low = mid
        } else {
            high = mid
        }
    }

    const exponent = (low + high) / 2
    const probabilities = implied.map((value) => Math.pow(value, exponent))

    return {
        probabilities,
        exponent,
    }
}
export function poissonPmf(k: number, lambda: number): number {
    if (!Number.isInteger(k) || k < 0) {
        throw new Error("k must be a non-negative integer")
    }

    if (!Number.isFinite(lambda) || lambda <= 0) {
        throw new Error("lambda must be a finite number greater than 0")
    }

    let factorial = 1

    for (let i = 2; i <= k; i++) {
        factorial *= i
    }

    return Math.exp(-lambda) * Math.pow(lambda, k) / factorial
}
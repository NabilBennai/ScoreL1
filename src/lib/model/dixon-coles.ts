import type { ScoreGrid, ScoreProbability } from "./score-grid"

export function dixonColesTau(
    homeGoals: number,
    awayGoals: number,
    lambdaHome: number,
    lambdaAway: number,
    rho: number,
): number {
    if (!Number.isFinite(rho)) {
        throw new Error("rho must be finite")
    }

    if (homeGoals === 0 && awayGoals === 0) {
        return 1 - lambdaHome * lambdaAway * rho
    }

    if (homeGoals === 0 && awayGoals === 1) {
        return 1 + lambdaHome * rho
    }

    if (homeGoals === 1 && awayGoals === 0) {
        return 1 + lambdaAway * rho
    }

    if (homeGoals === 1 && awayGoals === 1) {
        return 1 - rho
    }

    return 1
}

export function applyDixonColes(
    grid: ScoreGrid,
    lambdaHome: number,
    lambdaAway: number,
    rho: number,
): ScoreGrid {
    const correctedScores: ScoreProbability[] = grid.scores.map((score) => {
        const tau = dixonColesTau(
            score.home,
            score.away,
            lambdaHome,
            lambdaAway,
            rho,
        )

        if (tau <= 0) {
            throw new Error(
                `Invalid Dixon-Coles correction for score ${score.home}-${score.away}`,
            )
        }

        return {
            ...score,
            probability: score.probability * tau,
        }
    })

    const totalProbability = correctedScores.reduce(
        (sum, score) => sum + score.probability,
        0,
    )

    if (totalProbability <= 0) {
        throw new Error("Invalid Dixon-Coles probability grid")
    }

    const normalizedScores = correctedScores.map((score) => ({
        ...score,
        probability: score.probability / totalProbability,
    }))

    return {
        scores: normalizedScores,
        totalProbability: 1,
    }
}
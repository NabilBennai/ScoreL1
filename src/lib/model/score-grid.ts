import { poissonPmf } from "./poisson"

export type ScoreProbability = {
    home: number
    away: number
    probability: number
}

export type ScoreGrid = {
    scores: ScoreProbability[]
    totalProbability: number
}

export function buildPoissonScoreGrid(
    lambdaHome: number,
    lambdaAway: number,
    maxGoals = 12,
): ScoreGrid {
    if (!Number.isInteger(maxGoals) || maxGoals < 1) {
        throw new Error("maxGoals must be a positive integer")
    }

    const scores: ScoreProbability[] = []

    for (let home = 0; home <= maxGoals; home++) {
        const homeProbability = poissonPmf(home, lambdaHome)

        for (let away = 0; away <= maxGoals; away++) {
            const awayProbability = poissonPmf(away, lambdaAway)

            scores.push({
                home,
                away,
                probability: homeProbability * awayProbability,
            })
        }
    }

    const totalProbability = scores.reduce(
        (sum, score) => sum + score.probability,
        0,
    )

    return {
        scores,
        totalProbability,
    }
}

export function normalizeScoreGrid(grid: ScoreGrid): ScoreGrid {
    if (grid.totalProbability <= 0) {
        throw new Error("Cannot normalize an empty probability grid")
    }

    const scores = grid.scores.map((score) => ({
        ...score,
        probability: score.probability / grid.totalProbability,
    }))

    return {
        scores,
        totalProbability: 1,
    }
}
export type Score = {
  home: number
  away: number
}

export type RarityTier = {
  maxShareExclusive: number
  bonus: number
}

export type MppRules = {
  correctOutcomePoints: number
  rarityTiers: RarityTier[]
}

export function sameOutcome(a: Score, b: Score): boolean {
  const outcome = (score: Score) =>
    score.home > score.away ? "HOME" : score.home < score.away ? "AWAY" : "DRAW"

  return outcome(a) === outcome(b)
}

export function getRarityBonus(
  conditionalCrowdShare: number,
  rules: MppRules,
): number {
  if (
    !Number.isFinite(conditionalCrowdShare) ||
    conditionalCrowdShare < 0 ||
    conditionalCrowdShare > 1
  ) {
    throw new Error("Crowd share must be between 0 and 1")
  }

  const sorted = [...rules.rarityTiers].sort(
    (a, b) => a.maxShareExclusive - b.maxShareExclusive,
  )

  for (const tier of sorted) {
    if (conditionalCrowdShare < tier.maxShareExclusive) {
      return tier.bonus
    }
  }

  return 0
}

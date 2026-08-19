import type { MppRules } from "./mpp-rules"

export type MppModelConfig = {
  crowdAlpha: number
  rules: MppRules
}

export const DEV_MPP_CONFIG: MppModelConfig = {
  crowdAlpha: 1.35,

  rules: {
    correctOutcomePoints: 10,

    rarityTiers: [
      {
        maxShareExclusive: 0.005,
        bonus: 100,
      },
      {
        maxShareExclusive: 0.05,
        bonus: 70,
      },
      {
        maxShareExclusive: 0.2,
        bonus: 50,
      },
      {
        maxShareExclusive: 0.3,
        bonus: 30,
      },
      {
        maxShareExclusive: 1.01,
        bonus: 20,
      },
    ],
  },
}

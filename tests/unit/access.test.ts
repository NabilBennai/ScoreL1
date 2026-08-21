import { describe, expect, it } from "vitest"

import {
  type AccessLevel,
  hasPaidAccess,
} from "../../src/lib/data/supabase/access"

describe("hasPaidAccess", () => {
  it.each<AccessLevel>(["subscriber", "admin"])(
    "allows the %s access level",
    (accessLevel) => {
      expect(hasPaidAccess(accessLevel)).toBe(true)
    },
  )

  it.each<AccessLevel>(["anonymous", "user"])(
    "rejects the %s access level",
    (accessLevel) => {
      expect(hasPaidAccess(accessLevel)).toBe(false)
    },
  )
})

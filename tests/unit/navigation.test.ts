import { describe, expect, it } from "vitest"

import { getNavigationItems } from "../../src/app/navigation"

describe("getNavigationItems", () => {
  it.each(["anonymous", "user"] as const)(
    "does not expose prediction links to %s visitors",
    (accessLevel) => {
      expect(getNavigationItems(accessLevel)).toEqual([])
    },
  )

  it("shows predictions to subscribers", () => {
    expect(getNavigationItems("subscriber")).toEqual([
      { href: "/", label: "Pronostics" },
    ])
  })

  it("shows predictions and model administration to admins", () => {
    expect(getNavigationItems("admin")).toEqual([
      { href: "/", label: "Pronostics" },
      { href: "/admin", label: "Administration" },
    ])
  })
})

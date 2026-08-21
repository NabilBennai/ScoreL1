"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import AuthStatus from "./AuthStatus"
import type { NavigationItem } from "./navigation"

type NavigationLinksProps = {
  items: NavigationItem[]
}

export default function NavigationLinks({ items }: NavigationLinksProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [])

  return (
    <>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl border border-white/25 text-white transition hover:border-white/50 hover:bg-white/10 sm:hidden"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
          <span
            className={`h-0.5 w-full rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </span>
      </button>

      <div
        id="mobile-navigation"
        className={`${isOpen ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-2 border-t border-white/10 bg-pitch-950 px-5 py-4 shadow-xl sm:static sm:flex sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link text-center${isActive ? " nav-link-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-1 flex justify-center border-t border-white/10 pt-3 sm:mt-0 sm:border-0 sm:pt-0">
          <AuthStatus />
        </div>
      </div>
    </>
  )
}

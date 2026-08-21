import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google"
import { Suspense } from "react"

import { getCurrentAccessLevel } from "@/lib/data/supabase/access"

import NavigationLinks from "./NavigationLinks"
import { getNavigationItems } from "./navigation"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["600", "700"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mon Petit Prono Ligue 1",
  description:
    "Pronostics de scores exacts pour la Ligue 1, calculés à partir des probabilités de marché.",
}

async function AccessNavigationLinks() {
  const accessLevel = await getCurrentAccessLevel()
  return <NavigationLinks items={getNavigationItems(accessLevel)} />
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream-50 text-ink-900">
        <header className="site-header">
          <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="MPP Scores, accueil"
            >
              <span className="brand-mark" aria-hidden="true">
                <span className="brand-ball" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold uppercase leading-none tracking-[0.08em] text-white">
                  MPP Scores
                </span>
                <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-pitch-300">
                  Ligue 1 · Data lab
                </span>
              </span>
            </Link>

            <nav
              aria-label="Navigation principale"
              className="flex items-center"
            >
              <Suspense fallback={null}>
                <AccessNavigationLinks />
              </Suspense>
            </nav>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}

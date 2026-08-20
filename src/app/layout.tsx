import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google"
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
              className="flex items-center gap-2 sm:gap-5"
            >
              <Link href="/" className="nav-link nav-link-active">
                Pronostics
              </Link>
              <Link href="/admin" className="nav-link">
                <span className="hidden sm:inline">Le modèle</span>
                <span className="sm:hidden">Modèle</span>
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
          {children}
          <footer className="mt-auto border-t border-line bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p>MPP Scores · L&apos;analyse avant l&apos;intuition.</p>
              <p>Probabilités de marché · Poisson · Dixon-Coles</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

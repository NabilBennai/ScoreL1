import type { Metadata } from "next"
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
      <body className="min-h-full flex flex-col bg-cream-50 text-ink-900">
        {children}
      </body>
    </html>
  )
}

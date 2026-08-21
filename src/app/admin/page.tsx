import { redirect } from "next/navigation"

import { getCurrentUserProfile } from "@/lib/data/supabase/profile"

import EvaluationPanel from "./EvaluationPanel"
import PipelineRunner from "./PipelineRunner"

export default async function AdminPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== "admin") {
    redirect("/")
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
          Administration
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Pilotage des synchronisations, calculs et évaluations.
        </p>
      </div>

      <div className="space-y-8">
        <PipelineRunner />
        <EvaluationPanel />
      </div>
    </main>
  )
}

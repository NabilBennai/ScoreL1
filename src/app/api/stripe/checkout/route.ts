import { NextResponse } from "next/server"

import { createSupabaseAuthServerClient } from "@/lib/data/supabase/auth-server"
import { stripe } from "@/lib/stripe/stripe"

type CheckoutPlan = "monthly" | "yearly"

type CheckoutRequest = {
  plan?: CheckoutPlan
}

function getPriceId(plan: CheckoutPlan): string | null {
  if (plan === "monthly") {
    return process.env.STRIPE_PRICE_MONTHLY ?? null
  }

  if (plan === "yearly") {
    return process.env.STRIPE_PRICE_YEARLY ?? null
  }

  return null
}

export async function POST(request: Request) {
  const supabase = await createSupabaseAuthServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    )
  }

  let body: CheckoutRequest

  try {
    body = (await request.json()) as CheckoutRequest
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_REQUEST",
      },
      {
        status: 400,
      },
    )
  }

  if (body.plan !== "monthly" && body.plan !== "yearly") {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_PLAN",
      },
      {
        status: 400,
      },
    )
  }

  const priceId = getPriceId(body.plan)

  if (!priceId) {
    return NextResponse.json(
      {
        success: false,
        error: "STRIPE_PRICE_NOT_CONFIGURED",
      },
      {
        status: 500,
      },
    )
  }

  const origin = new URL(request.url).origin

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      customer_email: user.email ?? undefined,

      client_reference_id: user.id,

      metadata: {
        supabase_user_id: user.id,
        plan: body.plan,
      },

      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: body.plan,
        },
      },

      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    })

    if (!session.url) {
      return NextResponse.json(
        {
          success: false,
          error: "CHECKOUT_URL_MISSING",
        },
        {
          status: 500,
        },
      )
    }

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Stripe checkout creation failed", error)

    return NextResponse.json(
      {
        success: false,
        error: "CHECKOUT_CREATION_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}

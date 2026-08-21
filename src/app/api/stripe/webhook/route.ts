import { NextResponse } from "next/server"
import Stripe from "stripe"

import { supabaseAdmin } from "@/lib/data/supabase/admin-server"
import { stripe } from "@/lib/stripe/stripe"

function getSupabaseUserId(subscription: Stripe.Subscription): string | null {
  return subscription.metadata.supabase_user_id ?? null
}

async function activateSubscription(userId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    throw error
  }
}

async function deactivateSubscription(userId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    throw error
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
      },
      {
        status: 500,
      },
    )
  }

  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        error: "STRIPE_SIGNATURE_MISSING",
      },
      {
        status: 400,
      },
    )
  }

  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error)

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_STRIPE_SIGNATURE",
      },
      {
        status: 400,
      },
    )
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = getSupabaseUserId(subscription)

        if (!userId) {
          break
        }

        const activeStatuses = ["active", "trialing"]

        if (activeStatuses.includes(subscription.status)) {
          await activateSubscription(userId)
        } else {
          await deactivateSubscription(userId)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = getSupabaseUserId(subscription)

        if (userId) {
          await deactivateSubscription(userId)
        }

        break
      }

      default:
        break
    }

    return NextResponse.json({
      received: true,
    })
  } catch (error) {
    console.error("Stripe webhook processing failed", error)

    return NextResponse.json(
      {
        success: false,
        error: "WEBHOOK_PROCESSING_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}

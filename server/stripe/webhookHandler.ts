import { Request, Response } from "express";
import { stripe, constructWebhookEvent } from "./stripeService";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // Handle test events for webhook verification
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${event.type}:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;
  const customerId = session.customer as string;

  if (!userId) {
    console.error("[Webhook] No user_id in checkout session metadata");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }

  console.log(`[Webhook] Checkout completed for user ${userId}, plan: ${planId}`);

  // Handle lifetime purchase (one-time payment)
  if (session.mode === "payment" && planId === "lifetime") {
    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        subscriptionStatus: "lifetime",
        subscriptionPlan: "lifetime",
      })
      .where(eq(users.id, parseInt(userId)));
    
    console.log(`[Webhook] User ${userId} upgraded to lifetime plan`);
    return;
  }

  // For subscriptions, the subscription.created event will handle the rest
  if (session.subscription) {
    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: session.subscription as string,
      })
      .where(eq(users.id, parseInt(userId)));
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const db = await getDb();
  if (!db) return;

  // Find user by Stripe customer ID
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (userResults.length === 0) {
    console.error(`[Webhook] No user found for customer ${customerId}`);
    return;
  }

  const user = userResults[0];

  // Determine plan from price interval
  const priceId = subscription.items.data[0]?.price;
  let plan: "monthly" | "annual" = "monthly";
  
  if (priceId && typeof priceId !== "string") {
    const interval = priceId.recurring?.interval;
    if (interval === "year") {
      plan = "annual";
    }
  }

  // Map Stripe status to our status
  const statusMap: Record<string, "none" | "active" | "canceled" | "past_due"> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "none",
    incomplete_expired: "none",
    trialing: "active",
    paused: "canceled",
  };

  const status = statusMap[subscription.status] || "none";

  await db
    .update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionPlan: plan,
    })
    .where(eq(users.id, user.id));

  console.log(`[Webhook] Updated subscription for user ${user.id}: ${status} (${plan})`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const db = await getDb();
  if (!db) return;

  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (userResults.length === 0) return;

  const user = userResults[0];

  // Don't downgrade lifetime users
  if (user.subscriptionStatus === "lifetime") {
    console.log(`[Webhook] Ignoring subscription deletion for lifetime user ${user.id}`);
    return;
  }

  await db
    .update(users)
    .set({
      stripeSubscriptionId: null,
      subscriptionStatus: "none",
      subscriptionPlan: "none",
    })
    .where(eq(users.id, user.id));

  console.log(`[Webhook] Subscription deleted for user ${user.id}`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice paid: ${invoice.id}`);
  // Subscription status is handled by subscription.updated event
}

/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const db = await getDb();
  if (!db) return;

  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (userResults.length === 0) return;

  const user = userResults[0];

  // Don't affect lifetime users
  if (user.subscriptionStatus === "lifetime") return;

  await db
    .update(users)
    .set({
      subscriptionStatus: "past_due",
    })
    .where(eq(users.id, user.id));

  console.log(`[Webhook] Payment failed for user ${user.id}`);
}

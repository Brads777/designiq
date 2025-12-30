import Stripe from "stripe";
import { ENV } from "../_core/env";
import { SUBSCRIPTION_PLANS, PlanId } from "./products";

// Initialize Stripe with the secret key
const stripe = new Stripe(ENV.stripeSecretKey || "");

export { stripe };

/**
 * Create a Stripe Checkout session for a subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  planId,
  origin,
}: {
  userId: number;
  userEmail: string;
  userName: string | null;
  planId: PlanId;
  origin: string;
}): Promise<{ url: string }> {
  const plan = SUBSCRIPTION_PLANS[planId];
  
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  const isLifetime = plan.interval === "one_time";

  // Create checkout session parameters
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: isLifetime ? "payment" : "subscription",
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    allow_promotion_codes: true,
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=true`,
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || "",
      plan_id: planId,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `DesignIQ ${plan.name}`,
            description: plan.description,
          },
          unit_amount: plan.price,
          ...(isLifetime ? {} : { recurring: { interval: plan.interval } }),
        },
        quantity: 1,
      },
    ],
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url };
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateCustomer({
  userId,
  email,
  name,
  existingCustomerId,
}: {
  userId: number;
  email: string;
  name: string | null;
  existingCustomerId: string | null;
}): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      user_id: userId.toString(),
    },
  });

  return customer.id;
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subData = subscription as unknown as {
      status: string;
      current_period_end: number;
      cancel_at_period_end: boolean;
    };
    return {
      status: subData.status,
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
      cancelAtPeriodEnd: subData.cancel_at_period_end,
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Create a billing portal session for subscription management
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

/**
 * Verify webhook signature and construct event
 */
export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    ENV.stripeWebhookSecret || ""
  );
}

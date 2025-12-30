/**
 * DesignIQ Subscription Products
 * 
 * These are the subscription tiers available for DesignIQ.
 * Prices are in cents (USD).
 */

export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    description: "Full access to DesignIQ with monthly billing",
    price: 2000, // $20.00
    priceDisplay: "$20",
    interval: "month" as const,
    features: [
      "Unlimited book projects",
      "All interior themes",
      "Amazon KDP cover calculator",
      "IDML export for InDesign",
      "PDF export for print",
      "Copyright page generator",
      "Style mapping & detection",
      "Priority support"
    ]
  },
  annual: {
    id: "annual",
    name: "Annual",
    description: "Full access to DesignIQ with annual billing (save $40)",
    price: 20000, // $200.00
    priceDisplay: "$200",
    interval: "year" as const,
    savings: "$40",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Early access to new features"
    ]
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    description: "One-time payment for permanent access",
    price: 60000, // $600.00
    priceDisplay: "$600",
    interval: "one_time" as const,
    features: [
      "Everything in Annual",
      "Never pay again",
      "All future updates included",
      "Founding member badge"
    ]
  }
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export const DEMO_LIMITS = {
  maxProjects: 1,
  maxExports: 0,
  watermarkEnabled: true,
  themesAvailable: ["classic-fiction"], // Only one theme in demo
  coverDesignerEnabled: false,
  idmlExportEnabled: false,
  pdfExportEnabled: false
} as const;

export const SUBSCRIBER_FEATURES = {
  maxProjects: Infinity,
  maxExports: Infinity,
  watermarkEnabled: false,
  themesAvailable: ["classic-fiction", "modern-business", "academic"],
  coverDesignerEnabled: true,
  idmlExportEnabled: true,
  pdfExportEnabled: true
} as const;

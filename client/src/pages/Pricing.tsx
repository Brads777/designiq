import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function Pricing() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: plansData } = trpc.subscription.plans.useQuery();
  const { data: subscriptionStatus } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubscribe = (planId: "monthly" | "annual" | "lifetime") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    createCheckout.mutate({ planId });
  };

  const isSubscribed = subscriptionStatus?.isSubscribed;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">D</span>
              </div>
              <span className="font-semibold">DesignIQ</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your Word documents into professional, print-ready books.
            No trial period — try our demo to see DesignIQ in action.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Monthly</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                Perfect for occasional publishers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited book projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All interior themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Amazon KDP cover calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>IDML export for InDesign</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>PDF export for print</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleSubscribe("monthly")}
                disabled={createCheckout.isPending || isSubscribed}
              >
                {createCheckout.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubscribed ? "Current Plan" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Annual</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$200</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <CardDescription>
                Save $40 — 2 months free!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">2 months free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSubscribe("annual")}
                disabled={createCheckout.isPending || isSubscribed}
              >
                {createCheckout.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubscribed ? "Current Plan" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>

          {/* Lifetime Plan */}
          <Card className="relative bg-gradient-to-b from-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Lifetime</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$600</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <CardDescription>
                Pay once, use forever
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Everything in Annual</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Never pay again</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All future updates included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Founding member badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Direct support channel</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleSubscribe("lifetime")}
                disabled={createCheckout.isPending || (isSubscribed && subscriptionStatus?.plan === "lifetime")}
              >
                {createCheckout.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {subscriptionStatus?.plan === "lifetime" ? "Lifetime Member" : "Get Lifetime Access"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-muted/50 border border-border">
            <h2 className="text-2xl font-bold mb-4">Try Before You Buy</h2>
            <p className="text-muted-foreground mb-6">
              Not sure if DesignIQ is right for you? Try our demo mode to see the full 
              workflow — from uploading your Word document to previewing your formatted book.
              Demo exports include a watermark.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/")}
            >
              Try Demo Mode
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards through Stripe, including Visa, Mastercard, 
                American Express, and Discover.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have 
                access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What's included in the demo?</h3>
              <p className="text-muted-foreground">
                The demo includes full access to upload documents, apply themes, and preview 
                your book. Exports in demo mode include a watermark. Subscribe to remove 
                watermarks and unlock all export options.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all subscription plans. If you're 
                not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

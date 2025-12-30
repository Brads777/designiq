import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function SubscriptionSuccess() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Refetch subscription status on mount
  useEffect(() => {
    utils.subscription.status.invalidate();
    utils.auth.me.invalidate();
  }, []);

  const { data: subscriptionStatus, isLoading } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 2000, // Poll for updates
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Welcome to DesignIQ!</CardTitle>
          <CardDescription>
            Your subscription is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Thank you for subscribing! You now have full access to all DesignIQ features.
            </p>
          </div>

          {subscriptionStatus && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Your Plan</span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {subscriptionStatus.plan === "lifetime" 
                  ? "Lifetime Access" 
                  : `${subscriptionStatus.plan} Subscription`}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setLocation("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/")}
            >
              Return Home
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

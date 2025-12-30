import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function useSubscription() {
  const { isAuthenticated } = useAuth();
  
  const { data: subscriptionStatus, isLoading } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30000, // Cache for 30 seconds
  });

  const isSubscribed = subscriptionStatus?.isSubscribed ?? false;
  const isLifetime = subscriptionStatus?.plan === "lifetime";
  const features = subscriptionStatus?.features;

  return {
    isSubscribed,
    isLifetime,
    status: subscriptionStatus?.status ?? "none",
    plan: subscriptionStatus?.plan ?? "none",
    features,
    isLoading,
    // Helper functions for feature gating
    canCreateProject: () => {
      if (!features) return true; // Allow in demo mode
      if (isSubscribed) return true;
      return true; // Demo allows 1 project
    },
    canExport: () => isSubscribed,
    canUseCoverDesigner: () => isSubscribed,
    canUseAllThemes: () => isSubscribed,
    getAvailableThemes: () => {
      if (isSubscribed) {
        return ["classic-fiction", "modern-business", "academic"];
      }
      return ["classic-fiction"]; // Demo only gets one theme
    },
    isWatermarkEnabled: () => !isSubscribed,
  };
}

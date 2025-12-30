import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Sparkles, Lock, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoModeIndicatorProps {
  variant?: "banner" | "badge" | "inline";
  showUpgrade?: boolean;
}

export function DemoModeIndicator({ variant = "badge", showUpgrade = true }: DemoModeIndicatorProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const [, setLocation] = useLocation();

  if (isLoading || isSubscribed) return null;

  if (variant === "banner") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-amber-500">Demo Mode</p>
            <p className="text-sm text-muted-foreground">
              Exports include watermarks. Upgrade for full access.
            </p>
          </div>
        </div>
        {showUpgrade && (
          <Button variant="outline" size="sm" onClick={() => setLocation("/pricing")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-amber-500">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Demo Mode</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="border-amber-500/50 text-amber-500 cursor-help">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Demo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Demo mode - exports include watermarks</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface FeatureGateProps {
  feature: "export" | "cover" | "allThemes" | "unlimitedProjects";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { isSubscribed, canExport, canUseCoverDesigner, canUseAllThemes } = useSubscription();
  const [, setLocation] = useLocation();

  const checkFeature = () => {
    switch (feature) {
      case "export":
        return canExport();
      case "cover":
        return canUseCoverDesigner();
      case "allThemes":
        return canUseAllThemes();
      case "unlimitedProjects":
        return isSubscribed;
      default:
        return true;
    }
  };

  if (checkFeature()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-4">
          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-2">Premium Feature</p>
          <Button size="sm" onClick={() => setLocation("/pricing")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Unlock
          </Button>
        </div>
      </div>
    </div>
  );
}

interface WatermarkOverlayProps {
  children: React.ReactNode;
}

export function WatermarkOverlay({ children }: WatermarkOverlayProps) {
  const { isWatermarkEnabled } = useSubscription();

  if (!isWatermarkEnabled()) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="text-6xl font-bold text-muted-foreground/10 rotate-[-30deg] whitespace-nowrap">
          DEMO • DESIGNIQ • DEMO • DESIGNIQ
        </div>
      </div>
    </div>
  );
}

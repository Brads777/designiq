import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  ArrowLeft,
  User,
  Bell,
  Palette,
  CreditCard,
  Shield,
  Loader2
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { isSubscribed, plan, status } = useSubscription();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    updateSettings.mutate({ [key]: value });
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{user?.name || "Not set"}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Login Method</Label>
                  <p className="font-medium capitalize">{user?.loginMethod || "OAuth"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle>Subscription</CardTitle>
                </div>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {plan === "none" ? "Demo Mode" : `${plan} ${status === "lifetime" ? "" : "Subscription"}`}
                    </p>
                  </div>
                  {isSubscribed && plan !== "lifetime" ? (
                    <Button 
                      variant="outline"
                      onClick={() => createPortalSession.mutate()}
                      disabled={createPortalSession.isPending}
                    >
                      {createPortalSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Manage Billing
                    </Button>
                  ) : !isSubscribed ? (
                    <Button onClick={() => setLocation("/pricing")}>
                      Upgrade
                    </Button>
                  ) : null}
                </div>
                {status === "lifetime" && (
                  <div className="p-3 rounded-lg bg-primary/10 text-sm">
                    <p className="font-medium text-primary">Lifetime Member</p>
                    <p className="text-muted-foreground">You have permanent access to all features.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Configure how you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your projects
                    </p>
                  </div>
                  <Switch
                    checked={settings?.emailNotifications ?? true}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive tips, updates, and special offers
                    </p>
                  </div>
                  <Switch
                    checked={settings?.marketingEmails ?? false}
                    onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Preferences</CardTitle>
                </div>
                <CardDescription>
                  Customize your default project settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Default Theme</Label>
                  <Select
                    value={settings?.defaultTheme ?? "classic-fiction"}
                    onValueChange={(value) => handleSettingChange("defaultTheme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic-fiction">Classic Fiction</SelectItem>
                      <SelectItem value="modern-business">Modern Business</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Default Paper Type</Label>
                  <Select
                    value={settings?.defaultPaperType ?? "cream"}
                    onValueChange={(value) => handleSettingChange("defaultPaperType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Default Trim Size</Label>
                  <Select
                    value={settings?.defaultTrimSize ?? "6x9"}
                    onValueChange={(value) => handleSettingChange("defaultTrimSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5x8">5" x 8"</SelectItem>
                      <SelectItem value="5.5x8.5">5.5" x 8.5"</SelectItem>
                      <SelectItem value="6x9">6" x 9"</SelectItem>
                      <SelectItem value="7x10">7" x 10"</SelectItem>
                      <SelectItem value="8.5x11">8.5" x 11"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Tutorial Tips</Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tips throughout the app
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showTutorialTips ?? true}
                    onCheckedChange={(checked) => handleSettingChange("showTutorialTips", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more condensed layout
                    </p>
                  </div>
                  <Switch
                    checked={settings?.compactView ?? false}
                    onCheckedChange={(checked) => handleSettingChange("compactView", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Privacy & Security</CardTitle>
                </div>
                <CardDescription>
                  Manage your data and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Terms of Service</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.hasAcceptedTos ? "Accepted" : "Not accepted"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/onboarding")}>
                    View Terms
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your project data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Feature coming soon")}>
                    Export
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => toast.info("Please contact support")}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

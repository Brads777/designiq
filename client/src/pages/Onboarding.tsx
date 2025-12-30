import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  BookOpen, 
  FileText, 
  Palette, 
  Download, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  Layers,
  Crown,
  Shield,
  Loader2
} from "lucide-react";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to DesignIQ",
    description: "Let's get you set up to create beautiful books",
    icon: Sparkles,
  },
  {
    id: "terms",
    title: "Terms of Service",
    description: "Please review and accept our terms",
    icon: Shield,
  },
  {
    id: "tour-upload",
    title: "Upload Your Manuscript",
    description: "Start by uploading your Word document",
    icon: Upload,
  },
  {
    id: "tour-styles",
    title: "Style Detection",
    description: "We automatically detect and map your document styles",
    icon: Layers,
  },
  {
    id: "tour-themes",
    title: "Choose Your Theme",
    description: "Select from professional book interior designs",
    icon: Palette,
  },
  {
    id: "tour-cover",
    title: "Design Your Cover",
    description: "Create Amazon KDP-compliant covers",
    icon: BookOpen,
  },
  {
    id: "tour-export",
    title: "Export Your Book",
    description: "Generate print-ready PDF or IDML files",
    icon: Download,
  },
  {
    id: "subscription",
    title: "Choose Your Plan",
    description: "Select a subscription or try the demo",
    icon: Crown,
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start creating your first book",
    icon: CheckCircle2,
  },
];

export default function Onboarding() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [tosAccepted, setTosAccepted] = useState(false);
  const utils = trpc.useUtils();

  const acceptTos = trpc.onboarding.acceptTos.useMutation({
    onSuccess: () => {
      toast.success("Terms accepted");
      nextStep();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const completeOnboarding = trpc.onboarding.complete.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Onboarding complete!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateStep = trpc.onboarding.updateStep.useMutation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  // Resume from saved step
  useEffect(() => {
    if (user?.onboardingStep && user.onboardingStep > 0) {
      setCurrentStep(user.onboardingStep);
    }
    if (user?.hasAcceptedTos) {
      setTosAccepted(true);
    }
  }, [user]);

  const nextStep = () => {
    const newStep = Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1);
    setCurrentStep(newStep);
    updateStep.mutate({ step: newStep });
  };

  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 0);
    setCurrentStep(newStep);
  };

  const handleTosAccept = () => {
    if (!tosAccepted) {
      toast.error("Please accept the terms of service");
      return;
    }
    acceptTos.mutate();
  };

  const handleComplete = () => {
    completeOnboarding.mutate();
  };

  const handleSkipToDemo = () => {
    completeOnboarding.mutate();
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription className="text-base">
              {step.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Welcome Step */}
            {step.id === "welcome" && (
              <div className="space-y-6">
                <p className="text-center text-muted-foreground">
                  DesignIQ transforms your Word documents into professionally formatted, 
                  print-ready books. Let's walk through the key features.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Upload DOCX</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Palette className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Apply Themes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Design Covers</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Export Files</p>
                  </div>
                </div>
              </div>
            )}

            {/* Terms of Service Step */}
            {step.id === "terms" && (
              <div className="space-y-6">
                <div className="h-64 overflow-y-auto p-4 rounded-lg bg-muted/30 border border-border text-sm">
                  <h3 className="font-semibold mb-4">Terms of Service</h3>
                  <p className="mb-4">
                    Welcome to DesignIQ. By using our service, you agree to the following terms:
                  </p>
                  <h4 className="font-medium mb-2">1. Service Description</h4>
                  <p className="mb-4 text-muted-foreground">
                    DesignIQ provides document formatting and book publishing preparation tools. 
                    We convert Word documents into print-ready formats suitable for Amazon KDP 
                    and other print-on-demand services.
                  </p>
                  <h4 className="font-medium mb-2">2. User Responsibilities</h4>
                  <p className="mb-4 text-muted-foreground">
                    You are responsible for ensuring you have the rights to any content you upload. 
                    You retain all intellectual property rights to your original content.
                  </p>
                  <h4 className="font-medium mb-2">3. Subscription & Billing</h4>
                  <p className="mb-4 text-muted-foreground">
                    Subscriptions are billed according to the plan selected. You may cancel at any time. 
                    Refunds are available within 30 days of purchase.
                  </p>
                  <h4 className="font-medium mb-2">4. Privacy</h4>
                  <p className="mb-4 text-muted-foreground">
                    We respect your privacy. Your documents are processed securely and are not 
                    shared with third parties. See our Privacy Policy for details.
                  </p>
                  <h4 className="font-medium mb-2">5. Limitation of Liability</h4>
                  <p className="text-muted-foreground">
                    DesignIQ is provided "as is" without warranties. We are not liable for any 
                    damages arising from the use of our service.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tos" 
                    checked={tosAccepted}
                    onCheckedChange={(checked) => setTosAccepted(checked === true)}
                  />
                  <label 
                    htmlFor="tos" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
              </div>
            )}

            {/* Tour Steps */}
            {step.id === "tour-upload" && (
              <div className="space-y-6">
                <div className="aspect-video rounded-lg bg-muted/30 border border-border flex items-center justify-center">
                  <div className="text-center p-8">
                    <Upload className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                    <p className="text-muted-foreground">
                      Drag and drop your .docx file or click to browse
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">How it works:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Upload any Word document (.docx format)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      We extract text, chapters, and formatting
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Review detected styles before proceeding
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step.id === "tour-styles" && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <span className="text-sm">Heading 1</span>
                      <span className="text-sm text-primary">→ Chapter Title</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <span className="text-sm">Normal</span>
                      <span className="text-sm text-primary">→ Body Text</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <span className="text-sm">Quote</span>
                      <span className="text-sm text-primary">→ Block Quote</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Automatic Style Mapping:</h4>
                  <p className="text-sm text-muted-foreground">
                    DesignIQ intelligently detects Word styles and maps them to professional 
                    book formatting. You can review and adjust mappings before applying.
                  </p>
                </div>
              </div>
            )}

            {step.id === "tour-themes" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-primary bg-primary/5 text-center">
                    <div className="h-20 mb-2 rounded bg-gradient-to-b from-amber-900/20 to-amber-950/20" />
                    <p className="text-xs font-medium">Classic Fiction</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <div className="h-20 mb-2 rounded bg-gradient-to-b from-slate-100 to-slate-200" />
                    <p className="text-xs font-medium">Modern Business</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <div className="h-20 mb-2 rounded bg-gradient-to-b from-stone-100 to-stone-200" />
                    <p className="text-xs font-medium">Academic</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Each theme includes typography, spacing, headers, footers, and chapter styling 
                  optimized for professional printing.
                </p>
              </div>
            )}

            {step.id === "tour-cover" && (
              <div className="space-y-6">
                <div className="flex gap-4 justify-center">
                  <div className="w-24 h-36 rounded bg-gradient-to-br from-primary/20 to-primary/40 border border-border flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Back</span>
                  </div>
                  <div className="w-4 h-36 rounded bg-primary/30 flex items-center justify-center">
                    <span className="text-[8px] text-muted-foreground rotate-90">Spine</span>
                  </div>
                  <div className="w-24 h-36 rounded bg-gradient-to-br from-primary/40 to-primary/60 border border-border flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Front</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Amazon KDP Compliant:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Automatic spine width calculation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Bleed and safe zone guides
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      Multiple trim sizes supported
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step.id === "tour-export" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border text-center">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-red-500" />
                    <p className="font-medium">PDF Export</p>
                    <p className="text-xs text-muted-foreground">Print-ready files</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <Layers className="h-10 w-10 mx-auto mb-2 text-purple-500" />
                    <p className="font-medium">IDML Export</p>
                    <p className="text-xs text-muted-foreground">For Adobe InDesign</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Export your formatted book as a print-ready PDF or as an IDML file 
                  for further editing in Adobe InDesign.
                </p>
              </div>
            )}

            {/* Subscription Step */}
            {step.id === "subscription" && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly</p>
                      <p className="text-sm text-muted-foreground">$20/month</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/pricing")}>
                      Select
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-primary bg-primary/5 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Annual</p>
                      <p className="text-sm text-muted-foreground">$200/year (save $40)</p>
                    </div>
                    <Button size="sm" onClick={() => setLocation("/pricing")}>
                      Select
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lifetime</p>
                      <p className="text-sm text-muted-foreground">$600 one-time</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/pricing")}>
                      Select
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <Button variant="link" onClick={handleSkipToDemo}>
                    Skip for now — try demo mode
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {step.id === "complete" && (
              <div className="space-y-6 text-center">
                <div className="p-6 rounded-lg bg-primary/5">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">You're ready to create!</p>
                  <p className="text-muted-foreground">
                    Start your first book project and transform your manuscript into a 
                    professionally formatted, print-ready book.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6">
            {currentStep > 0 && step.id !== "complete" ? (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step.id === "terms" ? (
              <Button 
                onClick={handleTosAccept} 
                disabled={!tosAccepted || acceptTos.isPending}
              >
                {acceptTos.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accept & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : step.id === "complete" ? (
              <Button onClick={handleComplete} disabled={completeOnboarding.isPending}>
                {completeOnboarding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : step.id === "subscription" ? (
              <Button onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Skip link */}
        {currentStep > 1 && step.id !== "complete" && step.id !== "terms" && (
          <div className="text-center mt-4">
            <Button variant="link" className="text-muted-foreground" onClick={handleSkipToDemo}>
              Skip tutorial
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

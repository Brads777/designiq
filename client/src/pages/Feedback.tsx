import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Bug,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";

const FEEDBACK_TYPES = [
  { id: "bug", label: "Bug Report", description: "Something isn't working correctly", icon: Bug },
  { id: "feature", label: "Feature Request", description: "Suggest a new feature or improvement", icon: Lightbulb },
  { id: "general", label: "General Feedback", description: "Share your thoughts or experience", icon: MessageSquare },
  { id: "support", label: "Support Request", description: "Get help with a specific issue", icon: HelpCircle },
] as const;

export default function Feedback() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general" | "support">("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Feedback submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    submitFeedback.mutate({
      type: feedbackType,
      subject: subject.trim(),
      message: message.trim(),
      pageUrl: window.location.href,
      browserInfo: navigator.userAgent
    });
  };

  const handleNewFeedback = () => {
    setSubmitted(false);
    setFeedbackType("general");
    setSubject("");
    setMessage("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to submit feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your feedback has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              We appreciate you taking the time to share your thoughts. 
              Our team will review your feedback and get back to you if needed.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleNewFeedback}>
                Submit Another
              </Button>
              <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/help")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Send Feedback</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>We'd love to hear from you</CardTitle>
            <CardDescription>
              Your feedback helps us improve DesignIQ for everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-3">
                <Label>What type of feedback is this?</Label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}
                  className="grid grid-cols-2 gap-4"
                >
                  {FEEDBACK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.id}>
                        <RadioGroupItem
                          value={type.id}
                          id={type.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type.id}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Icon className="mb-2 h-6 w-6" />
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            {type.description}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of your feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={255}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder={
                    feedbackType === "bug"
                      ? "Please describe the issue in detail. Include steps to reproduce if possible."
                      : feedbackType === "feature"
                      ? "Describe the feature you'd like to see and how it would help you."
                      : feedbackType === "support"
                      ? "Describe the issue you're experiencing and what you've tried so far."
                      : "Share your thoughts, suggestions, or experience with DesignIQ."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>

              {/* User Info */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Submitting as <span className="font-medium text-foreground">{user?.email || user?.name}</span>
                </p>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

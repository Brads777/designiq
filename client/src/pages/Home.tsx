import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Palette, 
  Download, 
  CheckCircle2,
  ArrowRight,
  BookMarked,
  Layers,
  Wand2,
  Star,
  Users,
  Zap,
  Shield,
  Clock,
  Check,
  Play,
  LogIn,
  Image as ImageIcon,
  Quote,
  Layout
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const handleSignIn = () => {
    window.location.href = getLoginUrl();
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToDemo = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DesignIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={scrollToDemo} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </button>
            <button onClick={scrollToPricing} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button onClick={() => setLocation("/dashboard")}>
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleSignIn} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button onClick={handleGetStarted}>
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Book Publishing Made Simple</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="text-primary">Word Documents</span>
              <br />
              <span className="text-foreground">Into Print-Ready Books</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              DesignIQ uses professional typesetting algorithms to convert your manuscripts 
              into beautifully formatted books ready for Amazon KDP and print-on-demand services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6 gap-2">
                <Zap className="h-5 w-5" />
                Start Your Book Free
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToDemo} className="text-lg px-8 py-6 bg-transparent gap-2">
                <Play className="h-5 w-5" />
                See How It Works
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>2,500+ authors</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Stats */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">Books Published</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2.5K+</div>
              <div className="text-sm text-muted-foreground">Happy Authors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">99%</div>
              <div className="text-sm text-muted-foreground">KDP Approval Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">5 min</div>
              <div className="text-sm text-muted-foreground">Average Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Publish</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From manuscript to print-ready files, DesignIQ handles every step of the book formatting process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your manuscript into a professional book in minutes, not hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={handleGetStarted} className="gap-2">
              Try It Now - It's Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Interior Themes Preview */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Templates</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Interior Themes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from beautifully designed themes or customize every detail to match your vision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {themes.map((theme, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="w-3/4 h-4/5 bg-background rounded shadow-lg p-4 flex flex-col group-hover:scale-105 transition-transform">
                    <div className={`text-center mb-4 ${theme.titleStyle}`}>
                      <div className="text-xs text-muted-foreground mb-1">CHAPTER ONE</div>
                      <div className="text-lg font-bold">The Beginning</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-2 bg-muted rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Authors Worldwide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience with DesignIQ.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Monthly */}
            <Card className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Monthly</h3>
                  <div className="text-4xl font-bold mb-1">$20<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {pricingFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Annual - Most Popular */}
            <Card className="relative overflow-hidden border-primary shadow-lg shadow-primary/10">
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Most Popular - Save 17%
              </div>
              <CardContent className="pt-10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Annual</h3>
                  <div className="text-4xl font-bold mb-1">$200<span className="text-lg font-normal text-muted-foreground">/yr</span></div>
                  <p className="text-sm text-muted-foreground">$16.67/month, billed annually</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {pricingFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                Best Value
              </div>
              <CardContent className="pt-10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Lifetime</h3>
                  <div className="text-4xl font-bold mb-1">$600</div>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {pricingFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    All future updates
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={handleGetStarted}>
                  Get Lifetime Access
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              All plans include a demo mode to try before you buy. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DesignIQ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how we compare to traditional book formatting methods.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">DesignIQ</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Hire Designer</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">DIY InDesign</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.designiq === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-primary font-medium">{row.designiq}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{row.designer}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{row.diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Start publishing in under 5 minutes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Publish Your Book?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of authors who trust DesignIQ to format their books 
              with professional quality and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6 gap-2">
                <Zap className="h-5 w-5" />
                Start Formatting Now
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToPricing} className="text-lg px-8 py-6 bg-transparent">
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Demo mode available • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">DesignIQ</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional book publishing platform for authors who demand quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={scrollToPricing} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => setLocation("/help")} className="hover:text-foreground transition-colors">Help Center</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><button onClick={() => setLocation("/feedback")} className="hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DesignIQ. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                SSL Secured
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                2,500+ Users
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: FileText,
    title: "Smart Document Parsing",
    description: "Upload your Word document and our AI automatically detects styles, chapters, and formatting."
  },
  {
    icon: Palette,
    title: "Amazon KDP Cover Generator",
    description: "Create print-ready covers with automatic spine width calculation based on page count."
  },
  {
    icon: BookMarked,
    title: "Professional Interior Themes",
    description: "Choose from Classic Fiction, Modern Business, or Academic themes with full customization."
  },
  {
    icon: Layout,
    title: "Chapter Templates",
    description: "Multiple intro and body templates with drop caps, images, and decorative elements."
  },
  {
    icon: ImageIcon,
    title: "Graphic Novel Support",
    description: "Full-page image layouts, panel grids, and speech bubble support for visual storytelling."
  },
  {
    icon: Quote,
    title: "Pull Quotes & Callouts",
    description: "Add emphasis with styled pull quotes, tips, warnings, and callout boxes."
  },
  {
    icon: Layers,
    title: "Headers & Footers",
    description: "Customizable running headers, page numbers, and chapter-aware formatting."
  },
  {
    icon: Wand2,
    title: "Copyright Page Generator",
    description: "Smart templates for ISBN, publisher info, and legal text with easy editing."
  },
  {
    icon: Download,
    title: "IDML & PDF Export",
    description: "Export to InDesign-compatible IDML or print-ready PDF with professional typesetting."
  }
];

const steps = [
  {
    title: "Upload Your Manuscript",
    description: "Simply upload your Word document. DesignIQ will analyze the structure and detect your styles automatically."
  },
  {
    title: "Customize Your Design",
    description: "Choose a theme, design your cover, and fine-tune every detail of your book's interior."
  },
  {
    title: "Export & Publish",
    description: "Download print-ready PDF or IDML files, ready for Amazon KDP or your preferred print service."
  }
];

const themes = [
  {
    name: "Classic Fiction",
    description: "Elegant serif typography perfect for novels and literary works.",
    titleStyle: "font-serif"
  },
  {
    name: "Modern Business",
    description: "Clean sans-serif design ideal for non-fiction and business books.",
    titleStyle: "font-sans"
  },
  {
    name: "Academic",
    description: "Formal layout with footnote support for scholarly publications.",
    titleStyle: "font-serif italic"
  }
];

const testimonials = [
  {
    quote: "DesignIQ saved me weeks of work. My book looked professional from the first export. Amazon approved it on the first try!",
    name: "Sarah Mitchell",
    title: "Self-Published Author"
  },
  {
    quote: "As someone who publishes 4-5 books a year, this tool has become indispensable. The time savings alone are worth every penny.",
    name: "James Rodriguez",
    title: "Romance Author"
  },
  {
    quote: "I was skeptical at first, but the quality rivals what I used to pay $500+ for from professional formatters.",
    name: "Emily Chen",
    title: "Non-Fiction Writer"
  }
];

const pricingFeatures = [
  "Unlimited book projects",
  "All interior themes",
  "Amazon KDP cover generator",
  "IDML & PDF export",
  "Chapter templates",
  "Graphic novel mode",
  "Headers & footers customization"
];

const comparisonFeatures = [
  { feature: "Setup Time", designiq: "5 minutes", designer: "1-2 weeks", diy: "Days to learn" },
  { feature: "Cost", designiq: "From $20/mo", designer: "$300-1000+", diy: "$20/mo + time" },
  { feature: "Amazon KDP Ready", designiq: true, designer: "Usually", diy: "Manual" },
  { feature: "Revisions", designiq: "Unlimited", designer: "Limited", diy: "Unlimited" },
  { feature: "Learning Curve", designiq: "None", designer: "None", diy: "Steep" },
  { feature: "Consistent Quality", designiq: true, designer: "Varies", diy: "Varies" },
];

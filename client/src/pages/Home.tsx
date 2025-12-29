import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  Wand2
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
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button onClick={() => setLocation("/dashboard")}>
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
                Start Your Book
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Publish</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From manuscript to print-ready files, DesignIQ handles every step of the book formatting process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
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
      <section className="py-24 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your manuscript into a professional book.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interior Themes Preview */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Interior Themes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from beautifully designed themes or customize every detail to match your vision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {themes.map((theme, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="w-3/4 h-4/5 bg-background rounded shadow-lg p-4 flex flex-col">
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

      {/* CTA Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Publish Your Book?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of authors who trust DesignIQ to format their books 
              with professional quality and precision.
            </p>
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              Start Formatting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">DesignIQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DesignIQ. Professional Book Publishing Platform.
            </p>
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
    icon: Layers,
    title: "Chapter Styling",
    description: "Beautiful chapter openings with drop caps, custom headers, and professional formatting."
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

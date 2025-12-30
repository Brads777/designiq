import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  Search,
  BookOpen,
  Upload,
  Palette,
  Download,
  FileText,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";

const HELP_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Sparkles,
    articles: [
      { title: "Creating your first project", content: "Start by clicking 'New Project' on your dashboard. Give your book a title and optionally add the author name. You'll then be taken to the project editor where you can upload your manuscript." },
      { title: "Understanding the workflow", content: "DesignIQ follows a simple workflow: Upload → Style → Theme → Cover → Export. Each step builds on the previous one, guiding you from raw manuscript to print-ready book." },
      { title: "Demo vs. Subscription", content: "Demo mode lets you explore all features with one project. Exports include a watermark. Subscribe to remove watermarks, create unlimited projects, and unlock all export options." },
    ]
  },
  {
    id: "uploading",
    title: "Uploading Documents",
    icon: Upload,
    articles: [
      { title: "Supported file formats", content: "DesignIQ accepts Microsoft Word documents (.docx). For best results, use Word's built-in styles (Heading 1, Heading 2, Normal, etc.) to structure your document." },
      { title: "Preparing your manuscript", content: "Before uploading, ensure your document uses consistent formatting. Use Heading 1 for chapter titles, Normal for body text, and apply styles consistently throughout." },
      { title: "Style detection", content: "When you upload a document, DesignIQ automatically detects the styles used and maps them to book formatting. You can review and adjust these mappings before applying." },
    ]
  },
  {
    id: "themes",
    title: "Themes & Styling",
    icon: Palette,
    articles: [
      { title: "Available themes", content: "Choose from three professional themes: Classic Fiction (elegant serif typography), Modern Business (clean sans-serif design), and Academic (formal scholarly formatting)." },
      { title: "Customizing styles", content: "Each theme can be customized. Adjust fonts, sizes, margins, line spacing, and more to match your vision. Changes preview in real-time." },
      { title: "Chapter styling", content: "Configure chapter intro pages with drop caps, decorative elements, and custom spacing. Each chapter can have individual style overrides if needed." },
    ]
  },
  {
    id: "covers",
    title: "Cover Design",
    icon: BookOpen,
    articles: [
      { title: "Amazon KDP requirements", content: "DesignIQ automatically calculates cover dimensions based on your page count and paper type. The spine width is computed using Amazon's official formulas." },
      { title: "Creating your cover", content: "Upload images for the front and back cover, or use our template-based designer. Add text, adjust positioning, and preview the full wrap-around cover." },
      { title: "Bleed and safe zones", content: "Our cover templates include proper bleed areas (0.125\") and safe zones. Keep important content within the safe zone to prevent trimming issues." },
    ]
  },
  {
    id: "exporting",
    title: "Exporting",
    icon: Download,
    articles: [
      { title: "PDF export", content: "Generate print-ready PDF files suitable for Amazon KDP and other print-on-demand services. PDFs include proper page sizes, margins, and embedded fonts." },
      { title: "IDML export", content: "Export to Adobe InDesign's IDML format for further editing. This preserves all styling, structure, and formatting for professional designers." },
      { title: "Export quality", content: "All exports use professional typesetting algorithms including the Knuth-Plass line-breaking algorithm for optimal text flow and justified alignment." },
    ]
  },
  {
    id: "copyright",
    title: "Copyright Page",
    icon: FileText,
    articles: [
      { title: "Generating copyright pages", content: "DesignIQ includes a smart copyright page generator. Enter your ISBN, publisher name, and year, and we'll format the legal text professionally." },
      { title: "Legal text templates", content: "Choose from standard legal text templates or write your own. Include copyright notices, disclaimers, and credits as needed." },
      { title: "ISBN information", content: "You'll need to obtain your own ISBN from your country's ISBN agency. Enter it in the copyright page generator for proper formatting." },
    ]
  },
];

const FAQ_ITEMS = [
  {
    question: "What file formats can I upload?",
    answer: "Currently, DesignIQ supports Microsoft Word documents (.docx). We recommend using Word's built-in styles for best results."
  },
  {
    question: "Can I edit my book after exporting?",
    answer: "Yes! Export to IDML format to continue editing in Adobe InDesign. You can also re-export from DesignIQ at any time."
  },
  {
    question: "How is the spine width calculated?",
    answer: "We use Amazon KDP's official formulas: White paper = 0.002252\" per page, Cream paper = 0.0025\" per page, Color paper = 0.002347\" per page."
  },
  {
    question: "What's included in the demo?",
    answer: "Demo mode includes full access to all features with one project. Exports include a watermark. Subscribe to remove watermarks and create unlimited projects."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime. You'll continue to have access until the end of your billing period. We offer a 30-day money-back guarantee."
  },
  {
    question: "Is my content secure?",
    answer: "Yes, your documents are processed securely and are not shared with third parties. We use industry-standard encryption for all data transfers."
  },
  {
    question: "What print-on-demand services are supported?",
    answer: "Our exports are compatible with Amazon KDP, IngramSpark, Lulu, and most other print-on-demand services that accept PDF files."
  },
  {
    question: "Can I use custom fonts?",
    answer: "Currently, we offer a curated selection of professional book fonts. Custom font support is planned for a future update."
  },
];

export default function Help() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = HELP_CATEGORIES.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(query) ||
      category.articles.some(
        article => 
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      )
    );
  });

  const filteredFAQ = FAQ_ITEMS.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Help Center</h1>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/feedback")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Feedback
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">How can we help?</h2>
            <p className="text-muted-foreground">
              Search our documentation or browse by category
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        {!selectedCategory && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>
                          {category.articles.length} articles
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}

        {/* Selected Category */}
        {selectedCategory && (
          <div className="max-w-3xl mx-auto mb-12">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to categories
            </Button>
            {filteredCategories
              .filter(c => c.id === selectedCategory)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">{category.title}</h2>
                    </div>
                    <div className="space-y-4">
                      {category.articles.map((article, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{article.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* FAQ Section */}
        {!selectedCategory && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">FAQ</Badge>
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Contact Section */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="bg-muted/30">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold mb-1">Still need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Send us your feedback or question.
                </p>
              </div>
              <Button onClick={() => setLocation("/feedback")}>
                Contact Support
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

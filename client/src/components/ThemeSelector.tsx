import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, BookOpen, Briefcase, GraduationCap } from "lucide-react";

export interface BookTheme {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  titleFont: string;
  fontSize: number;
  lineHeight: number;
  features: string[];
  icon: React.ReactNode;
  preview: {
    bodyText: string;
    chapterTitle: string;
  };
}

export const BOOK_THEMES: BookTheme[] = [
  {
    id: "classic-fiction",
    name: "Classic Fiction",
    description: "Elegant serif typography with generous margins, perfect for novels and literary works.",
    fontFamily: "Georgia, 'Times New Roman', serif",
    titleFont: "Georgia, serif",
    fontSize: 11,
    lineHeight: 1.5,
    features: ["Drop caps", "Centered chapter titles", "Right-page chapter starts"],
    icon: <BookOpen className="h-5 w-5" />,
    preview: {
      bodyText: "The morning sun cast long shadows across the cobblestone streets as Eleanor made her way to the old bookshop...",
      chapterTitle: "Chapter One"
    }
  },
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Clean sans-serif design with efficient spacing, ideal for business books and guides.",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    titleFont: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 10,
    lineHeight: 1.4,
    features: ["Left-aligned titles", "Compact layout", "Professional headers"],
    icon: <Briefcase className="h-5 w-5" />,
    preview: {
      bodyText: "In today's rapidly evolving marketplace, successful leaders must adapt their strategies to meet changing demands...",
      chapterTitle: "1. Introduction"
    }
  },
  {
    id: "academic",
    name: "Academic",
    description: "Traditional scholarly format with double spacing and wide margins for annotations.",
    fontFamily: "'Times New Roman', Times, serif",
    titleFont: "'Times New Roman', Times, serif",
    fontSize: 12,
    lineHeight: 2.0,
    features: ["Double spacing", "Wide margins", "Numbered sections"],
    icon: <GraduationCap className="h-5 w-5" />,
    preview: {
      bodyText: "This study examines the correlation between environmental factors and cognitive development in early childhood...",
      chapterTitle: "Chapter 1: Literature Review"
    }
  }
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Book Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select a pre-designed theme that matches your book's genre and style.
        </p>
      </div>

      <RadioGroup value={selectedTheme} onValueChange={onThemeChange} className="grid gap-4">
        {BOOK_THEMES.map((theme) => (
          <Label
            key={theme.id}
            htmlFor={theme.id}
            className="cursor-pointer"
          >
            <Card className={`relative transition-all ${
              selectedTheme === theme.id 
                ? "border-primary ring-2 ring-primary/20" 
                : "hover:border-primary/50"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedTheme === theme.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      {theme.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {theme.name}
                        {selectedTheme === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {theme.description}
                      </CardDescription>
                    </div>
                  </div>
                  <RadioGroupItem value={theme.id} id={theme.id} className="mt-1" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Theme Preview */}
                <div 
                  className="bg-white text-black rounded-lg p-4 mb-4 border"
                  style={{ fontFamily: theme.fontFamily }}
                >
                  <div 
                    className="text-center mb-3 font-semibold"
                    style={{ fontFamily: theme.titleFont }}
                  >
                    {theme.preview.chapterTitle}
                  </div>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ 
                      fontSize: `${theme.fontSize}px`,
                      lineHeight: theme.lineHeight
                    }}
                  >
                    {theme.id === "classic-fiction" && (
                      <span className="float-left text-3xl font-bold mr-1 leading-none">
                        {theme.preview.bodyText.charAt(0)}
                      </span>
                    )}
                    {theme.id === "classic-fiction" 
                      ? theme.preview.bodyText.slice(1) 
                      : theme.preview.bodyText
                    }
                  </p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {theme.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}

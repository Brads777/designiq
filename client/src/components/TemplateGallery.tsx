import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Eye, 
  Check, 
  BookOpen, 
  Layout, 
  Image as ImageIcon,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { 
  CHAPTER_INTRO_TEMPLATES, 
  CHAPTER_BODY_TEMPLATES, 
  GRAPHIC_NOVEL_TEMPLATES,
  ChapterTemplateConfig 
} from "../../../shared/chapterTemplates";

type ChapterTemplate = ChapterTemplateConfig;

interface TemplateGalleryProps {
  onSelectIntroTemplate?: (templateId: string) => void;
  onSelectBodyTemplate?: (templateId: string) => void;
  selectedIntroTemplate?: string;
  selectedBodyTemplate?: string;
}

export function TemplateGallery({
  onSelectIntroTemplate,
  onSelectBodyTemplate,
  selectedIntroTemplate,
  selectedBodyTemplate,
}: TemplateGalleryProps) {
  const [previewTemplate, setPreviewTemplate] = useState<ChapterTemplate | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Template Gallery</h2>
        <p className="text-muted-foreground">
          Browse and preview all available templates for your book
        </p>
      </div>

      <Tabs defaultValue="intro" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intro" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Chapter Intros
          </TabsTrigger>
          <TabsTrigger value="body" className="gap-2">
            <Layout className="h-4 w-4" />
            Chapter Body
          </TabsTrigger>
          <TabsTrigger value="graphic" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Graphic Novel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intro" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAPTER_INTRO_TEMPLATES.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedIntroTemplate === template.id}
                onSelect={() => onSelectIntroTemplate?.(template.id)}
                onPreview={() => setPreviewTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="body" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAPTER_BODY_TEMPLATES.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedBodyTemplate === template.id}
                onSelect={() => onSelectBodyTemplate?.(template.id)}
                onPreview={() => setPreviewTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graphic" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRAPHIC_NOVEL_TEMPLATES.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {previewTemplate.name}
                </DialogTitle>
              </DialogHeader>
              <TemplatePreviewContent template={previewTemplate} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateCardProps {
  template: ChapterTemplate;
  isSelected?: boolean;
  onSelect?: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-primary">
            <Check className="h-3 w-3 mr-1" />
            Selected
          </Badge>
        </div>
      )}
      
      {/* Mini Preview */}
      <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden">
        <TemplateMiniPreview template={template} />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold mb-1">{template.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {template.description}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview} className="flex-1 gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          {onSelect && (
            <Button 
              size="sm" 
              onClick={onSelect}
              variant={isSelected ? "secondary" : "default"}
              className="flex-1"
            >
              {isSelected ? "Selected" : "Use This"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateMiniPreview({ template }: { template: ChapterTemplate }) {
  // Render a mini visual representation of the template
  const { layoutType, settings } = template;

  if (template.category === "graphic-novel") {
    return <GraphicNovelMiniPreview template={template} />;
  }

  if (template.category === "intro") {
    return <IntroMiniPreview template={template} />;
  }

  return <BodyMiniPreview template={template} />;
}

function IntroMiniPreview({ template }: { template: ChapterTemplate }) {
  const { settings } = template;
  const alignment = settings.titleAlignment || "center";

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Page representation */}
      <div className="flex-1 bg-background rounded shadow-sm p-3 flex flex-col">
        {/* Chapter number */}
        <div className={`text-xs text-muted-foreground mb-2 ${
          alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
        }`}>
          Chapter One
        </div>
        
        {/* Title */}
        <div className={`font-bold text-sm mb-3 ${
          alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
        }`}>
          The Beginning
        </div>

        {/* Decorative element based on layout */}
        {template.layoutType === "full-bleed-image" && (
          <div className="flex-1 bg-muted rounded mb-2 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}

        {template.layoutType === "decorative-intro" && (
          <div className="flex justify-center mb-2">
            <div className="w-16 h-0.5 bg-primary/50" />
          </div>
        )}

        {/* Text lines */}
        <div className="space-y-1 mt-auto">
          {settings.useDropCap && (
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-primary/20 rounded text-[8px] flex items-center justify-center font-serif">T</div>
              <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded" />
            </div>
          )}
          <div className="h-1.5 bg-muted-foreground/20 rounded" />
          <div className="h-1.5 bg-muted-foreground/20 rounded w-4/5" />
          <div className="h-1.5 bg-muted-foreground/20 rounded" />
        </div>
      </div>
    </div>
  );
}

function BodyMiniPreview({ template }: { template: ChapterTemplate }) {
  const { settings } = template;
  const imagePlacement = settings.defaultImagePlacement;

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex-1 bg-background rounded shadow-sm p-3">
        {imagePlacement === "full-width" && (
          <>
            <div className="h-12 bg-muted rounded mb-2 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
            </div>
          </>
        )}

        {imagePlacement === "float-left" && (
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0">
              <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-4/5" />
            </div>
          </div>
        )}

        {imagePlacement === "float-right" && (
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-4/5" />
            </div>
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0">
              <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </div>
        )}

        {imagePlacement === "inline" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
            </div>
            <div className="h-8 bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-2/3" />
            </div>
          </div>
        )}

        {!imagePlacement && (
          <div className="space-y-1">
            <div className="h-1.5 bg-muted-foreground/20 rounded" />
            <div className="h-1.5 bg-muted-foreground/20 rounded" />
            <div className="h-1.5 bg-muted-foreground/20 rounded w-4/5" />
            <div className="h-1.5 bg-muted-foreground/20 rounded" />
            <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
            <div className="h-1.5 bg-muted-foreground/20 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

function GraphicNovelMiniPreview({ template }: { template: ChapterTemplate }) {
  const { layoutType, settings } = template;
  const panelCount = (settings as any).panelCount || 1;

  const renderPanels = () => {
    if (layoutType === "full-bleed-image") {
      return (
        <div className="h-full bg-muted rounded flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      );
    }

    if (panelCount === 4) {
      return (
        <div className="h-full grid grid-cols-2 grid-rows-2 gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      );
    }

    if (panelCount === 6) {
      return (
        <div className="h-full grid grid-cols-2 grid-rows-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      );
    }

    if (panelCount === 9) {
      return (
        <div className="h-full grid grid-cols-3 grid-rows-3 gap-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-2 w-2 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      );
    }

    // Two panel horizontal
    if (panelCount === 2 && template.id.includes("horizontal")) {
      return (
        <div className="h-full grid grid-cols-2 gap-1">
          {[1, 2].map(i => (
            <div key={i} className="bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      );
    }

    // Two panel vertical
    return (
      <div className="h-full grid grid-rows-2 gap-1">
        {[1, 2].map(i => (
          <div key={i} className="bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full p-4">
      <div className="h-full bg-background rounded shadow-sm p-2">
        {renderPanels()}
      </div>
    </div>
  );
}

function TemplatePreviewContent({ template }: { template: ChapterTemplate }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Large Preview */}
      <div className="aspect-[3/4] bg-muted/30 rounded-lg overflow-hidden">
        <div className="h-full p-6">
          <div className="h-full bg-background rounded-lg shadow-lg p-6">
            {template.category === "intro" && <IntroFullPreview template={template} />}
            {template.category === "body" && <BodyFullPreview template={template} />}
            {template.category === "graphic-novel" && <GraphicNovelFullPreview template={template} />}
          </div>
        </div>
      </div>

      {/* Template Details */}
      <div className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {template.category === "intro" && "Chapter Intro"}
            {template.category === "body" && "Chapter Body"}
            {template.category === "graphic-novel" && "Graphic Novel"}
          </Badge>
          <h3 className="text-xl font-bold">{template.name}</h3>
          <p className="text-muted-foreground mt-2">{template.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Features</h4>
          <ul className="space-y-1">
            {template.settings.useDropCap && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Drop cap on first paragraph
              </li>
            )}
            {template.settings.showChapterNumber && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Chapter number display
              </li>
            )}
            {template.settings.defaultImagePlacement && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Image placement: {template.settings.defaultImagePlacement}
              </li>
            )}
            {(template.settings as any).panelCount && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {(template.settings as any).panelCount} panel layout
              </li>
            )}
          </ul>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Best For</h4>
          <p className="text-sm text-muted-foreground">
            {template.category === "intro" && "Opening pages of chapters to set the tone and style"}
            {template.category === "body" && "Main content pages with text and optional images"}
            {template.category === "graphic-novel" && "Visual storytelling with comic-style panel layouts"}
          </p>
        </div>
      </div>
    </div>
  );
}

function IntroFullPreview({ template }: { template: ChapterTemplate }) {
  const { settings } = template;
  const alignment = settings.titleAlignment || "center";

  return (
    <div className="h-full flex flex-col">
      {settings.showChapterNumber && (
        <div className={`text-sm text-muted-foreground mb-4 ${
          alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
        }`}>
          CHAPTER ONE
        </div>
      )}
      
      <div className={`text-2xl font-bold mb-6 ${
        alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
      }`}>
        The Journey Begins
      </div>

      {template.layoutType === "full-bleed-image" && (
        <div className="h-32 bg-muted rounded-lg mb-6 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}

      {template.layoutType === "decorative-intro" && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-primary/50" />
            <Sparkles className="h-4 w-4 text-primary/50" />
            <div className="w-8 h-px bg-primary/50" />
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm text-muted-foreground">
        {settings.useDropCap ? (
          <p>
            <span className="float-left text-4xl font-serif leading-none mr-2 text-foreground">T</span>
            he morning sun cast long shadows across the valley as Sarah stood at the edge of the cliff, 
            contemplating the journey that lay ahead. She had prepared for this moment her entire life.
          </p>
        ) : (
          <p>
            The morning sun cast long shadows across the valley as Sarah stood at the edge of the cliff, 
            contemplating the journey that lay ahead. She had prepared for this moment her entire life.
          </p>
        )}
        <p>
          With a deep breath, she adjusted her pack and took the first step onto the winding path 
          that would lead her through the mountains and into the unknown.
        </p>
      </div>
    </div>
  );
}

function BodyFullPreview({ template }: { template: ChapterTemplate }) {
  const { settings } = template;
  const imagePlacement = settings.defaultImagePlacement;

  const sampleText = `The ancient library stretched before them, its towering shelves reaching toward 
  a ceiling lost in shadow. Dust motes danced in the shafts of light that filtered through 
  stained glass windows, casting colored patterns across the worn stone floor.`;

  const moreText = `Marcus ran his fingers along the spines of countless books, each one holding 
  secrets that had been forgotten for centuries. The air was thick with the scent of old paper 
  and leather bindings.`;

  return (
    <div className="h-full text-sm text-muted-foreground">
      {imagePlacement === "full-width" && (
        <>
          <div className="h-24 bg-muted rounded-lg mb-4 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="mb-3">{sampleText}</p>
          <p>{moreText}</p>
        </>
      )}

      {imagePlacement === "float-left" && (
        <>
          <div className="float-left w-24 h-24 bg-muted rounded-lg mr-4 mb-2 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="mb-3">{sampleText}</p>
          <p>{moreText}</p>
        </>
      )}

      {imagePlacement === "float-right" && (
        <>
          <div className="float-right w-24 h-24 bg-muted rounded-lg ml-4 mb-2 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="mb-3">{sampleText}</p>
          <p>{moreText}</p>
        </>
      )}

      {imagePlacement === "inline" && (
        <>
          <p className="mb-4">{sampleText}</p>
          <div className="h-20 bg-muted rounded-lg mb-4 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p>{moreText}</p>
        </>
      )}

      {!imagePlacement && (
        <>
          <p className="mb-3">{sampleText}</p>
          <p className="mb-3">{moreText}</p>
          <p>
            "We must find the Chronicle of Ages," Elena whispered, her voice barely audible 
            in the vast silence. "Before the others discover its location."
          </p>
        </>
      )}
    </div>
  );
}

function GraphicNovelFullPreview({ template }: { template: ChapterTemplate }) {
  const { layoutType, settings } = template;
  const panelCount = (settings as any).panelCount || 1;

  const renderPanel = (index: number) => (
    <div key={index} className="bg-muted rounded flex items-center justify-center border-2 border-foreground/10">
      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
    </div>
  );

  if (layoutType === "full-bleed-image") {
    return (
      <div className="h-full bg-muted rounded-lg flex items-center justify-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );
  }

  if (panelCount === 4) {
    return (
      <div className="h-full grid grid-cols-2 grid-rows-2 gap-2">
        {[1, 2, 3, 4].map(i => renderPanel(i))}
      </div>
    );
  }

  if (panelCount === 6) {
    return (
      <div className="h-full grid grid-cols-2 grid-rows-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => renderPanel(i))}
      </div>
    );
  }

  if (panelCount === 9) {
    return (
      <div className="h-full grid grid-cols-3 grid-rows-3 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => renderPanel(i))}
      </div>
    );
  }

  if (panelCount === 2 && template.id.includes("horizontal")) {
    return (
      <div className="h-full grid grid-cols-2 gap-2">
        {[1, 2].map(i => renderPanel(i))}
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-2 gap-2">
      {[1, 2].map(i => renderPanel(i))}
    </div>
  );
}

export default TemplateGallery;

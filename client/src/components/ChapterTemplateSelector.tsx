import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CHAPTER_INTRO_TEMPLATES, 
  CHAPTER_BODY_TEMPLATES, 
  GRAPHIC_NOVEL_TEMPLATES,
  ChapterTemplateConfig 
} from "@shared/chapterTemplates";
import { 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Grid3X3,
  Check,
  Sparkles
} from "lucide-react";

interface ChapterTemplateSelectorProps {
  selectedIntroTemplate: string;
  selectedBodyTemplate: string;
  onSelectIntroTemplate: (templateId: string) => void;
  onSelectBodyTemplate: (templateId: string) => void;
  isGraphicNovel?: boolean;
  onToggleGraphicNovel?: (enabled: boolean) => void;
}

export function ChapterTemplateSelector({
  selectedIntroTemplate,
  selectedBodyTemplate,
  onSelectIntroTemplate,
  onSelectBodyTemplate,
  isGraphicNovel = false,
  onToggleGraphicNovel
}: ChapterTemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState("intro");

  const renderTemplateCard = (
    template: ChapterTemplateConfig, 
    isSelected: boolean, 
    onSelect: () => void
  ) => (
    <Card 
      key={template.id}
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isSelected ? "border-primary ring-2 ring-primary/20" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {template.description}
            </CardDescription>
          </div>
          {isSelected && (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center overflow-hidden">
          <TemplatePreview template={template} />
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {template.settings.useDropCap && (
            <Badge variant="outline" className="text-xs">Drop Cap</Badge>
          )}
          {template.settings.useDivider && (
            <Badge variant="outline" className="text-xs">Divider</Badge>
          )}
          {template.settings.showChapterNumber && (
            <Badge variant="outline" className="text-xs">Chapter #</Badge>
          )}
          {template.layoutType === "full-bleed-image" && (
            <Badge variant="outline" className="text-xs">Full Bleed</Badge>
          )}
          {template.layoutType === "image-grid" && (
            <Badge variant="outline" className="text-xs">Panels</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chapter Templates</h3>
        {onToggleGraphicNovel && (
          <Button
            variant={isGraphicNovel ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleGraphicNovel(!isGraphicNovel)}
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            Graphic Novel Mode
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intro" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Chapter Intro</span>
            <span className="sm:hidden">Intro</span>
          </TabsTrigger>
          <TabsTrigger value="body" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Body Layout</span>
            <span className="sm:hidden">Body</span>
          </TabsTrigger>
          {isGraphicNovel && (
            <TabsTrigger value="graphic" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Graphic Novel</span>
              <span className="sm:hidden">Graphic</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="intro" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {CHAPTER_INTRO_TEMPLATES.map((template) => 
                renderTemplateCard(
                  template,
                  selectedIntroTemplate === template.id,
                  () => onSelectIntroTemplate(template.id)
                )
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="body" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {CHAPTER_BODY_TEMPLATES.map((template) => 
                renderTemplateCard(
                  template,
                  selectedBodyTemplate === template.id,
                  () => onSelectBodyTemplate(template.id)
                )
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {isGraphicNovel && (
          <TabsContent value="graphic" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {GRAPHIC_NOVEL_TEMPLATES.map((template) => 
                  renderTemplateCard(
                    template,
                    selectedBodyTemplate === template.id,
                    () => onSelectBodyTemplate(template.id)
                  )
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Mini preview component for templates
function TemplatePreview({ template }: { template: ChapterTemplateConfig }) {
  if (template.category === "intro") {
    return (
      <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center">
        {template.settings.showChapterNumber && (
          <div className="text-[8px] text-muted-foreground mb-1">
            {template.settings.chapterNumberPrefix || "Chapter"} 1
          </div>
        )}
        <div 
          className="text-sm font-semibold mb-2"
          style={{ 
            textAlign: template.settings.titleAlignment || "center",
            textTransform: template.settings.titleStyle === "uppercase" ? "uppercase" : "none"
          }}
        >
          Title
        </div>
        {template.settings.useDivider && (
          <div className="w-12 h-px bg-border mb-2" />
        )}
        {template.settings.useDropCap && (
          <div className="flex items-start gap-1 text-[6px] text-muted-foreground">
            <span className="text-lg font-serif leading-none">T</span>
            <span>ext begins here with a decorative drop cap...</span>
          </div>
        )}
        {template.layoutType === "full-bleed-image" && (
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
    );
  }

  if (template.category === "body") {
    return (
      <div className="w-full h-full p-2 flex flex-col gap-1">
        {template.layoutType === "text-only" && (
          <>
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-11/12" />
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-10/12" />
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-9/12" />
          </>
        )}
        {template.layoutType === "text-with-images" && (
          <>
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-11/12" />
            <div className="flex gap-1 my-1">
              {template.settings.defaultImagePlacement === "float-right" ? (
                <>
                  <div className="flex-1 space-y-1">
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                  </div>
                  <div className="w-8 h-6 bg-primary/20 rounded" />
                </>
              ) : template.settings.defaultImagePlacement === "full-width" ? (
                <div className="w-full h-8 bg-primary/20 rounded" />
              ) : (
                <>
                  <div className="w-8 h-6 bg-primary/20 rounded" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                  </div>
                </>
              )}
            </div>
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-10/12" />
          </>
        )}
      </div>
    );
  }

  if (template.category === "graphic-novel") {
    const renderPanels = () => {
      switch (template.id) {
        case "gn-single-page":
          return <div className="w-full h-full bg-primary/20 rounded" />;
        case "gn-two-panel-horizontal":
          return (
            <div className="w-full h-full flex gap-0.5">
              <div className="flex-1 bg-primary/20 rounded" />
              <div className="flex-1 bg-primary/20 rounded" />
            </div>
          );
        case "gn-two-panel-vertical":
          return (
            <div className="w-full h-full flex flex-col gap-0.5">
              <div className="flex-1 bg-primary/20 rounded" />
              <div className="flex-1 bg-primary/20 rounded" />
            </div>
          );
        case "gn-three-panel":
          return (
            <div className="w-full h-full flex gap-0.5">
              <div className="flex-1 bg-primary/20 rounded" />
              <div className="flex-1 bg-primary/20 rounded" />
              <div className="flex-1 bg-primary/20 rounded" />
            </div>
          );
        case "gn-four-panel-grid":
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
            </div>
          );
        case "gn-six-panel-grid":
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-0.5">
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
              <div className="bg-primary/20 rounded" />
            </div>
          );
        default:
          return <div className="w-full h-full bg-primary/20 rounded" />;
      }
    };

    return (
      <div className="w-full h-full p-2">
        {renderPanels()}
      </div>
    );
  }

  return null;
}

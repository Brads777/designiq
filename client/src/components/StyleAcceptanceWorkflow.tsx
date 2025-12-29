import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface StyleMapping {
  id: number;
  sourceStyleName: string;
  sourceStyleType: "paragraph" | "character";
  targetStyleName: string;
  isAutoDetected: boolean;
  isAccepted: boolean | null;
}

// Available target styles for mapping
const TARGET_STYLES = {
  paragraph: [
    { value: "Body Text", label: "Body Text", description: "Standard paragraph text" },
    { value: "First Paragraph (No Indent)", label: "First Paragraph", description: "First paragraph after heading, no indent" },
    { value: "Chapter Title", label: "Chapter Title", description: "Main chapter heading" },
    { value: "Section Heading", label: "Section Heading", description: "Secondary heading within chapter" },
    { value: "Subsection Heading", label: "Subsection Heading", description: "Tertiary heading" },
    { value: "Block Quotation", label: "Block Quote", description: "Indented quote block" },
    { value: "Book Title", label: "Book Title", description: "Main title on title page" },
    { value: "Book Subtitle", label: "Book Subtitle", description: "Subtitle on title page" },
    { value: "Scene Break", label: "Scene Break", description: "Visual break between scenes" },
  ],
  character: [
    { value: "Bold", label: "Bold", description: "Bold emphasis" },
    { value: "Italic", label: "Italic", description: "Italic emphasis" },
    { value: "Bold Italic", label: "Bold Italic", description: "Combined bold and italic" },
    { value: "Small Caps", label: "Small Caps", description: "Small capital letters" },
    { value: "Superscript", label: "Superscript", description: "Raised text" },
    { value: "Subscript", label: "Subscript", description: "Lowered text" },
  ]
};

interface StyleAcceptanceWorkflowProps {
  mappings: StyleMapping[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onUpdateMapping: (id: number, targetStyleName: string) => void;
  onAcceptAll: () => void;
}

export function StyleAcceptanceWorkflow({
  mappings,
  onAccept,
  onReject,
  onUpdateMapping,
  onAcceptAll
}: StyleAcceptanceWorkflowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pendingMappings = mappings.filter(m => m.isAccepted === null);
  const acceptedCount = mappings.filter(m => m.isAccepted === true).length;
  const rejectedCount = mappings.filter(m => m.isAccepted === false).length;
  const progress = mappings.length > 0 ? ((acceptedCount + rejectedCount) / mappings.length) * 100 : 0;

  const currentMapping = pendingMappings[currentIndex];
  const targetStyles = currentMapping 
    ? TARGET_STYLES[currentMapping.sourceStyleType] 
    : TARGET_STYLES.paragraph;

  const handleAccept = () => {
    if (currentMapping) {
      onAccept(currentMapping.id);
      if (currentIndex >= pendingMappings.length - 1) {
        setCurrentIndex(Math.max(0, pendingMappings.length - 2));
      }
    }
  };

  const handleReject = () => {
    if (currentMapping) {
      onReject(currentMapping.id);
      if (currentIndex >= pendingMappings.length - 1) {
        setCurrentIndex(Math.max(0, pendingMappings.length - 2));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(pendingMappings.length - 1, currentIndex + 1));
  };

  if (mappings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Styles Detected</h3>
          <p className="text-muted-foreground">
            Upload a Word document to detect and map styles.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (pendingMappings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">All Styles Reviewed</h3>
          <p className="text-muted-foreground mb-4">
            You've reviewed all {mappings.length} style mappings.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-500">{acceptedCount} accepted</span>
            <span className="text-red-500">{rejectedCount} rejected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Style Review Progress</CardTitle>
              <CardDescription>
                {pendingMappings.length} styles remaining to review
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onAcceptAll}>
              <Sparkles className="mr-2 h-4 w-4" />
              Accept All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{acceptedCount} accepted</span>
            <span>{rejectedCount} rejected</span>
            <span>{pendingMappings.length} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Mapping Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={currentMapping.sourceStyleType === "paragraph" ? "default" : "secondary"}>
                {currentMapping.sourceStyleType}
              </Badge>
              {currentMapping.isAutoDetected && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Auto-detected
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {pendingMappings.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Style */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Word Style</label>
            <div className="mt-1 p-3 bg-muted rounded-lg">
              <p className="font-medium">{currentMapping.sourceStyleName}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Target Style */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Maps To</label>
            <Select 
              value={currentMapping.targetStyleName}
              onValueChange={(value) => onUpdateMapping(currentMapping.id, value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {targetStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {style.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= pendingMappings.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleReject}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleAccept}>
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Mappings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Style Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mappings.map((mapping, index) => (
              <div 
                key={mapping.id}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  mapping.isAccepted === true 
                    ? "bg-green-500/10 text-green-600" 
                    : mapping.isAccepted === false 
                    ? "bg-red-500/10 text-red-600"
                    : pendingMappings[currentIndex]?.id === mapping.id
                    ? "bg-primary/10 border border-primary"
                    : "bg-muted"
                }`}
              >
                <span className="truncate">{mapping.sourceStyleName}</span>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{mapping.targetStyleName}</span>
                  {mapping.isAccepted === true && <Check className="h-4 w-4" />}
                  {mapping.isAccepted === false && <X className="h-4 w-4" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

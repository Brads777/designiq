import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  MessageCircle,
  Move,
  Upload,
  Grid3X3,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Panel {
  id: string;
  imageUrl?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  borderWidth: string;
  borderColor: string;
}

interface SpeechBubble {
  id: string;
  panelId: string;
  type: "speech" | "thought" | "shout" | "whisper" | "narration" | "caption";
  text: string;
  positionX: number;
  positionY: number;
  width: number;
  tailDirection: string;
  backgroundColor: string;
  textColor: string;
}

interface GraphicNovelPage {
  id: string;
  pageNumber: number;
  layoutType: string;
  panels: Panel[];
  bubbles: SpeechBubble[];
}

interface GraphicNovelEditorProps {
  projectId: number;
  pages: GraphicNovelPage[];
  onPagesChange: (pages: GraphicNovelPage[]) => void;
}

const LAYOUT_PRESETS = [
  { id: "single", name: "Single Panel", panels: 1, grid: [[100, 100]] },
  { id: "two-h", name: "Two Horizontal", panels: 2, grid: [[50, 100], [50, 100]] },
  { id: "two-v", name: "Two Vertical", panels: 2, grid: [[100, 50], [100, 50]] },
  { id: "three-strip", name: "Three Strip", panels: 3, grid: [[33.33, 100], [33.33, 100], [33.33, 100]] },
  { id: "four-grid", name: "Four Grid", panels: 4, grid: [[50, 50], [50, 50], [50, 50], [50, 50]] },
  { id: "six-grid", name: "Six Grid", panels: 6, grid: [[50, 33.33], [50, 33.33], [50, 33.33], [50, 33.33], [50, 33.33], [50, 33.33]] },
];

const BUBBLE_TYPES = [
  { id: "speech", name: "Speech", icon: "💬" },
  { id: "thought", name: "Thought", icon: "💭" },
  { id: "shout", name: "Shout", icon: "💥" },
  { id: "whisper", name: "Whisper", icon: "🤫" },
  { id: "narration", name: "Narration", icon: "📖" },
  { id: "caption", name: "Caption", icon: "📝" },
];

export function GraphicNovelEditor({ projectId, pages, onPagesChange }: GraphicNovelEditorProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPage = pages[currentPageIndex];

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPage = () => {
    const newPage: GraphicNovelPage = {
      id: generateId(),
      pageNumber: pages.length + 1,
      layoutType: "single",
      panels: [{
        id: generateId(),
        positionX: 0,
        positionY: 0,
        width: 100,
        height: 100,
        borderWidth: "2px",
        borderColor: "#000000"
      }],
      bubbles: []
    };
    onPagesChange([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      toast.error("Cannot delete the only page");
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    // Renumber pages
    newPages.forEach((page, i) => page.pageNumber = i + 1);
    onPagesChange(newPages);
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
  };

  const applyLayout = (layoutId: string) => {
    const preset = LAYOUT_PRESETS.find(l => l.id === layoutId);
    if (!preset || !currentPage) return;

    const newPanels: Panel[] = [];
    let x = 0, y = 0;
    
    preset.grid.forEach((size, index) => {
      const [width, height] = size;
      newPanels.push({
        id: generateId(),
        positionX: x,
        positionY: y,
        width,
        height,
        borderWidth: "2px",
        borderColor: "#000000"
      });
      
      // Calculate next position based on layout
      if (layoutId === "two-h" || layoutId === "three-strip") {
        x += width;
      } else if (layoutId === "two-v") {
        y += height;
      } else if (layoutId === "four-grid" || layoutId === "six-grid") {
        x += width;
        if (x >= 100) {
          x = 0;
          y += height;
        }
      }
    });

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      layoutType: layoutId,
      panels: newPanels,
      bubbles: [] // Clear bubbles when changing layout
    };
    onPagesChange(updatedPages);
    setSelectedPanelId(null);
    setSelectedBubbleId(null);
  };

  const handleImageUpload = async (panelId: string, file: File) => {
    // In a real implementation, this would upload to S3
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updatePanel(panelId, { imageUrl });
    };
    reader.readAsDataURL(file);
    toast.success("Image added to panel");
  };

  const updatePanel = (panelId: string, updates: Partial<Panel>) => {
    if (!currentPage) return;
    const updatedPanels = currentPage.panels.map(panel =>
      panel.id === panelId ? { ...panel, ...updates } : panel
    );
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = { ...currentPage, panels: updatedPanels };
    onPagesChange(updatedPages);
  };

  const addBubble = (panelId: string, type: string) => {
    if (!currentPage) return;
    const newBubble: SpeechBubble = {
      id: generateId(),
      panelId,
      type: type as SpeechBubble["type"],
      text: "Enter text...",
      positionX: 50,
      positionY: 20,
      width: 30,
      tailDirection: "bottom",
      backgroundColor: "#FFFFFF",
      textColor: "#000000"
    };
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      bubbles: [...currentPage.bubbles, newBubble]
    };
    onPagesChange(updatedPages);
    setSelectedBubbleId(newBubble.id);
  };

  const updateBubble = (bubbleId: string, updates: Partial<SpeechBubble>) => {
    if (!currentPage) return;
    const updatedBubbles = currentPage.bubbles.map(bubble =>
      bubble.id === bubbleId ? { ...bubble, ...updates } : bubble
    );
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = { ...currentPage, bubbles: updatedBubbles };
    onPagesChange(updatedPages);
  };

  const deleteBubble = (bubbleId: string) => {
    if (!currentPage) return;
    const updatedBubbles = currentPage.bubbles.filter(b => b.id !== bubbleId);
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = { ...currentPage, bubbles: updatedBubbles };
    onPagesChange(updatedPages);
    setSelectedBubbleId(null);
  };

  const selectedPanel = currentPage?.panels.find(p => p.id === selectedPanelId);
  const selectedBubble = currentPage?.bubbles.find(b => b.id === selectedBubbleId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Page Navigator & Canvas */}
      <div className="lg:col-span-2 space-y-4">
        {/* Page Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPageIndex === pages.length - 1}
              onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addPage}>
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => deletePage(currentPageIndex)}
              disabled={pages.length <= 1}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <Card className="overflow-hidden">
          <div className="aspect-[8.5/11] bg-white relative">
            {currentPage?.panels.map((panel) => (
              <div
                key={panel.id}
                className={`absolute cursor-pointer transition-all ${
                  selectedPanelId === panel.id ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  left: `${panel.positionX}%`,
                  top: `${panel.positionY}%`,
                  width: `${panel.width}%`,
                  height: `${panel.height}%`,
                  border: `${panel.borderWidth} solid ${panel.borderColor}`,
                  boxSizing: "border-box"
                }}
                onClick={() => {
                  setSelectedPanelId(panel.id);
                  setSelectedBubbleId(null);
                }}
              >
                {panel.imageUrl ? (
                  <img 
                    src={panel.imageUrl} 
                    alt="Panel" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-xs">Click to add image</span>
                    </div>
                  </div>
                )}
                
                {/* Speech Bubbles */}
                {currentPage?.bubbles
                  .filter(b => b.panelId === panel.id)
                  .map((bubble) => (
                    <div
                      key={bubble.id}
                      className={`absolute cursor-move ${
                        selectedBubbleId === bubble.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      style={{
                        left: `${bubble.positionX}%`,
                        top: `${bubble.positionY}%`,
                        width: `${bubble.width}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBubbleId(bubble.id);
                        setSelectedPanelId(null);
                      }}
                    >
                      <div
                        className={`p-2 text-xs text-center ${
                          bubble.type === "thought" ? "rounded-full" :
                          bubble.type === "shout" ? "clip-path-burst" :
                          "rounded-lg"
                        }`}
                        style={{
                          backgroundColor: bubble.backgroundColor,
                          color: bubble.textColor,
                          border: bubble.type === "whisper" ? "2px dashed #666" : "2px solid #000"
                        }}
                      >
                        {bubble.text}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Layout Presets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Panel Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {LAYOUT_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant={currentPage?.layoutType === preset.id ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 flex flex-col items-center"
                  onClick={() => applyLayout(preset.id)}
                >
                  <Grid3X3 className="h-4 w-4 mb-1" />
                  <span className="text-[10px]">{preset.panels}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Panel */}
      <div className="space-y-4">
        {/* Panel Properties */}
        {selectedPanel && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Panel Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Image</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(selectedPanel.id, file);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedPanel.imageUrl ? "Replace Image" : "Upload Image"}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Border Width</Label>
                <Select
                  value={selectedPanel.borderWidth}
                  onValueChange={(value) => updatePanel(selectedPanel.id, { borderWidth: value })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">None</SelectItem>
                    <SelectItem value="1px">Thin</SelectItem>
                    <SelectItem value="2px">Medium</SelectItem>
                    <SelectItem value="3px">Thick</SelectItem>
                    <SelectItem value="4px">Extra Thick</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Border Color</Label>
                <Input
                  type="color"
                  value={selectedPanel.borderColor}
                  onChange={(e) => updatePanel(selectedPanel.id, { borderColor: e.target.value })}
                  className="h-8 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs mb-2 block">Add Speech Bubble</Label>
                <div className="grid grid-cols-3 gap-1">
                  {BUBBLE_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1 text-xs"
                      onClick={() => addBubble(selectedPanel.id, type.id)}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bubble Properties */}
        {selectedBubble && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bubble Properties</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteBubble(selectedBubble.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Text</Label>
                <Textarea
                  value={selectedBubble.text}
                  onChange={(e) => updateBubble(selectedBubble.id, { text: e.target.value })}
                  className="mt-1 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={selectedBubble.type}
                  onValueChange={(value) => updateBubble(selectedBubble.id, { type: value as SpeechBubble["type"] })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUBBLE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Position X (%)</Label>
                  <Slider
                    value={[selectedBubble.positionX]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => updateBubble(selectedBubble.id, { positionX: value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Position Y (%)</Label>
                  <Slider
                    value={[selectedBubble.positionY]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => updateBubble(selectedBubble.id, { positionY: value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Width (%)</Label>
                <Slider
                  value={[selectedBubble.width]}
                  min={10}
                  max={80}
                  step={1}
                  onValueChange={([value]) => updateBubble(selectedBubble.id, { width: value })}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Background</Label>
                  <Input
                    type="color"
                    value={selectedBubble.backgroundColor}
                    onChange={(e) => updateBubble(selectedBubble.id, { backgroundColor: e.target.value })}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <Input
                    type="color"
                    value={selectedBubble.textColor}
                    onChange={(e) => updateBubble(selectedBubble.id, { textColor: e.target.value })}
                    className="h-8 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page Thumbnails */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-3 gap-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`aspect-[8.5/11] border rounded cursor-pointer transition-all ${
                      currentPageIndex === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setCurrentPageIndex(index)}
                  >
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{page.pageNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

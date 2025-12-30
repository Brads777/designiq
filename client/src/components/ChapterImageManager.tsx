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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Maximize,
  GripVertical,
  MoveUp,
  MoveDown
} from "lucide-react";
import { toast } from "sonner";

export interface ChapterImage {
  id: string;
  imageUrl: string;
  originalFileName: string;
  placementType: "inline" | "float-left" | "float-right" | "full-width" | "full-bleed" | "background";
  positionMarker: string;
  orderIndex: number;
  widthPercent: number;
  caption: string;
  captionPosition: "below" | "above" | "overlay";
}

interface ChapterImageManagerProps {
  chapterId: number;
  images: ChapterImage[];
  onImagesChange: (images: ChapterImage[]) => void;
  chapterContent?: string;
}

const PLACEMENT_OPTIONS = [
  { value: "inline", label: "Inline", icon: AlignCenter, description: "Flows with text" },
  { value: "float-left", label: "Float Left", icon: AlignLeft, description: "Text wraps right" },
  { value: "float-right", label: "Float Right", icon: AlignRight, description: "Text wraps left" },
  { value: "full-width", label: "Full Width", icon: Maximize, description: "Spans text width" },
  { value: "full-bleed", label: "Full Bleed", icon: Maximize, description: "Edge to edge" },
  { value: "background", label: "Background", icon: ImageIcon, description: "Behind text" },
];

export function ChapterImageManager({ 
  chapterId, 
  images, 
  onImagesChange,
  chapterContent 
}: ChapterImageManagerProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ChapterImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      // In production, upload to S3
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: generateId(),
        imageUrl,
        originalFileName: file.name,
        placementType: "full-width",
        positionMarker: "",
        orderIndex: images.length + i,
        widthPercent: 100,
        caption: "",
        captionPosition: "below"
      });
    }

    onImagesChange([...images, ...newImages]);
    setIsAddDialogOpen(false);
    toast.success(`Added ${newImages.length} image(s)`);
  };

  const updateImage = (imageId: string, updates: Partial<ChapterImage>) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    );
    onImagesChange(updatedImages);
  };

  const deleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    // Reindex
    updatedImages.forEach((img, i) => img.orderIndex = i);
    onImagesChange(updatedImages);
    setSelectedImageId(null);
    toast.success("Image removed");
  };

  const moveImage = (imageId: string, direction: "up" | "down") => {
    const index = images.findIndex(img => img.id === imageId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    newImages.forEach((img, i) => img.orderIndex = i);
    onImagesChange(newImages);
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chapter Images</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Images
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Images to Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or GIF up to 10MB each
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No images added to this chapter yet
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Image List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Images ({images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {images
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((image, index) => (
                      <div
                        key={image.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedImageId === image.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedImageId(image.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveImage(image.id, "up");
                            }}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={index === images.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveImage(image.id, "down");
                            }}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={image.imageUrl} 
                            alt={image.originalFileName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {image.originalFileName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {PLACEMENT_OPTIONS.find(p => p.value === image.placementType)?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {image.widthPercent}% width
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Image Properties */}
          {selectedImage ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Image Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.originalFileName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Placement Type */}
                <div>
                  <Label className="text-xs mb-2 block">Placement</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLACEMENT_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedImage.placementType === option.value ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-2 flex flex-col items-center"
                        onClick={() => updateImage(selectedImage.id, { placementType: option.value as ChapterImage["placementType"] })}
                      >
                        <option.icon className="h-4 w-4 mb-1" />
                        <span className="text-[10px]">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                {selectedImage.placementType !== "full-bleed" && (
                  <div>
                    <Label className="text-xs">Width: {selectedImage.widthPercent}%</Label>
                    <Slider
                      value={[selectedImage.widthPercent]}
                      min={20}
                      max={100}
                      step={5}
                      onValueChange={([value]) => updateImage(selectedImage.id, { widthPercent: value })}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Caption */}
                <div>
                  <Label className="text-xs">Caption</Label>
                  <Textarea
                    value={selectedImage.caption}
                    onChange={(e) => updateImage(selectedImage.id, { caption: e.target.value })}
                    placeholder="Enter image caption..."
                    className="mt-1 text-sm"
                    rows={2}
                  />
                </div>

                {/* Caption Position */}
                {selectedImage.caption && (
                  <div>
                    <Label className="text-xs">Caption Position</Label>
                    <Select
                      value={selectedImage.captionPosition}
                      onValueChange={(value) => updateImage(selectedImage.id, { captionPosition: value as ChapterImage["captionPosition"] })}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below Image</SelectItem>
                        <SelectItem value="above">Above Image</SelectItem>
                        <SelectItem value="overlay">Overlay on Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Position Marker (for inline placement) */}
                {(selectedImage.placementType === "inline" || 
                  selectedImage.placementType === "float-left" || 
                  selectedImage.placementType === "float-right") && (
                  <div>
                    <Label className="text-xs">Insert After Paragraph</Label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedImage.positionMarker || "1"}
                      onChange={(e) => updateImage(selectedImage.id, { positionMarker: e.target.value })}
                      placeholder="Paragraph number"
                      className="h-8 mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Image will appear after this paragraph number
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select an image to edit its properties
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Preview Section */}
      {images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Layout Preview</CardTitle>
            <CardDescription>How images will appear in the chapter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white text-black max-h-[300px] overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {images
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((image, index) => (
                    <div 
                      key={image.id}
                      className={`my-4 ${
                        image.placementType === "float-left" ? "float-left mr-4 w-1/3" :
                        image.placementType === "float-right" ? "float-right ml-4 w-1/3" :
                        image.placementType === "full-width" ? "w-full" :
                        image.placementType === "full-bleed" ? "-mx-4 w-[calc(100%+2rem)]" :
                        "inline-block"
                      }`}
                      style={{ width: image.placementType === "inline" ? `${image.widthPercent}%` : undefined }}
                    >
                      {image.captionPosition === "above" && image.caption && (
                        <p className="text-xs text-gray-600 italic mb-1">{image.caption}</p>
                      )}
                      <img 
                        src={image.imageUrl} 
                        alt={image.caption || image.originalFileName}
                        className="w-full rounded"
                      />
                      {image.captionPosition === "below" && image.caption && (
                        <p className="text-xs text-gray-600 italic mt-1">{image.caption}</p>
                      )}
                    </div>
                  ))}
                <p className="text-gray-400">
                  [Chapter text content would appear here, flowing around the images based on their placement settings...]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

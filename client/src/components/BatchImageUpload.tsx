import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Wand2
} from "lucide-react";
import { toast } from "sonner";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  progress: number;
  url?: string;
  assignedChapter?: number;
  placement?: "inline" | "float-left" | "float-right" | "full-width" | "chapter-header";
  caption?: string;
}

interface BatchImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  chapters?: { id: number; title: string }[];
  onUploadComplete?: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function BatchImageUpload({
  images,
  onImagesChange,
  chapters = [],
  onUploadComplete,
  maxImages = 50,
}: BatchImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("No valid image files found");
      return;
    }

    if (images.length + imageFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: UploadedImage[] = imageFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      progress: 0,
      placement: "inline" as const,
    }));

    onImagesChange([...images, ...newImages]);
    toast.success(`Added ${imageFiles.length} image(s)`);
  }, [images, onImagesChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    processFiles(files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeImage = useCallback((id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    onImagesChange(images.filter(img => img.id !== id));
  }, [images, onImagesChange]);

  const updateImage = useCallback((id: string, updates: Partial<UploadedImage>) => {
    onImagesChange(images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, [images, onImagesChange]);

  const moveImage = useCallback((id: string, direction: "up" | "down") => {
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const autoDistributeImages = useCallback(() => {
    if (chapters.length === 0) {
      toast.error("No chapters available for distribution");
      return;
    }

    const imagesPerChapter = Math.ceil(images.length / chapters.length);
    const distributedImages = images.map((img, index) => {
      const chapterIndex = Math.floor(index / imagesPerChapter);
      const chapter = chapters[Math.min(chapterIndex, chapters.length - 1)];
      return {
        ...img,
        assignedChapter: chapter.id,
      };
    });

    onImagesChange(distributedImages);
    toast.success("Images distributed across chapters");
  }, [images, chapters, onImagesChange]);

  const uploadAllImages = useCallback(async () => {
    setIsUploading(true);
    
    // Simulate upload process
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.status === "uploaded") continue;

      updateImage(img.id, { status: "uploading", progress: 0 });

      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateImage(img.id, { progress: p });
      }

      // In real implementation, upload to S3 here
      updateImage(img.id, { 
        status: "uploaded", 
        progress: 100,
        url: img.preview // Would be S3 URL in production
      });
    }

    setIsUploading(false);
    toast.success("All images uploaded successfully");
    onUploadComplete?.(images);
  }, [images, updateImage, onUploadComplete]);

  const clearAllImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    onImagesChange([]);
  }, [images, onImagesChange]);

  const pendingCount = images.filter(img => img.status === "pending").length;
  const uploadedCount = images.filter(img => img.status === "uploaded").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Upload className={`h-12 w-12 mx-auto mb-4 ${
          isDragging ? "text-primary" : "text-muted-foreground"
        }`} />
        
        <h3 className="font-semibold mb-2">
          {isDragging ? "Drop images here" : "Drag & drop images"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse. Supports JPG, PNG, WebP (max {maxImages} images)
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
        >
          Select Images
        </Button>
      </div>

      {/* Stats Bar */}
      {images.length > 0 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </Badge>
            {pendingCount > 0 && (
              <Badge variant="secondary">
                {pendingCount} pending
              </Badge>
            )}
            {uploadedCount > 0 && (
              <Badge className="bg-green-500/20 text-green-500">
                {uploadedCount} uploaded
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {chapters.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={autoDistributeImages}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Auto-Distribute
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllImages}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
            <Button 
              size="sm" 
              onClick={uploadAllImages}
              disabled={isUploading || pendingCount === 0}
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              totalImages={images.length}
              chapters={chapters}
              onRemove={() => removeImage(image.id)}
              onUpdate={(updates) => updateImage(image.id, updates)}
              onMoveUp={() => moveImage(image.id, "up")}
              onMoveDown={() => moveImage(image.id, "down")}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Drag and drop images or click to browse</p>
        </div>
      )}
    </div>
  );
}

interface ImageCardProps {
  image: UploadedImage;
  index: number;
  totalImages: number;
  chapters: { id: number; title: string }[];
  onRemove: () => void;
  onUpdate: (updates: Partial<UploadedImage>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ImageCard({
  image,
  index,
  totalImages,
  chapters,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
}: ImageCardProps) {
  return (
    <Card className="overflow-hidden group">
      {/* Image Preview */}
      <div className="aspect-square relative bg-muted">
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        {image.status === "uploading" && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Progress value={image.progress} className="w-3/4 mb-2" />
            <span className="text-sm">{image.progress}%</span>
          </div>
        )}
        
        {image.status === "uploaded" && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500">
              <Check className="h-3 w-3" />
            </Badge>
          </div>
        )}
        
        {image.status === "error" && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3" />
            </Badge>
          </div>
        )}

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-8 w-8"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onMoveDown}
            disabled={index === totalImages - 1}
            className="h-8 w-8"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Index Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {index + 1}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <CardContent className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground truncate" title={image.file.name}>
          {image.file.name}
        </p>
        
        {chapters.length > 0 && (
          <Select
            value={image.assignedChapter?.toString() || ""}
            onValueChange={(value) => onUpdate({ assignedChapter: parseInt(value) })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Assign to chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map(chapter => (
                <SelectItem key={chapter.id} value={chapter.id.toString()}>
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={image.placement || "inline"}
          onValueChange={(value) => onUpdate({ placement: value as UploadedImage["placement"] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inline">Inline</SelectItem>
            <SelectItem value="float-left">Float Left</SelectItem>
            <SelectItem value="float-right">Float Right</SelectItem>
            <SelectItem value="full-width">Full Width</SelectItem>
            <SelectItem value="chapter-header">Chapter Header</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

export default BatchImageUpload;

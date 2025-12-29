import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ArrowLeft,
  Upload,
  Download,
  Type,
  Image as ImageIcon,
  Palette,
  Save,
  Loader2,
  Info,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move
} from "lucide-react";
import { toast } from "sonner";

// Amazon KDP trim sizes with bleed
const TRIM_SIZES = [
  { label: "5\" x 8\"", width: 5, height: 8 },
  { label: "5.25\" x 8\"", width: 5.25, height: 8 },
  { label: "5.5\" x 8.5\"", width: 5.5, height: 8.5 },
  { label: "6\" x 9\"", width: 6, height: 9 },
  { label: "6.14\" x 9.21\"", width: 6.14, height: 9.21 },
  { label: "6.69\" x 9.61\"", width: 6.69, height: 9.61 },
  { label: "7\" x 10\"", width: 7, height: 10 },
  { label: "7.5\" x 9.25\"", width: 7.5, height: 9.25 },
  { label: "8\" x 10\"", width: 8, height: 10 },
  { label: "8.5\" x 11\"", width: 8.5, height: 11 }
];

const PAPER_TYPES = [
  { value: "white", label: "White Paper", multiplier: 0.002252 },
  { value: "cream", label: "Cream/Off-white Paper", multiplier: 0.0025 },
  { value: "color", label: "Color Paper (Premium)", multiplier: 0.002347 }
];

const BLEED = 0.125; // 1/8 inch bleed on all sides

export default function CoverDesigner() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cover settings
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[3]); // 6x9 default
  const [paperType, setPaperType] = useState<"white" | "cream" | "color">("cream");
  const [pageCount, setPageCount] = useState(200);
  const [spineWidth, setSpineWidth] = useState(0);

  // Design elements
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#1a1a2e");
  const [textColor, setTextColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#d4af37");

  // Zoom and pan
  const [zoom, setZoom] = useState(0.5);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch project data
  const { data: project } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Calculate spine width
  const { data: spineData } = trpc.cover.calculateSpine.useQuery(
    { pageCount, paperType },
    { enabled: pageCount > 0 }
  );

  // Update spine width when calculation returns
  useEffect(() => {
    if (spineData) {
      setSpineWidth(parseFloat(spineData.spineWidth));
    }
  }, [spineData]);

  // Update from project data
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setAuthorName(project.author || "");
      if (project.pageCount) {
        setPageCount(project.pageCount);
      }
    }
  }, [project]);

  // Calculate full cover dimensions
  const fullWidth = (trimSize.width * 2) + spineWidth + (BLEED * 2);
  const fullHeight = trimSize.height + (BLEED * 2);

  // Pixel dimensions at 300 DPI
  const pixelWidth = Math.round(fullWidth * 300);
  const pixelHeight = Math.round(fullHeight * 300);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target?.result as string);
      toast.success("Image uploaded!");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(() => {
    toast.info("Generating print-ready cover...");
    // In production, this would generate the actual PDF/PNG
    setTimeout(() => {
      toast.success("Cover exported! (Demo)");
    }, 1500);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/project/${projectId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Cover Designer</h1>
              <p className="text-sm text-muted-foreground">{project?.title || "Loading..."}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Cover
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Settings */}
        <aside className="w-80 border-r border-border bg-card/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Dimensions */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Book Specifications
              </h3>
              
              <div className="space-y-2">
                <Label>Trim Size</Label>
                <Select 
                  value={`${trimSize.width}x${trimSize.height}`}
                  onValueChange={(val) => {
                    const [w, h] = val.split('x').map(Number);
                    const size = TRIM_SIZES.find(s => s.width === w && s.height === h);
                    if (size) setTrimSize(size);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIM_SIZES.map((size) => (
                      <SelectItem key={`${size.width}x${size.height}`} value={`${size.width}x${size.height}`}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Paper Type</Label>
                <Select value={paperType} onValueChange={(v) => setPaperType(v as typeof paperType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Page Count</Label>
                <Input
                  type="number"
                  min={24}
                  max={828}
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Calculated dimensions */}
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spine Width:</span>
                  <span className="font-medium">{spineWidth.toFixed(3)}" ({(spineWidth * 25.4).toFixed(1)}mm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Cover:</span>
                  <span className="font-medium">{fullWidth.toFixed(2)}" × {fullHeight.toFixed(2)}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pixels (300 DPI):</span>
                  <span className="font-medium">{pixelWidth} × {pixelHeight}</span>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Cover Text
              </h3>
              
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Book Title"
                />
              </div>

              <div className="space-y-2">
                <Label>Subtitle (Optional)</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A Subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Author Name"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Colors
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Background</Label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Text</Label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Accent</Label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Cover Image
              </h3>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              
              {coverImage && (
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive"
                  onClick={() => setCoverImage(null)}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 bg-muted/30 overflow-hidden flex flex-col">
          {/* Zoom controls */}
          <div className="p-2 border-b border-border bg-card/50 flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(0.5)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Canvas area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div 
              ref={canvasRef}
              className="relative shadow-2xl"
              style={{
                width: `${fullWidth * 100 * zoom}px`,
                height: `${fullHeight * 100 * zoom}px`,
                backgroundColor: backgroundColor,
                transition: 'width 0.3s, height 0.3s'
              }}
            >
              {/* Cover image */}
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt="Cover" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Bleed guides */}
              <div 
                className="absolute border-2 border-dashed border-red-500/30 pointer-events-none"
                style={{
                  left: `${BLEED * 100 * zoom}px`,
                  top: `${BLEED * 100 * zoom}px`,
                  right: `${BLEED * 100 * zoom}px`,
                  bottom: `${BLEED * 100 * zoom}px`,
                }}
              />

              {/* Spine guides */}
              <div 
                className="absolute top-0 bottom-0 border-l border-r border-primary/50 pointer-events-none"
                style={{
                  left: `${(trimSize.width + BLEED) * 100 * zoom}px`,
                  width: `${spineWidth * 100 * zoom}px`,
                  backgroundColor: 'rgba(212, 175, 55, 0.1)'
                }}
              />

              {/* Front Cover Content */}
              <div 
                className="absolute flex flex-col items-center justify-center text-center p-4"
                style={{
                  left: `${(trimSize.width + spineWidth + BLEED) * 100 * zoom}px`,
                  top: `${BLEED * 100 * zoom}px`,
                  width: `${trimSize.width * 100 * zoom}px`,
                  height: `${trimSize.height * 100 * zoom}px`,
                  color: textColor
                }}
              >
                {subtitle && (
                  <p 
                    className="uppercase tracking-widest mb-2"
                    style={{ 
                      fontSize: `${12 * zoom}px`,
                      color: accentColor
                    }}
                  >
                    {subtitle}
                  </p>
                )}
                <h1 
                  className="font-bold leading-tight mb-4"
                  style={{ fontSize: `${32 * zoom}px` }}
                >
                  {title || "Book Title"}
                </h1>
                <div 
                  className="w-16 h-0.5 mb-4"
                  style={{ backgroundColor: accentColor }}
                />
                <p 
                  className="font-light"
                  style={{ fontSize: `${16 * zoom}px` }}
                >
                  {authorName || "Author Name"}
                </p>
              </div>

              {/* Spine Content */}
              {spineWidth > 0.3 && (
                <div 
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${(trimSize.width + BLEED) * 100 * zoom}px`,
                    top: `${BLEED * 100 * zoom}px`,
                    width: `${spineWidth * 100 * zoom}px`,
                    height: `${trimSize.height * 100 * zoom}px`,
                    color: textColor,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                  }}
                >
                  <span 
                    className="font-semibold truncate"
                    style={{ fontSize: `${10 * zoom}px` }}
                  >
                    {title || "Book Title"} — {authorName || "Author"}
                  </span>
                </div>
              )}

              {/* Back Cover Content */}
              <div 
                className="absolute flex flex-col items-center justify-end p-4"
                style={{
                  left: `${BLEED * 100 * zoom}px`,
                  top: `${BLEED * 100 * zoom}px`,
                  width: `${trimSize.width * 100 * zoom}px`,
                  height: `${trimSize.height * 100 * zoom}px`,
                  color: textColor
                }}
              >
                {/* Barcode placeholder */}
                <div 
                  className="bg-white rounded p-2"
                  style={{
                    width: `${2 * 100 * zoom}px`,
                    height: `${1.2 * 100 * zoom}px`
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-black text-xs">ISBN Barcode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info bar */}
          <div className="p-2 border-t border-border bg-card/50 text-center text-sm text-muted-foreground">
            <span className="text-primary">Red dashed line</span> = Bleed area (will be trimmed) • 
            <span className="text-primary ml-2">Gold area</span> = Spine
          </div>
        </main>
      </div>
    </div>
  );
}

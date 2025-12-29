import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Download, 
  FileText, 
  FileCode, 
  Loader2, 
  CheckCircle2, 
  ExternalLink,
  AlertCircle
} from "lucide-react";

interface ExportPanelProps {
  projectId: number;
  hasChapters: boolean;
  pageCount: number | null;
}

const TRIM_SIZES = [
  { key: "5x8", label: "5\" × 8\" (Mass Market)" },
  { key: "5.25x8", label: "5.25\" × 8\"" },
  { key: "5.5x8.5", label: "5.5\" × 8.5\" (Digest)" },
  { key: "6x9", label: "6\" × 9\" (US Trade)" },
  { key: "6.14x9.21", label: "6.14\" × 9.21\" (Royal)" },
  { key: "6.69x9.61", label: "6.69\" × 9.61\" (Super Royal)" },
  { key: "7x10", label: "7\" × 10\" (Executive)" },
  { key: "7.5x9.25", label: "7.5\" × 9.25\"" },
  { key: "8x10", label: "8\" × 10\" (Letter)" },
  { key: "8.5x11", label: "8.5\" × 11\" (US Letter)" },
];

export function ExportPanel({ projectId, hasChapters, pageCount }: ExportPanelProps) {
  const [trimSize, setTrimSize] = useState("6x9");
  const [exportType, setExportType] = useState<"idml" | "pdf" | "both">("both");

  const generateExport = trpc.export.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Export generated successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const { data: exportJobs, refetch: refetchExports } = trpc.export.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const handleExport = () => {
    if (!hasChapters) {
      toast.error("Please upload a document first");
      return;
    }

    generateExport.mutate({
      projectId,
      exportType,
      trimSizeKey: trimSize
    }, {
      onSuccess: () => {
        refetchExports();
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Settings
          </CardTitle>
          <CardDescription>
            Configure your export options and generate print-ready files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trim Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trim Size</label>
            <Select value={trimSize} onValueChange={setTrimSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select trim size" />
              </SelectTrigger>
              <SelectContent>
                {TRIM_SIZES.map((size) => (
                  <SelectItem key={size.key} value={size.key}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Amazon KDP standard trim sizes for paperback books
            </p>
          </div>

          {/* Export Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={exportType === "pdf" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setExportType("pdf")}
              >
                <FileText className="h-6 w-6" />
                <span className="text-xs">PDF Only</span>
              </Button>
              <Button
                variant={exportType === "idml" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setExportType("idml")}
              >
                <FileCode className="h-6 w-6" />
                <span className="text-xs">IDML Only</span>
              </Button>
              <Button
                variant={exportType === "both" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setExportType("both")}
              >
                <Download className="h-6 w-6" />
                <span className="text-xs">Both</span>
              </Button>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Pages:</span>
              <span className="font-medium">{pageCount || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trim Size:</span>
              <span className="font-medium">{TRIM_SIZES.find(s => s.key === trimSize)?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium">
                {exportType === "both" ? "PDF + IDML" : exportType.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Export Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleExport}
            disabled={!hasChapters || generateExport.isPending}
          >
            {generateExport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Export
              </>
            )}
          </Button>

          {!hasChapters && (
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle className="h-4 w-4" />
              Upload a document to enable export
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      {exportJobs && exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {job.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : job.status === "processing" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {job.exportType.toUpperCase()} Export
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      job.status === "completed" ? "default" :
                      job.status === "processing" ? "secondary" : "outline"
                    }>
                      {job.status}
                    </Badge>
                    {job.status === "completed" && (
                      <div className="flex gap-1">
                        {job.pdfFileUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={job.pdfFileUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {job.idmlFileUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={job.idmlFileUrl} target="_blank" rel="noopener noreferrer">
                              <FileCode className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Format Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Export Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">PDF (Print-Ready)</p>
              <p className="text-xs text-muted-foreground">
                Ready for direct upload to Amazon KDP or other print-on-demand services. 
                Includes proper bleed, margins, and professional typesetting.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex gap-3">
            <FileCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">IDML (InDesign)</p>
              <p className="text-xs text-muted-foreground">
                Open in Adobe InDesign for advanced customization. Perfect for designers 
                who want full control over the final layout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

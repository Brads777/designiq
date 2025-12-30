import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Palette, 
  Type, 
  Download,
  ArrowLeft,
  Save,
  Eye,
  Check,
  X,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  BookMarked,
  Settings,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { ThemeSelector } from "@/components/ThemeSelector";
import { StylePreview } from "@/components/StylePreview";
import { ExportPanel } from "@/components/ExportPanel";
import { DemoModeIndicator } from "@/components/DemoModeIndicator";
import { useSubscription } from "@/hooks/useSubscription";

// Book interior themes
const BOOK_THEMES = [
  {
    id: "classic-fiction",
    name: "Classic Fiction",
    description: "Elegant serif typography perfect for novels and literary works",
    fontFamily: "Georgia, serif",
    chapterStyle: "centered",
    dropCap: true
  },
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Clean sans-serif design ideal for non-fiction and business books",
    fontFamily: "Inter, sans-serif",
    chapterStyle: "left-aligned",
    dropCap: false
  },
  {
    id: "academic",
    name: "Academic",
    description: "Formal layout with footnote support for scholarly publications",
    fontFamily: "Times New Roman, serif",
    chapterStyle: "numbered",
    dropCap: false
  }
];

// Amazon KDP trim sizes
const TRIM_SIZES = [
  { label: "5\" x 8\" (Small Trade)", width: "5", height: "8" },
  { label: "5.25\" x 8\" (Digest)", width: "5.25", height: "8" },
  { label: "5.5\" x 8.5\" (US Trade)", width: "5.5", height: "8.5" },
  { label: "6\" x 9\" (US Trade)", width: "6", height: "9" },
  { label: "6.14\" x 9.21\" (Royal)", width: "6.14", height: "9.21" },
  { label: "6.69\" x 9.61\" (Crown Quarto)", width: "6.69", height: "9.61" },
  { label: "7\" x 10\" (Executive)", width: "7", height: "10" },
  { label: "7.5\" x 9.25\" (Comic)", width: "7.5", height: "9.25" },
  { label: "8\" x 10\" (Large)", width: "8", height: "10" },
  { label: "8.5\" x 11\" (Letter)", width: "8.5", height: "11" }
];

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch project data
  const { data: project, isLoading: projectLoading, refetch: refetchProject } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Fetch chapters
  const { data: chapters, refetch: refetchChapters } = trpc.chapter.list.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Fetch style mappings
  const { data: styleMappings, refetch: refetchMappings } = trpc.styleMapping.list.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Fetch copyright page
  const { data: copyrightPage, refetch: refetchCopyright } = trpc.copyright.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Mutations
  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated");
      refetchProject();
    },
    onError: (err) => toast.error(err.message)
  });

  const saveCopyright = trpc.copyright.save.useMutation({
    onSuccess: () => {
      toast.success("Copyright page saved");
      refetchCopyright();
    },
    onError: (err) => toast.error(err.message)
  });

  const acceptStyleMapping = trpc.styleMapping.accept.useMutation({
    onSuccess: () => refetchMappings(),
    onError: (err) => toast.error(err.message)
  });

  // Local state for forms
  const [copyrightForm, setCopyrightForm] = useState({
    isbn: "",
    publisherName: "",
    publishYear: new Date().getFullYear(),
    copyrightHolder: "",
    legalText: "",
    additionalCredits: ""
  });

  const [selectedTheme, setSelectedTheme] = useState("classic-fiction");
  const [selectedTrimSize, setSelectedTrimSize] = useState(TRIM_SIZES[3]); // 6x9 default

  // Update copyright form when data loads
  useEffect(() => {
    if (copyrightPage) {
      setCopyrightForm({
        isbn: copyrightPage.isbn || "",
        publisherName: copyrightPage.publisherName || "",
        publishYear: copyrightPage.publishYear || new Date().getFullYear(),
        copyrightHolder: copyrightPage.copyrightHolder || "",
        legalText: copyrightPage.legalText || getDefaultLegalText(),
        additionalCredits: copyrightPage.additionalCredits || ""
      });
    }
  }, [copyrightPage]);

  // Update theme when project loads
  useEffect(() => {
    if (project?.themeId) {
      setSelectedTheme(project.themeId);
    }
  }, [project]);

  const uploadDocument = trpc.document.upload.useMutation({
    onSuccess: (data) => {
      toast.success(`Document processed: ${data.document.chapters} chapters, ${data.document.wordCount.toLocaleString()} words`);
      refetchProject();
      refetchChapters();
      refetchMappings();
      setActiveTab("styles");
    },
    onError: (err) => toast.error(err.message)
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      toast.error("Please upload a Word document (.docx or .doc)");
      return;
    }

    toast.info("Processing document... This may take a moment.");
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      uploadDocument.mutate({
        projectId,
        fileData: base64,
        fileName: file.name
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  }, [projectId, uploadDocument]);

  const handleSaveCopyright = useCallback(() => {
    saveCopyright.mutate({
      projectId,
      ...copyrightForm
    });
  }, [projectId, copyrightForm, saveCopyright]);

  const handleThemeChange = useCallback((themeId: string) => {
    setSelectedTheme(themeId);
    updateProject.mutate({
      id: projectId,
      themeId
    });
  }, [projectId, updateProject]);

  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold truncate max-w-[300px]">{project.title}</h1>
              <p className="text-sm text-muted-foreground">{project.author || "No author"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DemoModeIndicator variant="badge" />
            <Button variant="outline" onClick={() => setLocation(`/project/${projectId}/cover`)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Cover Designer
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="styles" className="gap-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Styles</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="copyright" className="gap-2">
              <BookMarked className="h-4 w-4" />
              <span className="hidden sm:inline">Copyright</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Manuscript</CardTitle>
                <CardDescription>
                  Upload your Word document (.docx) and we'll automatically detect styles and structure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadDocument.isPending ? (
                  <div className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Processing your document...</h3>
                    <p className="text-muted-foreground">Analyzing styles, detecting chapters, and extracting content</p>
                  </div>
                ) : project.sourceFileName ? (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{project.sourceFileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.pageCount ? `${project.pageCount} pages` : "Processing..."}
                          {project.wordCount ? ` • ${project.wordCount.toLocaleString()} words` : ""}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Replace File
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Drop your Word document here</h3>
                    <p className="text-muted-foreground mb-4">or click to browse</p>
                    <Button>Select File</Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </CardContent>
            </Card>

            {/* Document Info */}
            {project.sourceFileName && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{project.pageCount || "—"}</p>
                      <p className="text-sm text-muted-foreground">Pages</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{project.chapterCount || "—"}</p>
                      <p className="text-sm text-muted-foreground">Chapters</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {project.wordCount ? `${Math.round(project.wordCount / 1000)}k` : "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">Words</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{styleMappings?.length || "—"}</p>
                      <p className="text-sm text-muted-foreground">Styles Detected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Style Mapping</CardTitle>
                <CardDescription>
                  Review how your Word styles will be mapped to book styles. Accept or modify each mapping.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {styleMappings && styleMappings.length > 0 ? (
                  <div className="space-y-3">
                    {styleMappings.map((mapping) => (
                      <div 
                        key={mapping.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          mapping.isAccepted ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Word:</span>{" "}
                            <span className="font-medium">{mapping.sourceStyleName}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <span className="text-muted-foreground">Book:</span>{" "}
                            <span className="font-medium text-primary">{mapping.targetStyleName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {mapping.isAccepted ? (
                            <span className="flex items-center gap-1 text-sm text-green-500">
                              <Check className="h-4 w-4" />
                              Accepted
                            </span>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => acceptStyleMapping.mutate({ 
                                  id: mapping.id, 
                                  projectId, 
                                  isAccepted: true 
                                })}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a document to detect styles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interior Theme</CardTitle>
                  <CardDescription>
                    Choose a pre-designed theme for your book's interior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {BOOK_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTheme === theme.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{theme.name}</h4>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        {selectedTheme === theme.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trim Size</CardTitle>
                  <CardDescription>
                    Select the physical dimensions for your printed book.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={`${selectedTrimSize.width}x${selectedTrimSize.height}`}
                    onValueChange={(val) => {
                      const [w, h] = val.split('x');
                      const size = TRIM_SIZES.find(s => s.width === w && s.height === h);
                      if (size) setSelectedTrimSize(size);
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

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Size</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Width:</span>{" "}
                        <span className="font-medium">{selectedTrimSize.width}"</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Height:</span>{" "}
                        <span className="font-medium">{selectedTrimSize.height}"</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Copyright Tab */}
          <TabsContent value="copyright" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Copyright Page</CardTitle>
                <CardDescription>
                  Generate a professional copyright page with your book's legal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="978-0-000-00000-0"
                      value={copyrightForm.isbn}
                      onChange={(e) => setCopyrightForm(prev => ({ ...prev, isbn: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishYear">Publication Year</Label>
                    <Input
                      id="publishYear"
                      type="number"
                      value={copyrightForm.publishYear}
                      onChange={(e) => setCopyrightForm(prev => ({ ...prev, publishYear: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisherName">Publisher Name</Label>
                    <Input
                      id="publisherName"
                      placeholder="Your Publishing Company"
                      value={copyrightForm.publisherName}
                      onChange={(e) => setCopyrightForm(prev => ({ ...prev, publisherName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyrightHolder">Copyright Holder</Label>
                    <Input
                      id="copyrightHolder"
                      placeholder="Author Name"
                      value={copyrightForm.copyrightHolder}
                      onChange={(e) => setCopyrightForm(prev => ({ ...prev, copyrightHolder: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalText">Legal Text</Label>
                  <Textarea
                    id="legalText"
                    rows={6}
                    placeholder="All rights reserved..."
                    value={copyrightForm.legalText}
                    onChange={(e) => setCopyrightForm(prev => ({ ...prev, legalText: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalCredits">Additional Credits (Optional)</Label>
                  <Textarea
                    id="additionalCredits"
                    rows={3}
                    placeholder="Cover design by..., Edited by..."
                    value={copyrightForm.additionalCredits}
                    onChange={(e) => setCopyrightForm(prev => ({ ...prev, additionalCredits: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveCopyright} disabled={saveCopyright.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveCopyright.isPending ? "Saving..." : "Save Copyright Page"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Preview</CardTitle>
                <CardDescription>
                  Preview how your book will look with the selected theme and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="w-full max-w-md aspect-[3/4] bg-white rounded-lg shadow-xl p-8 text-gray-900">
                    {/* Simulated book page */}
                    <div className="text-center mb-8">
                      <p className="text-xs text-gray-500 tracking-widest mb-2">CHAPTER ONE</p>
                      <h2 className="text-2xl font-serif">The Beginning</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed font-serif">
                      <p>
                        <span className="float-left text-5xl font-bold mr-2 mt-1 leading-none">T</span>
                        he morning sun cast long shadows across the empty street as Sarah stepped out of her apartment building. She had been waiting for this day for what felt like an eternity.
                      </p>
                      <p>
                        Everything was about to change, and she could feel it in her bones. The letter in her pocket seemed to burn with possibility, its contents still fresh in her mind from when she had read it the night before.
                      </p>
                      <p>
                        "Today is the day," she whispered to herself, watching her breath form small clouds in the crisp autumn air.
                      </p>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-400">
                      1
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ExportPanel 
                projectId={projectId} 
                hasChapters={!!(chapters && chapters.length > 0)}
                pageCount={project.pageCount}
              />
              <StylePreview 
                chapters={chapters || []}
                themeId={selectedTheme}
                copyrightPage={copyrightPage ? {
                  isbn: copyrightPage.isbn || undefined,
                  publisherName: copyrightPage.publisherName || undefined,
                  publishYear: copyrightPage.publishYear || undefined,
                  copyrightHolder: copyrightPage.copyrightHolder || undefined,
                  legalText: copyrightPage.legalText || undefined
                } : null}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function getDefaultLegalText(): string {
  return `All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

This is a work of fiction. Names, characters, businesses, places, events, locales, and incidents are either the products of the author's imagination or used in a fictitious manner. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.`;
}

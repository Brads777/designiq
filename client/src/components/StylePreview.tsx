import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BOOK_THEMES } from "./ThemeSelector";

interface Chapter {
  id: number;
  chapterNumber: number;
  title: string | null;
  content: string | null;
  wordCount: number | null;
}

interface StylePreviewProps {
  chapters: Chapter[];
  themeId: string;
  copyrightPage?: {
    isbn?: string;
    publisherName?: string;
    publishYear?: number;
    copyrightHolder?: string;
    legalText?: string;
  } | null;
}

export function StylePreview({ chapters, themeId, copyrightPage }: StylePreviewProps) {
  const theme = BOOK_THEMES.find(t => t.id === themeId) || BOOK_THEMES[0];
  
  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Book Preview</h3>
        <Badge variant="outline">{theme.name} Theme</Badge>
      </div>

      <Tabs defaultValue="interior" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interior">Interior Pages</TabsTrigger>
          <TabsTrigger value="copyright">Copyright Page</TabsTrigger>
        </TabsList>

        <TabsContent value="interior" className="mt-4">
          <Card className="bg-white text-black">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-8" style={{ fontFamily: theme.fontFamily }}>
                  {chapters.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <p>Upload a document to see the preview</p>
                    </div>
                  ) : (
                    chapters.slice(0, 3).map((chapter, index) => (
                      <div key={chapter.id} className={index > 0 ? "mt-12 pt-12 border-t border-gray-200" : ""}>
                        {/* Chapter Title */}
                        <div 
                          className={`mb-8 ${
                            theme.id === "classic-fiction" ? "text-center" : 
                            theme.id === "academic" ? "text-center" : "text-left"
                          }`}
                          style={{ fontFamily: theme.titleFont }}
                        >
                          {theme.id === "classic-fiction" && (
                            <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
                              Chapter {chapter.chapterNumber}
                            </div>
                          )}
                          <h2 className="text-2xl font-normal">
                            {theme.id === "modern-business" && `${chapter.chapterNumber}. `}
                            {chapter.title || `Chapter ${chapter.chapterNumber}`}
                          </h2>
                        </div>

                        {/* Chapter Content */}
                        <div 
                          className="space-y-4"
                          style={{ 
                            fontSize: `${theme.fontSize}px`,
                            lineHeight: theme.lineHeight
                          }}
                        >
                          {chapter.content ? (
                            <>
                              {/* First paragraph with optional drop cap */}
                              <p className="text-justify">
                                {theme.id === "classic-fiction" && (
                                  <span className="float-left text-5xl font-bold mr-2 mt-1 leading-none">
                                    {stripHtml(chapter.content).charAt(0)}
                                  </span>
                                )}
                                {theme.id === "classic-fiction" 
                                  ? stripHtml(chapter.content).slice(1, 300)
                                  : stripHtml(chapter.content).slice(0, 300)
                                }...
                              </p>
                              {stripHtml(chapter.content).length > 300 && (
                                <p className="text-justify text-gray-400 italic text-sm">
                                  [Content continues...]
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-400 italic">No content available</p>
                          )}
                        </div>

                        {/* Word count badge */}
                        <div className="mt-4 text-right">
                          <span className="text-xs text-gray-400">
                            {chapter.wordCount?.toLocaleString() || 0} words
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  {chapters.length > 3 && (
                    <div className="mt-8 text-center text-gray-400 text-sm">
                      + {chapters.length - 3} more chapters
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copyright" className="mt-4">
          <Card className="bg-white text-black">
            <CardContent className="p-0">
              <div 
                className="p-8 min-h-[500px] flex flex-col items-center justify-center text-center"
                style={{ fontFamily: theme.fontFamily, fontSize: `${theme.fontSize - 1}px` }}
              >
                {copyrightPage ? (
                  <div className="space-y-4 max-w-md">
                    {copyrightPage.copyrightHolder && (
                      <p>
                        Copyright © {copyrightPage.publishYear || new Date().getFullYear()}{" "}
                        {copyrightPage.copyrightHolder}
                      </p>
                    )}
                    
                    {copyrightPage.legalText && (
                      <p className="text-gray-600 whitespace-pre-line">
                        {copyrightPage.legalText}
                      </p>
                    )}
                    
                    {copyrightPage.isbn && (
                      <p className="font-mono">ISBN: {copyrightPage.isbn}</p>
                    )}
                    
                    {copyrightPage.publisherName && (
                      <p>Published by {copyrightPage.publisherName}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <p className="mb-2">Copyright page not configured</p>
                    <p className="text-sm">Add copyright information in the Copyright tab</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Theme Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Theme Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Body Font:</span>
              <span className="ml-2">{theme.fontFamily.split(",")[0].replace(/'/g, "")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Font Size:</span>
              <span className="ml-2">{theme.fontSize}pt</span>
            </div>
            <div>
              <span className="text-muted-foreground">Line Height:</span>
              <span className="ml-2">{theme.lineHeight}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Features:</span>
              <span className="ml-2">{theme.features.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

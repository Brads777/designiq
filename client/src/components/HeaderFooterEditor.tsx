import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { HEADER_FOOTER_PRESETS, HeaderFooterPreset } from "@shared/chapterTemplates";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  BookOpen,
  Hash,
  User,
  FileText,
  Check
} from "lucide-react";

export interface HeaderFooterConfig {
  headerEnabled: boolean;
  headerLeftContent: string;
  headerCenterContent: string;
  headerRightContent: string;
  headerCustomLeft: string;
  headerCustomCenter: string;
  headerCustomRight: string;
  footerEnabled: boolean;
  footerLeftContent: string;
  footerCenterContent: string;
  footerRightContent: string;
  footerCustomLeft: string;
  footerCustomCenter: string;
  footerCustomRight: string;
  useDifferentOddEven: boolean;
  mirrorOnEvenPages: boolean;
  suppressOnChapterFirst: boolean;
  headerFont: string;
  headerFontSize: string;
  footerFont: string;
  footerFontSize: string;
  pageNumberStyle: string;
  pageNumberPrefix: string;
  pageNumberSuffix: string;
}

interface HeaderFooterEditorProps {
  config: HeaderFooterConfig;
  onChange: (config: HeaderFooterConfig) => void;
  bookTitle?: string;
  authorName?: string;
}

const CONTENT_OPTIONS = [
  { value: "none", label: "None", icon: null },
  { value: "page-number", label: "Page Number", icon: Hash },
  { value: "book-title", label: "Book Title", icon: BookOpen },
  { value: "chapter-title", label: "Chapter Title", icon: FileText },
  { value: "author", label: "Author Name", icon: User },
  { value: "custom", label: "Custom Text", icon: AlignLeft },
];

const PAGE_NUMBER_STYLES = [
  { value: "arabic", label: "1, 2, 3" },
  { value: "roman-lower", label: "i, ii, iii" },
  { value: "roman-upper", label: "I, II, III" },
  { value: "alpha-lower", label: "a, b, c" },
  { value: "alpha-upper", label: "A, B, C" },
];

const FONT_OPTIONS = [
  { value: "inherit", label: "Same as Body" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
];

const FONT_SIZES = ["8pt", "9pt", "10pt", "11pt", "12pt"];

export function HeaderFooterEditor({ config, onChange, bookTitle, authorName }: HeaderFooterEditorProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const updateConfig = (updates: Partial<HeaderFooterConfig>) => {
    onChange({ ...config, ...updates });
    setActivePreset(null); // Clear preset when manually editing
  };

  const applyPreset = (preset: HeaderFooterPreset) => {
    onChange({
      ...config,
      headerEnabled: preset.settings.headerEnabled,
      headerLeftContent: preset.settings.headerLeftContent,
      headerCenterContent: preset.settings.headerCenterContent,
      headerRightContent: preset.settings.headerRightContent,
      footerEnabled: preset.settings.footerEnabled,
      footerLeftContent: preset.settings.footerLeftContent,
      footerCenterContent: preset.settings.footerCenterContent,
      footerRightContent: preset.settings.footerRightContent,
      useDifferentOddEven: preset.settings.useDifferentOddEven,
      mirrorOnEvenPages: preset.settings.mirrorOnEvenPages,
      suppressOnChapterFirst: preset.settings.suppressOnChapterFirst,
      pageNumberStyle: preset.settings.pageNumberStyle,
    });
    setActivePreset(preset.id);
  };

  const renderContentSelector = (
    position: "left" | "center" | "right",
    section: "header" | "footer",
    value: string,
    customValue: string,
    onValueChange: (value: string) => void,
    onCustomChange: (value: string) => void
  ) => (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground capitalize">{position}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className="h-3 w-3" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === "custom" && (
        <Input
          placeholder="Enter custom text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className="h-8 text-sm"
        />
      )}
    </div>
  );

  const getPreviewText = (content: string, custom: string) => {
    switch (content) {
      case "page-number":
        return config.pageNumberPrefix + "1" + config.pageNumberSuffix;
      case "book-title":
        return bookTitle || "Book Title";
      case "chapter-title":
        return "Chapter Title";
      case "author":
        return authorName || "Author Name";
      case "custom":
        return custom || "Custom";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {HEADER_FOOTER_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? "default" : "outline"}
              size="sm"
              className="h-auto py-2 px-3 flex flex-col items-start"
              onClick={() => applyPreset(preset)}
            >
              <span className="text-xs font-medium">{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Preview */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Preview</Label>
        <div className="border rounded-lg p-4 bg-white text-black">
          <div className="aspect-[8.5/11] border border-dashed border-gray-300 rounded relative flex flex-col">
            {/* Header Preview */}
            {config.headerEnabled && (
              <div className="px-4 py-2 border-b border-dashed border-gray-200 flex justify-between text-[10px] text-gray-600">
                <span>{getPreviewText(config.headerLeftContent, config.headerCustomLeft)}</span>
                <span>{getPreviewText(config.headerCenterContent, config.headerCustomCenter)}</span>
                <span>{getPreviewText(config.headerRightContent, config.headerCustomRight)}</span>
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="text-center text-gray-400 text-xs">
                Page Content
              </div>
            </div>
            
            {/* Footer Preview */}
            {config.footerEnabled && (
              <div className="px-4 py-2 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-gray-600">
                <span>{getPreviewText(config.footerLeftContent, config.footerCustomLeft)}</span>
                <span>{getPreviewText(config.footerCenterContent, config.footerCustomCenter)}</span>
                <span>{getPreviewText(config.footerRightContent, config.footerCustomRight)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Header Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Header</CardTitle>
            <Switch
              checked={config.headerEnabled}
              onCheckedChange={(checked) => updateConfig({ headerEnabled: checked })}
            />
          </div>
        </CardHeader>
        {config.headerEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {renderContentSelector(
                "left", "header",
                config.headerLeftContent,
                config.headerCustomLeft,
                (value) => updateConfig({ headerLeftContent: value }),
                (value) => updateConfig({ headerCustomLeft: value })
              )}
              {renderContentSelector(
                "center", "header",
                config.headerCenterContent,
                config.headerCustomCenter,
                (value) => updateConfig({ headerCenterContent: value }),
                (value) => updateConfig({ headerCustomCenter: value })
              )}
              {renderContentSelector(
                "right", "header",
                config.headerRightContent,
                config.headerCustomRight,
                (value) => updateConfig({ headerRightContent: value }),
                (value) => updateConfig({ headerCustomRight: value })
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Font</Label>
                <Select 
                  value={config.headerFont} 
                  onValueChange={(value) => updateConfig({ headerFont: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Size</Label>
                <Select 
                  value={config.headerFontSize} 
                  onValueChange={(value) => updateConfig({ headerFontSize: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Footer Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Footer</CardTitle>
            <Switch
              checked={config.footerEnabled}
              onCheckedChange={(checked) => updateConfig({ footerEnabled: checked })}
            />
          </div>
        </CardHeader>
        {config.footerEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {renderContentSelector(
                "left", "footer",
                config.footerLeftContent,
                config.footerCustomLeft,
                (value) => updateConfig({ footerLeftContent: value }),
                (value) => updateConfig({ footerCustomLeft: value })
              )}
              {renderContentSelector(
                "center", "footer",
                config.footerCenterContent,
                config.footerCustomCenter,
                (value) => updateConfig({ footerCenterContent: value }),
                (value) => updateConfig({ footerCustomCenter: value })
              )}
              {renderContentSelector(
                "right", "footer",
                config.footerRightContent,
                config.footerCustomRight,
                (value) => updateConfig({ footerRightContent: value }),
                (value) => updateConfig({ footerCustomRight: value })
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Font</Label>
                <Select 
                  value={config.footerFont} 
                  onValueChange={(value) => updateConfig({ footerFont: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Size</Label>
                <Select 
                  value={config.footerFontSize} 
                  onValueChange={(value) => updateConfig({ footerFontSize: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Page Number Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Page Numbers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Style</Label>
              <Select 
                value={config.pageNumberStyle} 
                onValueChange={(value) => updateConfig({ pageNumberStyle: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_NUMBER_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prefix</Label>
              <Input
                placeholder="e.g., Page "
                value={config.pageNumberPrefix}
                onChange={(e) => updateConfig({ pageNumberPrefix: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Suffix</Label>
              <Input
                placeholder="e.g., ."
                value={config.pageNumberSuffix}
                onChange={(e) => updateConfig({ pageNumberSuffix: e.target.value })}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Advanced Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Different odd/even pages</Label>
              <p className="text-xs text-muted-foreground">
                Use different headers for left and right pages
              </p>
            </div>
            <Switch
              checked={config.useDifferentOddEven}
              onCheckedChange={(checked) => updateConfig({ useDifferentOddEven: checked })}
            />
          </div>
          {config.useDifferentOddEven && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Mirror on even pages</Label>
                <p className="text-xs text-muted-foreground">
                  Swap left/right content on even pages
                </p>
              </div>
              <Switch
                checked={config.mirrorOnEvenPages}
                onCheckedChange={(checked) => updateConfig({ mirrorOnEvenPages: checked })}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Suppress on chapter first page</Label>
              <p className="text-xs text-muted-foreground">
                Hide headers on the first page of each chapter
              </p>
            </div>
            <Switch
              checked={config.suppressOnChapterFirst}
              onCheckedChange={(checked) => updateConfig({ suppressOnChapterFirst: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

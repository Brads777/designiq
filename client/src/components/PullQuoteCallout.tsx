import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Quote, 
  AlertCircle, 
  Info, 
  Lightbulb, 
  AlertTriangle,
  Plus,
  Trash2,
  GripVertical,
  MessageSquareQuote
} from "lucide-react";

// Pull Quote Styles
export type PullQuoteStyle = 
  | "classic" 
  | "modern" 
  | "elegant" 
  | "bold" 
  | "minimal";

export interface PullQuote {
  id: string;
  text: string;
  attribution?: string;
  style: PullQuoteStyle;
  position: "left" | "center" | "right";
}

// Callout Box Types
export type CalloutType = 
  | "tip" 
  | "warning" 
  | "note" 
  | "info" 
  | "important" 
  | "example";

export interface CalloutBox {
  id: string;
  type: CalloutType;
  title?: string;
  content: string;
}

const PULL_QUOTE_STYLES: { id: PullQuoteStyle; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Traditional quotation marks with serif styling" },
  { id: "modern", name: "Modern", description: "Clean lines with accent color border" },
  { id: "elegant", name: "Elegant", description: "Decorative flourishes and italic text" },
  { id: "bold", name: "Bold", description: "Large text with strong visual impact" },
  { id: "minimal", name: "Minimal", description: "Simple left border with subtle styling" },
];

const CALLOUT_TYPES: { id: CalloutType; name: string; icon: typeof Info; color: string }[] = [
  { id: "tip", name: "Tip", icon: Lightbulb, color: "text-green-500" },
  { id: "warning", name: "Warning", icon: AlertTriangle, color: "text-yellow-500" },
  { id: "note", name: "Note", icon: MessageSquareQuote, color: "text-blue-500" },
  { id: "info", name: "Info", icon: Info, color: "text-cyan-500" },
  { id: "important", name: "Important", icon: AlertCircle, color: "text-red-500" },
  { id: "example", name: "Example", icon: Quote, color: "text-purple-500" },
];

interface PullQuoteEditorProps {
  quotes: PullQuote[];
  onQuotesChange: (quotes: PullQuote[]) => void;
}

export function PullQuoteEditor({ quotes, onQuotesChange }: PullQuoteEditorProps) {
  const addQuote = () => {
    const newQuote: PullQuote = {
      id: `quote-${Date.now()}`,
      text: "",
      style: "classic",
      position: "center",
    };
    onQuotesChange([...quotes, newQuote]);
  };

  const updateQuote = (id: string, updates: Partial<PullQuote>) => {
    onQuotesChange(quotes.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuote = (id: string) => {
    onQuotesChange(quotes.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Pull Quotes</h3>
          <p className="text-sm text-muted-foreground">
            Add emphasized quotes that stand out from the main text
          </p>
        </div>
        <Button onClick={addQuote} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pull Quote
        </Button>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Quote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No pull quotes added yet</p>
          <Button onClick={addQuote} variant="link" className="mt-2">
            Add your first pull quote
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <Card key={quote.id} className="relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 hover:opacity-100">
                <GripVertical className="h-5 w-5" />
              </div>
              <CardContent className="pt-4 pl-10">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select
                        value={quote.style}
                        onValueChange={(value: PullQuoteStyle) => updateQuote(quote.id, { style: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PULL_QUOTE_STYLES.map(style => (
                            <SelectItem key={style.id} value={style.id}>
                              <div>
                                <div className="font-medium">{style.name}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select
                        value={quote.position}
                        onValueChange={(value: "left" | "center" | "right") => updateQuote(quote.id, { position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left aligned</SelectItem>
                          <SelectItem value="center">Centered</SelectItem>
                          <SelectItem value="right">Right aligned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Quote Text</Label>
                    <Textarea
                      value={quote.text}
                      onChange={(e) => updateQuote(quote.id, { text: e.target.value })}
                      placeholder="Enter the quote text..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attribution (optional)</Label>
                    <Input
                      value={quote.attribution || ""}
                      onChange={(e) => updateQuote(quote.id, { attribution: e.target.value })}
                      placeholder="— Author Name"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <PullQuotePreview quote={quote} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuote(quote.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PullQuotePreview({ quote }: { quote: PullQuote }) {
  const getStyleClasses = () => {
    const baseClasses = "p-4 my-2 max-w-md";
    const positionClasses = {
      left: "mr-auto text-left",
      center: "mx-auto text-center",
      right: "ml-auto text-right",
    };

    const styleClasses = {
      classic: "border-l-4 border-primary bg-muted/30 italic font-serif",
      modern: "border-l-4 border-primary/70 bg-primary/5",
      elegant: "border-y border-primary/30 italic font-serif text-lg",
      bold: "bg-primary/10 text-xl font-semibold",
      minimal: "border-l-2 border-muted-foreground/30 pl-4",
    };

    return `${baseClasses} ${positionClasses[quote.position]} ${styleClasses[quote.style]}`;
  };

  if (!quote.text) return null;

  return (
    <div className="flex-1 mr-4">
      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
      <div className={getStyleClasses()}>
        <p className="text-sm">{quote.text || "Quote preview..."}</p>
        {quote.attribution && (
          <p className="text-xs text-muted-foreground mt-2">{quote.attribution}</p>
        )}
      </div>
    </div>
  );
}

interface CalloutEditorProps {
  callouts: CalloutBox[];
  onCalloutsChange: (callouts: CalloutBox[]) => void;
}

export function CalloutEditor({ callouts, onCalloutsChange }: CalloutEditorProps) {
  const addCallout = (type: CalloutType) => {
    const newCallout: CalloutBox = {
      id: `callout-${Date.now()}`,
      type,
      content: "",
    };
    onCalloutsChange([...callouts, newCallout]);
  };

  const updateCallout = (id: string, updates: Partial<CalloutBox>) => {
    onCalloutsChange(callouts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCallout = (id: string) => {
    onCalloutsChange(callouts.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Callout Boxes</h3>
          <p className="text-sm text-muted-foreground">
            Add tips, warnings, notes, and other highlighted content
          </p>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-2">
        {CALLOUT_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant="outline"
              size="sm"
              onClick={() => addCallout(type.id)}
              className="gap-2"
            >
              <Icon className={`h-4 w-4 ${type.color}`} />
              {type.name}
            </Button>
          );
        })}
      </div>

      {callouts.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No callout boxes added yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click a button above to add a callout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {callouts.map((callout) => {
            const typeInfo = CALLOUT_TYPES.find(t => t.id === callout.type)!;
            const Icon = typeInfo.icon;
            
            return (
              <Card key={callout.id} className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 hover:opacity-100">
                  <GripVertical className="h-5 w-5" />
                </div>
                <CardContent className="pt-4 pl-10">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                      <span className="font-medium">{typeInfo.name}</span>
                      <Select
                        value={callout.type}
                        onValueChange={(value: CalloutType) => updateCallout(callout.id, { type: value })}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CALLOUT_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={callout.title || ""}
                        onChange={(e) => updateCallout(callout.id, { title: e.target.value })}
                        placeholder={`${typeInfo.name} title...`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={callout.content}
                        onChange={(e) => updateCallout(callout.id, { content: e.target.value })}
                        placeholder="Enter the callout content..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <CalloutPreview callout={callout} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCallout(callout.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalloutPreview({ callout }: { callout: CalloutBox }) {
  const typeInfo = CALLOUT_TYPES.find(t => t.id === callout.type)!;
  const Icon = typeInfo.icon;

  const bgColors: Record<CalloutType, string> = {
    tip: "bg-green-500/10 border-green-500/30",
    warning: "bg-yellow-500/10 border-yellow-500/30",
    note: "bg-blue-500/10 border-blue-500/30",
    info: "bg-cyan-500/10 border-cyan-500/30",
    important: "bg-red-500/10 border-red-500/30",
    example: "bg-purple-500/10 border-purple-500/30",
  };

  if (!callout.content) return null;

  return (
    <div className="flex-1 mr-4">
      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
      <div className={`p-3 rounded-lg border ${bgColors[callout.type]}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${typeInfo.color}`} />
          <span className="font-medium text-sm">
            {callout.title || typeInfo.name}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{callout.content}</p>
      </div>
    </div>
  );
}

// Combined component for use in the editor
interface PullQuoteCalloutEditorProps {
  pullQuotes: PullQuote[];
  callouts: CalloutBox[];
  onPullQuotesChange: (quotes: PullQuote[]) => void;
  onCalloutsChange: (callouts: CalloutBox[]) => void;
}

export function PullQuoteCalloutEditor({
  pullQuotes,
  callouts,
  onPullQuotesChange,
  onCalloutsChange,
}: PullQuoteCalloutEditorProps) {
  return (
    <div className="space-y-8">
      <PullQuoteEditor quotes={pullQuotes} onQuotesChange={onPullQuotesChange} />
      <div className="border-t pt-8">
        <CalloutEditor callouts={callouts} onCalloutsChange={onCalloutsChange} />
      </div>
    </div>
  );
}

/**
 * Predefined chapter templates for DesignIQ
 */

export interface ChapterTemplateConfig {
  id: string;
  name: string;
  description: string;
  category: "intro" | "body" | "graphic-novel" | "custom";
  layoutType: "text-only" | "text-with-images" | "full-bleed-image" | "image-grid" | "decorative-intro" | "minimal-intro";
  settings: {
    // Typography
    titleFont?: string;
    titleSize?: string;
    titleAlignment?: "left" | "center" | "right";
    titleStyle?: "uppercase" | "capitalize" | "none";
    
    // Drop cap
    useDropCap?: boolean;
    dropCapLines?: number;
    dropCapFont?: string;
    
    // Spacing
    titleTopMargin?: string;
    titleBottomMargin?: string;
    paragraphSpacing?: string;
    lineHeight?: string;
    
    // Decorative elements
    useDivider?: boolean;
    dividerStyle?: "line" | "ornament" | "dots" | "custom";
    dividerImageUrl?: string;
    
    // Chapter number
    showChapterNumber?: boolean;
    chapterNumberStyle?: "numeric" | "word" | "roman";
    chapterNumberPrefix?: string;
    
    // Background
    backgroundColor?: string;
    backgroundImageUrl?: string;
    backgroundOpacity?: number;
    
    // Image settings (for text-with-images)
    defaultImagePlacement?: "inline" | "float-left" | "float-right" | "full-width";
    imageMargin?: string;
    imageCaptionStyle?: "italic" | "bold" | "normal";
    
    // Graphic novel settings
    panelGutter?: string;
    panelBorderWidth?: string;
    panelBorderColor?: string;
    defaultBubbleFont?: string;
  };
  previewImageUrl?: string;
}

// Chapter Intro Templates
export const CHAPTER_INTRO_TEMPLATES: ChapterTemplateConfig[] = [
  {
    id: "intro-classic-centered",
    name: "Classic Centered",
    description: "Traditional centered chapter opening with elegant typography",
    category: "intro",
    layoutType: "decorative-intro",
    settings: {
      titleFont: "Georgia, serif",
      titleSize: "28pt",
      titleAlignment: "center",
      titleStyle: "capitalize",
      useDropCap: true,
      dropCapLines: 3,
      dropCapFont: "Georgia, serif",
      titleTopMargin: "3in",
      titleBottomMargin: "0.5in",
      showChapterNumber: true,
      chapterNumberStyle: "word",
      chapterNumberPrefix: "Chapter",
      useDivider: true,
      dividerStyle: "ornament"
    }
  },
  {
    id: "intro-modern-left",
    name: "Modern Left-Aligned",
    description: "Clean, contemporary left-aligned chapter start",
    category: "intro",
    layoutType: "minimal-intro",
    settings: {
      titleFont: "Inter, sans-serif",
      titleSize: "24pt",
      titleAlignment: "left",
      titleStyle: "none",
      useDropCap: false,
      titleTopMargin: "2in",
      titleBottomMargin: "0.75in",
      showChapterNumber: true,
      chapterNumberStyle: "numeric",
      chapterNumberPrefix: "",
      useDivider: true,
      dividerStyle: "line"
    }
  },
  {
    id: "intro-full-bleed",
    name: "Full Bleed Image",
    description: "Chapter opens with a full-page image, title overlaid",
    category: "intro",
    layoutType: "full-bleed-image",
    settings: {
      titleFont: "Playfair Display, serif",
      titleSize: "36pt",
      titleAlignment: "center",
      titleStyle: "uppercase",
      useDropCap: false,
      titleTopMargin: "40%",
      backgroundColor: "rgba(0,0,0,0.4)",
      showChapterNumber: true,
      chapterNumberStyle: "numeric"
    }
  },
  {
    id: "intro-decorative-frame",
    name: "Decorative Frame",
    description: "Ornate border frame around chapter title",
    category: "intro",
    layoutType: "decorative-intro",
    settings: {
      titleFont: "Cormorant Garamond, serif",
      titleSize: "32pt",
      titleAlignment: "center",
      titleStyle: "capitalize",
      useDropCap: true,
      dropCapLines: 4,
      titleTopMargin: "2.5in",
      titleBottomMargin: "0.5in",
      showChapterNumber: true,
      chapterNumberStyle: "roman",
      useDivider: true,
      dividerStyle: "ornament"
    }
  },
  {
    id: "intro-minimal",
    name: "Minimal",
    description: "Ultra-clean minimal chapter opening",
    category: "intro",
    layoutType: "minimal-intro",
    settings: {
      titleFont: "Helvetica Neue, sans-serif",
      titleSize: "18pt",
      titleAlignment: "left",
      titleStyle: "uppercase",
      useDropCap: false,
      titleTopMargin: "1.5in",
      titleBottomMargin: "1in",
      showChapterNumber: false,
      useDivider: false
    }
  }
];

// Chapter Body Templates
export const CHAPTER_BODY_TEMPLATES: ChapterTemplateConfig[] = [
  {
    id: "body-text-only",
    name: "Text Only",
    description: "Standard text layout without images",
    category: "body",
    layoutType: "text-only",
    settings: {
      paragraphSpacing: "0",
      lineHeight: "1.5",
      useDropCap: false
    }
  },
  {
    id: "body-with-inline-images",
    name: "With Inline Images",
    description: "Text with images flowing inline",
    category: "body",
    layoutType: "text-with-images",
    settings: {
      defaultImagePlacement: "inline",
      imageMargin: "1em",
      imageCaptionStyle: "italic",
      paragraphSpacing: "0",
      lineHeight: "1.5"
    }
  },
  {
    id: "body-float-images",
    name: "Floating Images",
    description: "Images float with text wrapping around them",
    category: "body",
    layoutType: "text-with-images",
    settings: {
      defaultImagePlacement: "float-right",
      imageMargin: "1em",
      imageCaptionStyle: "italic",
      paragraphSpacing: "0",
      lineHeight: "1.5"
    }
  },
  {
    id: "body-full-width-images",
    name: "Full-Width Image Breaks",
    description: "Images span the full text width, breaking the flow",
    category: "body",
    layoutType: "text-with-images",
    settings: {
      defaultImagePlacement: "full-width",
      imageMargin: "1.5em",
      imageCaptionStyle: "normal",
      paragraphSpacing: "0",
      lineHeight: "1.5"
    }
  },
  {
    id: "body-illustrated",
    name: "Illustrated Book",
    description: "Heavy image integration for illustrated books",
    category: "body",
    layoutType: "text-with-images",
    settings: {
      defaultImagePlacement: "full-width",
      imageMargin: "2em",
      imageCaptionStyle: "bold",
      paragraphSpacing: "1em",
      lineHeight: "1.6"
    }
  }
];

// Graphic Novel Templates
export const GRAPHIC_NOVEL_TEMPLATES: ChapterTemplateConfig[] = [
  {
    id: "gn-single-page",
    name: "Single Full Page",
    description: "One image fills the entire page",
    category: "graphic-novel",
    layoutType: "full-bleed-image",
    settings: {
      panelGutter: "0",
      panelBorderWidth: "0",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-two-panel-horizontal",
    name: "Two Panel (Horizontal)",
    description: "Two panels side by side",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.1in",
      panelBorderWidth: "2px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-two-panel-vertical",
    name: "Two Panel (Vertical)",
    description: "Two panels stacked vertically",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.1in",
      panelBorderWidth: "2px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-three-panel",
    name: "Three Panel Strip",
    description: "Classic three-panel comic strip layout",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.1in",
      panelBorderWidth: "2px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-four-panel-grid",
    name: "Four Panel Grid",
    description: "2x2 panel grid layout",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.1in",
      panelBorderWidth: "2px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-six-panel-grid",
    name: "Six Panel Grid",
    description: "2x3 panel grid layout",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.08in",
      panelBorderWidth: "2px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Comic Sans MS, cursive"
    }
  },
  {
    id: "gn-manga-style",
    name: "Manga Style",
    description: "Dynamic panel layout typical of manga",
    category: "graphic-novel",
    layoutType: "image-grid",
    settings: {
      panelGutter: "0.05in",
      panelBorderWidth: "1px",
      panelBorderColor: "#000000",
      defaultBubbleFont: "Arial, sans-serif"
    }
  }
];

// All templates combined
export const ALL_CHAPTER_TEMPLATES = [
  ...CHAPTER_INTRO_TEMPLATES,
  ...CHAPTER_BODY_TEMPLATES,
  ...GRAPHIC_NOVEL_TEMPLATES
];

// Header/Footer presets
export interface HeaderFooterPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    headerEnabled: boolean;
    headerLeftContent: string;
    headerCenterContent: string;
    headerRightContent: string;
    footerEnabled: boolean;
    footerLeftContent: string;
    footerCenterContent: string;
    footerRightContent: string;
    useDifferentOddEven: boolean;
    mirrorOnEvenPages: boolean;
    suppressOnChapterFirst: boolean;
    pageNumberStyle: string;
  };
}

export const HEADER_FOOTER_PRESETS: HeaderFooterPreset[] = [
  {
    id: "classic-fiction",
    name: "Classic Fiction",
    description: "Book title on left pages, chapter title on right pages",
    settings: {
      headerEnabled: true,
      headerLeftContent: "book-title",
      headerCenterContent: "none",
      headerRightContent: "chapter-title",
      footerEnabled: true,
      footerLeftContent: "none",
      footerCenterContent: "page-number",
      footerRightContent: "none",
      useDifferentOddEven: true,
      mirrorOnEvenPages: true,
      suppressOnChapterFirst: true,
      pageNumberStyle: "arabic"
    }
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Page numbers only in bottom corners",
    settings: {
      headerEnabled: false,
      headerLeftContent: "none",
      headerCenterContent: "none",
      headerRightContent: "none",
      footerEnabled: true,
      footerLeftContent: "page-number",
      footerCenterContent: "none",
      footerRightContent: "page-number",
      useDifferentOddEven: true,
      mirrorOnEvenPages: true,
      suppressOnChapterFirst: true,
      pageNumberStyle: "arabic"
    }
  },
  {
    id: "academic",
    name: "Academic",
    description: "Author and title in header, page numbers in footer",
    settings: {
      headerEnabled: true,
      headerLeftContent: "author",
      headerCenterContent: "none",
      headerRightContent: "book-title",
      footerEnabled: true,
      footerLeftContent: "none",
      footerCenterContent: "page-number",
      footerRightContent: "none",
      useDifferentOddEven: true,
      mirrorOnEvenPages: true,
      suppressOnChapterFirst: true,
      pageNumberStyle: "arabic"
    }
  },
  {
    id: "graphic-novel",
    name: "Graphic Novel",
    description: "No headers, page numbers only",
    settings: {
      headerEnabled: false,
      headerLeftContent: "none",
      headerCenterContent: "none",
      headerRightContent: "none",
      footerEnabled: true,
      footerLeftContent: "none",
      footerCenterContent: "page-number",
      footerRightContent: "none",
      useDifferentOddEven: false,
      mirrorOnEvenPages: false,
      suppressOnChapterFirst: false,
      pageNumberStyle: "arabic"
    }
  },
  {
    id: "none",
    name: "No Headers/Footers",
    description: "Clean pages with no running headers or footers",
    settings: {
      headerEnabled: false,
      headerLeftContent: "none",
      headerCenterContent: "none",
      headerRightContent: "none",
      footerEnabled: false,
      footerLeftContent: "none",
      footerCenterContent: "none",
      footerRightContent: "none",
      useDifferentOddEven: false,
      mirrorOnEvenPages: false,
      suppressOnChapterFirst: false,
      pageNumberStyle: "arabic"
    }
  }
];

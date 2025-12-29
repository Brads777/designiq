/**
 * PDF Generation Service for DesignIQ
 * Generates print-ready PDFs with professional typesetting
 */

export interface BookTheme {
  id: string;
  name: string;
  fontFamily: string;
  titleFontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    inner: number;
    outer: number;
  };
  chapterStyle: {
    titleAlignment: "left" | "center" | "right";
    dropCap: boolean;
    dropCapLines: number;
    chapterStartPage: "recto" | "any";
  };
}

export interface TrimSize {
  width: number;  // inches
  height: number; // inches
}

export interface PDFGenerationOptions {
  theme: BookTheme;
  trimSize: TrimSize;
  includeBleed: boolean;
  bleedSize: number; // inches, typically 0.125
}

// Pre-defined book themes
export const BOOK_THEMES: Record<string, BookTheme> = {
  "classic-fiction": {
    id: "classic-fiction",
    name: "Classic Fiction",
    fontFamily: "Georgia, 'Times New Roman', serif",
    titleFontFamily: "Georgia, serif",
    fontSize: 11,
    lineHeight: 1.5,
    margins: {
      top: 0.75,
      bottom: 0.75,
      inner: 0.875,
      outer: 0.625
    },
    chapterStyle: {
      titleAlignment: "center",
      dropCap: true,
      dropCapLines: 3,
      chapterStartPage: "recto"
    }
  },
  "modern-business": {
    id: "modern-business",
    name: "Modern Business",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    titleFontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 10,
    lineHeight: 1.4,
    margins: {
      top: 0.75,
      bottom: 0.75,
      inner: 0.75,
      outer: 0.75
    },
    chapterStyle: {
      titleAlignment: "left",
      dropCap: false,
      dropCapLines: 0,
      chapterStartPage: "any"
    }
  },
  "academic": {
    id: "academic",
    name: "Academic",
    fontFamily: "'Times New Roman', Times, serif",
    titleFontFamily: "'Times New Roman', Times, serif",
    fontSize: 12,
    lineHeight: 2.0,
    margins: {
      top: 1.0,
      bottom: 1.0,
      inner: 1.25,
      outer: 1.0
    },
    chapterStyle: {
      titleAlignment: "center",
      dropCap: false,
      dropCapLines: 0,
      chapterStartPage: "recto"
    }
  }
};

// Amazon KDP standard trim sizes
export const TRIM_SIZES: Record<string, TrimSize> = {
  "5x8": { width: 5, height: 8 },
  "5.25x8": { width: 5.25, height: 8 },
  "5.5x8.5": { width: 5.5, height: 8.5 },
  "6x9": { width: 6, height: 9 },
  "6.14x9.21": { width: 6.14, height: 9.21 },
  "6.69x9.61": { width: 6.69, height: 9.61 },
  "7x10": { width: 7, height: 10 },
  "7.5x9.25": { width: 7.5, height: 9.25 },
  "8x10": { width: 8, height: 10 },
  "8.5x11": { width: 8.5, height: 11 }
};

/**
 * Generate HTML content for PDF conversion
 * This creates properly formatted HTML that can be converted to PDF
 */
export function generateBookHtml(
  chapters: Array<{
    number: number;
    title: string;
    content: string;
  }>,
  copyrightPage: {
    isbn?: string;
    publisherName?: string;
    publishYear?: number;
    copyrightHolder?: string;
    legalText?: string;
    additionalCredits?: string;
  } | null,
  options: PDFGenerationOptions
): string {
  const { theme, trimSize, includeBleed, bleedSize } = options;
  
  // Calculate page dimensions in points (72 points per inch)
  const pageWidth = (trimSize.width + (includeBleed ? bleedSize * 2 : 0)) * 72;
  const pageHeight = (trimSize.height + (includeBleed ? bleedSize * 2 : 0)) * 72;
  
  // Generate CSS
  const css = `
    @page {
      size: ${pageWidth}pt ${pageHeight}pt;
      margin: ${theme.margins.top}in ${theme.margins.outer}in ${theme.margins.bottom}in ${theme.margins.inner}in;
      @bottom-center {
        content: counter(page);
        font-family: ${theme.fontFamily};
        font-size: 10pt;
      }
    }
    
    @page :left {
      margin-left: ${theme.margins.outer}in;
      margin-right: ${theme.margins.inner}in;
    }
    
    @page :right {
      margin-left: ${theme.margins.inner}in;
      margin-right: ${theme.margins.outer}in;
    }
    
    @page :first {
      @bottom-center { content: none; }
    }
    
    body {
      font-family: ${theme.fontFamily};
      font-size: ${theme.fontSize}pt;
      line-height: ${theme.lineHeight};
      text-align: justify;
      hyphens: auto;
      -webkit-hyphens: auto;
      orphans: 2;
      widows: 2;
    }
    
    h1.chapter-title {
      font-family: ${theme.titleFontFamily};
      font-size: ${theme.fontSize * 2}pt;
      text-align: ${theme.chapterStyle.titleAlignment};
      margin-top: 2in;
      margin-bottom: 0.5in;
      page-break-before: ${theme.chapterStyle.chapterStartPage === 'recto' ? 'right' : 'always'};
      font-weight: normal;
      letter-spacing: 0.1em;
    }
    
    h1.chapter-title .chapter-number {
      display: block;
      font-size: ${theme.fontSize}pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 0.25in;
    }
    
    p {
      margin: 0;
      text-indent: 1.5em;
    }
    
    p.first-paragraph {
      text-indent: 0;
    }
    
    ${theme.chapterStyle.dropCap ? `
    p.first-paragraph::first-letter {
      float: left;
      font-size: ${theme.fontSize * theme.chapterStyle.dropCapLines}pt;
      line-height: 1;
      padding-right: 0.1em;
      font-weight: bold;
    }
    ` : ''}
    
    .copyright-page {
      page-break-before: always;
      font-size: ${theme.fontSize - 1}pt;
      text-align: center;
      padding-top: 3in;
    }
    
    .copyright-page p {
      text-indent: 0;
      margin-bottom: 1em;
    }
    
    blockquote {
      margin: 1em 2em;
      font-style: italic;
    }
    
    .scene-break {
      text-align: center;
      margin: 1em 0;
    }
    
    .scene-break::before {
      content: "* * *";
      letter-spacing: 0.5em;
    }
  `;
  
  // Generate copyright page HTML
  let copyrightHtml = '';
  if (copyrightPage) {
    copyrightHtml = `
      <div class="copyright-page">
        ${copyrightPage.copyrightHolder ? `<p>Copyright © ${copyrightPage.publishYear || new Date().getFullYear()} ${copyrightPage.copyrightHolder}</p>` : ''}
        ${copyrightPage.legalText ? `<p>${copyrightPage.legalText.replace(/\n/g, '<br>')}</p>` : ''}
        ${copyrightPage.isbn ? `<p>ISBN: ${copyrightPage.isbn}</p>` : ''}
        ${copyrightPage.publisherName ? `<p>Published by ${copyrightPage.publisherName}</p>` : ''}
        ${copyrightPage.additionalCredits ? `<p>${copyrightPage.additionalCredits.replace(/\n/g, '<br>')}</p>` : ''}
      </div>
    `;
  }
  
  // Generate chapters HTML
  const chaptersHtml = chapters.map((chapter, index) => {
    // Process content to add proper paragraph classes
    let content = chapter.content;
    
    // Add first-paragraph class to first paragraph after chapter title
    content = content.replace(/<p>/, '<p class="first-paragraph">');
    
    return `
      <h1 class="chapter-title">
        <span class="chapter-number">Chapter ${chapter.number}</span>
        ${chapter.title}
      </h1>
      <div class="chapter-content">
        ${content}
      </div>
    `;
  }).join('\n');
  
  // Combine into full HTML document
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>${css}</style>
    </head>
    <body>
      ${copyrightHtml}
      ${chaptersHtml}
    </body>
    </html>
  `;
}

/**
 * Calculate spine width based on page count and paper type
 */
export function calculateSpineWidth(pageCount: number, paperType: "white" | "cream" | "color"): number {
  const multipliers = {
    white: 0.002252,
    cream: 0.0025,
    color: 0.002347
  };
  return pageCount * multipliers[paperType];
}

/**
 * Generate full cover dimensions including spine
 */
export function calculateCoverDimensions(
  trimSize: TrimSize,
  pageCount: number,
  paperType: "white" | "cream" | "color",
  bleed: number = 0.125
): {
  fullWidth: number;
  fullHeight: number;
  spineWidth: number;
  frontCoverX: number;
  spineX: number;
  backCoverX: number;
} {
  const spineWidth = calculateSpineWidth(pageCount, paperType);
  const fullWidth = (trimSize.width * 2) + spineWidth + (bleed * 2);
  const fullHeight = trimSize.height + (bleed * 2);
  
  return {
    fullWidth,
    fullHeight,
    spineWidth,
    frontCoverX: trimSize.width + spineWidth + bleed,
    spineX: trimSize.width + bleed,
    backCoverX: bleed
  };
}

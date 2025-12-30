import { describe, expect, it } from "vitest";
import { 
  CHAPTER_INTRO_TEMPLATES, 
  CHAPTER_BODY_TEMPLATES, 
  GRAPHIC_NOVEL_TEMPLATES,
  HEADER_FOOTER_PRESETS,
  ALL_CHAPTER_TEMPLATES
} from "../shared/chapterTemplates";

describe("Chapter Templates", () => {
  describe("Chapter Intro Templates", () => {
    it("should have at least 3 intro templates", () => {
      expect(CHAPTER_INTRO_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it("should have unique IDs for all intro templates", () => {
      const ids = CHAPTER_INTRO_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have required fields for each intro template", () => {
      CHAPTER_INTRO_TEMPLATES.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBe("intro");
        expect(template.layoutType).toBeDefined();
        expect(template.settings).toBeDefined();
      });
    });

    it("should include classic centered template", () => {
      const classic = CHAPTER_INTRO_TEMPLATES.find(t => t.id === "intro-classic-centered");
      expect(classic).toBeDefined();
      expect(classic?.settings.titleAlignment).toBe("center");
      expect(classic?.settings.useDropCap).toBe(true);
    });

    it("should include full bleed image template", () => {
      const fullBleed = CHAPTER_INTRO_TEMPLATES.find(t => t.id === "intro-full-bleed");
      expect(fullBleed).toBeDefined();
      expect(fullBleed?.layoutType).toBe("full-bleed-image");
    });
  });

  describe("Chapter Body Templates", () => {
    it("should have at least 3 body templates", () => {
      expect(CHAPTER_BODY_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it("should have unique IDs for all body templates", () => {
      const ids = CHAPTER_BODY_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have required fields for each body template", () => {
      CHAPTER_BODY_TEMPLATES.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.category).toBe("body");
        expect(template.layoutType).toBeDefined();
      });
    });

    it("should include text-only template", () => {
      const textOnly = CHAPTER_BODY_TEMPLATES.find(t => t.id === "body-text-only");
      expect(textOnly).toBeDefined();
      expect(textOnly?.layoutType).toBe("text-only");
    });

    it("should include templates with image support", () => {
      const withImages = CHAPTER_BODY_TEMPLATES.filter(t => t.layoutType === "text-with-images");
      expect(withImages.length).toBeGreaterThanOrEqual(2);
    });

    it("should have different image placement options", () => {
      const placements = CHAPTER_BODY_TEMPLATES
        .filter(t => t.settings.defaultImagePlacement)
        .map(t => t.settings.defaultImagePlacement);
      const uniquePlacements = new Set(placements);
      expect(uniquePlacements.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Graphic Novel Templates", () => {
    it("should have at least 5 graphic novel templates", () => {
      expect(GRAPHIC_NOVEL_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique IDs for all graphic novel templates", () => {
      const ids = GRAPHIC_NOVEL_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have required fields for each graphic novel template", () => {
      GRAPHIC_NOVEL_TEMPLATES.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.category).toBe("graphic-novel");
        expect(template.settings.panelGutter).toBeDefined();
        expect(template.settings.panelBorderWidth).toBeDefined();
      });
    });

    it("should include single page template", () => {
      const single = GRAPHIC_NOVEL_TEMPLATES.find(t => t.id === "gn-single-page");
      expect(single).toBeDefined();
      expect(single?.layoutType).toBe("full-bleed-image");
    });

    it("should include grid layouts", () => {
      const fourGrid = GRAPHIC_NOVEL_TEMPLATES.find(t => t.id === "gn-four-panel-grid");
      const sixGrid = GRAPHIC_NOVEL_TEMPLATES.find(t => t.id === "gn-six-panel-grid");
      expect(fourGrid).toBeDefined();
      expect(sixGrid).toBeDefined();
    });
  });

  describe("All Templates Combined", () => {
    it("should combine all template categories", () => {
      const expectedTotal = 
        CHAPTER_INTRO_TEMPLATES.length + 
        CHAPTER_BODY_TEMPLATES.length + 
        GRAPHIC_NOVEL_TEMPLATES.length;
      expect(ALL_CHAPTER_TEMPLATES.length).toBe(expectedTotal);
    });

    it("should have globally unique IDs across all templates", () => {
      const ids = ALL_CHAPTER_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

describe("Header/Footer Presets", () => {
  it("should have at least 4 presets", () => {
    expect(HEADER_FOOTER_PRESETS.length).toBeGreaterThanOrEqual(4);
  });

  it("should have unique IDs for all presets", () => {
    const ids = HEADER_FOOTER_PRESETS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have required fields for each preset", () => {
    HEADER_FOOTER_PRESETS.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.settings).toBeDefined();
      expect(typeof preset.settings.headerEnabled).toBe("boolean");
      expect(typeof preset.settings.footerEnabled).toBe("boolean");
    });
  });

  it("should include classic fiction preset", () => {
    const classic = HEADER_FOOTER_PRESETS.find(p => p.id === "classic-fiction");
    expect(classic).toBeDefined();
    expect(classic?.settings.headerEnabled).toBe(true);
    expect(classic?.settings.headerLeftContent).toBe("book-title");
    expect(classic?.settings.headerRightContent).toBe("chapter-title");
  });

  it("should include modern minimal preset", () => {
    const minimal = HEADER_FOOTER_PRESETS.find(p => p.id === "modern-minimal");
    expect(minimal).toBeDefined();
    expect(minimal?.settings.headerEnabled).toBe(false);
    expect(minimal?.settings.footerEnabled).toBe(true);
  });

  it("should include no headers/footers preset", () => {
    const none = HEADER_FOOTER_PRESETS.find(p => p.id === "none");
    expect(none).toBeDefined();
    expect(none?.settings.headerEnabled).toBe(false);
    expect(none?.settings.footerEnabled).toBe(false);
  });

  it("should include graphic novel preset", () => {
    const gn = HEADER_FOOTER_PRESETS.find(p => p.id === "graphic-novel");
    expect(gn).toBeDefined();
    expect(gn?.settings.headerEnabled).toBe(false);
  });

  it("should have valid content options", () => {
    const validContentOptions = ["none", "page-number", "book-title", "chapter-title", "author", "custom"];
    
    HEADER_FOOTER_PRESETS.forEach(preset => {
      expect(validContentOptions).toContain(preset.settings.headerLeftContent);
      expect(validContentOptions).toContain(preset.settings.headerCenterContent);
      expect(validContentOptions).toContain(preset.settings.headerRightContent);
      expect(validContentOptions).toContain(preset.settings.footerLeftContent);
      expect(validContentOptions).toContain(preset.settings.footerCenterContent);
      expect(validContentOptions).toContain(preset.settings.footerRightContent);
    });
  });

  it("should have valid page number styles", () => {
    const validStyles = ["arabic", "roman-lower", "roman-upper", "alpha-lower", "alpha-upper"];
    
    HEADER_FOOTER_PRESETS.forEach(preset => {
      expect(validStyles).toContain(preset.settings.pageNumberStyle);
    });
  });
});

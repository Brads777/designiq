import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["none", "active", "canceled", "past_due", "lifetime"]).default("none").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["none", "monthly", "annual", "lifetime"]).default("none").notNull(),
  
  // Onboarding
  hasAcceptedTos: boolean("hasAcceptedTos").default(false).notNull(),
  tosAcceptedAt: timestamp("tosAcceptedAt"),
  hasCompletedOnboarding: boolean("hasCompletedOnboarding").default(false).notNull(),
  onboardingStep: int("onboardingStep").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Book projects - the main container for each book being formatted
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  status: mysqlEnum("status", ["draft", "processing", "ready", "exported"]).default("draft").notNull(),
  
  // Source document
  sourceFileUrl: text("sourceFileUrl"),
  sourceFileName: varchar("sourceFileName", { length: 255 }),
  
  // Detected/parsed content
  pageCount: int("pageCount"),
  chapterCount: int("chapterCount"),
  wordCount: int("wordCount"),
  
  // Selected theme and settings
  themeId: varchar("themeId", { length: 64 }),
  customStyles: json("customStyles"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Parsed chapters from the Word document
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content"),
  wordCount: int("wordCount"),
  
  // Style overrides for this chapter
  useDropCap: boolean("useDropCap").default(true),
  customStyles: json("customStyles"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * Cover designs for books
 */
export const covers = mysqlTable("covers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Amazon KDP specifications
  paperType: mysqlEnum("paperType", ["white", "cream", "color"]).default("cream").notNull(),
  trimWidth: decimal("trimWidth", { precision: 5, scale: 2 }).notNull(), // inches
  trimHeight: decimal("trimHeight", { precision: 5, scale: 2 }).notNull(), // inches
  pageCount: int("pageCount").notNull(),
  spineWidth: decimal("spineWidth", { precision: 5, scale: 3 }), // calculated
  
  // Cover design data
  frontCoverUrl: text("frontCoverUrl"),
  backCoverUrl: text("backCoverUrl"),
  spineText: varchar("spineText", { length: 255 }),
  
  // Design elements (JSON for flexibility)
  designData: json("designData"),
  
  // Export
  fullCoverUrl: text("fullCoverUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cover = typeof covers.$inferSelect;
export type InsertCover = typeof covers.$inferInsert;

/**
 * Copyright page data
 */
export const copyrightPages = mysqlTable("copyrightPages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Standard fields
  isbn: varchar("isbn", { length: 20 }),
  publisherName: varchar("publisherName", { length: 255 }),
  publishYear: int("publishYear"),
  copyrightHolder: varchar("copyrightHolder", { length: 255 }),
  
  // Legal text
  legalText: text("legalText"),
  additionalCredits: text("additionalCredits"),
  
  // Custom content
  customContent: text("customContent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CopyrightPage = typeof copyrightPages.$inferSelect;
export type InsertCopyrightPage = typeof copyrightPages.$inferInsert;

/**
 * Style mappings - how Word styles map to book styles
 */
export const styleMappings = mysqlTable("styleMappings", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Source style from Word
  sourceStyleName: varchar("sourceStyleName", { length: 255 }).notNull(),
  sourceStyleType: mysqlEnum("sourceStyleType", ["paragraph", "character"]).notNull(),
  
  // Target book style
  targetStyleName: varchar("targetStyleName", { length: 255 }).notNull(),
  
  // User acceptance
  isAccepted: boolean("isAccepted").default(false),
  isAutoDetected: boolean("isAutoDetected").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StyleMapping = typeof styleMappings.$inferSelect;
export type InsertStyleMapping = typeof styleMappings.$inferInsert;

/**
 * Export jobs - track IDML/PDF generation
 */
export const exportJobs = mysqlTable("exportJobs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  exportType: mysqlEnum("exportType", ["idml", "pdf", "both"]).notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  
  // Output files
  idmlFileUrl: text("idmlFileUrl"),
  pdfFileUrl: text("pdfFileUrl"),
  
  // Processing info
  errorMessage: text("errorMessage"),
  processingStartedAt: timestamp("processingStartedAt"),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;


/**
 * User feedback submissions
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["bug", "feature", "general", "support"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Optional context
  pageUrl: varchar("pageUrl", { length: 500 }),
  browserInfo: text("browserInfo"),
  
  // Status tracking
  status: mysqlEnum("status", ["new", "reviewed", "resolved", "closed"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * User settings/preferences
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Notification preferences
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  marketingEmails: boolean("marketingEmails").default(false).notNull(),
  
  // Default project settings
  defaultTheme: varchar("defaultTheme", { length: 64 }).default("classic-fiction"),
  defaultPaperType: mysqlEnum("defaultPaperType", ["white", "cream", "color"]).default("cream"),
  defaultTrimSize: varchar("defaultTrimSize", { length: 20 }).default("6x9"),
  
  // UI preferences
  showTutorialTips: boolean("showTutorialTips").default(true).notNull(),
  compactView: boolean("compactView").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;


/**
 * Chapter templates - predefined layouts for chapter pages
 */
export const chapterTemplates = mysqlTable("chapterTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["intro", "body", "graphic-novel", "custom"]).notNull(),
  
  // Template configuration
  layoutType: mysqlEnum("layoutType", [
    "text-only",           // Standard text layout
    "text-with-images",    // Text with inline/floating images
    "full-bleed-image",    // Full page image with optional text overlay
    "image-grid",          // Comic/graphic novel panel grid
    "decorative-intro",    // Decorative chapter opener
    "minimal-intro"        // Clean minimal chapter start
  ]).notNull(),
  
  // Visual settings (JSON for flexibility)
  settings: json("settings"),
  
  // Preview image
  previewImageUrl: text("previewImageUrl"),
  
  // System vs user-created
  isSystem: boolean("isSystem").default(false).notNull(),
  createdByUserId: int("createdByUserId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChapterTemplate = typeof chapterTemplates.$inferSelect;
export type InsertChapterTemplate = typeof chapterTemplates.$inferInsert;

/**
 * Chapter images - images embedded within chapters
 */
export const chapterImages = mysqlTable("chapterImages", {
  id: int("id").autoincrement().primaryKey(),
  chapterId: int("chapterId").notNull(),
  
  // Image file
  imageUrl: text("imageUrl").notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }),
  
  // Placement
  placementType: mysqlEnum("placementType", [
    "inline",           // Flows with text
    "float-left",       // Text wraps right
    "float-right",      // Text wraps left
    "full-width",       // Spans full text width
    "full-bleed",       // Edge to edge (for graphic novels)
    "background"        // Behind text
  ]).notNull(),
  
  // Position within chapter content (for inline/float)
  positionMarker: varchar("positionMarker", { length: 100 }),
  orderIndex: int("orderIndex").default(0),
  
  // Sizing
  widthPercent: int("widthPercent").default(100),
  aspectRatio: varchar("aspectRatio", { length: 20 }),
  
  // Caption
  caption: text("caption"),
  captionPosition: mysqlEnum("captionPosition", ["below", "above", "overlay"]).default("below"),
  
  // For graphic novels - speech bubbles/overlays
  overlayData: json("overlayData"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChapterImage = typeof chapterImages.$inferSelect;
export type InsertChapterImage = typeof chapterImages.$inferInsert;

/**
 * Page headers and footers configuration
 */
export const pageHeaderFooters = mysqlTable("pageHeaderFooters", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Header configuration
  headerEnabled: boolean("headerEnabled").default(true).notNull(),
  headerLeftContent: mysqlEnum("headerLeftContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("book-title"),
  headerCenterContent: mysqlEnum("headerCenterContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("none"),
  headerRightContent: mysqlEnum("headerRightContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("page-number"),
  headerCustomLeft: varchar("headerCustomLeft", { length: 255 }),
  headerCustomCenter: varchar("headerCustomCenter", { length: 255 }),
  headerCustomRight: varchar("headerCustomRight", { length: 255 }),
  
  // Footer configuration
  footerEnabled: boolean("footerEnabled").default(true).notNull(),
  footerLeftContent: mysqlEnum("footerLeftContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("none"),
  footerCenterContent: mysqlEnum("footerCenterContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("page-number"),
  footerRightContent: mysqlEnum("footerRightContent", [
    "none", "page-number", "book-title", "chapter-title", "author", "custom"
  ]).default("none"),
  footerCustomLeft: varchar("footerCustomLeft", { length: 255 }),
  footerCustomCenter: varchar("footerCustomCenter", { length: 255 }),
  footerCustomRight: varchar("footerCustomRight", { length: 255 }),
  
  // Odd/even page differences
  useDifferentOddEven: boolean("useDifferentOddEven").default(true).notNull(),
  mirrorOnEvenPages: boolean("mirrorOnEvenPages").default(true).notNull(),
  
  // First page of chapter
  suppressOnChapterFirst: boolean("suppressOnChapterFirst").default(true).notNull(),
  
  // Styling
  headerFont: varchar("headerFont", { length: 100 }).default("inherit"),
  headerFontSize: varchar("headerFontSize", { length: 20 }).default("10pt"),
  footerFont: varchar("footerFont", { length: 100 }).default("inherit"),
  footerFontSize: varchar("footerFontSize", { length: 20 }).default("10pt"),
  
  // Page number formatting
  pageNumberStyle: mysqlEnum("pageNumberStyle", [
    "arabic",       // 1, 2, 3
    "roman-lower",  // i, ii, iii
    "roman-upper",  // I, II, III
    "alpha-lower",  // a, b, c
    "alpha-upper"   // A, B, C
  ]).default("arabic"),
  pageNumberPrefix: varchar("pageNumberPrefix", { length: 20 }),
  pageNumberSuffix: varchar("pageNumberSuffix", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageHeaderFooter = typeof pageHeaderFooters.$inferSelect;
export type InsertPageHeaderFooter = typeof pageHeaderFooters.$inferInsert;

/**
 * Graphic novel pages - for image-based layouts
 */
export const graphicNovelPages = mysqlTable("graphicNovelPages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  pageNumber: int("pageNumber").notNull(),
  
  // Layout type
  layoutType: mysqlEnum("layoutType", [
    "single-image",     // One full-page image
    "two-panel-h",      // Two panels horizontal
    "two-panel-v",      // Two panels vertical
    "three-panel",      // Three panels
    "four-panel-grid",  // 2x2 grid
    "six-panel-grid",   // 2x3 grid
    "custom"            // Custom panel arrangement
  ]).notNull(),
  
  // Panel configuration (for custom layouts)
  panelConfig: json("panelConfig"),
  
  // Bleed settings
  useBleed: boolean("useBleed").default(true).notNull(),
  bleedSize: varchar("bleedSize", { length: 20 }).default("0.125in"),
  
  // Background
  backgroundColor: varchar("backgroundColor", { length: 20 }),
  backgroundImageUrl: text("backgroundImageUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GraphicNovelPage = typeof graphicNovelPages.$inferSelect;
export type InsertGraphicNovelPage = typeof graphicNovelPages.$inferInsert;

/**
 * Graphic novel panels - individual panels within a page
 */
export const graphicNovelPanels = mysqlTable("graphicNovelPanels", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("pageId").notNull(),
  
  panelIndex: int("panelIndex").notNull(),
  
  // Image
  imageUrl: text("imageUrl"),
  
  // Position and size (percentages of page)
  positionX: decimal("positionX", { precision: 5, scale: 2 }).default("0"),
  positionY: decimal("positionY", { precision: 5, scale: 2 }).default("0"),
  width: decimal("width", { precision: 5, scale: 2 }).default("100"),
  height: decimal("height", { precision: 5, scale: 2 }).default("100"),
  
  // Border
  borderWidth: varchar("borderWidth", { length: 20 }).default("2px"),
  borderColor: varchar("borderColor", { length: 20 }).default("#000000"),
  borderRadius: varchar("borderRadius", { length: 20 }).default("0"),
  
  // Gutter (space between panels)
  gutterRight: varchar("gutterRight", { length: 20 }).default("0.1in"),
  gutterBottom: varchar("gutterBottom", { length: 20 }).default("0.1in"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GraphicNovelPanel = typeof graphicNovelPanels.$inferSelect;
export type InsertGraphicNovelPanel = typeof graphicNovelPanels.$inferInsert;

/**
 * Speech bubbles and text overlays for graphic novels
 */
export const speechBubbles = mysqlTable("speechBubbles", {
  id: int("id").autoincrement().primaryKey(),
  panelId: int("panelId").notNull(),
  
  // Type
  bubbleType: mysqlEnum("bubbleType", [
    "speech",       // Normal speech bubble
    "thought",      // Cloud-like thought bubble
    "shout",        // Jagged edges
    "whisper",      // Dashed outline
    "narration",    // Rectangle box
    "caption"       // Caption box
  ]).notNull(),
  
  // Content
  text: text("text").notNull(),
  
  // Position (percentage within panel)
  positionX: decimal("positionX", { precision: 5, scale: 2 }).notNull(),
  positionY: decimal("positionY", { precision: 5, scale: 2 }).notNull(),
  width: decimal("width", { precision: 5, scale: 2 }).default("30"),
  
  // Tail direction (for speech bubbles)
  tailDirection: mysqlEnum("tailDirection", [
    "none", "top", "bottom", "left", "right",
    "top-left", "top-right", "bottom-left", "bottom-right"
  ]).default("bottom"),
  
  // Styling
  backgroundColor: varchar("backgroundColor", { length: 20 }).default("#FFFFFF"),
  textColor: varchar("textColor", { length: 20 }).default("#000000"),
  fontSize: varchar("fontSize", { length: 20 }).default("12pt"),
  fontFamily: varchar("fontFamily", { length: 100 }).default("Comic Sans MS, cursive"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SpeechBubble = typeof speechBubbles.$inferSelect;
export type InsertSpeechBubble = typeof speechBubbles.$inferInsert;

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

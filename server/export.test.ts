import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  createProject: vi.fn(),
  getUserProjects: vi.fn(),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Book",
    author: "Test Author",
    status: "draft",
    sourceFileUrl: "https://example.com/file.docx",
    sourceFileName: "test.docx",
    pageCount: 200,
    chapterCount: 10,
    wordCount: 50000,
    themeId: "classic-fiction",
    customStyles: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  updateProject: vi.fn().mockResolvedValue({}),
  deleteProject: vi.fn(),
  getProjectChapters: vi.fn().mockResolvedValue([
    {
      id: 1,
      projectId: 1,
      chapterNumber: 1,
      title: "Chapter One",
      content: "<p>This is the first chapter content.</p>",
      wordCount: 5000,
      useDropCap: true,
      customStyles: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      projectId: 1,
      chapterNumber: 2,
      title: "Chapter Two",
      content: "<p>This is the second chapter content.</p>",
      wordCount: 4500,
      useDropCap: true,
      customStyles: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]),
  getCoverByProjectId: vi.fn().mockResolvedValue(null),
  getCopyrightPageByProjectId: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    isbn: "978-0-000-00000-0",
    publisherName: "Test Publisher",
    publishYear: 2024,
    copyrightHolder: "Test Author",
    legalText: "All rights reserved.",
    additionalCredits: null,
    customContent: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  getStyleMappingsByProjectId: vi.fn().mockResolvedValue([]),
  getExportJobsByProjectId: vi.fn().mockResolvedValue([]),
  createChapter: vi.fn(),
  updateChapter: vi.fn(),
  createCover: vi.fn(),
  updateCover: vi.fn(),
  createCopyrightPage: vi.fn(),
  updateCopyrightPage: vi.fn(),
  createStyleMapping: vi.fn(),
  updateStyleMapping: vi.fn(),
  createExportJob: vi.fn().mockResolvedValue({
    id: 1,
    projectId: 1,
    exportType: "both",
    status: "completed",
    idmlFileUrl: "https://example.com/export.idml",
    pdfFileUrl: "https://example.com/export.html",
    completedAt: new Date(),
    createdAt: new Date()
  }),
  deleteStyleMappingsByProjectId: vi.fn()
}));

// Mock export service
vi.mock("./services/exportService", () => ({
  generateFullExport: vi.fn().mockResolvedValue({
    idmlUrl: "https://example.com/export.idml",
    htmlUrl: "https://example.com/export.html"
  }),
  generateIDMLExport: vi.fn().mockResolvedValue("https://example.com/export.idml"),
  generatePDFExport: vi.fn().mockResolvedValue({
    htmlUrl: "https://example.com/export.html"
  })
}));

// Mock file upload service
vi.mock("./services/fileUpload", () => ({
  processDocxUpload: vi.fn(),
  validateDocxFile: vi.fn().mockReturnValue({ valid: true })
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("export.generate", () => {
  it("generates both IDML and PDF exports", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.generate({
      projectId: 1,
      exportType: "both",
      trimSizeKey: "6x9"
    });

    expect(result).toBeDefined();
    expect(result.idmlUrl).toBe("https://example.com/export.idml");
    expect(result.htmlUrl).toBe("https://example.com/export.html");
  });

  it("generates IDML only export", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.generate({
      projectId: 1,
      exportType: "idml",
      trimSizeKey: "6x9"
    });

    expect(result).toBeDefined();
    expect(result.idmlUrl).toBe("https://example.com/export.idml");
  });

  it("generates PDF only export", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.generate({
      projectId: 1,
      exportType: "pdf",
      trimSizeKey: "6x9"
    });

    expect(result).toBeDefined();
    expect(result.htmlUrl).toBe("https://example.com/export.html");
  });
});

describe("export.list", () => {
  it("returns export jobs for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.list({ projectId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("chapter.list", () => {
  it("returns chapters for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chapter.list({ projectId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].title).toBe("Chapter One");
    expect(result[1].title).toBe("Chapter Two");
  });
});

describe("copyright.get", () => {
  it("returns copyright page for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.copyright.get({ projectId: 1 });

    expect(result).toBeDefined();
    expect(result?.isbn).toBe("978-0-000-00000-0");
    expect(result?.publisherName).toBe("Test Publisher");
    expect(result?.copyrightHolder).toBe("Test Author");
  });
});

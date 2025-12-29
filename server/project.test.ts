import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  createProject: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Book",
    author: "Test Author",
    status: "draft",
    sourceFileUrl: null,
    sourceFileName: null,
    pageCount: null,
    chapterCount: null,
    wordCount: null,
    themeId: null,
    customStyles: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  getUserProjects: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      title: "Test Book",
      author: "Test Author",
      status: "draft",
      sourceFileUrl: null,
      sourceFileName: null,
      pageCount: 200,
      chapterCount: 10,
      wordCount: 50000,
      themeId: "classic-fiction",
      customStyles: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Book",
    author: "Test Author",
    status: "draft",
    sourceFileUrl: null,
    sourceFileName: null,
    pageCount: 200,
    chapterCount: 10,
    wordCount: 50000,
    themeId: "classic-fiction",
    customStyles: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  updateProject: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Updated Book",
    author: "Test Author",
    status: "draft",
    sourceFileUrl: null,
    sourceFileName: null,
    pageCount: 200,
    chapterCount: 10,
    wordCount: 50000,
    themeId: "classic-fiction",
    customStyles: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  getProjectChapters: vi.fn().mockResolvedValue([]),
  getCoverByProjectId: vi.fn().mockResolvedValue(null),
  getCopyrightPageByProjectId: vi.fn().mockResolvedValue(null),
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
  createExportJob: vi.fn()
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

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("project.create", () => {
  it("creates a new project for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.create({
      title: "Test Book",
      author: "Test Author"
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Book");
    expect(result.author).toBe("Test Author");
    expect(result.status).toBe("draft");
  });

  it("creates a project without author", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.create({
      title: "Test Book Without Author"
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Test Book");
  });
});

describe("project.list", () => {
  it("returns user projects for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe("Test Book");
  });
});

describe("project.get", () => {
  it("returns project details for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.get({ id: 1 });

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Book");
  });
});

describe("cover.calculateSpine", () => {
  it("calculates spine width for white paper", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cover.calculateSpine({
      pageCount: 200,
      paperType: "white"
    });

    expect(result).toBeDefined();
    expect(result.spineWidth).toBeDefined();
    // White paper: 200 * 0.002252 = 0.4504
    expect(parseFloat(result.spineWidth)).toBeCloseTo(0.4504, 3);
  });

  it("calculates spine width for cream paper", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cover.calculateSpine({
      pageCount: 200,
      paperType: "cream"
    });

    expect(result).toBeDefined();
    // Cream paper: 200 * 0.0025 = 0.5
    expect(parseFloat(result.spineWidth)).toBeCloseTo(0.5, 3);
  });

  it("calculates spine width for color paper", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cover.calculateSpine({
      pageCount: 300,
      paperType: "color"
    });

    expect(result).toBeDefined();
    // Color paper: 300 * 0.002347 = 0.7041
    expect(parseFloat(result.spineWidth)).toBeCloseTo(0.7041, 3);
  });

  it("returns spine width in millimeters", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cover.calculateSpine({
      pageCount: 200,
      paperType: "cream"
    });

    expect(result.spineWidthMm).toBeDefined();
    // 0.5 inches * 25.4 = 12.7mm
    expect(parseFloat(result.spineWidthMm)).toBeCloseTo(12.7, 1);
  });
});

describe("project.delete", () => {
  it("deletes a project owned by user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });
});

import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  InsertProject, 
  Project,
  chapters,
  InsertChapter,
  Chapter,
  covers,
  InsertCover,
  Cover,
  copyrightPages,
  InsertCopyrightPage,
  CopyrightPage,
  styleMappings,
  InsertStyleMapping,
  StyleMapping,
  exportJobs,
  InsertExportJob,
  ExportJob,
  feedback,
  InsertFeedback,
  Feedback,
  userSettings,
  InsertUserSettings,
  UserSettings
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSubscription(
  userId: number,
  data: {
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: "none" | "active" | "canceled" | "past_due" | "lifetime";
    subscriptionPlan?: "none" | "monthly" | "annual" | "lifetime";
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ PROJECT FUNCTIONS ============

export async function createProject(data: Omit<InsertProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(data);
  const insertId = result[0].insertId;
  
  const [project] = await db.select().from(projects).where(eq(projects.id, insertId));
  return project;
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project;
}

export async function updateProject(id: number, data: Partial<Omit<InsertProject, 'id' | 'userId' | 'createdAt'>>): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects).set(data).where(eq(projects.id, id));
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project;
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related records first
  await db.delete(chapters).where(eq(chapters.projectId, id));
  await db.delete(covers).where(eq(covers.projectId, id));
  await db.delete(copyrightPages).where(eq(copyrightPages.projectId, id));
  await db.delete(styleMappings).where(eq(styleMappings.projectId, id));
  await db.delete(exportJobs).where(eq(exportJobs.projectId, id));
  
  // Delete the project
  await db.delete(projects).where(eq(projects.id, id));
}

// ============ CHAPTER FUNCTIONS ============

export async function createChapter(data: Omit<InsertChapter, 'id' | 'createdAt'>): Promise<Chapter> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chapters).values(data);
  const insertId = result[0].insertId;
  
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, insertId));
  return chapter;
}

export async function getProjectChapters(projectId: number): Promise<Chapter[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(chapters).where(eq(chapters.projectId, projectId)).orderBy(chapters.chapterNumber);
}

export async function updateChapter(id: number, data: Partial<Omit<InsertChapter, 'id' | 'projectId' | 'createdAt'>>): Promise<Chapter> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(chapters).set(data).where(eq(chapters.id, id));
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
  return chapter;
}

export async function deleteChapter(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(chapters).where(eq(chapters.id, id));
}

// ============ COVER FUNCTIONS ============

export async function createCover(data: Omit<InsertCover, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cover> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(covers).values(data);
  const insertId = result[0].insertId;
  
  const [cover] = await db.select().from(covers).where(eq(covers.id, insertId));
  return cover;
}

export async function getCoverByProjectId(projectId: number): Promise<Cover | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [cover] = await db.select().from(covers).where(eq(covers.projectId, projectId));
  return cover;
}

export async function updateCover(id: number, data: Partial<Omit<InsertCover, 'id' | 'projectId' | 'createdAt'>>): Promise<Cover> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(covers).set(data).where(eq(covers.id, id));
  const [cover] = await db.select().from(covers).where(eq(covers.id, id));
  return cover;
}

// ============ COPYRIGHT PAGE FUNCTIONS ============

export async function createCopyrightPage(data: Omit<InsertCopyrightPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CopyrightPage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(copyrightPages).values(data);
  const insertId = result[0].insertId;
  
  const [page] = await db.select().from(copyrightPages).where(eq(copyrightPages.id, insertId));
  return page;
}

export async function getCopyrightPageByProjectId(projectId: number): Promise<CopyrightPage | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [page] = await db.select().from(copyrightPages).where(eq(copyrightPages.projectId, projectId));
  return page;
}

export async function updateCopyrightPage(id: number, data: Partial<Omit<InsertCopyrightPage, 'id' | 'projectId' | 'createdAt'>>): Promise<CopyrightPage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(copyrightPages).set(data).where(eq(copyrightPages.id, id));
  const [page] = await db.select().from(copyrightPages).where(eq(copyrightPages.id, id));
  return page;
}

// ============ STYLE MAPPING FUNCTIONS ============

export async function createStyleMapping(data: Omit<InsertStyleMapping, 'id' | 'createdAt'>): Promise<StyleMapping> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(styleMappings).values(data);
  const insertId = result[0].insertId;
  
  const [mapping] = await db.select().from(styleMappings).where(eq(styleMappings.id, insertId));
  return mapping;
}

export async function getStyleMappingsByProjectId(projectId: number): Promise<StyleMapping[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(styleMappings).where(eq(styleMappings.projectId, projectId));
}

export async function updateStyleMapping(id: number, data: Partial<Omit<InsertStyleMapping, 'id' | 'projectId' | 'createdAt'>>): Promise<StyleMapping> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(styleMappings).set(data).where(eq(styleMappings.id, id));
  const [mapping] = await db.select().from(styleMappings).where(eq(styleMappings.id, id));
  return mapping;
}

export async function deleteStyleMappingsByProjectId(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(styleMappings).where(eq(styleMappings.projectId, projectId));
}

// ============ EXPORT JOB FUNCTIONS ============

export async function createExportJob(data: Omit<InsertExportJob, 'id' | 'createdAt'>): Promise<ExportJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exportJobs).values(data);
  const insertId = result[0].insertId;
  
  const [job] = await db.select().from(exportJobs).where(eq(exportJobs.id, insertId));
  return job;
}

export async function getExportJobsByProjectId(projectId: number): Promise<ExportJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(exportJobs).where(eq(exportJobs.projectId, projectId)).orderBy(desc(exportJobs.createdAt));
}

export async function updateExportJob(id: number, data: Partial<Omit<InsertExportJob, 'id' | 'projectId' | 'createdAt'>>): Promise<ExportJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(exportJobs).set(data).where(eq(exportJobs.id, id));
  const [job] = await db.select().from(exportJobs).where(eq(exportJobs.id, id));
  return job;
}


// ============ ONBOARDING FUNCTIONS ============

export async function updateUserOnboarding(
  userId: number,
  data: {
    hasAcceptedTos?: boolean;
    tosAcceptedAt?: Date;
    hasCompletedOnboarding?: boolean;
    onboardingStep?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ FEEDBACK FUNCTIONS ============

export async function createFeedback(data: Omit<InsertFeedback, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Feedback> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(feedback).values(data);
  const insertId = result[0].insertId;
  
  const [item] = await db.select().from(feedback).where(eq(feedback.id, insertId));
  return item;
}

export async function getFeedbackByUserId(userId: number): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt));
}

// ============ USER SETTINGS FUNCTIONS ============

export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  return settings || null;
}

export async function upsertUserSettings(
  userId: number,
  data: Partial<Omit<InsertUserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserSettings> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserSettings(userId);
  
  if (existing) {
    await db.update(userSettings).set(data).where(eq(userSettings.userId, userId));
    const [updated] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return updated;
  } else {
    const result = await db.insert(userSettings).values({ userId, ...data });
    const insertId = result[0].insertId;
    const [created] = await db.select().from(userSettings).where(eq(userSettings.id, insertId));
    return created;
  }
}

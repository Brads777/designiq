import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { processDocxUpload, validateDocxFile } from "./services/fileUpload";
import { generateFullExport, generateIDMLExport, generatePDFExport } from "./services/exportService";
import { deleteStyleMappingsByProjectId } from "./db";
import { 
  createProject, 
  getUserProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  createChapter,
  getProjectChapters,
  updateChapter,
  createCover,
  getCoverByProjectId,
  updateCover,
  createCopyrightPage,
  getCopyrightPageByProjectId,
  updateCopyrightPage,
  createStyleMapping,
  getStyleMappingsByProjectId,
  updateStyleMapping,
  createExportJob,
  getExportJobsByProjectId,
  updateUserSubscription,
  updateUserOnboarding,
  createFeedback,
  getUserSettings,
  upsertUserSettings
} from "./db";
import { createCheckoutSession, createBillingPortalSession, getSubscriptionDetails } from "./stripe/stripeService";
import { SUBSCRIPTION_PLANS, DEMO_LIMITS, SUBSCRIBER_FEATURES } from "./stripe/products";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Project management
  project: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserProjects(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        author: z.string().max(255).optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return createProject({
          userId: ctx.user.id,
          title: input.title,
          author: input.author || null,
          status: "draft"
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        author: z.string().max(255).optional(),
        themeId: z.string().max(64).optional(),
        customStyles: z.any().optional(),
        sourceFileUrl: z.string().optional(),
        sourceFileName: z.string().optional(),
        pageCount: z.number().optional(),
        chapterCount: z.number().optional(),
        wordCount: z.number().optional(),
        status: z.enum(["draft", "processing", "ready", "exported"]).optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        const { id, ...updateData } = input;
        return updateProject(id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await deleteProject(input.id);
        return { success: true };
      }),
  }),

  // Chapter management
  chapter: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getProjectChapters(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        chapterNumber: z.number(),
        title: z.string().max(500).optional(),
        content: z.string().optional(),
        wordCount: z.number().optional(),
        useDropCap: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return createChapter(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        projectId: z.number(),
        title: z.string().max(500).optional(),
        content: z.string().optional(),
        wordCount: z.number().optional(),
        useDropCap: z.boolean().optional(),
        customStyles: z.any().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        const { id, projectId, ...updateData } = input;
        return updateChapter(id, updateData);
      }),
  }),

  // Cover management
  cover: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getCoverByProjectId(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        paperType: z.enum(["white", "cream", "color"]),
        trimWidth: z.string(),
        trimHeight: z.string(),
        pageCount: z.number(),
        spineWidth: z.string().optional(),
        frontCoverUrl: z.string().optional(),
        backCoverUrl: z.string().optional(),
        spineText: z.string().optional(),
        designData: z.any().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return createCover(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        projectId: z.number(),
        paperType: z.enum(["white", "cream", "color"]).optional(),
        trimWidth: z.string().optional(),
        trimHeight: z.string().optional(),
        pageCount: z.number().optional(),
        spineWidth: z.string().optional(),
        frontCoverUrl: z.string().optional(),
        backCoverUrl: z.string().optional(),
        spineText: z.string().optional(),
        designData: z.any().optional(),
        fullCoverUrl: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        const { id, projectId, ...updateData } = input;
        return updateCover(id, updateData);
      }),

    calculateSpine: publicProcedure
      .input(z.object({
        pageCount: z.number(),
        paperType: z.enum(["white", "cream", "color"])
      }))
      .query(({ input }) => {
        // Amazon KDP spine width calculation
        // White paper: 0.002252" per page
        // Cream paper: 0.0025" per page
        // Color paper: 0.002347" per page
        const multipliers = {
          white: 0.002252,
          cream: 0.0025,
          color: 0.002347
        };
        const spineWidth = input.pageCount * multipliers[input.paperType];
        return {
          spineWidth: spineWidth.toFixed(3),
          spineWidthMm: (spineWidth * 25.4).toFixed(2)
        };
      }),
  }),

  // Copyright page management
  copyright: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getCopyrightPageByProjectId(input.projectId);
      }),

    save: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        isbn: z.string().max(20).optional(),
        publisherName: z.string().max(255).optional(),
        publishYear: z.number().optional(),
        copyrightHolder: z.string().max(255).optional(),
        legalText: z.string().optional(),
        additionalCredits: z.string().optional(),
        customContent: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        
        const existing = await getCopyrightPageByProjectId(input.projectId);
        if (existing) {
          const { projectId, ...updateData } = input;
          return updateCopyrightPage(existing.id, updateData);
        } else {
          return createCopyrightPage(input);
        }
      }),
  }),

  // Style mapping management
  styleMapping: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getStyleMappingsByProjectId(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        sourceStyleName: z.string().max(255),
        sourceStyleType: z.enum(["paragraph", "character"]),
        targetStyleName: z.string().max(255),
        isAutoDetected: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return createStyleMapping(input);
      }),

    accept: protectedProcedure
      .input(z.object({
        id: z.number(),
        projectId: z.number(),
        isAccepted: z.boolean()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateStyleMapping(input.id, { isAccepted: input.isAccepted });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        projectId: z.number(),
        targetStyleName: z.string().max(255)
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateStyleMapping(input.id, { targetStyleName: input.targetStyleName });
      }),
  }),

  // Document upload and processing
  document: router({
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileData: z.string(), // Base64 encoded file
        fileName: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Decode base64 file
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Validate file
        const validation = validateDocxFile(buffer, input.fileName);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Process the document
        const result = await processDocxUpload(buffer, input.fileName, ctx.user.id);

        // Update project with document info
        await updateProject(input.projectId, {
          sourceFileUrl: result.fileUrl,
          sourceFileName: result.fileName,
          pageCount: result.parsedDocument.estimatedPageCount,
          chapterCount: result.parsedDocument.chapters.length,
          wordCount: result.parsedDocument.totalWordCount,
          status: "processing"
        });

        // Clear existing style mappings and create new ones
        await deleteStyleMappingsByProjectId(input.projectId);
        
        for (const mapping of result.styleMappings) {
          await createStyleMapping({
            projectId: input.projectId,
            sourceStyleName: mapping.sourceStyleName,
            sourceStyleType: mapping.sourceStyleType,
            targetStyleName: mapping.targetStyleName,
            isAutoDetected: true
          });
        }

        // Create chapters
        for (const chapter of result.parsedDocument.chapters) {
          await createChapter({
            projectId: input.projectId,
            chapterNumber: chapter.number,
            title: chapter.title,
            content: chapter.content,
            wordCount: chapter.wordCount,
            useDropCap: true
          });
        }

        return {
          success: true,
          document: {
            title: result.parsedDocument.title,
            chapters: result.parsedDocument.chapters.length,
            wordCount: result.parsedDocument.totalWordCount,
            pageCount: result.parsedDocument.estimatedPageCount,
            styles: result.styleMappings.length
          }
        };
      }),
  }),

  // Export jobs
  export: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getExportJobsByProjectId(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        exportType: z.enum(["idml", "pdf", "both"])
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return createExportJob({
          projectId: input.projectId,
          exportType: input.exportType,
          status: "queued"
        });
      }),

    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        exportType: z.enum(["idml", "pdf", "both"]),
        trimSizeKey: z.string().default("6x9")
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Get chapters
        const chapters = await getProjectChapters(input.projectId);
        if (chapters.length === 0) {
          throw new Error("No chapters found. Please upload a document first.");
        }

        // Get copyright page
        const copyrightPage = await getCopyrightPageByProjectId(input.projectId);

        // Prepare export input
        const exportInput = {
          projectId: input.projectId,
          userId: ctx.user.id,
          title: project.title,
          author: project.author || undefined,
          themeId: project.themeId || "classic-fiction",
          trimSizeKey: input.trimSizeKey,
          chapters: chapters.map(ch => ({
            number: ch.chapterNumber,
            title: ch.title || `Chapter ${ch.chapterNumber}`,
            content: ch.content || ""
          })),
          copyrightPage: copyrightPage ? {
            isbn: copyrightPage.isbn || undefined,
            publisherName: copyrightPage.publisherName || undefined,
            publishYear: copyrightPage.publishYear || undefined,
            copyrightHolder: copyrightPage.copyrightHolder || undefined,
            legalText: copyrightPage.legalText || undefined,
            additionalCredits: copyrightPage.additionalCredits || undefined
          } : null
        };

        // Generate exports based on type
        let result;
        if (input.exportType === "idml") {
          const idmlUrl = await generateIDMLExport(exportInput);
          result = { idmlUrl };
        } else if (input.exportType === "pdf") {
          const pdfResult = await generatePDFExport(exportInput);
          result = { htmlUrl: pdfResult.htmlUrl };
        } else {
          result = await generateFullExport(exportInput);
        }

        // Create export job record
        await createExportJob({
          projectId: input.projectId,
          exportType: input.exportType,
          status: "completed",
          idmlFileUrl: result.idmlUrl || null,
          pdfFileUrl: result.htmlUrl || result.pdfUrl || null,
          completedAt: new Date()
        });

        // Update project status
        await updateProject(input.projectId, { status: "exported" });

        return result;
      }),
  }),

  // Subscription management
  subscription: router({
    // Get current user's subscription status
    status: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const isSubscribed = user.subscriptionStatus === "active" || user.subscriptionStatus === "lifetime";
      
      let subscriptionDetails = null;
      if (user.stripeSubscriptionId && user.subscriptionStatus !== "lifetime") {
        subscriptionDetails = await getSubscriptionDetails(user.stripeSubscriptionId);
      }

      return {
        isSubscribed,
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        features: isSubscribed ? SUBSCRIBER_FEATURES : DEMO_LIMITS,
        subscriptionDetails
      };
    }),

    // Get available plans
    plans: publicProcedure.query(() => {
      return {
        plans: SUBSCRIPTION_PLANS,
        demoLimits: DEMO_LIMITS
      };
    }),

    // Create checkout session
    createCheckout: protectedProcedure
      .input(z.object({
        planId: z.enum(["monthly", "annual", "lifetime"])
      }))
      .mutation(async ({ ctx, input }) => {
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        
        return createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name,
          planId: input.planId,
          origin
        });
      }),

    // Create billing portal session for managing subscription
    createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new Error("No Stripe customer found");
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";
      
      return createBillingPortalSession({
        customerId: ctx.user.stripeCustomerId,
        returnUrl: `${origin}/dashboard`
      });
    }),
  }),

  // Onboarding management
  onboarding: router({
    acceptTos: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUserOnboarding(ctx.user.id, {
        hasAcceptedTos: true,
        tosAcceptedAt: new Date()
      });
      return { success: true };
    }),

    updateStep: protectedProcedure
      .input(z.object({ step: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await updateUserOnboarding(ctx.user.id, {
          onboardingStep: input.step
        });
        return { success: true };
      }),

    complete: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUserOnboarding(ctx.user.id, {
        hasCompletedOnboarding: true
      });
      return { success: true };
    }),
  }),

  // Feedback system
  feedback: router({
    submit: protectedProcedure
      .input(z.object({
        type: z.enum(["bug", "feature", "general", "support"]),
        subject: z.string().min(1).max(255),
        message: z.string().min(1),
        pageUrl: z.string().max(500).optional(),
        browserInfo: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return createFeedback({
          userId: ctx.user.id,
          ...input
        });
      }),
  }),

  // User settings
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        emailNotifications: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
        defaultTheme: z.string().max(64).optional(),
        defaultPaperType: z.enum(["white", "cream", "color"]).optional(),
        defaultTrimSize: z.string().max(20).optional(),
        showTutorialTips: z.boolean().optional(),
        compactView: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return upsertUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;

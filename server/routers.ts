import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다" });
  }
  return next({ ctx });
});

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

  // ============ PUBLIC PROFILE ROUTES ============
  profiles: router({
    list: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        profession: z.string().optional(),
        specialty: z.string().optional(),
        region: z.string().optional(),
        sortBy: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getPublicProfiles(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getProfileWithDetails(input.id);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 찾을 수 없습니다" });
        }
        if (!profile.isPublic) {
          throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 찾을 수 없습니다" });
        }
        return await db.getProfileWithDetails(input.id, { publicView: true });
      }),
  }),

  // ============ SPECIALTIES ============
  specialties: router({
    list: publicProcedure.query(async () => {
      return db.getAllSpecialties();
    }),
  }),

  // ============ MY PROFILE (PROTECTED) ============
  myProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) return null;
      const details = await db.getProfileWithDetails(profile.id);
      const specialtyIds = await db.getProfileSpecialtyIds(profile.id);
      return { ...details, specialtyIds };
    }),

    create: protectedProcedure
      .input(z.object({
        displayName: z.string().min(1).max(100),
        profession: z.string().min(1).max(50),
        headline: z.string().max(200).optional(),
        introduction: z.string().optional(),
        profileImageUrl: z.string().optional(),
        totalExperienceYears: z.number().min(0).max(50).optional(),
        isPublic: z.boolean().optional(),
        centerName: z.string().max(200).optional(),
        centerAddress: z.string().optional(),
        centerPhone: z.string().max(30).optional(),
        centerWebsite: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        region: z.string().max(50).optional(),
        contactEmail: z.string().max(320).optional(),
        contactPhone: z.string().max(30).optional(),
        specialtyIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "이미 프로필이 존재합니다" });
        }
        const { specialtyIds, ...profileData } = input;
        const profileId = await db.createProfile({ ...profileData, userId: ctx.user.id });
        if (specialtyIds && specialtyIds.length > 0) {
          await db.setProfileSpecialties(profileId, specialtyIds);
        }
        return { id: profileId };
      }),

    update: protectedProcedure
      .input(z.object({
        displayName: z.string().min(1).max(100).optional(),
        profession: z.string().min(1).max(50).optional(),
        headline: z.string().max(200).optional(),
        introduction: z.string().optional(),
        profileImageUrl: z.string().optional(),
        totalExperienceYears: z.number().min(0).max(50).optional(),
        isPublic: z.boolean().optional(),
        centerName: z.string().max(200).optional(),
        centerAddress: z.string().optional(),
        centerPhone: z.string().max(30).optional(),
        centerWebsite: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        region: z.string().max(50).optional(),
        contactEmail: z.string().max(320).optional(),
        contactPhone: z.string().max(30).optional(),
        specialtyIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "프로필이 존재하지 않습니다" });
        }
        const { specialtyIds, ...profileData } = input;
        await db.updateProfile(profile.id, profileData);
        if (specialtyIds !== undefined) {
          await db.setProfileSpecialties(profile.id, specialtyIds);
        }
        return { success: true };
      }),

    delete: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "프로필이 존재하지 않습니다" });
      }
      await db.deleteProfile(profile.id);
      return { success: true };
    }),
  }),

  // ============ LICENSES (PROTECTED) ============
  licenses: router({
    create: protectedProcedure
      .input(z.object({
        licenseName: z.string().min(1).max(200),
        issuingOrganization: z.string().max(200).optional(),
        licenseNumber: z.string().max(100).optional(),
        acquiredDate: z.string().max(20).optional(),
        expiryDate: z.string().max(20).optional(),
        evidenceFileUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const id = await db.createLicense({ ...input, profileId: profile.id, verificationStatus: "pending" });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        licenseName: z.string().min(1).max(200).optional(),
        issuingOrganization: z.string().max(200).optional(),
        licenseNumber: z.string().max(100).optional(),
        acquiredDate: z.string().max(20).optional(),
        expiryDate: z.string().max(20).optional(),
        evidenceFileUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const { id, ...data } = input;
        const updated = await db.updateLicenseOwned(id, profile.id, data);
        if (!updated) throw new TRPCError({ code: "FORBIDDEN", message: "이 자격증을 수정할 권한이 없습니다" });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const deleted = await db.deleteLicenseOwned(input.id, profile.id);
        if (!deleted) throw new TRPCError({ code: "FORBIDDEN", message: "이 자격증을 삭제할 권한이 없습니다" });
        return { success: true };
      }),
  }),

  // ============ EXPERIENCES (PROTECTED) ============
  experiences: router({
    create: protectedProcedure
      .input(z.object({
        organizationName: z.string().min(1).max(200),
        position: z.string().max(100).optional(),
        startDate: z.string().max(20).optional(),
        endDate: z.string().max(20).optional(),
        isCurrent: z.boolean().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const id = await db.createExperience({ ...input, profileId: profile.id });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        organizationName: z.string().min(1).max(200).optional(),
        position: z.string().max(100).optional(),
        startDate: z.string().max(20).optional(),
        endDate: z.string().max(20).optional(),
        isCurrent: z.boolean().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const { id, ...data } = input;
        const updated = await db.updateExperienceOwned(id, profile.id, data);
        if (!updated) throw new TRPCError({ code: "FORBIDDEN", message: "이 경력을 수정할 권한이 없습니다" });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const deleted = await db.deleteExperienceOwned(input.id, profile.id);
        if (!deleted) throw new TRPCError({ code: "FORBIDDEN", message: "이 경력을 삭제할 권한이 없습니다" });
        return { success: true };
      }),
  }),

  // ============ EDUCATIONS (PROTECTED) ============
  educations: router({
    create: protectedProcedure
      .input(z.object({
        educationName: z.string().min(1).max(200),
        organizationName: z.string().max(200).optional(),
        completionDate: z.string().max(20).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const id = await db.createEducation({ ...input, profileId: profile.id });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        educationName: z.string().min(1).max(200).optional(),
        organizationName: z.string().max(200).optional(),
        completionDate: z.string().max(20).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const { id, ...data } = input;
        const updated = await db.updateEducationOwned(id, profile.id, data);
        if (!updated) throw new TRPCError({ code: "FORBIDDEN", message: "이 교육을 수정할 권한이 없습니다" });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "프로필을 먼저 생성해주세요" });
        const deleted = await db.deleteEducationOwned(input.id, profile.id);
        if (!deleted) throw new TRPCError({ code: "FORBIDDEN", message: "이 교육을 삭제할 권한이 없습니다" });
        return { success: true };
      }),
  }),

  // ============ REPORTS ============
  reports: router({
    create: protectedProcedure
      .input(z.object({
        targetProfileId: z.number(),
        reason: z.string().min(1).max(50),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createReport({ ...input, reporterUserId: ctx.user.id });
        return { id };
      }),
  }),

  // ============ ADMIN ROUTES ============
  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminStats();
    }),

    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    profiles: adminProcedure.query(async () => {
      return db.getAllProfiles();
    }),

    pendingLicenses: adminProcedure.query(async () => {
      return db.getPendingLicenses();
    }),

    reviewLicense: adminProcedure
      .input(z.object({
        licenseId: z.number(),
        status: z.enum(["verified", "rejected"]),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateLicense(input.licenseId, {
          verificationStatus: input.status,
          adminNote: input.adminNote,
        });
        return { success: true };
      }),

    reports: adminProcedure.query(async () => {
      return db.getAllReports();
    }),

    reviewReport: adminProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(["reviewed", "resolved", "dismissed"]),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateReportStatus(input.reportId, input.status, input.adminNote);
        return { success: true };
      }),

    updateProfileVisibility: adminProcedure
      .input(z.object({
        profileId: z.number(),
        isPublic: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updateProfile(input.profileId, { isPublic: input.isPublic });
        return { success: true };
      }),

    updateProfileVerification: adminProcedure
      .input(z.object({
        profileId: z.number(),
        verificationStatus: z.enum(["unverified", "pending", "verified", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateProfile(input.profileId, { verificationStatus: input.verificationStatus });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

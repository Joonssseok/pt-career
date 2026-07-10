import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
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

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "google",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
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

function createAdminContext(): TrpcContext {
  return createAuthContext({ role: "admin", id: 99, openId: "admin-open-id" });
}

// ============ AUTH TESTS ============
describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});

// ============ PROFILES PUBLIC TESTS ============
describe("profiles.list", () => {
  it("returns a list of public profiles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({});
    expect(Array.isArray(result)).toBe(true);
    // All returned profiles should be public
    result.forEach((profile: any) => {
      expect(profile.isPublic).toBe(true);
    });
  });

  it("accepts filter parameters without error", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({
      profession: "물리치료사",
      region: "서울",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("profiles.getById", () => {
  it("returns profile details for a valid id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.getById({ id: 1 });
    expect(result).not.toBeNull();
    // getProfileWithDetails returns flat object with profile fields + licenses/experiences/educations arrays
    expect(result.displayName).toBeDefined();
    expect(result.licenses).toBeDefined();
    expect(Array.isArray(result.licenses)).toBe(true);
    expect(result.experiences).toBeDefined();
    expect(Array.isArray(result.experiences)).toBe(true);
    expect(result.educations).toBeDefined();
    expect(Array.isArray(result.educations)).toBe(true);
    expect(result.specialties).toBeDefined();
  });

  it("throws NOT_FOUND for non-existent profile", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.getById({ id: 99999 })).rejects.toThrow(
      "프로필을 찾을 수 없습니다"
    );
  });
});

// ============ SPECIALTIES TESTS ============
describe("specialties.list", () => {
  it("returns a list of specialties", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialties.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("category");
  });
});

// ============ MY PROFILE TESTS (PROTECTED) ============
describe("myProfile.get", () => {
  it("throws for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.myProfile.get()).rejects.toThrow();
  });

  it("returns profile or null for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.myProfile.get();
    // User 1 has a profile in seed data
    if (result) {
      // myProfile.get returns { ...details, mySpecialties } where details is flat
      expect(result.displayName).toBeDefined();
      expect(result.mySpecialties).toBeDefined();
      expect(Array.isArray(result.mySpecialties)).toBe(true);
      if (result.mySpecialties.length > 0) {
        const first = result.mySpecialties[0];
        expect(first.specialtyId).toBeDefined();
        expect(typeof first.isPrimary).toBe("boolean");
      }
    }
  });
});

// ============ ADMIN TESTS ============
describe("admin.stats", () => {
  it("throws FORBIDDEN for non-admin user", async () => {
    const ctx = createAuthContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow("관리자 권한이 필요합니다");
  });

  it("returns stats for admin user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalProfiles");
    expect(result).toHaveProperty("pendingLicenses");
    expect(result).toHaveProperty("pendingReports");
    expect(typeof result.totalUsers).toBe("number");
  });
});

describe("admin.profiles", () => {
  it("throws FORBIDDEN for non-admin user", async () => {
    const ctx = createAuthContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.profiles()).rejects.toThrow("관리자 권한이 필요합니다");
  });

  it("returns all profiles for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.profiles();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("admin.pendingLicenses", () => {
  it("throws FORBIDDEN for non-admin user", async () => {
    const ctx = createAuthContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.pendingLicenses()).rejects.toThrow("관리자 권한이 필요합니다");
  });

  it("returns pending licenses for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.pendingLicenses();
    expect(Array.isArray(result)).toBe(true);
  });
});

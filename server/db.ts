import { eq, and, like, or, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profiles, licenses, experiences, educations, specialties, profileSpecialties, reports, type InsertProfile, type InsertLicense, type InsertExperience, type InsertEducation, type InsertReport } from "../drizzle/schema";
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

// ============ USER HELPERS ============

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
    const values: InsertUser = { openId: user.openId };
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ============ PROFILE HELPERS ============

export async function getPublicProfiles(filters?: {
  query?: string;
  profession?: string;
  specialty?: string;
  region?: string;
  sortBy?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(profiles.isPublic, true)];

  if (filters?.query) {
    const q = `%${filters.query}%`;
    conditions.push(
      or(
        like(profiles.displayName, q),
        like(profiles.centerName, q),
        like(profiles.region, q),
        like(profiles.headline, q)
      )!
    );
  }

  if (filters?.profession) {
    conditions.push(eq(profiles.profession, filters.profession));
  }

  if (filters?.region) {
    conditions.push(eq(profiles.region, filters.region));
  }

  let orderClause = desc(profiles.createdAt);
  if (filters?.sortBy === "experience") {
    orderClause = desc(profiles.totalExperienceYears);
  }

  let result = await db
    .select()
    .from(profiles)
    .where(and(...conditions))
    .orderBy(orderClause);

  // If specialty filter, join through profileSpecialties
  if (filters?.specialty) {
    const specialtyRow = await db.select().from(specialties).where(eq(specialties.name, filters.specialty)).limit(1);
    if (specialtyRow.length > 0) {
      const profileIds = await db
        .select({ profileId: profileSpecialties.profileId })
        .from(profileSpecialties)
        .where(eq(profileSpecialties.specialtyId, specialtyRow[0].id));
      const ids = profileIds.map(p => p.profileId);
      return result.filter(p => ids.includes(p.id));
    }
    return [];
  }

  return result;
}

export async function getProfileWithDetails(id: number) {
  const db = await getDb();
  if (!db) return null;

  const profileResult = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  if (profileResult.length === 0) return null;

  const profile = profileResult[0];

  const [profileLicenses, profileExperiences, profileEducations, profileSpecs] = await Promise.all([
    db.select().from(licenses).where(eq(licenses.profileId, id)),
    db.select().from(experiences).where(eq(experiences.profileId, id)).orderBy(desc(experiences.startDate)),
    db.select().from(educations).where(eq(educations.profileId, id)).orderBy(desc(educations.completionDate)),
    db.select({ specialtyId: profileSpecialties.specialtyId }).from(profileSpecialties).where(eq(profileSpecialties.profileId, id)),
  ]);

  let specialtyNames: string[] = [];
  if (profileSpecs.length > 0) {
    const specIds = profileSpecs.map(s => s.specialtyId);
    const specRows = await db.select().from(specialties).where(inArray(specialties.id, specIds));
    specialtyNames = specRows.map(s => s.name);
  }

  return {
    ...profile,
    licenses: profileLicenses,
    experiences: profileExperiences,
    educations: profileEducations,
    specialties: specialtyNames,
  };
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProfile(data: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(profiles).values(data);
  return result[0].insertId;
}

export async function updateProfile(id: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(profiles).set(data).where(eq(profiles.id, id));
}

export async function deleteProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(licenses).where(eq(licenses.profileId, id));
  await db.delete(experiences).where(eq(experiences.profileId, id));
  await db.delete(educations).where(eq(educations.profileId, id));
  await db.delete(profileSpecialties).where(eq(profileSpecialties.profileId, id));
  await db.delete(profiles).where(eq(profiles.id, id));
}

// ============ LICENSE HELPERS ============

export async function createLicense(data: InsertLicense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(licenses).values(data);
  return result[0].insertId;
}

export async function updateLicense(id: number, data: Partial<InsertLicense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(licenses).set(data).where(eq(licenses.id, id));
}

export async function deleteLicense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(licenses).where(eq(licenses.id, id));
}

export async function getPendingLicenses() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      license: licenses,
      profileName: profiles.displayName,
      profileId: profiles.id,
    })
    .from(licenses)
    .innerJoin(profiles, eq(licenses.profileId, profiles.id))
    .where(eq(licenses.verificationStatus, "pending"))
    .orderBy(asc(licenses.createdAt));
}

// ============ EXPERIENCE HELPERS ============

export async function createExperience(data: InsertExperience) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(experiences).values(data);
  return result[0].insertId;
}

export async function updateExperience(id: number, data: Partial<InsertExperience>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(experiences).set(data).where(eq(experiences.id, id));
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(experiences).where(eq(experiences.id, id));
}

// ============ EDUCATION HELPERS ============

export async function createEducation(data: InsertEducation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(educations).values(data);
  return result[0].insertId;
}

export async function updateEducation(id: number, data: Partial<InsertEducation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(educations).set(data).where(eq(educations.id, id));
}

export async function deleteEducation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(educations).where(eq(educations.id, id));
}

// ============ SPECIALTY HELPERS ============

export async function getAllSpecialties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialties).where(eq(specialties.isActive, true)).orderBy(asc(specialties.name));
}

export async function setProfileSpecialties(profileId: number, specialtyIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(profileSpecialties).where(eq(profileSpecialties.profileId, profileId));
  if (specialtyIds.length > 0) {
    await db.insert(profileSpecialties).values(
      specialtyIds.map(specialtyId => ({ profileId, specialtyId }))
    );
  }
}

export async function getProfileSpecialtyIds(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(profileSpecialties).where(eq(profileSpecialties.profileId, profileId));
  return rows.map(r => r.specialtyId);
}

// ============ REPORT HELPERS ============

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reports).values(data);
  return result[0].insertId;
}

export async function getAllReports() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      report: reports,
      profileName: profiles.displayName,
    })
    .from(reports)
    .leftJoin(profiles, eq(reports.targetProfileId, profiles.id))
    .orderBy(desc(reports.createdAt));
}

export async function updateReportStatus(id: number, status: string, adminNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reports).set({ status: status as any, adminNote }).where(eq(reports.id, id));
}

// ============ ADMIN HELPERS ============

export async function getAllProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles).orderBy(desc(profiles.createdAt));
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalProfiles: 0, publicProfiles: 0, pendingLicenses: 0, pendingReports: 0 };

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [profileCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles);
  const [publicCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.isPublic, true));
  const [licenseCount] = await db.select({ count: sql<number>`count(*)` }).from(licenses).where(eq(licenses.verificationStatus, "pending"));
  const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, "pending"));

  return {
    totalUsers: userCount.count,
    totalProfiles: profileCount.count,
    publicProfiles: publicCount.count,
    pendingLicenses: licenseCount.count,
    pendingReports: reportCount.count,
  };
}

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
  category?: string;
  specialtyIds?: number[];
  region?: string;
  sortBy?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(profiles.isPublic, true), eq(profiles.verificationStatus, "verified")];

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

  // Category filter: match profiles that have at least one specialty in this category
  if (filters?.category) {
    const categorySpecs = await db.select({ id: specialties.id }).from(specialties).where(eq(specialties.category, filters.category));
    const catSpecIds = categorySpecs.map(s => s.id);
    if (catSpecIds.length === 0) return [];
    const profileIdRows = await db
      .select({ profileId: profileSpecialties.profileId })
      .from(profileSpecialties)
      .where(inArray(profileSpecialties.specialtyId, catSpecIds));
    const catProfileIds = new Set(profileIdRows.map(p => p.profileId));
    result = result.filter(p => catProfileIds.has(p.id));
  }

  // Specialty tag filter: match profiles that have ALL selected tags (narrow-down)
  if (filters?.specialtyIds && filters.specialtyIds.length > 0) {
    const tagRows = await db
      .select({ profileId: profileSpecialties.profileId, specialtyId: profileSpecialties.specialtyId })
      .from(profileSpecialties)
      .where(inArray(profileSpecialties.specialtyId, filters.specialtyIds));
    const tagMap = new Map<number, Set<number>>();
    for (const row of tagRows) {
      if (!tagMap.has(row.profileId)) tagMap.set(row.profileId, new Set());
      tagMap.get(row.profileId)!.add(row.specialtyId);
    }
    result = result.filter(p => {
      const owned = tagMap.get(p.id);
      return owned && filters.specialtyIds!.every(id => owned.has(id));
    });
  }

  // Attach specialty info (primary + tags) for card display
  if (result.length > 0) {
    const resultIds = result.map(p => p.id);
    const specRows = await db
      .select({
        profileId: profileSpecialties.profileId,
        specialtyId: profileSpecialties.specialtyId,
        isPrimary: profileSpecialties.isPrimary,
        displayOrder: profileSpecialties.displayOrder,
        name: specialties.name,
        category: specialties.category,
      })
      .from(profileSpecialties)
      .innerJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
      .where(inArray(profileSpecialties.profileId, resultIds))
      .orderBy(desc(profileSpecialties.isPrimary), asc(profileSpecialties.displayOrder));
    const specsByProfile = new Map<number, { specialtyId: number; isPrimary: boolean; name: string; category: string }[]>();
    for (const row of specRows) {
      if (!specsByProfile.has(row.profileId)) specsByProfile.set(row.profileId, []);
      specsByProfile.get(row.profileId)!.push({
        specialtyId: row.specialtyId,
        isPrimary: row.isPrimary,
        name: row.name,
        category: row.category,
      });
    }
    return result.map(p => ({
      ...p,
      specialties: specsByProfile.get(p.id) || [],
    }));
  }

  return result.map(p => ({ ...p, specialties: [] as { specialtyId: number; isPrimary: boolean; name: string; category: string }[] }));
}

export async function getProfileWithDetails(id: number, opts?: { publicView?: boolean }) {
  const db = await getDb();
  if (!db) return null;

  const profileResult = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  if (profileResult.length === 0) return null;

  const profile = profileResult[0];

  const [profileLicenses, profileExperiences, profileEducations, profileSpecs] = await Promise.all([
    db.select().from(licenses).where(eq(licenses.profileId, id)),
    db.select().from(experiences).where(eq(experiences.profileId, id)).orderBy(desc(experiences.startDate)),
    db.select().from(educations).where(eq(educations.profileId, id)).orderBy(desc(educations.completionDate)),
    db.select({ specialtyId: profileSpecialties.specialtyId, isPrimary: profileSpecialties.isPrimary }).from(profileSpecialties).where(eq(profileSpecialties.profileId, id)).orderBy(desc(profileSpecialties.isPrimary), asc(profileSpecialties.displayOrder)),
  ]);

  let profileSpecsData: { specialtyId: number; isPrimary: boolean; name: string; category: string }[] = [];
  if (profileSpecs.length > 0) {
    const specIds = profileSpecs.map(s => s.specialtyId);
    const specRows = await db.select().from(specialties).where(inArray(specialties.id, specIds));
    const specMap = new Map(specRows.map(s => [s.id, s]));
    profileSpecsData = profileSpecs.map(ps => {
      const spec = specMap.get(ps.specialtyId);
      return {
        specialtyId: ps.specialtyId,
        isPrimary: ps.isPrimary,
        name: spec?.name || '',
        category: spec?.category || '',
      };
    });
  }

  let licensesToReturn: any = profileLicenses;
  if (opts?.publicView) {
    licensesToReturn = profileLicenses
      .filter(l => l.isPublic)
      .map(l => {
        const { licenseNumber, evidenceFileUrl, adminNote, ...filtered } = l;
        return filtered;
      });
  }

  return {
    ...profile,
    licenses: licensesToReturn,
    experiences: profileExperiences,
    educations: profileEducations,
    specialties: profileSpecsData,
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

export async function updateLicenseOwned(id: number, profileId: number, data: Partial<InsertLicense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(licenses).set(data).where(and(eq(licenses.id, id), eq(licenses.profileId, profileId)));
  return result[0].affectedRows > 0;
}

export async function deleteLicense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(licenses).where(eq(licenses.id, id));
}

export async function deleteLicenseOwned(id: number, profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(licenses).where(and(eq(licenses.id, id), eq(licenses.profileId, profileId)));
  return result[0].affectedRows > 0;
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

export async function updateExperienceOwned(id: number, profileId: number, data: Partial<InsertExperience>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(experiences).set(data).where(and(eq(experiences.id, id), eq(experiences.profileId, profileId)));
  return result[0].affectedRows > 0;
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(experiences).where(eq(experiences.id, id));
}

export async function deleteExperienceOwned(id: number, profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(experiences).where(and(eq(experiences.id, id), eq(experiences.profileId, profileId)));
  return result[0].affectedRows > 0;
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

export async function updateEducationOwned(id: number, profileId: number, data: Partial<InsertEducation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(educations).set(data).where(and(eq(educations.id, id), eq(educations.profileId, profileId)));
  return result[0].affectedRows > 0;
}

export async function deleteEducation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(educations).where(eq(educations.id, id));
}

export async function deleteEducationOwned(id: number, profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(educations).where(and(eq(educations.id, id), eq(educations.profileId, profileId)));
  return result[0].affectedRows > 0;
}

// ============ SPECIALTY HELPERS ============

export async function getAllSpecialties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialties).where(eq(specialties.isActive, true)).orderBy(asc(specialties.displayOrder));
}

export async function getSpecialtiesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialties)
    .where(and(eq(specialties.isActive, true), eq(specialties.category, category)))
    .orderBy(asc(specialties.displayOrder));
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.selectDistinct({ category: specialties.category })
    .from(specialties)
    .where(eq(specialties.isActive, true))
    .orderBy(asc(specialties.displayOrder));
  return rows.map(r => r.category);
}

export async function setProfileSpecialties(profileId: number, items: { specialtyId: number; isPrimary: boolean; displayOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(profileSpecialties).where(eq(profileSpecialties.profileId, profileId));
  if (items.length > 0) {
    await db.insert(profileSpecialties).values(
      items.map(item => ({ profileId, specialtyId: item.specialtyId, isPrimary: item.isPrimary, displayOrder: item.displayOrder }))
    );
  }
}

export async function getProfileSpecialties(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    specialtyId: profileSpecialties.specialtyId,
    isPrimary: profileSpecialties.isPrimary,
    displayOrder: profileSpecialties.displayOrder,
    name: specialties.name,
    category: specialties.category,
  })
    .from(profileSpecialties)
    .innerJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
    .where(eq(profileSpecialties.profileId, profileId))
    .orderBy(desc(profileSpecialties.isPrimary), asc(profileSpecialties.displayOrder));
  return rows;
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

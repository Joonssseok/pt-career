import { int, pgEnum, pgTable, text, timestamp, varchar, boolean, decimal, json, serial } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: int("id").serial(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: pgEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Expert profiles - main profile table for professionals
 */
export const profiles = pgTable("profiles", {
  id: int("id").serial(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  profession: varchar("profession", { length: 50 }).notNull(),
  headline: varchar("headline", { length: 200 }),
  introduction: text("introduction"),
  profileImageUrl: text("profileImageUrl"),
  totalExperienceYears: int("totalExperienceYears").default(0),
  isPublic: boolean("isPublic").default(false).notNull(),
  verificationStatus: pgEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  // Workplace info
  centerName: varchar("centerName", { length: 200 }),
  centerAddress: text("centerAddress"),
  centerPhone: varchar("centerPhone", { length: 30 }),
  centerWebsite: text("centerWebsite"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  region: varchar("region", { length: 50 }),
  // Contact & social
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 30 }),
  snsLinks: json("snsLinks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Licenses and certifications
 */
export const licenses = pgTable("licenses", {
  id: int("id").serial(),
  profileId: int("profileId").notNull(),
  licenseName: varchar("licenseName", { length: 200 }).notNull(),
  issuingOrganization: varchar("issuingOrganization", { length: 200 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  acquiredDate: varchar("acquiredDate", { length: 20 }),
  expiryDate: varchar("expiryDate", { length: 20 }),
  verificationStatus: pgEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  evidenceFileUrl: text("evidenceFileUrl"),
  isPublic: boolean("isPublic").default(true).notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = typeof licenses.$inferInsert;

/**
 * Work experiences
 */
export const experiences = pgTable("experiences", {
  id: int("id").serial(),
  profileId: int("profileId").notNull(),
  organizationName: varchar("organizationName", { length: 200 }).notNull(),
  position: varchar("position", { length: 100 }),
  startDate: varchar("startDate", { length: 20 }),
  endDate: varchar("endDate", { length: 20 }),
  isCurrent: boolean("isCurrent").default(false),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

/**
 * Education history
 */
export const educations = pgTable("educations", {
  id: int("id").serial(),
  profileId: int("profileId").notNull(),
  educationName: varchar("educationName", { length: 200 }).notNull(),
  organizationName: varchar("organizationName", { length: 200 }),
  completionDate: varchar("completionDate", { length: 20 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Education = typeof educations.$inferSelect;
export type InsertEducation = typeof educations.$inferInsert;

/**
 * Specialties master table
 * category: 1차 카테고리 (12개)
 * name: 세부 태그 이름
 * description: 간단한 설명
 * displayOrder: 정렬 순서
 */
export const specialties = pgTable("specialties", {
  id: int("id").serial(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

/**
 * Profile-Specialty junction table (N:M)
 * isPrimary: 대표 전문분야 여부
 * displayOrder: 프로필 내 표시 순서
 */
export const profileSpecialties = pgTable("profileSpecialties", {
  id: int("id").serial(),
  profileId: int("profileId").notNull(),
  specialtyId: int("specialtyId").notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
});

export type ProfileSpecialty = typeof profileSpecialties.$inferSelect;

/**
 * Reports (flagging inappropriate content)
 */
export const reports = pgTable("reports", {
  id: int("id").serial(),
  reporterUserId: int("reporterUserId"),
  targetProfileId: int("targetProfileId").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  description: text("description"),
  status: pgEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

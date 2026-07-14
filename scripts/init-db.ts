import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const sql = `
CREATE TYPE role_enum AS ENUM ('user', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  "name" TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role role_enum NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  "userId" INT NOT NULL,
  "displayName" VARCHAR(100) NOT NULL,
  profession VARCHAR(50) NOT NULL,
  headline VARCHAR(200),
  introduction TEXT,
  "profileImageUrl" TEXT,
  "totalExperienceYears" INT DEFAULT 0,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "verificationStatus" verification_status_enum NOT NULL DEFAULT 'unverified',
  "centerName" VARCHAR(200),
  "centerAddress" TEXT,
  "centerPhone" VARCHAR(30),
  "centerWebsite" TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  region VARCHAR(50),
  "contactEmail" VARCHAR(320),
  "contactPhone" VARCHAR(30),
  "snsLinks" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  "profileId" INT NOT NULL,
  "licenseName" VARCHAR(200) NOT NULL,
  "issuingOrganization" VARCHAR(200),
  "licenseNumber" VARCHAR(100),
  "acquiredDate" VARCHAR(20),
  "expiryDate" VARCHAR(20),
  "verificationStatus" verification_status_enum NOT NULL DEFAULT 'unverified',
  "evidenceFileUrl" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "adminNote" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  "profileId" INT NOT NULL,
  "organizationName" VARCHAR(200) NOT NULL,
  position VARCHAR(100),
  "startDate" VARCHAR(20),
  "endDate" VARCHAR(20),
  "isCurrent" BOOLEAN DEFAULT false,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS educations (
  id SERIAL PRIMARY KEY,
  "profileId" INT NOT NULL,
  "educationName" VARCHAR(200) NOT NULL,
  "organizationName" VARCHAR(200),
  "completionDate" VARCHAR(20),
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS specialties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  "displayOrder" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "profileSpecialties" (
  id SERIAL PRIMARY KEY,
  "profileId" INT NOT NULL,
  "specialtyId" INT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INT NOT NULL DEFAULT 0,
  FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY ("specialtyId") REFERENCES specialties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  "reporterUserId" INT,
  "targetProfileId" INT NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status report_status_enum NOT NULL DEFAULT 'pending',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("reporterUserId") REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY ("targetProfileId") REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_userId ON profiles("userId");
CREATE INDEX IF NOT EXISTS idx_profiles_isPublic ON profiles("isPublic");
CREATE INDEX IF NOT EXISTS idx_profiles_verificationStatus ON profiles("verificationStatus");
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_licenses_profileId ON licenses("profileId");
CREATE INDEX IF NOT EXISTS idx_experiences_profileId ON experiences("profileId");
CREATE INDEX IF NOT EXISTS idx_educations_profileId ON educations("profileId");
CREATE INDEX IF NOT EXISTS idx_profileSpecialties_profileId ON "profileSpecialties"("profileId");
CREATE INDEX IF NOT EXISTS idx_profileSpecialties_specialtyId ON "profileSpecialties"("specialtyId");
CREATE INDEX IF NOT EXISTS idx_reports_targetProfileId ON reports("targetProfileId");
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
`;

async function initDb() {
  const pool = new Pool({ connectionString });
  try {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }

    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDb();

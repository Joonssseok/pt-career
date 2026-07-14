-- Create ENUM types
CREATE TYPE role_enum AS ENUM ('user', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Users table
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

-- Profiles table
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
  -- Workplace info
  "centerName" VARCHAR(200),
  "centerAddress" TEXT,
  "centerPhone" VARCHAR(30),
  "centerWebsite" TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  region VARCHAR(50),
  -- Contact & social
  "contactEmail" VARCHAR(320),
  "contactPhone" VARCHAR(30),
  "snsLinks" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Licenses table
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

-- Experiences table
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

-- Educations table
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

-- Specialties table (Master data)
CREATE TABLE IF NOT EXISTS specialties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  "displayOrder" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ProfileSpecialties junction table (N:M)
CREATE TABLE IF NOT EXISTS "profileSpecialties" (
  id SERIAL PRIMARY KEY,
  "profileId" INT NOT NULL,
  "specialtyId" INT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INT NOT NULL DEFAULT 0,
  FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY ("specialtyId") REFERENCES specialties(id) ON DELETE CASCADE
);

-- Reports table
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

-- Create indexes for performance
CREATE INDEX idx_profiles_userId ON profiles("userId");
CREATE INDEX idx_profiles_isPublic ON profiles("isPublic");
CREATE INDEX idx_profiles_verificationStatus ON profiles("verificationStatus");
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_licenses_profileId ON licenses("profileId");
CREATE INDEX idx_experiences_profileId ON experiences("profileId");
CREATE INDEX idx_educations_profileId ON educations("profileId");
CREATE INDEX idx_profileSpecialties_profileId ON "profileSpecialties"("profileId");
CREATE INDEX idx_profileSpecialties_specialtyId ON "profileSpecialties"("specialtyId");
CREATE INDEX idx_reports_targetProfileId ON reports("targetProfileId");
CREATE INDEX idx_reports_status ON reports(status);

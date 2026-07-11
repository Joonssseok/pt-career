# PT Career - GitHub Pages + Supabase 배포 가이드

## 📋 개요

- **프론트엔드**: GitHub Pages (자동 배포)
- **백엔드**: Supabase (Edge Functions)
- **데이터베이스**: Supabase PostgreSQL

---

## 🚀 배포 단계

### 1️⃣ Supabase 프로젝트 생성 (5분)

**1. Supabase 가입**
- [supabase.com](https://supabase.com) 방문
- GitHub 계정으로 로그인
- "New Project" 클릭

**2. 프로젝트 정보 입력**
```
Organization: (기본값)
Project Name: pt-career
Database Password: (복잡한 비밀번호 설정)
Region: Asia (싱가포르 추천)
```

**3. 프로젝트 생성 완료**
- 대시보드에서 "Settings" 클릭
- "API" 탭에서 다음 정보 복사:
  ```
  Project URL: https://xxxxx.supabase.co
  anon public key: eyJxxx...
  service_role secret: eyJxxx...
  ```

---

### 2️⃣ GitHub Secrets 설정 (3분)

저장소 → **Settings** → **Secrets and variables** → **Actions**

**다음 3개 Secret 추가:**

| 이름 | 값 |
|------|-----|
| `SUPABASE_API_URL` | `https://xxxxx.supabase.co` (프로젝트 URL) |
| `SUPABASE_ANON_KEY` | `eyJxxx...` (anon public key) |
| `SUPABASE_SERVICE_ROLE` | `eyJxxx...` (service_role secret) |

---

### 3️⃣ GitHub Pages 활성화 (2분)

저장소 → **Settings** → **Pages**

```
Source: Deploy from a branch
Branch: gh-pages
Folder: / (root)
```

> ℹ️ 워크플로우가 자동으로 `gh-pages` 브랜치 생성

---

### 4️⃣ 데이터베이스 마이그레이션 (10분)

**Supabase SQL Editor에서:**

1. Supabase 대시보드 → "SQL Editor"
2. "New Query" 클릭
3. 아래 스크립트 붙여넣기:

```sql
-- PT Career Database Schema

CREATE TABLE IF NOT EXISTS profiles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_image_url TEXT,
  headline TEXT,
  bio TEXT,
  profession TEXT,
  region TEXT,
  center_name TEXT,
  center_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_experience_years INT,
  is_public BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS specialties (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_specialties (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  specialty_id BIGINT REFERENCES specialties(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS licenses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  license_name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiration_date DATE,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  graduation_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_public ON profiles(is_public);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);
CREATE INDEX idx_profile_specialties_profile_id ON profile_specialties(profile_id);
CREATE INDEX idx_specialties_category ON specialties(category);

-- Row-level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;

-- 공개 프로필 조회 정책
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = true AND verification_status = 'verified');

-- 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);
```

4. "Run" 클릭

---

### 5️⃣ GitHub Actions 배포 확인 (2분)

**저장소에 커밋 & 푸시:**

```bash
git add .github/workflows/deploy-frontend.yml .env.example DEPLOYMENT.md
git commit -m "feat: GitHub Pages + Supabase 배포 설정"
git push origin main
```

**배포 상태 확인:**
- 저장소 → **Actions** 탭
- 최근 "Deploy Frontend to GitHub Pages" 실행 확인
- ✅ 녹색 = 배포 성공

**배포 URL 확인:**
- 저장소 → **Settings** → **Pages**
- "Visit site" 링크 클릭

---

## 🔗 API 연결

현재 프론트엔드는 Supabase API를 자동으로 사용합니다.

**환경변수 (자동 설정):**
```
VITE_API_URL=https://xxxxx.supabase.co
VITE_ANON_KEY=eyJxxx...
```

이 정보는 GitHub Secrets에서 자동으로 주입됩니다.

---

## 🛠️ 로컬 개발

```bash
# 1. 저장소 클론
git clone https://github.com/Joonssseok/pt-career.git
cd pt-career

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집 후 Supabase 정보 입력

# 4. 개발 서버 실행
pnpm run dev
```

---

## 📱 배포 후 테스트

1. **프론트엔드** (GitHub Pages)
   ```
   https://{username}.github.io/pt-career
   ```

2. **기능 테스트**
   - "내 주변 전문가 찾기" 버튼 클릭
   - 위치 권한 요청 확인
   - 주변 전문가 리스트 표시 확인

---

## ⚠️ 주의사항

- **Supabase 크레딧**: Free tier는 월 50K 요청 제한 (충분함)
- **API 키**: `anon public key`만 GitHub에 업로드 (service_role은 절대 공개하지 마세요)
- **데이터베이스**: Supabase의 기본 PostgreSQL 사용 (자동 백업됨)

---

## 🔄 이후 배포

이제부터는:
```bash
git commit -m "..."
git push origin main
```
이것만으로 자동 배포됩니다! 🎉

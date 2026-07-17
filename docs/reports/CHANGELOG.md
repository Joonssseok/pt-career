# Changelog — PT Career MVP

모든 주목할 만한 변경사항이 이 파일에 기록됩니다.

**마지막 갱신:** 2026-07-16

---

## [Unreleased]

### Phase 1-B (진행 중)
**Status:** Vercel Preview 배포 중

#### Added
- docs/DECISION_LOG.md — CTO 의사결정 기록
- docs/CHANGELOG.md — 변경 기록 (이 파일)
- Vercel 배포 설정 (자동 감지)

#### Testing
- npm run build: ✅ PASS (87.4 kB)
- TypeScript check: ✅ PASS (0 errors)
- Vercel Preview: 🔄 진행 중

---

## [1.0.0-phase-1] — 2026-07-16

### Phase 0: Code Preservation
**Status:** ✅ COMPLETE

#### Changed
- `.github/workflows/deploy.yml` — `on: push` 제거 → `on: workflow_dispatch`로 변경 (자동 배포 중단)
- `.github/workflows/deploy-frontend.yml` — `on: push; branches: [main]` 제거

#### Created
- `legacy/manus-prototype` branch — 기존 Manus/Vite/Express 코드 영구 보존
  - 12개 파일, 4165 insertions
  - 기본 브랜치에서 보호됨

#### Security
- GitHub Actions 자동 실행 비활성화 (workflow_dispatch로 전환)

---

### Phase 1: Next.js Base Structure
**Status:** ✅ LOCAL COMPLETE (Vercel 배포 대기)

#### Added
- **Framework Migration:**
  - `app/layout.tsx` — Root layout (Next.js 14 App Router)
  - `app/page.tsx` — Home page component
  - `app/globals.css` — Global Tailwind styles

- **Configuration Files:**
  - `next.config.mjs` — Next.js build config (React strict mode enabled)
  - `tsconfig.json` — TypeScript config (App Router path aliases)
  - `tailwind.config.ts` — Tailwind CSS 4.1 config
  - `.gitignore` — node_modules, .next, .env 제외

- **Dependencies:**
  - `next@^14.0.0` — Server-rendered React
  - `react@^19.2.1`, `react-dom@^19.2.1` — UI library
  - `@supabase/supabase-js@^2.38.0` — Supabase client (준비)
  - `@supabase/ssr@^0.0.10` — SSR utilities (준비)
  - Radix UI (20+ 컴포넌트) — UI library (이식 예정)
  - `tailwindcss@^4.1.14` — CSS framework
  - `@tanstack/react-query@^5.90.2` — Data fetching (tRPC 대체)
  - Framer Motion, Zod, date-fns — Utilities

- **Documentation:**
  - `docs/MVP_MIGRATION_LOG.md` — Phase 0/1 실행 기록
  - `docs/PHASE_0_1_COMPLETION_REPORT.md` — 8점 검증 보고서

#### Changed
- `package.json` — Vite/Express scripts 제거 → Next.js 스크립트로 교체
  - `"dev": "next dev"` (Vite watch 제거)
  - `"build": "next build"` (Vite build + esbuild 제거)
  - `"start": "next start"` (node dist/index.js 제거)
  - `"lint": "next lint"` 추가

#### Preserved (Not Deleted)
- `client/` directory — 12개 Vite 컴포넌트
- `server/` directory — Express 백엔드
- `drizzle/` — 11-테이블 ORM 스키마 (Postgres enum 호환성 수정)
- `render.yaml` — Render 배포 설정

#### Removed (Code Preservation Policy: Phase 8까지 금지)
- Vite 빌드 아티팩트만 제거 (`vite.config.ts` 보존)
- Express 서버 부팅 코드만 비활성화 (파일 자체는 보존)

#### Verified
- ✅ npm run build — 87.4 kB first load JS
- ✅ TypeScript check — 0 errors
- ✅ Dependencies installed — pnpm 226 packages
- ✅ Git history — 3 commits recorded

---

## [Legacy Preserved] — 2026-07-15

### Initial Commit

#### Content
```
client/src/App.tsx                          # Vite root component
client/src/components/NearbyExpertCard.tsx  # Expert card
client/src/components/NearbyExpertsModal.tsx # Location modal
client/src/lib/utils/distance.ts            # Geolocation
client/src/pages/Home.tsx                   # Home page
client/src/pages/Experts.tsx                # Expert list
client/src/pages/MapPage.tsx                # Map view
client/src/pages/MyExperiences.tsx          # User experiences
client/src/pages/MyEducations.tsx           # User educations
client/src/pages/MyLicenses.tsx             # User licenses
client/src/types/location.ts                # Location types
docs/13_UX_FLOW.md                          # UX documentation
```

#### Rationale
- Manus OAuth Portal 의존성 검증 완료
- Vite base path 문제 확인
- tRPC 하드코딩 패턴 기록
- Drizzle MySQL 잔재 식별

---

## Upcoming Changes

### Phase 2 (예정)
- [ ] `.env` 파일 템플릿 생성
- [ ] Supabase 프로젝트 선택/생성 절차
- [ ] 환경변수 설정 가이드
- [ ] NEXT_PUBLIC_SUPABASE_URL 등록

### Phase 3 (예정)
- [ ] Supabase Auth 클라이언트 초기화
- [ ] 로그인/회원가입 페이지 구현
- [ ] Session 관리 (Supabase cookie)
- [ ] 프로필 생성 flow

### Phase 4 (예정)
- [ ] Supabase 테이블 마이그레이션
- [ ] Row-Level Security (RLS) 정책
- [ ] admin_users 테이블 구현

### Phase 5 (예정)
- [ ] Next.js Route Handlers (API)
- [ ] 전문가 검색 엔드포인트
- [ ] 프로필 CRUD 엔드포인트

---

## Decisions & Rationale

### Why Next.js over current Vite/Express?
1. **통합 배포:** Vercel에서 단일 배포 (현재는 Render + GitHub Pages 분리)
2. **CORS 해결:** 동일 도메인에서 API 호출 (현재는 base path 문제)
3. **쿠키 관리:** 서버/클라이언트 쿠키 자동 동기화 (현재는 크로스 도메인 문제)
4. **Manus 독립:** Manus OAuth Portal 의존성 제거

### Why Supabase over Firebase?
1. **PostgreSQL:** 구조화된 데이터 모델 (전문가 프로필, 자격증 검증)
2. **RLS:** 행 단위 보안 제어 (민감한 데이터 보호)
3. **Storage:** 자격증 파일 저장 (signed URL)
4. **비용:** 소규모 MVP 무료 tier 충분

### Why separate admin_users table?
1. **명시성:** profiles.role보다 접근 제어 명확
2. **감사:** 권한 부여/철회 기록 남김
3. **보안:** 프로필 업데이트 중 실수 권한 변경 방지

---

## Migration Checklist

### From Manus/Vite/Express → Next.js/Supabase/Vercel

- [x] **Phase 0:** Legacy code 보존
  - [x] legacy/manus-prototype branch
  - [x] GitHub Actions disabled

- [x] **Phase 1:** Next.js 기본 구조
  - [x] app/ router 설정
  - [x] TypeScript 설정
  - [x] Tailwind CSS 설정
  - [x] npm run build ✅
  - [x] TypeScript check ✅

- [ ] **Phase 1-B:** Vercel 배포 (진행 중)
  - [ ] Vercel 프로젝트 생성
  - [ ] GitHub remote 연결
  - [ ] legacy 브랜치 보호
  - [ ] Vercel Preview URL 획득

- [ ] **Phase 2:** 환경 설정
  - [ ] Supabase 프로젝트 생성
  - [ ] .env 파일 설정
  - [ ] 환경변수 Vercel에 등록

- [ ] **Phase 3:** 인증 연결
  - [ ] Supabase Auth 클라이언트
  - [ ] 로그인/가입 UI
  - [ ] Session 관리

- [ ] **Phase 4:** 데이터베이스
  - [ ] 테이블 생성 (migrations)
  - [ ] RLS 정책
  - [ ] admin_users 테이블

- [ ] **Phase 5:** API 구현
  - [ ] Route Handlers
  - [ ] 전문가 검색
  - [ ] 프로필 관리

---

## Performance Notes

### Current Build Metrics (Phase 1)
- First Load JS: **87.4 kB**
- Chunks: 2 (418-..., b9c6e... + shared 1.92 kB)
- Build time: ~8s
- TypeScript compile: <1s

### Optimization Opportunities
- [ ] Unused dependency removal (Phase 6)
- [ ] Code splitting (Route-level)
- [ ] Image optimization (with next/image)
- [ ] Font optimization (with next/font)

---

**Repository:** PT Career MVP
**Branch Base:** master (main 전환 예정)
**Last Updated:** 2026-07-16 01:30 UTC

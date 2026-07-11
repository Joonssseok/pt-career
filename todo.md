# Project TODO

- [x] Project initialization and scaffold
- [x] Full-stack upgrade (db, server, user)
- [x] Database schema (users, profiles, licenses, experiences, educations, specialties, profileSpecialties, reports)
- [x] Backend API (tRPC routers for profiles, specialties, myProfile, admin)
- [x] Seed data (6 expert profiles with licenses, experiences, educations, specialties)
- [x] Common layout with responsive header, footer, mobile bottom nav
- [x] Home page with hero, search, specialties, featured experts
- [x] Expert listing page with filters (profession, region, specialty) and search
- [x] Expert detail page with full profile info (licenses, experiences, educations, specialties)
- [x] Map page (Google Maps integration via proxy, tRPC data)
- [x] Login/Signup pages (Manus OAuth)
- [x] My Page (profile overview, licenses, experiences, educations)
- [x] Profile create/edit form (basic info, specialties, workplace, contact, visibility)
- [x] Admin page (dashboard stats, license verification, profile management, report management)
- [x] Auth-aware navigation (login vs mypage/admin)
- [x] About page
- [x] Terms page
- [x] Privacy page
- [x] 404 Not Found page
- [x] Mobile responsive design (bottom nav, mobile menu)
- [x] Vitest tests (16 tests passing - auth, profiles, specialties, myProfile, admin)
- [x] Dark/light theme toggle
- [x] Map page: Google Maps loads in production only (proxy requires Origin header from deployed domain) - documented as known behavior
- [x] Admin page: shows loading spinner in preview (requires admin role - works when logged in as admin) - documented as known behavior

## 전문분야 카테고리 구조 재구성

- [x] DB: specialties 테이블에 category 컬럼 추가, 기존 데이터 삭제 후 12개 1차 카테고리 + 세부 태그 시드 (48개 태그, 온라인 코칭·비대면 트레이닝 포함)
- [x] DB: profileSpecialties 테이블에 isPrimary/displayOrder 컬럼 추가 및 시드 리매핑
- [x] API: specialties 라우터에 카테고리별 조회 추가 (specialties.byCategory)
- [x] API: profiles.list에 카테고리/태그 필터 추가 (category, specialtyIds)
- [x] 홈 화면: 12개 카테고리 그리드 → 카테고리 필터 링크
- [x] 전문가 목록: 상단 1차 카테고리 필터 + 세부 태그 필터 + 초기화 버튼
- [x] 전문가 카드: 대표 전문분야 배지, 세부 태그 최대 3개, 자격/면허 상태, 경력, 센터명/지역
- [x] 전문가 상세: 전문분야 객체 렌더링 (대표 분야 강조 표시)
- [x] 프로필 등록/수정: 카테고리 아코디언 → 세부 태그 선택 → 대표 전문분야 지정 (별표)
- [x] 모바일 360px 반응형 검증
- [x] 테스트 업데이트 (16개 전체 통과)

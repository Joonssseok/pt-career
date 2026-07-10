export interface Expert {
  id: string;
  displayName: string;
  profileImageUrl: string;
  profession: string;
  headline: string;
  introduction: string;
  totalExperienceYears: number;
  region: string;
  isPublic: boolean;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  specialties: string[];
  workplace: {
    centerName: string;
    address: string;
    phone: string;
    websiteUrl?: string;
    latitude: number;
    longitude: number;
  };
  experiences: {
    organizationName: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  licenses: {
    licenseName: string;
    issuingOrganization: string;
    acquiredDate: string;
    verificationStatus: "not_submitted" | "pending" | "verified" | "rejected";
    isPublic: boolean;
  }[];
  educations: {
    educationName: string;
    organizationName: string;
    completionDate: string;
    description?: string;
  }[];
  createdAt: string;
}

export const PROFESSIONS = [
  "물리치료사",
  "퍼스널 트레이너",
  "건강운동관리사",
  "선수트레이너",
  "필라테스 강사",
  "재활운동 전문가",
  "작업치료사",
  "스포츠재활전문가",
  "요가 강사",
  "운동처방사",
  "기타",
];

// MVP 12개 1차 카테고리 (specialties.category 값과 동일)
export const SPECIALTY_CATEGORIES = [
  "다이어트·체형관리",
  "근력강화·바디프로필",
  "자세·움직임 개선",
  "재활운동·회복 운동",
  "산전·산후 운동",
  "소아·청소년 운동",
  "시니어·낙상예방",
  "스포츠 퍼포먼스",
  "체력향상·컨디셔닝",
  "필라테스·요가·유연성",
  "만성질환·특수집단 운동",
  "온라인 코칭·비대면 트레이닝",
];

export const REGIONS = [
  "서울 강남구",
  "서울 서초구",
  "서울 송파구",
  "서울 마포구",
  "서울 강서구",
  "서울 영등포구",
  "서울 용산구",
  "서울 성동구",
  "서울 종로구",
  "서울 중구",
  "경기 성남시",
  "경기 수원시",
  "경기 용인시",
  "경기 고양시",
  "경기 부천시",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "제주",
  "부산 해운대구",
];

export const mockExperts: Expert[] = [
  {
    id: "1",
    displayName: "김도현",
    profileImageUrl: "/manus-storage/expert-card-1_bf9ae639.png",
    profession: "물리치료사",
    headline: "근골격계 전문 물리치료사 | 도수치료 10년",
    introduction: "10년간 근골격계 환자를 전문으로 치료해온 물리치료사입니다. 대학병원과 재활센터에서의 풍부한 경험을 바탕으로, 환자 개개인에 맞춘 맞춤형 치료 프로그램을 제공합니다. 특히 만성 통증 관리와 수술 후 재활에 강점을 가지고 있습니다.",
    totalExperienceYears: 10,
    region: "서울 강남구",
    isPublic: true,
    verificationStatus: "verified",
    specialties: ["근골격계 재활", "도수치료", "통증 관리", "척추 교정"],
    workplace: {
      centerName: "강남 리커버리 센터",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      websiteUrl: "https://example.com",
      latitude: 37.5012,
      longitude: 127.0396,
    },
    experiences: [
      { organizationName: "강남 리커버리 센터", position: "수석 물리치료사", startDate: "2020-03", description: "근골격계 환자 전담 치료" },
      { organizationName: "서울대학교병원 재활의학과", position: "물리치료사", startDate: "2016-03", endDate: "2020-02", description: "입원 및 외래 환자 물리치료" },
    ],
    licenses: [
      { licenseName: "물리치료사 면허", issuingOrganization: "보건복지부", acquiredDate: "2015-02", verificationStatus: "verified", isPublic: true },
      { licenseName: "정형도수치료 전문가", issuingOrganization: "대한도수치료학회", acquiredDate: "2017-06", verificationStatus: "verified", isPublic: true },
    ],
    educations: [
      { educationName: "물리치료학 학사", organizationName: "연세대학교", completionDate: "2015-02" },
      { educationName: "정형도수치료 고급과정", organizationName: "대한도수치료학회", completionDate: "2017-06" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    displayName: "박서연",
    profileImageUrl: "/manus-storage/expert-card-2_798ac38c.png",
    profession: "퍼스널 트레이너",
    headline: "체형 교정 전문 트레이너 | NSCA-CPT",
    introduction: "체형 교정과 기능적 트레이닝을 전문으로 하는 퍼스널 트레이너입니다. 미국 NSCA 인증 자격을 보유하고 있으며, 개인별 체형 분석을 통한 맞춤 운동 프로그램을 설계합니다.",
    totalExperienceYears: 7,
    region: "서울 서초구",
    isPublic: true,
    verificationStatus: "verified",
    specialties: ["체형 교정", "기능적 트레이닝", "근력 강화", "유연성 향상"],
    workplace: {
      centerName: "바디밸런스 스튜디오",
      address: "서울특별시 서초구 강남대로 456",
      phone: "02-9876-5432",
      websiteUrl: "https://example.com",
      latitude: 37.4969,
      longitude: 127.0278,
    },
    experiences: [
      { organizationName: "바디밸런스 스튜디오", position: "대표 트레이너", startDate: "2021-01" },
      { organizationName: "피트니스 원", position: "시니어 트레이너", startDate: "2018-06", endDate: "2020-12" },
    ],
    licenses: [
      { licenseName: "NSCA-CPT", issuingOrganization: "NSCA", acquiredDate: "2018-03", verificationStatus: "verified", isPublic: true },
      { licenseName: "생활스포츠지도사 2급", issuingOrganization: "문화체육관광부", acquiredDate: "2017-11", verificationStatus: "pending", isPublic: true },
    ],
    educations: [
      { educationName: "체육학 학사", organizationName: "한국체육대학교", completionDate: "2017-02" },
      { educationName: "NSCA-CPT 인증 과정", organizationName: "NSCA Korea", completionDate: "2018-03" },
    ],
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    displayName: "이준호",
    profileImageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop&crop=face",
    profession: "건강운동관리사",
    headline: "만성질환 운동처방 전문 | 운동생리학 석사",
    introduction: "운동생리학 석사 학위를 바탕으로 만성질환자를 위한 과학적 운동처방을 전문으로 합니다. 당뇨, 고혈압, 비만 등 대사질환 환자의 운동 관리에 특화되어 있습니다.",
    totalExperienceYears: 8,
    region: "서울 송파구",
    isPublic: true,
    verificationStatus: "pending",
    specialties: ["운동처방", "심폐 재활", "근력 강화", "통증 관리"],
    workplace: {
      centerName: "헬스케어 운동센터",
      address: "서울특별시 송파구 올림픽로 789",
      phone: "02-5555-1234",
      latitude: 37.5145,
      longitude: 127.1050,
    },
    experiences: [
      { organizationName: "헬스케어 운동센터", position: "운동처방사", startDate: "2019-05" },
      { organizationName: "삼성서울병원 스포츠의학센터", position: "운동관리사", startDate: "2016-09", endDate: "2019-04" },
    ],
    licenses: [
      { licenseName: "건강운동관리사", issuingOrganization: "문화체육관광부", acquiredDate: "2016-08", verificationStatus: "pending", isPublic: true },
    ],
    educations: [
      { educationName: "운동생리학 석사", organizationName: "서울대학교", completionDate: "2016-08" },
      { educationName: "체육교육학 학사", organizationName: "고려대학교", completionDate: "2014-02" },
    ],
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    displayName: "최민지",
    profileImageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop&crop=face",
    profession: "필라테스 강사",
    headline: "재활 필라테스 전문 | STOTT 인증",
    introduction: "STOTT PILATES 인증 강사로, 재활 목적의 필라테스 프로그램을 전문으로 운영합니다. 특히 산전·산후 여성과 척추 질환 환자를 위한 맞춤 프로그램에 강점이 있습니다.",
    totalExperienceYears: 6,
    region: "서울 마포구",
    isPublic: true,
    verificationStatus: "verified",
    specialties: ["산전·산후 운동", "척추 교정", "체형 교정", "유연성 향상"],
    workplace: {
      centerName: "필라테스 라움",
      address: "서울특별시 마포구 월드컵북로 321",
      phone: "02-3333-7890",
      websiteUrl: "https://example.com",
      latitude: 37.5566,
      longitude: 126.9080,
    },
    experiences: [
      { organizationName: "필라테스 라움", position: "원장", startDate: "2022-01" },
      { organizationName: "바디앤마인드 스튜디오", position: "수석 강사", startDate: "2019-03", endDate: "2021-12" },
    ],
    licenses: [
      { licenseName: "STOTT PILATES IMP", issuingOrganization: "Merrithew", acquiredDate: "2019-01", verificationStatus: "verified", isPublic: true },
    ],
    educations: [
      { educationName: "무용학 학사", organizationName: "이화여자대학교", completionDate: "2018-02" },
      { educationName: "STOTT PILATES 풀 인증 과정", organizationName: "Merrithew Korea", completionDate: "2019-01" },
    ],
    createdAt: "2024-04-05",
  },
  {
    id: "5",
    displayName: "정태우",
    profileImageUrl: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop&crop=face",
    profession: "선수트레이너",
    headline: "프로 스포츠 선수 재활 전문 | ATC",
    introduction: "미국 공인 선수트레이너(ATC) 자격을 보유하고 있으며, 프로 스포츠 선수의 부상 예방과 재활을 전문으로 합니다. KBL, K리그 구단에서의 경험을 바탕으로 일반인 스포츠 재활도 진행합니다.",
    totalExperienceYears: 12,
    region: "서울 강남구",
    isPublic: true,
    verificationStatus: "verified",
    specialties: ["스포츠 재활", "관절 치료", "근골격계 재활", "기능적 트레이닝"],
    workplace: {
      centerName: "스포츠메디컬 센터",
      address: "서울특별시 강남구 삼성로 567",
      phone: "02-7777-8888",
      websiteUrl: "https://example.com",
      latitude: 37.5088,
      longitude: 127.0610,
    },
    experiences: [
      { organizationName: "스포츠메디컬 센터", position: "대표 트레이너", startDate: "2020-01" },
      { organizationName: "서울 SK 나이츠", position: "팀 트레이너", startDate: "2015-09", endDate: "2019-12" },
      { organizationName: "FC 서울", position: "재활 트레이너", startDate: "2013-03", endDate: "2015-08" },
    ],
    licenses: [
      { licenseName: "ATC (Certified Athletic Trainer)", issuingOrganization: "BOC", acquiredDate: "2013-01", verificationStatus: "verified", isPublic: true },
      { licenseName: "CSCS", issuingOrganization: "NSCA", acquiredDate: "2014-06", verificationStatus: "verified", isPublic: true },
    ],
    educations: [
      { educationName: "Athletic Training 석사", organizationName: "University of Oregon", completionDate: "2012-12" },
      { educationName: "체육학 학사", organizationName: "한양대학교", completionDate: "2010-02" },
    ],
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    displayName: "한소희",
    profileImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&crop=face",
    profession: "물리치료사",
    headline: "신경계 재활 전문 | NDT 인증",
    introduction: "신경계 재활을 전문으로 하는 물리치료사입니다. 뇌졸중, 파킨슨병, 척수손상 환자의 기능 회복을 위한 치료를 제공합니다. NDT(보바스) 인증 치료사로서 근거 기반 치료를 실천합니다.",
    totalExperienceYears: 9,
    region: "경기 성남시",
    isPublic: true,
    verificationStatus: "verified",
    specialties: ["신경계 재활", "노인 재활", "통증 관리", "근골격계 재활"],
    workplace: {
      centerName: "분당 뉴로재활센터",
      address: "경기도 성남시 분당구 정자로 234",
      phone: "031-1111-2222",
      latitude: 37.3595,
      longitude: 127.1052,
    },
    experiences: [
      { organizationName: "분당 뉴로재활센터", position: "팀장", startDate: "2020-06" },
      { organizationName: "분당서울대학교병원", position: "물리치료사", startDate: "2015-09", endDate: "2020-05" },
    ],
    licenses: [
      { licenseName: "물리치료사 면허", issuingOrganization: "보건복지부", acquiredDate: "2015-02", verificationStatus: "verified", isPublic: true },
      { licenseName: "NDT(보바스) 인증", issuingOrganization: "대한보바스학회", acquiredDate: "2018-11", verificationStatus: "verified", isPublic: true },
    ],
    educations: [
      { educationName: "물리치료학 석사", organizationName: "연세대학교", completionDate: "2015-08" },
      { educationName: "NDT 기본·고급 과정", organizationName: "대한보바스학회", completionDate: "2018-11" },
    ],
    createdAt: "2024-02-01",
  },
];

export function getVerificationLabel(status: Expert["verificationStatus"]) {
  switch (status) {
    case "verified": return "확인 완료";
    case "pending": return "검토 중";
    case "rejected": return "반려";
    default: return "미인증";
  }
}

export function getVerificationColor(status: Expert["verificationStatus"]) {
  switch (status) {
    case "verified": return "text-teal bg-teal/10 border-teal/20";
    case "pending": return "text-amber bg-amber/10 border-amber/20";
    case "rejected": return "text-destructive bg-destructive/10 border-destructive/20";
    default: return "text-muted-foreground bg-muted border-border";
  }
}

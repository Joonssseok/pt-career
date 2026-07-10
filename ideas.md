# PT Career 디자인 브레인스토밍

## 세 가지 스타일 방향

### 1. Clinical Trust (임상적 신뢰)
네이비/화이트 기반의 의료 전문 포털 느낌. 깔끔한 카드 레이아웃과 인증 배지 중심의 정보 전달. 병원 홈페이지보다 부드럽지만 전문성을 강조.
- **확률**: 0.06

### 2. Active Precision (활동적 정밀함)
딥블루와 밝은 시안의 조합. 운동/재활의 역동성을 절제된 기하학적 요소로 표현. 비대칭 그리드와 대각선 컷으로 에너지를 전달하되 정보 가독성을 최우선.
- **확률**: 0.08

### 3. Warm Authority (따뜻한 권위)
네이비 + 웜 아이보리 배경. 둥근 카드와 부드러운 그림자로 접근성을 높이면서, 타이포그래피 위계와 검증 배지로 전문성을 전달. 강남언니의 직관성 + 의료 신뢰감의 균형.
- **확률**: 0.07

---

## 선택: Active Precision (활동적 정밀함)

### Design Movement
**Geometric Functionalism** — 바우하우스의 기능주의에서 영감을 받되, 스포츠/재활 분야의 역동성을 기하학적 형태로 표현. 불필요한 장식을 배제하고 정보 구조 자체가 디자인이 되는 접근.

### Core Principles
1. **정보 위계의 명확성**: 모든 요소는 시각적 중요도에 따라 크기, 색상, 위치가 결정됨
2. **절제된 역동성**: 대각선 컷, 비대칭 배치로 에너지를 전달하되 과하지 않음
3. **증거 기반 신뢰**: 검증 배지, 경력 수치, 자격 정보가 시각적으로 돋보이는 구조
4. **공간의 리듬**: 타이트한 정보 블록과 넓은 여백이 교차하며 호흡을 만듦

### Color Philosophy
- **Primary — Deep Navy** `oklch(0.25 0.06 260)`: 권위와 전문성. 헤더, 주요 텍스트, CTA 배경
- **Accent — Electric Cyan** `oklch(0.72 0.15 220)`: 활력과 정밀함. 강조 요소, 호버 상태, 링크
- **Surface — Cool White** `oklch(0.985 0.005 260)`: 깨끗한 배경. 약간의 블루 틴트로 차가운 전문성
- **Muted — Slate** `oklch(0.55 0.02 260)`: 보조 텍스트, 비활성 요소
- **Success — Teal** `oklch(0.65 0.12 180)`: 검증 완료, 긍정적 상태
- **Warning — Amber** `oklch(0.75 0.15 80)`: 검토 대기, 주의 상태

### Layout Paradigm
**Offset Grid System** — 전통적인 12컬럼 그리드를 기반으로 하되, 섹션 간 대각선 전환과 카드의 비대칭 배치로 시각적 흥미를 유지. 모바일에서는 단일 컬럼으로 자연스럽게 축소되면서도 대각선 요소는 유지.

### Signature Elements
1. **Diagonal Section Dividers**: 섹션 간 5도 각도의 대각선 컷으로 페이지에 방향성과 에너지 부여
2. **Verification Badge System**: 검증 상태를 나타내는 아이콘 시스템 (쉴드 아이콘 + 색상 코딩)
3. **Metric Highlights**: 경력 년수, 자격 수 등 핵심 수치를 큰 타이포로 강조하는 스탯 블록

### Interaction Philosophy
- 호버 시 카드가 미세하게 위로 떠오르며 그림자 깊어짐 (2px translate + shadow 확장)
- 클릭/탭 시 scale(0.97) 피드백
- 페이지 전환 없이 필터가 즉시 반영되는 반응형 목록
- 지도 마커 클릭 시 카드가 하단에서 슬라이드업

### Animation
- 페이지 진입 시 요소들이 아래에서 위로 stagger 등장 (30ms 간격, 200ms duration)
- 카드 호버: `transform: translateY(-2px)` + `box-shadow` 확장, 160ms ease-out
- 버튼 active: `scale(0.97)`, 120ms
- 필터 변경 시 카드 목록 fade-in, 180ms
- 모달/시트: 아래에서 위로 슬라이드, 250ms `cubic-bezier(0.23, 1, 0.32, 1)`
- `prefers-reduced-motion` 존중

### Typography System
- **Display/Heading**: Pretendard Bold (700) — 한국어 최적화, 기하학적 느낌
- **Body**: Pretendard Regular (400) / Medium (500)
- **Metric Numbers**: Pretendard Bold (700), 크게 표시
- **Scale**: 14px base, 1.5 line-height, heading scale 1.25 ratio
- **Hierarchy**: Display 32px → H1 28px → H2 22px → H3 18px → Body 15px → Caption 13px

### Brand Essence
재활·운동 전문가의 검증된 경력을 한눈에 확인하고 내 주변 전문가를 찾는 서비스. 전문가를 찾는 소비자와 자신을 알리고 싶은 전문가 모두를 위한 플랫폼. 신뢰할 수 있고, 정밀하며, 접근하기 쉬운.
- 성격 형용사: **정밀한(Precise)**, **신뢰할 수 있는(Trustworthy)**, **역동적인(Dynamic)**

### Brand Voice
헤드라인과 CTA는 간결하고 행동 지향적. 과장 없이 사실 기반으로 전달. "최고", "완벽" 같은 수식어 배제.
- 예시 1: "경력과 자격으로 검증된 전문가를 찾으세요"
- 예시 2: "내 전문성을 증명하는 가장 정확한 프로필"

### Wordmark & Logo
"PT" 글자를 기하학적으로 변형한 마크. P의 곡선과 T의 직선이 만나는 지점에 시안 액센트 포인트. 전체적으로 굵고 안정적인 형태에 한 점의 역동적 색상.

### Signature Brand Color
**Electric Cyan** `oklch(0.72 0.15 220)` — 의료의 차가운 전문성과 운동의 활력을 동시에 전달하는 색상. 네이비 배경 위에서 강렬하게 빛나고, 화이트 배경에서도 충분한 대비를 가짐.

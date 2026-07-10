export default function Privacy() {
  return (
    <div className="pt-24 pb-20 md:pb-8 min-h-screen">
      <div className="container max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">개인정보처리방침</h1>

        <div className="prose prose-sm max-w-none text-foreground/80 space-y-6">
          <div className="bg-amber/10 border border-amber/20 rounded-lg p-4 text-sm text-amber">
            본 개인정보처리방침은 초안이며, 정식 출시 전 법률 전문가의 검토가 필요합니다.
          </div>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. 개인정보의 수집 항목</h2>
            <p>서비스는 다음과 같은 개인정보를 수집합니다:</p>
            <h3 className="font-medium text-foreground mt-3 mb-2">필수 수집 항목 (전문가 회원)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>이메일 주소</li>
              <li>비밀번호 (암호화 저장)</li>
              <li>이름 또는 활동명</li>
              <li>프로필 사진</li>
              <li>직군 정보</li>
              <li>근무기관 정보 (기관명, 주소, 전화번호)</li>
            </ul>
            <h3 className="font-medium text-foreground mt-3 mb-2">선택 수집 항목</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>면허/자격 정보 (명칭, 발급기관, 취득일)</li>
              <li>자격번호 (암호화 저장, 비공개)</li>
              <li>증빙 서류 (비공개 저장)</li>
              <li>학력, 경력, 교육 이력</li>
              <li>SNS, 블로그, 홈페이지 URL</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. 개인정보의 수집 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>전문가 프로필 서비스 제공</li>
              <li>전문가 검색 및 열람 서비스 제공</li>
              <li>자격 검증 서비스 운영</li>
              <li>서비스 이용 통계 분석</li>
              <li>부정 이용 방지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. 개인정보의 제3자 제공</h2>
            <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. 개인정보의 안전성 확보 조치</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>비밀번호 암호화 저장</li>
              <li>자격번호 암호화 저장</li>
              <li>증빙 서류 비공개 저장소 관리</li>
              <li>접근 권한 제한 (Row Level Security)</li>
              <li>SSL/TLS 통신 암호화</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. 수집하지 않는 정보</h2>
            <p>서비스는 다음 정보를 수집하지 않습니다:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>환자의 건강정보</li>
              <li>치료 전후 사진</li>
              <li>환자 치료 경험담</li>
              <li>의료 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. 이용자의 권리</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정 요청</li>
              <li>개인정보 삭제 요청 (회원 탈퇴)</li>
              <li>프로필 공개/비공개 설정</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. 개인정보 보호책임자</h2>
            <p>개인정보 관련 문의는 서비스 운영팀으로 연락해 주세요.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4">
            시행일: 2026년 7월 1일
          </p>
        </div>
      </div>
    </div>
  );
}

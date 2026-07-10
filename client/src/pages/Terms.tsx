export default function Terms() {
  return (
    <div className="pt-24 pb-20 md:pb-8 min-h-screen">
      <div className="container max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">이용약관</h1>

        <div className="prose prose-sm max-w-none text-foreground/80 space-y-6">
          <div className="bg-amber/10 border border-amber/20 rounded-lg p-4 text-sm text-amber">
            본 이용약관은 초안이며, 정식 출시 전 법률 전문가의 검토가 필요합니다.
          </div>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제1조 (목적)</h2>
            <p>이 약관은 PT Career(이하 "서비스")가 제공하는 전문가 정보 제공 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제2조 (서비스의 내용)</h2>
            <p>서비스는 재활·운동 분야 전문가의 경력, 자격, 교육 이력 등 프로필 정보를 제공하는 플랫폼입니다. 서비스는 다음을 제공합니다:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>전문가 프로필 등록 및 관리 기능</li>
              <li>전문가 검색 및 열람 기능</li>
              <li>지도 기반 전문가 탐색 기능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제3조 (서비스의 제한)</h2>
            <p>서비스는 다음 기능을 제공하지 않습니다:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>온라인 예약 또는 결제</li>
              <li>진료 또는 치료 중개</li>
              <li>치료 효과 보증</li>
              <li>의료 상담</li>
            </ul>
            <p className="mt-2">센터 내원과 상담은 해당 기관과 이용자가 직접 진행하며, 서비스는 이에 대한 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제4조 (회원가입)</h2>
            <p>전문가 프로필을 등록하려는 이용자는 회원가입을 해야 합니다. 일반 열람에는 회원가입이 필요하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제5조 (전문가 회원의 의무)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>등록하는 정보는 사실에 기반해야 합니다</li>
              <li>허위 경력, 자격, 학력을 등록해서는 안 됩니다</li>
              <li>치료 효과를 보장하는 표현을 사용해서는 안 됩니다</li>
              <li>타인의 개인정보를 무단으로 등록해서는 안 됩니다</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제6조 (자격 검증)</h2>
            <p>서비스는 전문가가 제출한 자격 증빙을 검토할 수 있으며, 검증 상태를 표시합니다. 검증 상태는 서비스가 증빙을 확인했다는 의미이며, 해당 전문가의 치료 능력이나 결과를 보증하는 것은 아닙니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제7조 (면책)</h2>
            <p>서비스는 전문가 정보의 정확성을 보증하지 않으며, 이용자가 전문가를 선택하여 발생하는 결과에 대해 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">제8조 (회원 탈퇴)</h2>
            <p>회원은 언제든지 서비스 내에서 탈퇴를 요청할 수 있으며, 탈퇴 시 등록된 프로필 정보는 삭제됩니다.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4">
            시행일: 2026년 7월 1일
          </p>
        </div>
      </div>
    </div>
  );
}

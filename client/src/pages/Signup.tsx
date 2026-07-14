import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function Signup() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/mypage");
    }
  }, [isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-card border border-border rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/pt-career/manus-storage/pt-career-logo_d0877007.png"
              alt="PT Career"
              className="h-10 w-10 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-foreground">전문가 등록</h1>
            <p className="text-sm text-muted-foreground mt-1">
              PT Career에 전문가로 등록하고<br />
              나의 전문성을 알리세요
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">무료 프로필 등록</p>
                <p className="text-xs text-muted-foreground">경력, 자격, 전문 분야를 등록하세요</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">자격 검증</p>
                <p className="text-xs text-muted-foreground">면허와 자격을 검증받아 신뢰도를 높이세요</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">고객 연결</p>
                <p className="text-xs text-muted-foreground">지도와 검색을 통해 고객에게 발견되세요</p>
              </div>
            </div>
          </div>

          {/* OAuth Signup Button */}
          <Button
            className="w-full btn-press h-12 text-base"
            onClick={() => startLogin()}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            시작하기
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              로그인
            </Link>
          </p>

          <p className="text-xs text-muted-foreground text-center mt-2">
            시작하기 시{" "}
            <Link href="/terms" className="text-accent hover:underline">이용약관</Link>
            {" "}및{" "}
            <Link href="/privacy" className="text-accent hover:underline">개인정보처리방침</Link>
            에 동의하는 것으로 간주합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

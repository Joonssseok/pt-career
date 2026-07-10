import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function Login() {
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
              src="/manus-storage/pt-career-logo_d0877007.png"
              alt="PT Career"
              className="h-10 w-10 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-foreground">로그인</h1>
            <p className="text-sm text-muted-foreground mt-1">
              전문가 프로필을 관리하려면 로그인하세요
            </p>
          </div>

          {/* OAuth Login Button */}
          <Button
            className="w-full btn-press h-12 text-base"
            onClick={() => startLogin()}
          >
            <LogIn className="w-5 h-5 mr-2" />
            로그인 / 회원가입
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            로그인 시{" "}
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

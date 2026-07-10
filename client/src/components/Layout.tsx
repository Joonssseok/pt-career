import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, MapPin, Users, UserPlus, LogIn, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/map", label: "전문가 찾기", icon: MapPin },
    { href: "/experts", label: "전체 전문가", icon: Users },
    { href: "/signup", label: "전문가 등록", icon: UserPlus },
  ];

  const isHome = location === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled || !isHome
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/manus-storage/pt-career-logo_d0877007.png"
              alt="PT Career"
              className="h-8 w-8"
            />
            <span className={`font-bold text-lg tracking-tight ${
              scrolled || !isHome ? "text-navy" : "text-white"
            }`}>
              PT Career
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-accent/10 text-accent"
                      : scrolled || !isHome
                        ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className={scrolled || !isHome ? "" : "text-white hover:bg-white/10"}>
                      <Shield className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/mypage">
                  <Button
                    variant={scrolled || !isHome ? "default" : "secondary"}
                    size="sm"
                    className="btn-press"
                  >
                    <User className="w-4 h-4 mr-1.5" />
                    마이페이지
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant={scrolled || !isHome ? "default" : "secondary"}
                size="sm"
                className="ml-2 btn-press"
                onClick={() => startLogin()}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                로그인
              </Button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${scrolled || !isHome ? "text-foreground" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled || !isHome ? "text-foreground" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border shadow-lg">
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    location === link.href
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/70 hover:bg-muted"
                  }`}>
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link href="/mypage">
                    <span className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted">
                      <User className="w-5 h-5" />
                      마이페이지
                    </span>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <span className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted">
                        <Shield className="w-5 h-5" />
                        관리자
                      </span>
                    </Link>
                  )}
                </>
              ) : (
                <button onClick={() => startLogin()}>
                  <span className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted">
                    <LogIn className="w-5 h-5" />
                    로그인
                  </span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white/80">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/manus-storage/pt-career-logo_d0877007.png"
                  alt="PT Career"
                  className="h-7 w-7"
                />
                <span className="font-bold text-lg text-white">PT Career</span>
              </div>
              <p className="text-sm text-white/60 max-w-md leading-relaxed">
                경력과 자격으로 검증된 재활·운동 전문가를 찾아보세요.
                PT Career는 전문가 정보 제공 및 포트폴리오 열람 서비스입니다.
              </p>
              <p className="text-xs text-white/40 mt-4">
                PT Career는 특정 치료 결과를 보증하지 않습니다. 센터 내원과 상담은 해당 기관과 사용자가 직접 진행합니다.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/experts" className="hover:text-white transition-colors">전문가 찾기</Link></li>
                <li><Link href="/map" className="hover:text-white transition-colors">지도 탐색</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">전문가 등록</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">서비스 소개</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-3">정보</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-xs text-white/40">
            © 2026 PT Career. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          <Link href="/">
            <span className={`flex flex-col items-center gap-0.5 text-xs ${location === "/" ? "text-accent" : "text-muted-foreground"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈
            </span>
          </Link>
          <Link href="/map">
            <span className={`flex flex-col items-center gap-0.5 text-xs ${location === "/map" ? "text-accent" : "text-muted-foreground"}`}>
              <MapPin className="w-5 h-5" />
              지도
            </span>
          </Link>
          <Link href="/experts">
            <span className={`flex flex-col items-center gap-0.5 text-xs ${location === "/experts" ? "text-accent" : "text-muted-foreground"}`}>
              <Users className="w-5 h-5" />
              전문가
            </span>
          </Link>
          {isAuthenticated ? (
            <Link href="/mypage">
              <span className={`flex flex-col items-center gap-0.5 text-xs ${location.startsWith("/mypage") ? "text-accent" : "text-muted-foreground"}`}>
                <User className="w-5 h-5" />
                MY
              </span>
            </Link>
          ) : (
            <button onClick={() => startLogin()}>
              <span className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground">
                <LogIn className="w-5 h-5" />
                로그인
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

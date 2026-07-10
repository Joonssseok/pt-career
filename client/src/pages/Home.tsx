import { Link } from "wouter";
import { Search, MapPin, Shield, Award, ArrowRight, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import ExpertCard from "@/components/ExpertCard";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles } = trpc.profiles.list.useQuery({});
  const { data: specialtiesData } = trpc.specialties.list.useQuery();

  const featuredExperts = (profiles || []).filter(e => e.verificationStatus === "verified").slice(0, 3);
  const topSpecialties = (specialtiesData || []).slice(0, 8);

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden diagonal-bottom bg-navy">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-main_0c66565d.png"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/50" />
        </div>

        <div className="container relative z-10 pt-24 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              내 주변 재활·운동<br />
              <span className="text-cyan">전문가</span>를 찾아보세요
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              경력과 전문 분야, 자격 정보를 확인하고<br className="hidden md:block" />
              나에게 맞는 전문가를 찾아보세요.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="지역, 전문가명, 전문 분야 검색"
                  className="pl-10 h-12 bg-white border-0 text-foreground shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href={searchQuery ? `/experts?q=${searchQuery}` : "/experts"}>
                <Button size="lg" className="h-12 px-6 bg-cyan hover:bg-cyan-light text-navy font-semibold btn-press">
                  검색
                </Button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/map">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 btn-press">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  내 주변 전문가 찾기
                </Button>
              </Link>
              <Link href="/experts">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 btn-press">
                  <Users className="w-4 h-4 mr-1.5" />
                  전체 전문가 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              전문 분야별 전문가 찾기
            </h2>
            <p className="text-muted-foreground">
              필요한 전문 분야를 선택하면 해당 분야 전문가를 바로 확인할 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto stagger-in">
            {topSpecialties.map((specialty) => (
              <Link key={specialty.id} href={`/experts?specialty=${specialty.name}`}>
                <div className="card-hover bg-card border border-border rounded-xl p-4 text-center hover:border-accent/30 transition-colors">
                  <span className="text-sm font-medium text-foreground">{specialty.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      {featuredExperts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary diagonal-top">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  주목할 만한 전문가
                </h2>
                <p className="text-muted-foreground">
                  자격이 확인된 검증 전문가를 만나보세요
                </p>
              </div>
              <Link href="/experts" className="hidden md:block">
                <Button variant="ghost" className="text-accent hover:text-accent">
                  전체 보기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-in">
              {featuredExperts.map((profile) => (
                <ExpertCard
                  key={profile.id}
                  expert={{
                    id: profile.id,
                    displayName: profile.displayName,
                    profileImageUrl: profile.profileImageUrl,
                    profession: profile.profession,
                    headline: profile.headline,
                    totalExperienceYears: profile.totalExperienceYears,
                    region: profile.region,
                    centerName: profile.centerName,
                    verificationStatus: profile.verificationStatus,
                  }}
                />
              ))}
            </div>

            <div className="md:hidden mt-6 text-center">
              <Link href="/experts">
                <Button variant="outline" className="btn-press">
                  전체 전문가 보기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              PT Career 이용 방법
            </h2>
            <p className="text-muted-foreground">
              간단한 3단계로 나에게 맞는 전문가를 찾으세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-cyan" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. 검색</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                지역, 전문 분야, 직군으로<br />원하는 전문가를 검색하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-cyan" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. 확인</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                경력, 자격, 교육 이력을<br />상세 프로필에서 확인하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-cyan" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. 방문</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                센터 위치와 연락처를 확인하고<br />직접 문의하거나 방문하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Experts */}
      <section className="py-16 md:py-24 bg-navy diagonal-top">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Award className="w-12 h-12 text-cyan mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              전문가이신가요?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              내 전문성을 증명하는 가장 정확한 프로필을 만들어보세요.<br />
              경력과 자격을 등록하고, 나를 찾는 고객에게 발견되세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my/profile">
                <Button size="lg" className="bg-cyan hover:bg-cyan-light text-navy font-semibold btn-press">
                  무료로 프로필 등록하기
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 btn-press">
                  서비스 자세히 보기
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal" />
                무료 등록
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal" />
                자격 검증 시스템
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal" />
                프로필 공개 제어
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

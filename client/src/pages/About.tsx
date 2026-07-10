import { Link } from "wouter";
import { Shield, Search, MapPin, Award, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="pt-24 pb-20 md:pb-8 min-h-screen">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            PT Career 소개
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            경력과 자격으로 검증된 재활·운동 전문가를 찾는 가장 정확한 방법
          </p>
        </div>

        {/* Mission */}
        <section className="bg-card border border-border rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">서비스 목적</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            PT Career는 물리치료사, 트레이너 등 재활·운동 관련 전문가가 자신의 경력, 근무기관, 면허, 자격, 교육 이력을 등록하고 관리할 수 있는 플랫폼입니다.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            일반 사용자는 현재 위치 또는 선택한 지역을 기준으로 주변 전문가를 지도와 목록에서 찾고, 전문가의 상세 프로필과 근무 센터 정보를 확인할 수 있습니다.
          </p>
        </section>

        {/* Values */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">핵심 가치</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Award className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">전문가 포트폴리오</h3>
              <p className="text-sm text-muted-foreground">
                전문가에게 경력과 전문성을 보여주는 온라인 포트폴리오를 제공합니다
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Search className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">정확한 검색</h3>
              <p className="text-sm text-muted-foreground">
                위치, 전문 분야, 경력, 자격을 기준으로 전문가를 탐색할 수 있습니다
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Shield className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">객관적 신뢰</h3>
              <p className="text-sm text-muted-foreground">
                광고성 문구보다 객관적인 이력과 자격 정보를 중심으로 신뢰도를 형성합니다
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-secondary rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">이용 방법</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-accent">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">전문가 검색</h3>
                <p className="text-sm text-muted-foreground">지역, 전문 분야, 직군으로 원하는 전문가를 검색하세요</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-accent">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">프로필 확인</h3>
                <p className="text-sm text-muted-foreground">경력, 자격, 교육 이력을 상세 프로필에서 확인하세요</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-accent">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">직접 문의</h3>
                <p className="text-sm text-muted-foreground">센터 위치와 연락처를 확인하고 직접 문의하거나 방문하세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-3">안내사항</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal mt-0.5 shrink-0" />
              PT Career는 전문가 정보 제공 및 포트폴리오 열람 서비스입니다
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal mt-0.5 shrink-0" />
              센터 내원과 상담은 해당 기관과 사용자가 직접 진행합니다
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal mt-0.5 shrink-0" />
              PT Career는 특정 치료 결과를 보증하지 않습니다
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="btn-press">
              전문가 등록하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

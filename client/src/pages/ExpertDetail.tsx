import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Phone, Globe, ExternalLink, Shield, Briefcase, GraduationCap, Award, Calendar, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function getVerificationLabel(status: string) {
  switch (status) {
    case "verified": return "확인 완료";
    case "pending": return "검토 중";
    case "rejected": return "반려";
    default: return "미인증";
  }
}

function getVerificationColor(status: string) {
  switch (status) {
    case "verified": return "text-teal bg-teal/10 border-teal/20";
    case "pending": return "text-amber bg-amber/10 border-amber/20";
    case "rejected": return "text-destructive bg-destructive/10 border-destructive/20";
    default: return "text-muted-foreground bg-muted border-border";
  }
}

export default function ExpertDetail() {
  const params = useParams();
  const profileId = parseInt(params.id || "0", 10);

  const { data: expert, isLoading, error } = trpc.profiles.getById.useQuery(
    { id: profileId },
    { enabled: profileId > 0 }
  );

  useEffect(() => {
    if (expert) {
      const title = `${expert.displayName} - ${expert.profession} | PT Career`;
      const description = expert.headline || expert.introduction?.substring(0, 160) || "경력과 자격으로 검증된 전문가";
      const image = expert.profileImageUrl || "https://ptcareer-g7uun8nt.manus.space/manus-storage/pt-career-logo_d0877007.png";

      document.title = title;

      const updateOrCreateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updateOrCreateNameMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", name);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateOrCreateMetaTag("og:title", title);
      updateOrCreateMetaTag("og:description", description);
      updateOrCreateMetaTag("og:image", image);
      updateOrCreateMetaTag("og:type", "profile");
      updateOrCreateMetaTag("og:url", window.location.href);

      updateOrCreateNameMetaTag("twitter:title", title);
      updateOrCreateNameMetaTag("twitter:description", description);
      updateOrCreateNameMetaTag("twitter:image", image);
      updateOrCreateNameMetaTag("twitter:card", "summary_large_image");
    }
  }, [expert]);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container text-center py-20">
          <p className="text-muted-foreground mb-4">전문가를 찾을 수 없습니다</p>
          <Link href="/experts">
            <Button variant="outline">전문가 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("프로필 링크가 복사되었습니다");
  };

  return (
    <div className="pt-20 pb-20 md:pb-8 min-h-screen">
      <div className="container max-w-4xl">
        {/* Back */}
        <Link href="/experts">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            전문가 목록
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo */}
              <div className="shrink-0">
                {expert.profileImageUrl ? (
                  <img
                    src={expert.profileImageUrl}
                    alt={expert.displayName}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-secondary flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground/30">
                      {expert.displayName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">{expert.displayName}</h1>
                      {expert.verificationStatus === "verified" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20">
                          <Shield className="w-3 h-3" />
                          확인 완료
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{expert.profession}</p>
                    {expert.headline && (
                      <p className="text-foreground/80 text-sm">{expert.headline}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleShare} className="shrink-0">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{expert.totalExperienceYears || 0}</p>
                    <p className="text-xs text-muted-foreground">경력(년)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{expert.licenses?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">자격</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{expert.specialties?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">전문 분야</p>
                  </div>
                </div>

                {/* Specialties */}
                {expert.specialties && expert.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {expert.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Introduction */}
          {expert.introduction && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                소개
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {expert.introduction}
              </p>
            </section>
          )}

          {/* Experience */}
          {expert.experiences && expert.experiences.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                주요 경력
              </h2>
              <div className="space-y-4">
                {expert.experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{exp.organizationName}</p>
                      {exp.position && <p className="text-sm text-muted-foreground">{exp.position}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exp.startDate} ~ {exp.endDate || "현재"}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-foreground/70 mt-1">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Licenses */}
          {expert.licenses && expert.licenses.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                면허 및 자격
              </h2>
              <div className="space-y-3">
                {expert.licenses.filter((l: any) => l.isPublic).map((license: any) => (
                  <div key={license.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{license.licenseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {license.issuingOrganization} · {license.acquiredDate}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getVerificationColor(license.verificationStatus)}`}>
                      {license.verificationStatus === "verified" && <Shield className="w-3 h-3" />}
                      {getVerificationLabel(license.verificationStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {expert.educations && expert.educations.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                교육 이력
              </h2>
              <div className="space-y-3">
                {expert.educations.map((edu) => (
                  <div key={edu.id} className="flex gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{edu.educationName}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.organizationName} · {edu.completionDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workplace */}
          {expert.centerName && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                근무기관
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">{expert.centerName}</p>
                  {expert.centerAddress && (
                    <p className="text-sm text-muted-foreground mt-1">{expert.centerAddress}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {expert.centerPhone && (
                    <a href={`tel:${expert.centerPhone}`}>
                      <Button variant="outline" size="sm" className="btn-press">
                        <Phone className="w-4 h-4 mr-1.5" />
                        전화하기
                      </Button>
                    </a>
                  )}
                  {expert.centerWebsite && (
                    <a href={expert.centerWebsite} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="btn-press">
                        <Globe className="w-4 h-4 mr-1.5" />
                        홈페이지
                      </Button>
                    </a>
                  )}
                  {expert.latitude && expert.longitude && (
                    <a
                      href={`https://map.kakao.com/link/to/${expert.centerName},${expert.latitude},${expert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="btn-press">
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        길찾기
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Shield, Briefcase, GraduationCap, Award, MapPin, Edit, Plus, Eye, EyeOff, LogOut, Share2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { useEffect } from "react";

export default function MyPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading, isFetching } = trpc.myProfile.get.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleShare = () => {
    if (profile) {
      navigator.clipboard.writeText(`${window.location.origin}/experts/${profile.id}`);
      toast.success("프로필 링크가 복사되었습니다");
    }
  };

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="container max-w-4xl">
        {/* User Info Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user?.name || "사용자"}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" />
              로그아웃
            </Button>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : !profile ? (
          /* No Profile Yet */
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">아직 프로필이 없습니다</h2>
            <p className="text-sm text-muted-foreground mb-6">
              전문가 프로필을 등록하고 고객에게 발견되세요
            </p>
            <Link href="/mypage/profile/create">
              <Button className="btn-press">
                <Plus className="w-4 h-4 mr-1.5" />
                프로필 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          /* Profile Exists */
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  내 프로필
                  {profile.verificationStatus === "verified" && (
                    <Shield className="w-5 h-5 text-teal" />
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.isPublic ? "default" : "secondary"} className="text-xs">
                    {profile.isPublic ? (
                      <><Eye className="w-3 h-3 mr-1" /> 공개</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> 비공개</>
                    )}
                  </Badge>
                  <Link href="/mypage/profile/edit">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.displayName} className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/30">{profile.displayName?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{profile.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{profile.profession}</p>
                  {profile.headline && <p className="text-sm text-foreground mt-1">{profile.headline}</p>}
                  {profile.centerName && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {profile.centerName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Licenses */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  면허·자격 ({profile.licenses?.length || 0})
                </h2>
                <Link href="/mypage/licenses">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" /> 관리
                  </Button>
                </Link>
              </div>
              {profile.licenses && profile.licenses.length > 0 ? (
                <div className="space-y-2">
                  {profile.licenses.map((lic: any) => (
                    <div key={lic.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{lic.licenseName}</p>
                        <p className="text-xs text-muted-foreground">{lic.issuingOrganization}</p>
                      </div>
                      <Badge variant={lic.verificationStatus === "verified" ? "default" : "secondary"} className="text-xs">
                        {lic.verificationStatus === "verified" ? "검증됨" : lic.verificationStatus === "pending" ? "검토중" : "미검증"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">등록된 면허·자격이 없습니다</p>
              )}
            </div>

            {/* Experiences */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  경력 ({profile.experiences?.length || 0})
                </h2>
                <Link href="/mypage/experiences">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" /> 관리
                  </Button>
                </Link>
              </div>
              {profile.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-2">
                  {profile.experiences.map((exp: any) => (
                    <div key={exp.id} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm font-medium">{exp.organizationName}</p>
                      <p className="text-xs text-muted-foreground">{exp.position} · {exp.startDate} ~ {exp.isCurrent ? "현재" : exp.endDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">등록된 경력이 없습니다</p>
              )}
            </div>

            {/* Educations */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  교육 ({profile.educations?.length || 0})
                </h2>
                <Link href="/mypage/educations">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" /> 관리
                  </Button>
                </Link>
              </div>
              {profile.educations && profile.educations.length > 0 ? (
                <div className="space-y-2">
                  {profile.educations.map((edu: any) => (
                    <div key={edu.id} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm font-medium">{edu.educationName}</p>
                      <p className="text-xs text-muted-foreground">{edu.organizationName} · {edu.completionDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">등록된 교육 이력이 없습니다</p>
              )}
            </div>

            {/* View Public Profile */}
            {profile.isPublic && (
              <div className="text-center flex gap-2 justify-center">
                <Link href={`/experts/${profile.id}`}>
                  <Button variant="outline" className="btn-press">
                    <Eye className="w-4 h-4 mr-1.5" />
                    공개 프로필 미리보기
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleShare} className="btn-press">
                  <Share2 className="w-4 h-4 mr-1.5" />
                  공유
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

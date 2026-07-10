import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Users, Award, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Tab = "dashboard" | "licenses" | "profiles" | "reports";

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      setLocation("/");
      toast.error("관리자 권한이 필요합니다");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

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
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">관리자 페이지에 접근하려면 로그인해주세요</p>
          <Button onClick={() => startLogin()} className="btn-press">로그인</Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground mb-4">이 페이지는 관리자만 접근할 수 있습니다</p>
          <Button variant="outline" onClick={() => setLocation("/")} className="btn-press">홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "대시보드", icon: <Shield className="w-4 h-4" /> },
    { id: "licenses", label: "자격 검증", icon: <Award className="w-4 h-4" /> },
    { id: "profiles", label: "프로필 관리", icon: <Users className="w-4 h-4" /> },
    { id: "reports", label: "신고 관리", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="container max-w-6xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">관리자 페이지</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "licenses" && <LicensesTab />}
        {activeTab === "profiles" && <ProfilesTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="전체 회원" value={stats?.totalUsers || 0} icon={<Users className="w-5 h-5 text-blue-500" />} />
      <StatCard label="전체 프로필" value={stats?.totalProfiles || 0} icon={<Shield className="w-5 h-5 text-teal" />} />
      <StatCard label="검증 대기" value={stats?.pendingLicenses || 0} icon={<Award className="w-5 h-5 text-amber-500" />} />
      <StatCard label="미처리 신고" value={stats?.pendingReports || 0} icon={<AlertTriangle className="w-5 h-5 text-red-500" />} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function LicensesTab() {
  const { data: licenses = [], isLoading, refetch } = trpc.admin.pendingLicenses.useQuery();
  const reviewMutation = trpc.admin.reviewLicense.useMutation({
    onSuccess: () => { toast.success("처리 완료"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (licenses.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">검증 대기 중인 자격이 없습니다</div>;
  }

  return (
    <div className="space-y-3">
      {licenses.map((lic: any) => (
        <div key={lic.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-foreground">{lic.licenseName}</p>
              <p className="text-sm text-muted-foreground">{lic.issuingOrganization} · {lic.licenseNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">프로필 ID: {lic.profileId} · 취득일: {lic.acquiredDate}</p>
              {lic.evidenceFileUrl && (
                <a href={lic.evidenceFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block">
                  증빙 파일 보기
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => reviewMutation.mutate({ licenseId: lic.id, status: "verified" })}
                disabled={reviewMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> 승인
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => reviewMutation.mutate({ licenseId: lic.id, status: "rejected" })}
                disabled={reviewMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" /> 거절
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilesTab() {
  const { data: profiles = [], isLoading, refetch } = trpc.admin.profiles.useQuery();
  const visibilityMutation = trpc.admin.updateProfileVisibility.useMutation({
    onSuccess: () => { toast.success("변경 완료"); refetch(); },
  });
  const verificationMutation = trpc.admin.updateProfileVerification.useMutation({
    onSuccess: () => { toast.success("변경 완료"); refetch(); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-3">
      {profiles.map((profile: any) => (
        <div key={profile.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-muted-foreground/30">{profile.displayName?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{profile.displayName}</p>
                <p className="text-xs text-muted-foreground">{profile.profession} · {profile.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={profile.verificationStatus === "verified" ? "default" : "secondary"} className="text-xs">
                {profile.verificationStatus === "verified" ? "검증됨" : profile.verificationStatus === "pending" ? "대기" : "미검증"}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => visibilityMutation.mutate({ profileId: profile.id, isPublic: !profile.isPublic })}
              >
                {profile.isPublic ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </Button>
              {profile.verificationStatus !== "verified" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => verificationMutation.mutate({ profileId: profile.id, verificationStatus: "verified" })}
                >
                  검증
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsTab() {
  const { data: reports = [], isLoading, refetch } = trpc.admin.reports.useQuery();
  const reviewMutation = trpc.admin.reviewReport.useMutation({
    onSuccess: () => { toast.success("처리 완료"); refetch(); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (reports.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">신고 내역이 없습니다</div>;
  }

  return (
    <div className="space-y-3">
      {reports.map((report: any) => (
        <div key={report.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{report.reason}</Badge>
                <Badge variant={report.status === "pending" ? "destructive" : "default"} className="text-xs">
                  {report.status === "pending" ? "미처리" : report.status === "resolved" ? "해결됨" : "기각"}
                </Badge>
              </div>
              <p className="text-sm text-foreground mt-2">{report.description || "상세 내용 없음"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                대상 프로필: {report.targetProfileId} · 신고자: {report.reporterUserId}
              </p>
            </div>
            {report.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => reviewMutation.mutate({ reportId: report.id, status: "resolved" })}
                >
                  해결
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => reviewMutation.mutate({ reportId: report.id, status: "dismissed" })}
                >
                  기각
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { PROFESSIONS, REGIONS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { startLogin } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileForm() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEdit] = useRoute("/mypage/profile/edit");

  const { data: existingProfile, isLoading: profileLoading } = trpc.myProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: specialties = [] } = trpc.specialties.list.useQuery();

  const createMutation = trpc.myProfile.create.useMutation({
    onSuccess: () => {
      toast.success("프로필이 등록되었습니다");
      setLocation("/mypage");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.myProfile.update.useMutation({
    onSuccess: () => {
      toast.success("프로필이 수정되었습니다");
      setLocation("/mypage");
    },
    onError: (err) => toast.error(err.message),
  });

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [headline, setHeadline] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [totalExperienceYears, setTotalExperienceYears] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerPhone, setCenterPhone] = useState("");
  const [centerWebsite, setCenterWebsite] = useState("");
  const [region, setRegion] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingProfile) {
      setDisplayName(existingProfile.displayName || "");
      setProfession(existingProfile.profession || "");
      setHeadline(existingProfile.headline || "");
      setIntroduction(existingProfile.introduction || "");
      setProfileImageUrl(existingProfile.profileImageUrl || "");
      setTotalExperienceYears(existingProfile.totalExperienceYears || 0);
      setIsPublic(existingProfile.isPublic ?? true);
      setCenterName(existingProfile.centerName || "");
      setCenterAddress(existingProfile.centerAddress || "");
      setCenterPhone(existingProfile.centerPhone || "");
      setCenterWebsite(existingProfile.centerWebsite || "");
      setRegion(existingProfile.region || "");
      setContactEmail(existingProfile.contactEmail || "");
      setContactPhone(existingProfile.contactPhone || "");
      setSelectedSpecialties(existingProfile.specialtyIds || []);
    }
  }, [isEdit, existingProfile]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || profileLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !profession) {
      toast.error("이름과 직군은 필수 항목입니다");
      return;
    }

    const data = {
      displayName,
      profession,
      headline: headline || undefined,
      introduction: introduction || undefined,
      profileImageUrl: profileImageUrl || undefined,
      totalExperienceYears: totalExperienceYears || undefined,
      isPublic,
      centerName: centerName || undefined,
      centerAddress: centerAddress || undefined,
      centerPhone: centerPhone || undefined,
      centerWebsite: centerWebsite || undefined,
      region: region || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      specialtyIds: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleSpecialty = (id: number) => {
    setSelectedSpecialties(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/mypage">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? "프로필 수정" : "프로필 등록"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground">기본 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">이름 / 활동명 *</Label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="홍길동" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">직군 *</Label>
                <select
                  id="profession"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">한줄 소개</Label>
              <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="예: 10년차 물리치료사, 스포츠 재활 전문" maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">자기소개</Label>
              <textarea
                id="introduction"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                value={introduction}
                onChange={e => setIntroduction(e.target.value)}
                placeholder="전문 분야, 치료 철학, 경력 요약 등을 자유롭게 작성하세요"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalExperienceYears">총 경력 (년)</Label>
                <Input id="totalExperienceYears" type="number" min={0} max={50} value={totalExperienceYears} onChange={e => setTotalExperienceYears(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
                <Input id="profileImageUrl" value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground">전문 분야</h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s: any) => (
                <button
                  key={s.id}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedSpecialties.includes(s.id)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-foreground border-border hover:border-accent/50"
                  }`}
                  onClick={() => toggleSpecialty(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Workplace */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground">근무지 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centerName">센터/병원명</Label>
                <Input id="centerName" value={centerName} onChange={e => setCenterName(e.target.value)} placeholder="강남 리커버리 센터" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">지역</Label>
                <select
                  id="region"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="centerAddress">주소</Label>
              <Input id="centerAddress" value={centerAddress} onChange={e => setCenterAddress(e.target.value)} placeholder="서울시 강남구 테헤란로 123" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centerPhone">센터 전화번호</Label>
                <Input id="centerPhone" value={centerPhone} onChange={e => setCenterPhone(e.target.value)} placeholder="02-1234-5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="centerWebsite">센터 웹사이트</Label>
                <Input id="centerWebsite" value={centerWebsite} onChange={e => setCenterWebsite(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground">연락처</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">이메일</Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="expert@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">전화번호</Label>
                <Input id="contactPhone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="010-1234-5678" />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground">프로필 공개</h2>
                <p className="text-sm text-muted-foreground mt-1">공개 시 검색 결과와 지도에 표시됩니다</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Link href="/mypage">
              <Button type="button" variant="outline">취소</Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="btn-press">
              {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              {isEdit ? "수정 완료" : "등록하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

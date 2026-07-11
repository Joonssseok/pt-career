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
import { useEffect, useMemo, useState } from "react";
import { SPECIALTY_CATEGORIES } from "@/lib/mockData";
import { Star } from "lucide-react";
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
  // Selected specialty tag IDs (multi-select) and the primary tag ID
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [primarySpecialtyId, setPrimarySpecialtyId] = useState<number | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Group specialties by category, preserving MVP category order
  const specialtiesByCategory = useMemo(() => {
    const map = new Map<string, { id: number; name: string; category: string }[]>();
    for (const cat of SPECIALTY_CATEGORIES) map.set(cat, []);
    for (const s of specialties as { id: number; name: string; category: string }[]) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, [specialties]);

  const specialtyById = useMemo(() => {
    const map = new Map<number, { id: number; name: string; category: string }>();
    for (const s of specialties as { id: number; name: string; category: string }[]) map.set(s.id, s);
    return map;
  }, [specialties]);

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
      const mySpecs = existingProfile.mySpecialties || [];
      setSelectedSpecialties(mySpecs.map((s: { specialtyId: number }) => s.specialtyId));
      const primary = mySpecs.find((s: { isPrimary: boolean }) => s.isPrimary);
      setPrimarySpecialtyId(primary ? primary.specialtyId : null);
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
      specialtyItems: selectedSpecialties.length > 0
        ? selectedSpecialties.map((id, idx) => ({
            specialtyId: id,
            isPrimary: primarySpecialtyId != null ? id === primarySpecialtyId : idx === 0,
            displayOrder: idx,
          }))
        : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleSpecialty = (id: number) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(id)) {
        if (primarySpecialtyId === id) setPrimarySpecialtyId(null);
        return prev.filter(s => s !== id);
      }
      return [...prev, id];
    });
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
            <div>
              <h2 className="font-bold text-foreground">전문 분야</h2>
              <p className="text-sm text-muted-foreground mt-1">
                카테고리를 열고 세부 분야를 선택하세요. 선택한 분야 중 하나를 대표 분야로 지정할 수 있습니다.
              </p>
            </div>

            {/* Selected tags summary */}
            {selectedSpecialties.length > 0 && (
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  선택된 분야 ({selectedSpecialties.length}) — 별표를 눌러 대표 분야를 지정하세요
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpecialties.map(id => {
                    const s = specialtyById.get(id);
                    if (!s) return null;
                    const isPrimary = primarySpecialtyId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPrimarySpecialtyId(isPrimary ? null : id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                          isPrimary
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        <Star className={`w-3 h-3 ${isPrimary ? "fill-current" : ""}`} />
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category accordion */}
            <div className="space-y-2">
              {SPECIALTY_CATEGORIES.map(cat => {
                const tags = specialtiesByCategory.get(cat) || [];
                if (tags.length === 0) return null;
                const isOpen = openCategory === cat;
                const selectedInCat = tags.filter(t => selectedSpecialties.includes(t.id)).length;
                return (
                  <div key={cat} className="border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenCategory(isOpen ? null : cat)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-background hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="flex items-center gap-2">
                        {selectedInCat > 0 && (
                          <span className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                            {selectedInCat}
                          </span>
                        )}
                        <span className="text-muted-foreground text-xs">{isOpen ? "−" : "+"}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 bg-secondary/30 flex flex-wrap gap-1.5 border-t border-border">
                        {tags.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                              selectedSpecialties.includes(s.id)
                                ? "bg-accent text-accent-foreground border-accent"
                                : "bg-card text-foreground/80 border-border hover:border-accent/50"
                            }`}
                            onClick={() => toggleSpecialty(s.id)}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

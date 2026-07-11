import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Plus, Edit, Trash2, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LicenseFormData {
  licenseName: string;
  issuingOrganization?: string;
  licenseNumber?: string;
  acquiredDate?: string;
  expiryDate?: string;
  evidenceFileUrl?: string;
  isPublic?: boolean;
}

export default function MyLicenses() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.myProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.licenses.create.useMutation({
    onSuccess: () => {
      toast.success("면허·자격이 등록되었습니다");
      refetchProfile();
      setOpenCreate(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.licenses.update.useMutation({
    onSuccess: () => {
      toast.success("면허·자격이 수정되었습니다");
      refetchProfile();
      setOpenEdit(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.licenses.delete.useMutation({
    onSuccess: () => {
      toast.success("면허·자격이 삭제되었습니다");
      refetchProfile();
    },
    onError: (err) => toast.error(err.message),
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<LicenseFormData>({
    licenseName: "",
    issuingOrganization: "",
    licenseNumber: "",
    acquiredDate: "",
    expiryDate: "",
    evidenceFileUrl: "",
    isPublic: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  const resetForm = () => {
    setFormData({
      licenseName: "",
      issuingOrganization: "",
      licenseNumber: "",
      acquiredDate: "",
      expiryDate: "",
      evidenceFileUrl: "",
      isPublic: true,
    });
    setEditingId(null);
  };

  const handleOpenEdit = (license: any) => {
    setFormData({
      licenseName: license.licenseName || "",
      issuingOrganization: license.issuingOrganization || "",
      licenseNumber: license.licenseNumber || "",
      acquiredDate: license.acquiredDate || "",
      expiryDate: license.expiryDate || "",
      evidenceFileUrl: license.evidenceFileUrl || "",
      isPublic: license.isPublic ?? true,
    });
    setEditingId(license.id);
    setOpenEdit(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.licenseName) {
      toast.error("면허명/자격명은 필수 항목입니다");
      return;
    }

    const submitData = {
      licenseName: formData.licenseName,
      issuingOrganization: formData.issuingOrganization || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      acquiredDate: formData.acquiredDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      evidenceFileUrl: formData.evidenceFileUrl || undefined,
      isPublic: formData.isPublic,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (license: any) => {
    if (confirm(`"${license.licenseName}"을(를) 삭제하시겠습니까?`)) {
      deleteMutation.mutate({ id: license.id });
    }
  };

  if (authLoading || profileLoading) {
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

  if (!profile) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container text-center py-20">
          <p className="text-muted-foreground mb-4">프로필을 먼저 생성해주세요</p>
          <Link href="/mypage">
            <Button variant="outline">돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const licenses = profile.licenses || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/mypage">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">면허 및 자격 관리</h1>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {/* Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-foreground">
              등록된 면허·자격 ({licenses.length})
            </h2>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button className="btn-press">
                  <Plus className="w-4 h-4 mr-1.5" />
                  추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>면허·자격 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseName">면허명/자격명 *</Label>
                    <Input
                      id="licenseName"
                      value={formData.licenseName}
                      onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                      placeholder="예: 물리치료사 면허"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issuingOrganization">발급 기관</Label>
                    <Input
                      id="issuingOrganization"
                      value={formData.issuingOrganization || ""}
                      onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                      placeholder="예: 한국보건의료인국가시험원"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="acquiredDate">취득일</Label>
                      <Input
                        id="acquiredDate"
                        value={formData.acquiredDate || ""}
                        onChange={(e) => setFormData({ ...formData, acquiredDate: e.target.value })}
                        placeholder="예: 2020-03-15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">만료일</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate || ""}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        placeholder="예: 2025-03-14"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">면허 번호</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber || ""}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="선택 사항"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidenceFileUrl">증빙 파일 URL</Label>
                    <Input
                      id="evidenceFileUrl"
                      value={formData.evidenceFileUrl || ""}
                      onChange={(e) => setFormData({ ...formData, evidenceFileUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic ?? true}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <Label htmlFor="isPublic" className="cursor-pointer">공개 프로필에 표시</Label>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">취소</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSaving} className="btn-press">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                      추가
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* List */}
          {licenses.length > 0 ? (
            <div className="space-y-2 pt-2">
              {licenses.map((license: any) => (
                <div key={license.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">{license.licenseName}</p>
                      <Badge
                        variant={
                          license.verificationStatus === "verified"
                            ? "default"
                            : license.verificationStatus === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {license.verificationStatus === "verified" && <Shield className="w-3 h-3 mr-1" />}
                        {license.verificationStatus === "verified"
                          ? "검증됨"
                          : license.verificationStatus === "pending"
                            ? "검토중"
                            : "미검증"}
                      </Badge>
                    </div>
                    {license.issuingOrganization && (
                      <p className="text-xs text-muted-foreground">{license.issuingOrganization}</p>
                    )}
                    {license.acquiredDate && (
                      <p className="text-xs text-muted-foreground">
                        취득: {license.acquiredDate}
                        {license.expiryDate && ` ~ 만료: ${license.expiryDate}`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Dialog open={openEdit && editingId === license.id} onOpenChange={setOpenEdit}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(license)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>면허·자격 수정</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-licenseName">면허명/자격명 *</Label>
                            <Input
                              id="edit-licenseName"
                              value={formData.licenseName}
                              onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                              placeholder="예: 물리치료사 면허"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-issuingOrganization">발급 기관</Label>
                            <Input
                              id="edit-issuingOrganization"
                              value={formData.issuingOrganization || ""}
                              onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                              placeholder="예: 한국보건의료인국가시험원"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="edit-acquiredDate">취득일</Label>
                              <Input
                                id="edit-acquiredDate"
                                value={formData.acquiredDate || ""}
                                onChange={(e) => setFormData({ ...formData, acquiredDate: e.target.value })}
                                placeholder="예: 2020-03-15"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-expiryDate">만료일</Label>
                              <Input
                                id="edit-expiryDate"
                                value={formData.expiryDate || ""}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                placeholder="예: 2025-03-14"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-licenseNumber">면허 번호</Label>
                            <Input
                              id="edit-licenseNumber"
                              value={formData.licenseNumber || ""}
                              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                              placeholder="선택 사항"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-evidenceFileUrl">증빙 파일 URL</Label>
                            <Input
                              id="edit-evidenceFileUrl"
                              value={formData.evidenceFileUrl || ""}
                              onChange={(e) => setFormData({ ...formData, evidenceFileUrl: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="edit-isPublic"
                              checked={formData.isPublic ?? true}
                              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                              className="w-4 h-4 rounded"
                            />
                            <Label htmlFor="edit-isPublic" className="cursor-pointer">공개 프로필에 표시</Label>
                          </div>

                          <div className="flex gap-2 justify-end pt-4">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">취소</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSaving} className="btn-press">
                              {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Edit className="w-4 h-4 mr-1.5" />}
                              수정
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(license)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">등록된 면허·자격이 없습니다</p>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-1.5" />
                    첫 면허·자격 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>면허·자격 추가</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseName">면허명/자격명 *</Label>
                      <Input
                        id="licenseName"
                        value={formData.licenseName}
                        onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                        placeholder="예: 물리치료사 면허"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issuingOrganization">발급 기관</Label>
                      <Input
                        id="issuingOrganization"
                        value={formData.issuingOrganization || ""}
                        onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                        placeholder="예: 한국보건의료인국가시험원"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="acquiredDate">취득일</Label>
                        <Input
                          id="acquiredDate"
                          value={formData.acquiredDate || ""}
                          onChange={(e) => setFormData({ ...formData, acquiredDate: e.target.value })}
                          placeholder="예: 2020-03-15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">만료일</Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate || ""}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          placeholder="예: 2025-03-14"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">면허 번호</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber || ""}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="선택 사항"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evidenceFileUrl">증빙 파일 URL</Label>
                      <Input
                        id="evidenceFileUrl"
                        value={formData.evidenceFileUrl || ""}
                        onChange={(e) => setFormData({ ...formData, evidenceFileUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic ?? true}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <Label htmlFor="isPublic" className="cursor-pointer">공개 프로필에 표시</Label>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">취소</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSaving} className="btn-press">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                        추가
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EducationFormData {
  educationName: string;
  organizationName?: string;
  completionDate?: string;
  description?: string;
}

export default function MyEducations() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.myProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.educations.create.useMutation({
    onSuccess: () => {
      toast.success("교육이 등록되었습니다");
      refetchProfile();
      setOpenCreate(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.educations.update.useMutation({
    onSuccess: () => {
      toast.success("교육이 수정되었습니다");
      refetchProfile();
      setOpenEdit(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.educations.delete.useMutation({
    onSuccess: () => {
      toast.success("교육이 삭제되었습니다");
      refetchProfile();
    },
    onError: (err) => toast.error(err.message),
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EducationFormData>({
    educationName: "",
    organizationName: "",
    completionDate: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  const resetForm = () => {
    setFormData({
      educationName: "",
      organizationName: "",
      completionDate: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleOpenEdit = (education: any) => {
    setFormData({
      educationName: education.educationName || "",
      organizationName: education.organizationName || "",
      completionDate: education.completionDate || "",
      description: education.description || "",
    });
    setEditingId(education.id);
    setOpenEdit(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.educationName) {
      toast.error("교육명은 필수 항목입니다");
      return;
    }

    const submitData = {
      educationName: formData.educationName,
      organizationName: formData.organizationName || undefined,
      completionDate: formData.completionDate || undefined,
      description: formData.description || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (education: any) => {
    if (confirm(`"${education.educationName}"을(를) 삭제하시겠습니까?`)) {
      deleteMutation.mutate({ id: education.id });
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
    return null;
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

  const educations = profile.educations || [];
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
          <h1 className="text-xl font-bold text-foreground">교육 이력 관리</h1>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {/* Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-foreground">
              등록된 교육 ({educations.length})
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
                  <DialogTitle>교육 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationName">교육명/과정명 *</Label>
                    <Input
                      id="educationName"
                      value={formData.educationName}
                      onChange={(e) => setFormData({ ...formData, educationName: e.target.value })}
                      placeholder="예: 고급 물리치료 기술 교육"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationName">기관명/대학명</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName || ""}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      placeholder="예: 서울대학교 의과대학"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completionDate">이수/졸업일</Label>
                    <Input
                      id="completionDate"
                      value={formData.completionDate || ""}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                      placeholder="예: 2023-06"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="전공, 성적, 주요 과목 등을 자유롭게 작성하세요"
                    />
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
          {educations.length > 0 ? (
            <div className="space-y-2 pt-2">
              {educations.map((education: any) => (
                <div key={education.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">{education.educationName}</p>
                    </div>
                    {education.organizationName && (
                      <p className="text-xs text-muted-foreground">{education.organizationName}</p>
                    )}
                    {education.completionDate && (
                      <p className="text-xs text-muted-foreground">이수: {education.completionDate}</p>
                    )}
                    {education.description && (
                      <p className="text-xs text-foreground/70 mt-1">{education.description}</p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Dialog open={openEdit && editingId === education.id} onOpenChange={setOpenEdit}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(education)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>교육 수정</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-educationName">교육명/과정명 *</Label>
                            <Input
                              id="edit-educationName"
                              value={formData.educationName}
                              onChange={(e) => setFormData({ ...formData, educationName: e.target.value })}
                              placeholder="예: 고급 물리치료 기술 교육"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-organizationName">기관명/대학명</Label>
                            <Input
                              id="edit-organizationName"
                              value={formData.organizationName || ""}
                              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                              placeholder="예: 서울대학교 의과대학"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-completionDate">이수/졸업일</Label>
                            <Input
                              id="edit-completionDate"
                              value={formData.completionDate || ""}
                              onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                              placeholder="예: 2023-06"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-description">설명</Label>
                            <textarea
                              id="edit-description"
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                              value={formData.description || ""}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="전공, 성적, 주요 과목 등을 자유롭게 작성하세요"
                            />
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
                      onClick={() => handleDelete(education)}
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
              <p className="text-muted-foreground mb-4">등록된 교육 이력이 없습니다</p>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-1.5" />
                    첫 교육 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>교육 추가</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="educationName">교육명/과정명 *</Label>
                      <Input
                        id="educationName"
                        value={formData.educationName}
                        onChange={(e) => setFormData({ ...formData, educationName: e.target.value })}
                        placeholder="예: 고급 물리치료 기술 교육"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName">기관명/대학명</Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName || ""}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="예: 서울대학교 의과대학"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="completionDate">이수/졸업일</Label>
                      <Input
                        id="completionDate"
                        value={formData.completionDate || ""}
                        onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                        placeholder="예: 2023-06"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <textarea
                        id="description"
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="전공, 성적, 주요 과목 등을 자유롭게 작성하세요"
                      />
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

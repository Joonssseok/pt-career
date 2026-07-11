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

interface ExperienceFormData {
  organizationName: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export default function MyExperiences() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.myProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.experiences.create.useMutation({
    onSuccess: () => {
      toast.success("경력이 등록되었습니다");
      refetchProfile();
      setOpenCreate(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.experiences.update.useMutation({
    onSuccess: () => {
      toast.success("경력이 수정되었습니다");
      refetchProfile();
      setOpenEdit(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.experiences.delete.useMutation({
    onSuccess: () => {
      toast.success("경력이 삭제되었습니다");
      refetchProfile();
    },
    onError: (err) => toast.error(err.message),
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ExperienceFormData>({
    organizationName: "",
    position: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startLogin();
    }
  }, [authLoading, isAuthenticated]);

  const resetForm = () => {
    setFormData({
      organizationName: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
    setEditingId(null);
  };

  const handleOpenEdit = (experience: any) => {
    setFormData({
      organizationName: experience.organizationName || "",
      position: experience.position || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      isCurrent: experience.isCurrent ?? false,
      description: experience.description || "",
    });
    setEditingId(experience.id);
    setOpenEdit(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName) {
      toast.error("기관명/회사명은 필수 항목입니다");
      return;
    }

    const submitData = {
      organizationName: formData.organizationName,
      position: formData.position || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.isCurrent ? undefined : formData.endDate || undefined,
      isCurrent: formData.isCurrent,
      description: formData.description || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (experience: any) => {
    if (confirm(`"${experience.organizationName}"의 경력을 삭제하시겠습니까?`)) {
      deleteMutation.mutate({ id: experience.id });
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

  const experiences = profile.experiences || [];
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
          <h1 className="text-xl font-bold text-foreground">경력 관리</h1>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {/* Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-foreground">
              등록된 경력 ({experiences.length})
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
                  <DialogTitle>경력 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">기관명/회사명 *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      placeholder="예: 서울대학교 병원"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">직책/직급</Label>
                    <Input
                      id="position"
                      value={formData.position || ""}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="예: 물리치료사"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">시작일</Label>
                      <Input
                        id="startDate"
                        value={formData.startDate || ""}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        placeholder="예: 2020-01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">종료일</Label>
                      <Input
                        id="endDate"
                        value={formData.endDate || ""}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        placeholder="예: 2023-12"
                        disabled={formData.isCurrent}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={formData.isCurrent ?? false}
                      onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: "" })}
                      className="w-4 h-4 rounded"
                    />
                    <Label htmlFor="isCurrent" className="cursor-pointer">현재 재직 중</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="주요 업무, 성과 등을 자유롭게 작성하세요"
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
          {experiences.length > 0 ? (
            <div className="space-y-2 pt-2">
              {experiences.map((experience: any) => (
                <div key={experience.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">{experience.organizationName}</p>
                    </div>
                    {experience.position && (
                      <p className="text-xs text-muted-foreground">{experience.position}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {experience.startDate} ~ {experience.isCurrent ? "현재" : experience.endDate || "미정"}
                    </p>
                    {experience.description && (
                      <p className="text-xs text-foreground/70 mt-1">{experience.description}</p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Dialog open={openEdit && editingId === experience.id} onOpenChange={setOpenEdit}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(experience)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>경력 수정</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-organizationName">기관명/회사명 *</Label>
                            <Input
                              id="edit-organizationName"
                              value={formData.organizationName}
                              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                              placeholder="예: 서울대학교 병원"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-position">직책/직급</Label>
                            <Input
                              id="edit-position"
                              value={formData.position || ""}
                              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                              placeholder="예: 물리치료사"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="edit-startDate">시작일</Label>
                              <Input
                                id="edit-startDate"
                                value={formData.startDate || ""}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                placeholder="예: 2020-01"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-endDate">종료일</Label>
                              <Input
                                id="edit-endDate"
                                value={formData.endDate || ""}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                placeholder="예: 2023-12"
                                disabled={formData.isCurrent}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="edit-isCurrent"
                              checked={formData.isCurrent ?? false}
                              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: "" })}
                              className="w-4 h-4 rounded"
                            />
                            <Label htmlFor="edit-isCurrent" className="cursor-pointer">현재 재직 중</Label>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-description">설명</Label>
                            <textarea
                              id="edit-description"
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                              value={formData.description || ""}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="주요 업무, 성과 등을 자유롭게 작성하세요"
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
                      onClick={() => handleDelete(experience)}
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
              <p className="text-muted-foreground mb-4">등록된 경력이 없습니다</p>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-1.5" />
                    첫 경력 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>경력 추가</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">기관명/회사명 *</Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="예: 서울대학교 병원"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">직책/직급</Label>
                      <Input
                        id="position"
                        value={formData.position || ""}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="예: 물리치료사"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">시작일</Label>
                        <Input
                          id="startDate"
                          value={formData.startDate || ""}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          placeholder="예: 2020-01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">종료일</Label>
                        <Input
                          id="endDate"
                          value={formData.endDate || ""}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          placeholder="예: 2023-12"
                          disabled={formData.isCurrent}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isCurrent"
                        checked={formData.isCurrent ?? false}
                        onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: "" })}
                        className="w-4 h-4 rounded"
                      />
                      <Label htmlFor="isCurrent" className="cursor-pointer">현재 재직 중</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <textarea
                        id="description"
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="주요 업무, 성과 등을 자유롭게 작성하세요"
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

import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import ExpertCard from "@/components/ExpertCard";
import { PROFESSIONS, REGIONS } from "@/lib/mockData";

export default function Experts() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [query, setQuery] = useState(params.get("q") || "");
  const [profession, setProfession] = useState(params.get("profession") || "all");
  const [specialty, setSpecialty] = useState(params.get("specialty") || "all");
  const [region, setRegion] = useState(params.get("region") || "all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: specialtiesData } = trpc.specialties.list.useQuery();
  const specialtyNames = useMemo(() => specialtiesData?.map(s => s.name) || [], [specialtiesData]);

  const { data: profiles, isLoading } = trpc.profiles.list.useQuery({
    query: query || undefined,
    profession: profession !== "all" ? profession : undefined,
    specialty: specialty !== "all" ? specialty : undefined,
    region: region !== "all" ? region : undefined,
    sortBy,
  });

  const hasActiveFilters = profession !== "all" || specialty !== "all" || region !== "all";

  const clearFilters = () => {
    setProfession("all");
    setSpecialty("all");
    setRegion("all");
    setQuery("");
  };

  return (
    <div className="pt-20 pb-20 md:pb-8 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">전체 전문가</h1>
          <p className="text-muted-foreground">
            {profiles ? `${profiles.length}명의 전문가가 등록되어 있습니다` : "전문가 목록을 불러오는 중..."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="이름, 센터명, 지역, 전문 분야 검색"
              className="pl-9 h-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger>
                  <SelectValue placeholder="직군" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 직군</SelectItem>
                  {PROFESSIONS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="전문 분야" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 분야</SelectItem>
                  {specialtyNames.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 지역</SelectItem>
                  {REGIONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-3.5 h-3.5 mr-1" />
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {hasActiveFilters && (
              <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                필터 적용됨
              </span>
            )}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">최근 등록순</SelectItem>
              <SelectItem value="experience">경력순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expert Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
            {profiles.map((profile) => (
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
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">검색 조건에 맞는 전문가가 없습니다</p>
            <Button variant="outline" onClick={clearFilters}>
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

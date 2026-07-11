import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import ExpertCard from "@/components/ExpertCard";
import { PROFESSIONS, REGIONS, SPECIALTY_CATEGORIES } from "@/lib/mockData";

export default function Experts() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [query, setQuery] = useState(params.get("q") || "");
  const [profession, setProfession] = useState(params.get("profession") || "all");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [region, setRegion] = useState(params.get("region") || "all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: specialtiesData } = trpc.specialties.list.useQuery();

  // Sub tags for the selected category
  const categoryTags = useMemo(() => {
    if (category === "all" || !specialtiesData) return [];
    return specialtiesData.filter((s) => s.category === category);
  }, [specialtiesData, category]);

  const queryInput = useMemo(() => ({
    query: query || undefined,
    profession: profession !== "all" ? profession : undefined,
    category: category !== "all" ? category : undefined,
    specialtyIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    region: region !== "all" ? region : undefined,
    sortBy,
  }), [query, profession, category, selectedTagIds, region, sortBy]);

  const { data: profiles, isLoading } = trpc.profiles.list.useQuery(queryInput);

  const hasActiveFilters = profession !== "all" || category !== "all" || region !== "all" || selectedTagIds.length > 0;

  const selectCategory = (cat: string) => {
    setCategory(cat);
    setSelectedTagIds([]);
  };

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setProfession("all");
    setCategory("all");
    setSelectedTagIds([]);
    setRegion("all");
    setQuery("");
  };

  return (
    <div className="pt-20 pb-20 md:pb-8 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">전체 전문가</h1>
          <p className="text-muted-foreground">
            {profiles ? `${profiles.length}명의 전문가가 등록되어 있습니다` : "전문가 목록을 불러오는 중..."}
          </p>
        </div>

        {/* Category chips (primary filter) */}
        <div className="mb-4 -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex gap-2 md:flex-wrap w-max md:w-auto pb-1">
            <button
              onClick={() => selectCategory("all")}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border ${
                category === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground/80 border-border hover:border-primary/40"
              }`}
            >
              전체
            </button>
            {SPECIALTY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border ${
                  category === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground/80 border-border hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sub tag chips (secondary filter, shown when a category is selected) */}
        {category !== "all" && categoryTags.length > 0 && (
          <div className="mb-4 bg-secondary/50 border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2">세부 분야로 좁혀보세요</p>
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-foreground/70 border-border hover:border-accent/40"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="이름, 센터명, 지역 검색"
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

        {/* Extra Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
        )}

        {/* Sort + Reset */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <>
                <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                  필터 적용됨
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-7 px-2">
                  <X className="w-3.5 h-3.5 mr-1" />
                  초기화
                </Button>
              </>
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
                  specialties: profile.specialties,
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

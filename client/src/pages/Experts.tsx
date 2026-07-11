import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X, Loader2, MapPinIcon, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import ExpertCard from "@/components/ExpertCard";
import { PROFESSIONS, REGIONS, SPECIALTY_CATEGORIES } from "@/lib/mockData";
import { toast } from "sonner";
import { calculateDistanceKm, formatDistance, isValidCoordinate } from "@/lib/utils/distance";
import type { UserLocation } from "@/types/location";

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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: specialtiesData } = trpc.specialties.list.useQuery();

  const handleRequestCurrentLocation = () => {
    console.log("[Experts] 위치 요청 시작");

    if (!navigator.geolocation) {
      console.error("[Experts] Geolocation API 미지원");
      setLocationError("브라우저가 위치 서비스를 지원하지 않습니다");
      toast.error("브라우저가 위치 서비스를 지원하지 않습니다");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    console.log("[Experts] toast.info 시도");
    toast.info("현재 위치를 확인하고 있어요");
    console.log("[Experts] Geolocation.getCurrentPosition 호출");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("[Experts] 위치 획득 성공:", position.coords);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        toast.success("현재 위치 기준으로 가까운 전문가를 보여드릴게요");
      },
      (error) => {
        console.error("[Experts] Geolocation 에러:", error.code, error.message);
        setIsLocating(false);
        let errorMsg = "현재 위치를 확인하지 못했어요";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "위치 권한이 허용되지 않았어요. 지역 검색으로 전문가를 찾아보세요";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "위치 확인 시간이 초과되었어요";
        }
        console.log("[Experts] 에러 메시지:", errorMsg);
        setLocationError(errorMsg);
        toast.error(errorMsg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

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

  // Calculate distances and sort
  const displayProfiles = useMemo(() => {
    if (!profiles) return [];

    const withDistance = profiles.map((p: any) => {
      if (userLocation && isValidCoordinate(p.latitude, p.longitude)) {
        const lat = parseFloat(p.latitude);
        const lng = parseFloat(p.longitude);
        const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
        return { ...p, distanceKm: distance };
      }
      return p;
    });

    // Sort by distance if user location is available
    if (userLocation) {
      return [...withDistance].sort((a, b) => {
        const distA = a.distanceKm ?? Infinity;
        const distB = b.distanceKm ?? Infinity;
        return distA - distB;
      });
    }

    return withDistance;
  }, [profiles, userLocation]);

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

        {/* Location Error */}
        {locationError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{locationError}</p>
          </div>
        )}

        {/* Sort + Reset + Location Button */}
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={userLocation ? "default" : "outline"}
              onClick={handleRequestCurrentLocation}
              disabled={isLocating}
              className="whitespace-nowrap"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  위치 확인 중
                </>
              ) : userLocation ? (
                <>
                  <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
                  위치 활성화됨
                </>
              ) : (
                <>
                  <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
                  내 주변 찾기
                </>
              )}
            </Button>
            {(hasActiveFilters || userLocation) && (
              <>
                <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                  {userLocation ? "위치 기준" : ""} {hasActiveFilters ? "필터 적용됨" : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearFilters();
                    setUserLocation(null);
                    setLocationError(null);
                  }}
                  className="text-muted-foreground h-7 px-2"
                >
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
        ) : displayProfiles && displayProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
            {displayProfiles.map((profile) => (
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
                  distanceKm: profile.distanceKm,
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

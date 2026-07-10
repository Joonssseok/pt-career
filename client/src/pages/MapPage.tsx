import { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { List, MapIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Briefcase } from "lucide-react";

type ProfileData = {
  id: number;
  displayName: string;
  profession: string;
  profileImageUrl: string | null;
  totalExperienceYears: number | null;
  verificationStatus: string;
  centerName: string | null;
  centerAddress: string | null;
  latitude: string | null;
  longitude: string | null;
  region: string | null;
};

export default function MapPage() {
  const [selectedExpert, setSelectedExpert] = useState<ProfileData | null>(null);
  const [showList, setShowList] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: experts = [], isLoading } = trpc.profiles.list.useQuery({});

  // Filter experts that have lat/lng
  const mappableExperts = experts.filter(
    (e: any) => e.latitude && e.longitude
  ) as ProfileData[];

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Center on Seoul
    map.setCenter({ lat: 37.5065, lng: 127.0536 });
    map.setZoom(12);
  }, []);

  // Add markers when experts data loads
  const addMarkers = useCallback(() => {
    if (!mapRef.current || mappableExperts.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    mappableExperts.forEach((expert) => {
      const lat = parseFloat(expert.latitude!);
      const lng = parseFloat(expert.longitude!);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current!,
        title: expert.centerName || expert.displayName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#00b8d4",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setSelectedExpert(expert);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple markers
    if (markersRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(m => {
        const pos = m.getPosition();
        if (pos) bounds.extend(pos);
      });
      mapRef.current!.fitBounds(bounds, 60);
    }
  }, [mappableExperts]);

  // Effect to add markers when map is ready and data loads
  const handleMapReadyWithMarkers = useCallback((map: google.maps.Map) => {
    handleMapReady(map);
    // Delay marker addition to ensure data is ready
    setTimeout(() => addMarkers(), 100);
  }, [handleMapReady, addMarkers]);

  // Re-add markers when experts change
  if (mapRef.current && mappableExperts.length > 0 && markersRef.current.length === 0) {
    addMarkers();
  }

  if (isLoading) {
    return (
      <div className="pt-16 h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pt-16 pb-14 md:pb-0 h-screen flex flex-col">
      {/* Map Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-foreground">지도에서 전문가 찾기</h1>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setShowList(!showList)}
        >
          {showList ? <MapIcon className="w-4 h-4 mr-1" /> : <List className="w-4 h-4 mr-1" />}
          {showList ? "지도" : "목록"}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className={`flex-1 relative ${showList ? "hidden md:block" : ""}`}>
          <MapView
            className="w-full h-full"
            initialCenter={{ lat: 37.5065, lng: 127.0536 }}
            initialZoom={12}
            onMapReady={handleMapReadyWithMarkers}
          />

          {/* Selected Expert Card */}
          {selectedExpert && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
              <div className="bg-card border border-border rounded-xl shadow-lg p-4">
                <button
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                  onClick={() => setSelectedExpert(null)}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex gap-3">
                  {selectedExpert.profileImageUrl ? (
                    <img
                      src={selectedExpert.profileImageUrl}
                      alt={selectedExpert.displayName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground/30">
                        {selectedExpert.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm truncate">{selectedExpert.displayName}</h3>
                      {selectedExpert.verificationStatus === "verified" && (
                        <Shield className="w-3.5 h-3.5 text-teal shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedExpert.profession}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {selectedExpert.centerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        경력 {selectedExpert.totalExperienceYears || 0}년
                      </Badge>
                    </div>
                  </div>
                </div>
                <Link href={`/experts/${selectedExpert.id}`}>
                  <Button size="sm" className="w-full mt-3 btn-press bg-accent text-accent-foreground hover:bg-accent/90">
                    상세 프로필 보기
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* List Panel (desktop always visible, mobile toggle) */}
        <div className={`w-full md:w-96 md:border-l border-border overflow-y-auto bg-background ${!showList ? "hidden md:block" : ""}`}>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              {mappableExperts.length}명의 전문가
            </p>
            {mappableExperts.map((expert) => (
              <button
                key={expert.id}
                className="w-full text-left"
                onClick={() => setSelectedExpert(expert)}
              >
                <div className={`p-3 rounded-lg border transition-colors ${
                  selectedExpert?.id === expert.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/30"
                }`}>
                  <div className="flex gap-3">
                    {expert.profileImageUrl ? (
                      <img
                        src={expert.profileImageUrl}
                        alt={expert.displayName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground/30">
                          {expert.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-medium text-sm truncate">{expert.displayName}</h3>
                        {expert.verificationStatus === "verified" && (
                          <Shield className="w-3.5 h-3.5 text-teal shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{expert.profession} · 경력 {expert.totalExperienceYears || 0}년</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" />
                        {expert.centerName}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

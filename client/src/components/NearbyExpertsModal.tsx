import { useState, useEffect } from "react";
import { X, Loader2, MapIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { calculateDistanceKm, formatDistance, isValidCoordinate } from "@/lib/utils/distance";
import type { UserLocation } from "@/types/location";
import NearbyExpertCard from "./NearbyExpertCard";

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
  headline?: string | null;
  specialties?: Array<{
    specialtyId: number;
    isPrimary: boolean;
    name: string;
    category: string;
  }>;
  distanceKm?: number;
};

interface NearbyExpertsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NearbyExpertsModal({ open, onOpenChange }: NearbyExpertsModalProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const { data: experts = [], isLoading } = trpc.profiles.list.useQuery({}, {
    enabled: userLocation !== null && hasRequested,
  });

  // 모달이 열릴 때 위치 요청
  useEffect(() => {
    if (open && !hasRequested) {
      requestCurrentLocation();
      setHasRequested(true);
    }
  }, [open, hasRequested]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      const msg = "브라우저가 위치 서비스를 지원하지 않습니다";
      setLocationError(msg);
      toast.error(msg);
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    toast.info("현재 위치를 확인하고 있어요");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        toast.success("현재 위치 기준으로 가까운 전문가를 보여드릴게요");
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "현재 위치를 확인하지 못했어요";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "위치 권한이 허용되지 않았어요. 지역 검색으로 전문가를 찾아보세요";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "위치 확인 시간이 초과되었어요";
        }
        setLocationError(errorMsg);
        toast.error(errorMsg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  // 거리 계산 및 정렬
  const expertsWithDistance = experts.map((e: any) => {
    if (userLocation && isValidCoordinate(e.latitude, e.longitude)) {
      const lat = parseFloat(e.latitude);
      const lng = parseFloat(e.longitude);
      const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
      return { ...e, distanceKm: distance };
    }
    return e;
  });

  let displayExperts = expertsWithDistance;
  if (userLocation) {
    displayExperts = [...expertsWithDistance].sort((a, b) => {
      const distA = a.distanceKm ?? Infinity;
      const distB = b.distanceKm ?? Infinity;
      return distA - distB;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">주변의 전문가</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                현재 위치를 기준으로 가까운 전문가를 확인해보세요.
              </p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 에러 상태 */}
          {locationError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{locationError}</p>
            </div>
          )}

          {/* 로딩 상태 */}
          {(isLocating || isLoading) && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          )}

          {/* 전문가 리스트 */}
          {!isLocating && !isLoading && userLocation && displayExperts.length > 0 && (
            <div className="space-y-3">
              {displayExperts.map((expert) => (
                <NearbyExpertCard
                  key={expert.id}
                  expert={expert}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}

          {/* 주변 전문가 없음 */}
          {!isLocating && !isLoading && userLocation && displayExperts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                현재 위치 주변에서 조건에 맞는 전문가를 찾지 못했어요.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
            </div>
          )}

          {/* 위치 미확인 상태 */}
          {!isLocating && !userLocation && !locationError && (
            <div className="text-center py-12">
              <Button onClick={requestCurrentLocation} disabled={isLocating}>
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    위치 확인 중
                  </>
                ) : (
                  "위치 권한 허용"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

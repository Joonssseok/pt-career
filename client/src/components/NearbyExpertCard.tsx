import { Link } from "wouter";
import { Shield, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/utils/distance";

interface ExpertSpecialty {
  specialtyId: number;
  isPrimary: boolean;
  name: string;
  category: string;
}

interface NearbyExpertCardProps {
  expert: {
    id: number;
    displayName: string;
    profileImageUrl: string | null;
    profession: string;
    headline?: string | null;
    totalExperienceYears: number | null;
    verificationStatus: string;
    centerName: string | null;
    centerAddress: string | null;
    distanceKm?: number;
    specialties?: ExpertSpecialty[];
  };
  onNavigate?: () => void;
}

export default function NearbyExpertCard({ expert, onNavigate }: NearbyExpertCardProps) {
  const specialties = expert.specialties || [];
  const primary = specialties.find((s) => s.isPrimary);
  const subTags = specialties.filter((s) => !s.isPrimary).slice(0, 2);

  return (
    <Link href={`/experts/${expert.id}`}>
      <div onClick={onNavigate} className="card-hover bg-card border border-border rounded-lg p-4 cursor-pointer">
        <div className="flex gap-4 items-start">
          {/* 프로필 사진 */}
          <div className="shrink-0">
            {expert.profileImageUrl ? (
              <img
                src={expert.profileImageUrl}
                alt={expert.displayName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground/30">
                  {expert.displayName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* 좌측 정보 */}
          <div className="flex-1 min-w-0">
            {/* 이름 + 자격 배지 */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{expert.displayName}</h3>
              {expert.verificationStatus === "verified" && (
                <Shield className="w-4 h-4 text-teal shrink-0" />
              )}
            </div>

            {/* 직군 */}
            <p className="text-sm text-muted-foreground mb-2">{expert.profession}</p>

            {/* 한 줄 소개 */}
            {expert.headline && (
              <p className="text-sm text-foreground/80 line-clamp-1 mb-2">
                {expert.headline}
              </p>
            )}

            {/* 경력 + 전문분야 */}
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {expert.totalExperienceYears != null && expert.totalExperienceYears > 0 && (
                <Badge variant="secondary" className="text-xs">
                  경력 {expert.totalExperienceYears}년
                </Badge>
              )}
              {primary && (
                <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  {primary.category}
                </span>
              )}
            </div>

            {/* 세부 전문분야 */}
            {subTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {subTags.map((tag) => (
                  <span
                    key={tag.specialtyId}
                    className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 센터 정보 */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {expert.centerName && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {expert.centerName}
                </span>
              )}
              {expert.centerAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {expert.centerAddress}
                </span>
              )}
            </div>
          </div>

          {/* 우측 정보 (데스크톱) / 하단 정보 (모바일) */}
          <div className="hidden sm:block shrink-0 text-right text-xs text-muted-foreground">
            {expert.distanceKm !== undefined ? (
              <>
                <p className="font-medium text-foreground mb-1">현재 위치에서</p>
                <p className="text-accent font-semibold">{formatDistance(expert.distanceKm)}</p>
              </>
            ) : (
              <p className="text-muted-foreground">거리 정보 없음</p>
            )}
          </div>
        </div>

        {/* 모바일: 하단 거리 정보 */}
        <div className="sm:hidden mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          {expert.distanceKm !== undefined ? (
            <p className="text-accent font-semibold">현재 위치에서 {formatDistance(expert.distanceKm)}</p>
          ) : (
            <p>거리 정보 없음</p>
          )}
        </div>
      </div>
    </Link>
  );
}

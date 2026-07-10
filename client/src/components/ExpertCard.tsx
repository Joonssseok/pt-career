import { Link } from "wouter";
import { MapPin, Briefcase, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ExpertCardData {
  id: number;
  displayName: string;
  profileImageUrl: string | null;
  profession: string;
  headline: string | null;
  totalExperienceYears: number | null;
  region: string | null;
  centerName: string | null;
  verificationStatus: string;
  specialties?: string[];
}

interface ExpertCardProps {
  expert: ExpertCardData;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const specialties = expert.specialties || [];

  return (
    <Link href={`/experts/${expert.id}`}>
      <div className="card-hover bg-card border border-border rounded-xl overflow-hidden">
        {/* Image + Badge */}
        <div className="relative h-48 bg-muted">
          {expert.profileImageUrl ? (
            <img
              src={expert.profileImageUrl}
              alt={expert.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-4xl font-bold text-muted-foreground/30">
                {expert.displayName.charAt(0)}
              </span>
            </div>
          )}
          {expert.verificationStatus === "verified" && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teal/90 text-white">
                <Shield className="w-3 h-3" />
                확인 완료
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground text-base">{expert.displayName}</h3>
              <p className="text-sm text-muted-foreground">{expert.profession}</p>
            </div>
            {expert.totalExperienceYears != null && expert.totalExperienceYears > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                경력 {expert.totalExperienceYears}년
              </Badge>
            )}
          </div>

          {expert.headline && (
            <p className="text-sm text-foreground/80 line-clamp-1 mb-3">
              {expert.headline}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {expert.region && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {expert.region}
              </span>
            )}
            {expert.centerName && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {expert.centerName}
              </span>
            )}
          </div>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {specialties.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-secondary-foreground">
                  {s}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">
                  +{specialties.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

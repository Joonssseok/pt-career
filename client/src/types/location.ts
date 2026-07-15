/**
 * User's current geographic location
 */
export type UserLocation = {
  lat: number;
  lng: number;
};

/**
 * Expert profile with calculated distance from user location
 */
export type ExpertWithDistance = {
  id: number;
  displayName: string;
  profession: string;
  profileImageUrl: string | null;
  totalExperienceYears: number | null;
  verificationStatus: string;
  centerName: string | null;
  centerAddress?: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  region: string | null;
  headline?: string | null;
  specialties?: Array<{
    specialtyId: number;
    isPrimary: boolean;
    name: string;
    category: string;
  }>;
  distanceKm?: number; // Calculated distance from user location
};

/**
 * Location permission status
 */
export type LocationPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

/**
 * Geolocation result or error
 */
export type GeolocationResult =
  | { success: true; location: UserLocation }
  | { success: false; error: string };

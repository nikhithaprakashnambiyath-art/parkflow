import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ParkingLot, SearchFilters } from "@/store/searchStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export interface ScoredParkingLot extends ParkingLot {
  score: number;
  isRecommended: boolean;
}

export function scoreParkingLot(
  lot: ParkingLot,
  filters: SearchFilters,
): number {
  let score = 0;

  // Distance score (0-25 points): closer is better
  if (lot.distance !== undefined) {
    const distanceScore = Math.max(
      0,
      25 - (lot.distance / filters.distance) * 25,
    );
    score += distanceScore;
  }

  // Price score (0-25 points): cheaper within budget is better
  const priceScore = Math.max(0, 25 - (lot.pricing / filters.price) * 25);
  score += priceScore;

  // Rating score (0-20 points): higher rating is better
  const ratingScore = (lot.rating / 5) * 20;
  score += ratingScore;

  // Availability score (0-20 points): more spaces available is better
  const availabilityScore = Math.min(20, (lot.availability / 100) * 20);
  score += availabilityScore;

  // Amenities matching score (0-10 points)
  let amenitiesMatch = 0;
  const requestedAmenities = [
    { requested: filters.evCharging, has: lot.hasEVCharging },
    { requested: filters.covered, has: lot.isCovered },
    { requested: filters.security, has: lot.hasSecurity },
    { requested: filters.accessibility, has: lot.isAccessible },
  ];

  const totalRequested = requestedAmenities.filter((a) => a.requested).length;
  if (totalRequested > 0) {
    const matched = requestedAmenities.filter(
      (a) => a.requested && a.has,
    ).length;
    amenitiesMatch = (matched / totalRequested) * 10;
  } else {
    amenitiesMatch = 5; // Neutral score if no amenities requested
  }
  score += amenitiesMatch;

  return score;
}

export function getRecommendedSpot(
  lots: ParkingLot[],
  filters: SearchFilters,
): ScoredParkingLot[] {
  const scoredLots: ScoredParkingLot[] = lots.map((lot) => ({
    ...lot,
    score: scoreParkingLot(lot, filters),
    isRecommended: false,
  }));

  // Sort by score descending
  scoredLots.sort((a, b) => b.score - a.score);

  // Mark the top spot as recommended
  if (scoredLots.length > 0) {
    scoredLots[0].isRecommended = true;
  }

  return scoredLots;
}

import type { GradeLabel, Listing, MarketplaceListing } from "./types";

export function dominantGrade(grade: Record<GradeLabel, number>) {
  return (Object.entries(grade) as Array<[GradeLabel, number]>).reduce(
    (dominant, current) => current[1] > dominant[1] ? current : dominant,
    ["A", grade.A] as [GradeLabel, number],
  );
}

export function toMarketplaceListing(listing: Listing): MarketplaceListing {
  const gradeA = Math.round(listing.grade_distribution.A * 100);
  const gradeB = Math.round(listing.grade_distribution.B * 100);
  const gradeC = Math.max(0, 100 - gradeA - gradeB);
  const grade = { A: gradeA, B: gradeB, C: gradeC };
  const [dominantLabel, dominantPercentage] = dominantGrade(grade);
  const recommendation = listing.grade_recommendations.find((item) => item.grade === dominantLabel);
  const cropName = listing.produce_type === "tomato" ? "Tomato crate" : "Banana crate";
  const qualitySummary = `${dominantPercentage}% Grade ${dominantLabel}${recommendation ? ` · ${recommendation.title}` : ""}`;
  return {
    id: listing.id,
    produce: cropName,
    produceType: listing.produce_type,
    farmer: listing.farmer_name,
    location: listing.farmer_location,
    image: listing.photo_url,
    weightKg: listing.est_weight_kg,
    pricePerKg: listing.unit_price,
    grade,
    dominantGrade: { grade: dominantLabel, percentage: dominantPercentage },
    gradeRecommendations: listing.grade_recommendations,
    shelfLife: `about ${listing.est_shelf_life.approx_days} days`,
    shelfBand: listing.est_shelf_life.band,
    segment: listing.suggested_segment,
    codex: qualitySummary,
    fresh: true,
    ipfsCid: listing.ipfs_cid,
  };
}

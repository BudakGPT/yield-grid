import type { Listing, MarketplaceListing } from "./types";

export function toMarketplaceListing(listing: Listing): MarketplaceListing {
  const gradeA = Math.round(listing.grade_distribution.A * 100);
  const gradeB = Math.round(listing.grade_distribution.B * 100);
  const gradeReject = Math.max(0, 100 - gradeA - gradeB);
  const cropName = listing.produce_type === "tomato" ? "Tomato crate" : "Banana crate";
  const qualitySummary = gradeA >= gradeB ? "Mostly Grade A produce" : "Mostly Grade B produce";
  return {
    id: listing.id,
    produce: cropName,
    produceType: listing.produce_type,
    farmer: listing.farmer_name,
    location: listing.farmer_location,
    image: listing.photo_url,
    weightKg: listing.est_weight_kg,
    pricePerKg: listing.unit_price,
    grade: { A: gradeA, B: gradeB, reject: gradeReject },
    shelfLife: `about ${listing.est_shelf_life.approx_days} days`,
    shelfBand: listing.est_shelf_life.band,
    segment: listing.suggested_segment,
    codex: qualitySummary,
    fresh: true,
    ipfsCid: listing.ipfs_cid,
  };
}

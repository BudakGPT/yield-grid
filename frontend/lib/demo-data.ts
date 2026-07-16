export type BuyerSegment = "retail" | "wholesale" | "processing";
export type ProduceType = "tomato" | "banana";
export type OrderStatus = "open" | "escrowed" | "in_transit" | "breached" | "settled";

export type MarketplaceListing = {
  id: string;
  produce: string;
  produceType: ProduceType;
  farmer: string;
  location: string;
  image: string;
  weightKg: number;
  pricePerKg: number;
  grade: { A: number; B: number; reject: number };
  shelfLife: string;
  shelfBand: "short" | "medium" | "long";
  segment: BuyerSegment;
  reputation: number;
  codex: string;
  fresh?: boolean;
};

export const AMARA_LISTING: MarketplaceListing = {
  id: "YG-LST-1042",
  produce: "Tomat merah",
  produceType: "tomato",
  farmer: "Amara Nwosu",
  location: "Pangalengan, Jawa Barat",
  image: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&q=88&w=1400",
  weightKg: 45,
  pricePerKg: 18000,
  grade: { A: 70, B: 25, reject: 5 },
  shelfLife: "sekitar 5–7 hari",
  shelfBand: "medium",
  segment: "retail",
  reputation: 96,
  codex: "A = Codex Extra / Class I · CXS 293",
  fresh: true,
};

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: "YG-LST-1039",
    produce: "Pisang Cavendish",
    produceType: "banana",
    farmer: "Komang Ari",
    location: "Tabanan, Bali",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=88&w=1400",
    weightKg: 90,
    pricePerKg: 14200,
    grade: { A: 82, B: 16, reject: 2 },
    shelfLife: "sekitar 8–10 hari",
    shelfBand: "long",
    segment: "retail",
    reputation: 94,
    codex: "A = Codex Extra / Class I · CXS 205",
  },
  {
    id: "YG-LST-1037",
    produce: "Tomat saus",
    produceType: "tomato",
    farmer: "Nur Aisyah",
    location: "Garut, Jawa Barat",
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=88&w=1400",
    weightKg: 120,
    pricePerKg: 11200,
    grade: { A: 28, B: 58, reject: 14 },
    shelfLife: "sekitar 2–3 hari",
    shelfBand: "short",
    segment: "processing",
    reputation: 91,
    codex: "B = Codex Class II · CXS 293",
  },
  {
    id: "YG-LST-1034",
    produce: "Pisang Grade B",
    produceType: "banana",
    farmer: "Tani Makmur",
    location: "Lampung Selatan",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=88&w=1400",
    weightKg: 160,
    pricePerKg: 9800,
    grade: { A: 35, B: 60, reject: 5 },
    shelfLife: "sekitar 4–6 hari",
    shelfBand: "medium",
    segment: "wholesale",
    reputation: 89,
    codex: "B = Codex Class II · CXS 205",
  },
];

export const DEMO_HASHES = {
  escrow: "3e4a2f93b8d7c1a5f6e2199a1f2d74b0326c81f44ce899b8ad72f6c4eab10c91",
  settlement: "7cb1270e819d5f35d24c9aa443e794a76a9b18f0672d4ac7edb1f39c06da921e",
  ipfs: "QmYieldGridDemo7zP4N2hW3uV9kA6fR8xC1tM5sL0jB",
};

export const READINESS_SERVICES = ["API", "Database", "Vision model", "Pinata / IPFS", "Stellar testnet", "WebSocket"];

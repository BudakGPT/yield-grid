export type Role = "BUYER" | "SELLER" | "ADMIN" | "MODERATOR" | "SUPPORT";
export type BuyerSegment = "retail" | "wholesale" | "processing";
export type EscrowStatus = "NONE" | "CREATED" | "ESCROWED" | "IN_TRANSIT" | "BREACHED" | "SETTLED";
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
  ipfsCid?: string | null;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
  stellarPublicKey: string | null;
  walletReady: boolean;
};

export type Profile = User & {
  phoneNumber: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
};

export type GradeDistribution = { A: number; B: number; reject: number };
export type ShelfLifeEstimate = { band: "short" | "medium" | "long"; approx_days: number; basis: string };

export type GradingResult = {
  scan_id: string;
  produce_type: "tomato" | "banana";
  crate_count: number;
  est_weight_kg: number;
  grade_distribution: GradeDistribution;
  est_shelf_life: ShelfLifeEstimate;
  defects_observed: string[];
  suggested_unit_price: number;
  rubric_version: string;
  model_confidence: string;
  photo_url: string;
  ipfs_cid: string | null;
  signature: string | null;
};

export type Listing = {
  id: string;
  scan_id: string;
  farmer_id: string;
  farmer_name: string;
  produce_type: "tomato" | "banana";
  unit_price: number;
  est_weight_kg: number;
  grade_distribution: GradeDistribution;
  est_shelf_life: ShelfLifeEstimate;
  photo_url: string;
  ipfs_cid: string | null;
  rubric_version: string;
  suggested_segment: BuyerSegment;
  status: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  productName: string;
  qualityGrade: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderItem[];
  escrowStatus: EscrowStatus;
  farmerId: string | null;
  farmerName: string | null;
  escrowTxHash: string | null;
  settleTxHash: string | null;
  discountBps: number | null;
  breachDetected: boolean;
  lastTemperatureC: number | null;
};

export type YieldGridEvent = {
  event: "listing.created" | "order.created" | "order.escrow_locked" | "transit.update" | "transit.breach" | "order.settled";
  order_id: string;
  data: Record<string, unknown> | Listing;
  timestamp: string;
};

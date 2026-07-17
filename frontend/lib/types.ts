export type Role = "BUYER" | "SELLER" | "ADMIN" | "MODERATOR" | "SUPPORT";
export type BuyerSegment = "retail" | "wholesale" | "processing";
export type EscrowStatus = "NONE" | "CREATED" | "ESCROWED" | "IN_TRANSIT" | "BREACHED" | "SETTLED";
export type ProduceType = "tomato" | "banana";
export type OrderStatus = "open" | "escrowed" | "in_transit" | "breached" | "settled";
export type GradeLabel = "A" | "B" | "C";

export type GradeRecommendation = {
  grade: GradeLabel;
  title: string;
  description: string;
};

export type MarketplaceListing = {
  id: string;
  produce: string;
  produceType: ProduceType;
  farmer: string;
  location: string | null;
  image: string;
  weightKg: number;
  pricePerKg: number;
  grade: Record<GradeLabel, number>;
  dominantGrade: { grade: GradeLabel; percentage: number };
  gradeRecommendations: GradeRecommendation[];
  shelfLife: string;
  shelfBand: "short" | "medium" | "long";
  segment: BuyerSegment;
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
  deliveryRecipientName: string | null;
  deliveryPhoneNumber: string | null;
  deliveryProvince: string | null;
  deliveryCity: string | null;
  deliveryDistrict: string | null;
  deliveryPostalCode: string | null;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  deliveryRecipientName?: string;
  deliveryPhoneNumber?: string;
  deliveryProvince?: string;
  deliveryCity?: string;
  deliveryDistrict?: string;
  deliveryPostalCode?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
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
  grade_recommendations: GradeRecommendation[];
};

export type Listing = {
  id: string;
  scan_id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_location: string | null;
  produce_type: "tomato" | "banana";
  unit_price: number;
  est_weight_kg: number;
  grade_distribution: GradeDistribution;
  est_shelf_life: ShelfLifeEstimate;
  photo_url: string;
  ipfs_cid: string | null;
  rubric_version: string;
  suggested_segment: BuyerSegment;
  grade_recommendations: GradeRecommendation[];
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
  recipientName: string;
  recipientPhone: string;
  province: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  fullAddress: string;
  notes: string | null;
  items: OrderItem[];
  orderedAt: string;
  updatedAt: string;
  completedAt: string | null;
  escrowStatus: EscrowStatus;
  farmerId: string | null;
  farmerName: string | null;
  escrowTxHash: string | null;
  settleTxHash: string | null;
  discountBps: number | null;
  breachDetected: boolean;
  lastTemperatureC: number | null;
};

export type DeliveryDetails = {
  recipientName: string;
  recipientPhone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  notes: string;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  itemCount: number;
  orderedAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type AdminMetrics = {
  totalUsers: number;
  activeUsers: number;
  buyers: number;
  sellers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  activeOrders: number;
  totalGradings: number;
  ordersByStatus: Record<string, number>;
};

export type AdminIntegrationStatus = {
  name: string;
  status: "READY" | "DEGRADED" | "DOWN" | "DISABLED" | "UNCONFIGURED";
  detail: string;
  latencyMs: number | null;
};

export type AdminAudit = {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: string;
};

export type AdminOverview = {
  metrics: AdminMetrics;
  integrations: AdminIntegrationStatus[];
  recentActivity: AdminAudit[];
  generatedAt: string;
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
  walletReady: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type ProductSummary = {
  id: string;
  name: string;
  price: number;
  stock: number;
  qualityGrade: string;
  unit: string;
  status: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  category: { id: string; name: string; description: string | null; active: boolean };
  primaryImageUrl: string | null;
  sellerId: string;
  sellerName: string;
};

export type YieldGridEvent = {
  event: "listing.created" | "order.created" | "order.escrow_locked" | "order.status_updated" | "transit.update" | "transit.breach" | "order.settled";
  order_id: string;
  data: Record<string, unknown> | Listing;
  timestamp: string;
};

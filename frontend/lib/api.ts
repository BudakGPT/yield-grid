import type { AdminAudit, AdminOverview, AdminUser, AuthResponse, BuyerSegment, DeliveryDetails, GradeRecommendation, GradingResult, Listing, Order, OrderSummary, PageResponse, ProductSummary, Profile, Role, UpdateProfileInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";
export const SESSION_STORAGE_KEY = "yieldgrid-session";
export const SESSION_INVALIDATED_EVENT = "yieldgrid:session-invalidated";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function readSession(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!saved) return null;
  try {
    const session = JSON.parse(saved) as AuthResponse;
    const expiresAt = sessionExpiresAt(session);
    if (expiresAt !== null && expiresAt <= Date.now() + 5_000) {
      invalidateSession();
      return null;
    }
    return session;
  } catch {
    invalidateSession();
    return null;
  }
}

export function writeSession(session: AuthResponse | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function sessionExpiresAt(session: AuthResponse): number | null {
  try {
    const payload = session.accessToken.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const parsed = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof parsed.exp === "number" ? parsed.exp * 1_000 : null;
  } catch {
    return null;
  }
}

export function invalidateSession() {
  if (typeof window === "undefined") return;
  writeSession(null);
  window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("content-type", "application/json");
  if (authenticated) {
    const session = readSession();
    if (!session) {
      invalidateSession();
      throw new ApiError("Sign in to continue", 401);
    }
    headers.set("authorization", `${session.tokenType} ${session.accessToken}`);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch (cause) {
    throw new ApiError(
      cause instanceof TypeError
        ? "YieldGrid is temporarily unavailable. Please try again."
        : "The request could not be completed.",
      0,
    );
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    if (authenticated && response.status === 401) invalidateSession();
    throw new ApiError(body?.message ?? `Request failed (${response.status})`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  signup(fullName: string, email: string, password: string, role: Role) {
    return request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, role }),
    }, false);
  },
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
  },
  oauthLogin(accessToken: string, role?: Role) {
    return request<AuthResponse>("/api/auth/oauth", {
      method: "POST",
      body: JSON.stringify({ accessToken, role: role ?? null }),
    }, false);
  },
  getMyProfile() {
    return request<Profile>("/api/profile/me");
  },
  updateMyProfile(profile: UpdateProfileInput) {
    return request<Profile>("/api/profile/me", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  },
  provisionMyWallet() {
    return request<Profile>("/api/profile/me/wallet", { method: "POST" });
  },
  async scan(photo: File, crateCount: number, produceType: string) {
    const form = new FormData();
    form.set("photo", photo);
    form.set("crate_count", String(crateCount));
    form.set("produce_type", produceType);
    const session = readSession();
    if (!session) {
      invalidateSession();
      throw new ApiError("Sign in as a farmer to scan", 401);
    }
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/scans`, {
        method: "POST",
        headers: { authorization: `${session.tokenType} ${session.accessToken}` },
        body: form,
        cache: "no-store",
      });
    } catch {
      throw new ApiError("YieldGrid is temporarily unavailable. Please try again.", 0);
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (response.status === 401) invalidateSession();
      throw new ApiError(body?.message ?? "Scan failed", response.status);
    }
    return {
      result: (await response.json()) as GradingResult,
      source: response.headers.get("X-YieldGrid-Grading-Source") ?? "live",
    };
  },
  createListing(scanId: string, unitPrice: number) {
    return request<Listing>("/api/listings", {
      method: "POST",
      body: JSON.stringify({ scan_id: scanId, unit_price: unitPrice }),
    });
  },
  getListings(segment?: BuyerSegment) {
    const query = new URLSearchParams({ status: "open" });
    if (segment) query.set("segment", segment.toUpperCase());
    return request<Listing[]>(`/api/listings?${query}`);
  },
  getMyListings() {
    return request<Listing[]>("/api/listings/mine");
  },
  getListing(listingId: string) {
    return request<Listing>(`/api/listings/${listingId}`);
  },
  createOrder(listingId: string, quantity: number, delivery: DeliveryDetails) {
    return request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: [{ productId: listingId, quantity }],
        paymentMethod: "YGIDR_ESCROW",
        ...delivery,
      }),
    });
  },
  getMyOrders() {
    return request<PageResponse<OrderSummary>>("/api/orders/my?page=0&size=1&sort=orderedAt,desc");
  },
  getSellerOrders() {
    return request<PageResponse<OrderSummary>>("/api/orders/seller?page=0&size=1&sort=orderedAt,desc");
  },
  getOrder(orderId: string) {
    return request<Order>(`/api/orders/${orderId}`);
  },
  getAdminOverview() {
    return request<AdminOverview>("/api/admin/overview");
  },
  getAdminUsers() {
    return request<PageResponse<AdminUser>>("/api/admin/users?page=0&size=50&sort=createdAt,desc");
  },
  updateAdminUserStatus(userId: string, enabled: boolean) {
    return request<AdminUser>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  },
  getAdminOrders() {
    return request<PageResponse<OrderSummary>>("/api/admin/orders?page=0&size=50&sort=orderedAt,desc");
  },
  updateAdminOrderStatus(orderId: string, status: string) {
    return request<Order>(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  getAdminProducts() {
    return request<PageResponse<ProductSummary>>("/api/admin/products?page=0&size=50&sort=createdAt,desc");
  },
  getAdminGradeRecommendations() {
    return request<GradeRecommendation[]>("/api/admin/grade-recommendations");
  },
  updateAdminGradeRecommendation(grade: GradeRecommendation["grade"], title: string, description: string) {
    return request<GradeRecommendation>(`/api/admin/grade-recommendations/${grade}`, {
      method: "PATCH",
      body: JSON.stringify({ title, description }),
    });
  },
  updateAdminProductStatus(productId: string, status: ProductSummary["status"]) {
    return request<Record<string, unknown>>(`/api/admin/products/${productId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  getAdminAudit() {
    return request<PageResponse<AdminAudit>>("/api/admin/audit?page=0&size=50&sort=createdAt,desc");
  },
  updateOrderStatus(orderId: string, status: "PROCESSING" | "SHIPPED") {
    return request<Order>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  deliver(orderId: string, qrPayload?: string) {
    return request<Order>(`/api/orders/${orderId}/deliver`, {
      method: "POST",
      body: JSON.stringify({ qr_payload: qrPayload ?? null }),
    });
  },
  startTransit(orderId: string) {
    return request<Record<string, unknown>>("/api/demo/transit/start", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }, false);
  },
  injectBreach(orderId: string) {
    return request<Record<string, unknown>>("/api/demo/breach", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }, false);
  },
  resetDemo() {
    return request<Record<string, unknown>>("/api/demo/reset", { method: "POST" }, false);
  },
  demoHealth() {
    return request<Record<string, unknown>>("/api/demo/health", {}, false);
  },
};

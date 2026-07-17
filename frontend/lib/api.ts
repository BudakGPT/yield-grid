import type { AuthResponse, BuyerSegment, DeliveryDetails, GradingResult, Listing, Order, OrderSummary, PageResponse, Profile, Role, UpdateProfileInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";
const SESSION_KEY = "yieldgrid-session";

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
  const saved = window.localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AuthResponse;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeSession(session: AuthResponse | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("content-type", "application/json");
  if (authenticated) {
    const session = readSession();
    if (!session) throw new ApiError("Sign in to continue", 401);
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
  getMyProfile() {
    return request<Profile>("/api/profile/me");
  },
  updateMyProfile(profile: UpdateProfileInput) {
    return request<Profile>("/api/profile/me", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  },
  async scan(photo: File, crateCount: number, produceType: string) {
    const form = new FormData();
    form.set("photo", photo);
    form.set("crate_count", String(crateCount));
    form.set("produce_type", produceType);
    const session = readSession();
    if (!session) throw new ApiError("Sign in as a farmer to scan", 401);
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

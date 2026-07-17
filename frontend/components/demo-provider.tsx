"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toMarketplaceListing } from "@/lib/listing";
import type { DeliveryDetails, MarketplaceListing, Order, OrderStatus, ProduceType, YieldGridEvent } from "@/lib/types";
import { subscribeToYieldGrid } from "@/lib/ws";
import { useAuth } from "./auth-provider";

export type DemoState = {
  produceType: ProduceType;
  crateCount: number;
  pricePerKg: number;
  scanComplete: boolean;
  listingLive: boolean;
  status: OrderStatus;
  payoutVersion: number;
  selectedListingId: string;
  activeListing: MarketplaceListing | null;
  activeOrder: Order | null;
  orderId: string;
  escrowTxHash: string;
  settleTxHash: string;
  totalAmount: number;
  discountBps: number;
  lastTemperatureC: number | null;
  lastEvent: string;
};

type DemoContextValue = {
  state: DemoState;
  setScanInput: (produceType: ProduceType, crateCount: number) => void;
  completeScan: () => void;
  listForSale: (pricePerKg: number, listingId?: string) => void;
  lockEscrow: (listing: MarketplaceListing, delivery: DeliveryDetails) => Promise<void>;
  updateOrderStatus: (status: "PROCESSING" | "SHIPPED") => Promise<void>;
  refreshOrder: () => Promise<void>;
  startTransit: () => Promise<void>;
  injectBreach: () => Promise<void>;
  settleOrder: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const INITIAL_STATE: DemoState = {
  produceType: "tomato",
  crateCount: 1,
  pricePerKg: 0,
  scanComplete: false,
  listingLive: false,
  status: "open",
  payoutVersion: 0,
  selectedListingId: "",
  activeListing: null,
  activeOrder: null,
  orderId: "",
  escrowTxHash: "",
  settleTxHash: "",
  totalAmount: 0,
  discountBps: 0,
  lastTemperatureC: null,
  lastEvent: "Waiting for a farmer listing",
};

const DemoContext = createContext<DemoContextValue | null>(null);

function dataValue<T>(event: YieldGridEvent, key: string): T | undefined {
  return (event.data as Record<string, unknown>)[key] as T | undefined;
}

function statusFromOrder(order: Order): OrderStatus {
  if (order.breachDetected || order.escrowStatus === "BREACHED") return "breached";
  if (order.status === "COMPLETED" || order.escrowStatus === "SETTLED") return "settled";
  if (["SHIPPED", "DELIVERED"].includes(order.status) || order.escrowStatus === "IN_TRANSIT") return "in_transit";
  if (["PAID", "PROCESSING"].includes(order.status) || ["CREATED", "ESCROWED"].includes(order.escrowStatus)) return "escrowed";
  return "open";
}

function eventLabel(status: OrderStatus) {
  if (status === "settled") return "Farmer payment confirmed";
  if (status === "breached") return "Temperature issue detected";
  if (status === "in_transit") return "Order in transit";
  if (status === "escrowed") return "Payment protected";
  return "Order received";
}

function applyOrder(current: DemoState, order: Order, listing: MarketplaceListing | null = current.activeListing): DemoState {
  const status = statusFromOrder(order);
  return {
    ...current,
    selectedListingId: order.items[0]?.productId ?? current.selectedListingId,
    activeListing: listing,
    activeOrder: order,
    orderId: order.id,
    status,
    payoutVersion: status === "settled" && current.status !== "settled" ? current.payoutVersion + 1 : current.payoutVersion,
    escrowTxHash: order.escrowTxHash ?? "",
    settleTxHash: order.settleTxHash ?? "",
    totalAmount: order.totalAmount,
    discountBps: order.discountBps ?? 0,
    lastTemperatureC: order.lastTemperatureC,
    lastEvent: eventLabel(status),
  };
}

async function loadOrder(orderId: string) {
  const order = await api.getOrder(orderId);
  const productId = order.items[0]?.productId;
  let listing: MarketplaceListing | null = null;
  if (productId) {
    try {
      listing = toMarketplaceListing(await api.getListing(productId));
    } catch {
      listing = null;
    }
  }
  return { order, listing };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth();
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const storageKey = session ? `yieldgrid-trade-${session.user.id}` : null;

  useEffect(() => {
    if (!ready) return;
    let active = true;

    const hydrate = async () => {
      await Promise.resolve();
      if (!session || !storageKey) {
        if (active) {
          setState(INITIAL_STATE);
          setHydratedKey(null);
        }
        return;
      }

      let saved = INITIAL_STATE;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) saved = { ...INITIAL_STATE, ...JSON.parse(raw) } as DemoState;
      } catch {
        window.localStorage.removeItem(storageKey);
      }

      if (active) setState(saved);
      try {
        let orderId = saved.orderId;
        if (!orderId && session.user.role === "BUYER") orderId = (await api.getMyOrders()).content[0]?.id ?? "";
        if (!orderId && session.user.role === "SELLER") orderId = (await api.getSellerOrders()).content[0]?.id ?? "";
        if (orderId) {
          const trade = await loadOrder(orderId);
          if (active) setState((current) => applyOrder(current, trade.order, trade.listing));
        }
      } catch {
        // Keep local scan/listing input when no accessible order exists yet.
      } finally {
        if (active) setHydratedKey(storageKey);
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [ready, session, storageKey]);

  useEffect(() => {
    if (hydratedKey === storageKey && storageKey) window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydratedKey, state, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) setState({ ...INITIAL_STATE, ...JSON.parse(event.newValue) });
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey]);

  useEffect(() => {
    const timers = new Set<number>();
    const syncOrder = (orderId: string, attempt = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        void loadOrder(orderId)
          .then((trade) => setState((current) => applyOrder(current, trade.order, trade.listing)))
          .catch(() => {
            if (attempt < 1) syncOrder(orderId, attempt + 1);
          });
      }, attempt === 0 ? 150 : 600);
      timers.add(timer);
    };

    const unsubscribe = subscribeToYieldGrid((event) => {
      if (event.event === "listing.created") {
        setState((current) => ({ ...current, listingLive: true, lastEvent: "Listing available to buyers" }));
        return;
      }

      if (event.event === "order.created" || event.event === "order.status_updated") {
        const buyerId = dataValue<string>(event, "buyer_id");
        const farmerId = dataValue<string>(event, "farmer_id");
        if (!session || (buyerId !== session.user.id && farmerId !== session.user.id)) return;
        setState((current) => ({ ...current, orderId: event.order_id, lastEvent: "Order update received" }));
        syncOrder(event.order_id);
        return;
      }

      setState((current) => {
        if (current.orderId !== event.order_id) return current;
        if (event.event === "order.escrow_locked") return { ...current, status: "escrowed", escrowTxHash: dataValue<string>(event, "tx_hash") ?? current.escrowTxHash, lastEvent: "Payment protected" };
        if (event.event === "transit.update") {
          const temperature = dataValue<number>(event, "temp_c");
          const lastTemperatureC = temperature == null ? current.lastTemperatureC : Number(temperature);
          return { ...current, status: "in_transit", activeOrder: current.activeOrder ? { ...current.activeOrder, escrowStatus: "IN_TRANSIT", lastTemperatureC } : null, lastTemperatureC, lastEvent: "Order in transit" };
        }
        if (event.event === "transit.breach") {
          const temperature = dataValue<number>(event, "temp_c");
          const discountBps = dataValue<number>(event, "discount_bps");
          const nextDiscountBps = discountBps == null ? current.discountBps : Number(discountBps);
          const lastTemperatureC = temperature == null ? current.lastTemperatureC : Number(temperature);
          return { ...current, status: "breached", activeOrder: current.activeOrder ? { ...current.activeOrder, escrowStatus: "BREACHED", breachDetected: true, discountBps: nextDiscountBps, lastTemperatureC } : null, discountBps: nextDiscountBps, lastTemperatureC, lastEvent: "Temperature issue detected" };
        }
        if (event.event === "order.settled") {
          const settleTxHash = dataValue<string>(event, "tx_hash") ?? current.settleTxHash;
          const discountBps = Number(dataValue(event, "discount_bps") ?? current.discountBps);
          return { ...current, status: "settled", activeOrder: current.activeOrder ? { ...current.activeOrder, escrowStatus: "SETTLED", settleTxHash, discountBps } : null, payoutVersion: current.status === "settled" ? current.payoutVersion : current.payoutVersion + 1, settleTxHash, totalAmount: Number(dataValue(event, "amount") ?? current.totalAmount), discountBps, lastEvent: "Farmer payment confirmed" };
        }
        return current;
      });
    });

    return () => {
      unsubscribe();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [session]);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    setScanInput: (produceType, crateCount) => setState((current) => ({ ...current, produceType, crateCount })),
    completeScan: () => setState((current) => ({ ...current, scanComplete: true, lastEvent: "Visual grade ready" })),
    listForSale: (pricePerKg, listingId = "") => setState((current) => ({ ...current, pricePerKg, selectedListingId: listingId || current.selectedListingId, listingLive: true, lastEvent: "Listing available to buyers" })),
    lockEscrow: async (listing, delivery) => {
      const order = await api.createOrder(listing.id, Math.max(1, Math.floor(listing.weightKg)), delivery);
      setState((current) => applyOrder(current, order, listing));
    },
    updateOrderStatus: async (status) => {
      if (!state.orderId) throw new Error("No active order");
      const order = await api.updateOrderStatus(state.orderId, status);
      setState((current) => applyOrder(current, order));
    },
    refreshOrder: async () => {
      if (!state.orderId) throw new Error("No active order");
      const trade = await loadOrder(state.orderId);
      setState((current) => applyOrder(current, trade.order, trade.listing));
    },
    startTransit: async () => {
      if (!state.orderId) throw new Error("No active order");
      await api.startTransit(state.orderId);
    },
    injectBreach: async () => {
      if (!state.orderId) throw new Error("No active order");
      await api.injectBreach(state.orderId);
    },
    settleOrder: async () => {
      if (!state.orderId) throw new Error("No active order");
      const order = await api.deliver(state.orderId);
      setState((current) => applyOrder(current, order));
    },
    resetDemo: async () => {
      await api.resetDemo();
      setState(INITIAL_STATE);
    },
  }), [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}

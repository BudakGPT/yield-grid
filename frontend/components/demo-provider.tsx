"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { MarketplaceListing, OrderStatus, ProduceType } from "@/lib/types";
import { subscribeToYieldGrid } from "@/lib/ws";
import type { YieldGridEvent } from "@/lib/types";

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
  lockEscrow: (listing: MarketplaceListing) => Promise<void>;
  startTransit: () => Promise<void>;
  injectBreach: () => Promise<void>;
  settleOrder: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const INITIAL_STATE: DemoState = {
  produceType: "tomato",
  crateCount: 3,
  pricePerKg: 18000,
  scanComplete: false,
  listingLive: false,
  status: "open",
  payoutVersion: 0,
  selectedListingId: "",
  activeListing: null,
  orderId: "",
  escrowTxHash: "",
  settleTxHash: "",
  totalAmount: 0,
  discountBps: 0,
  lastTemperatureC: null,
  lastEvent: "Connected · waiting for a farmer scan",
};

const DemoContext = createContext<DemoContextValue | null>(null);
const STORAGE_KEY = "yieldgrid-integrated-demo";

function dataValue<T>(event: YieldGridEvent, key: string): T | undefined {
  return (event.data as Record<string, unknown>)[key] as T | undefined;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setState({ ...INITIAL_STATE, ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) setState({ ...INITIAL_STATE, ...JSON.parse(event.newValue) });
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => subscribeToYieldGrid((event) => {
    setState((current) => {
      if (event.event === "listing.created") return { ...current, listingLive: true, lastEvent: "listing.created · buyer feed updated" };
      if (event.event === "order.created") return { ...current, orderId: event.order_id, lastEvent: "order.created · escrow submission started" };
      if (event.event === "order.escrow_locked") return { ...current, orderId: event.order_id, status: "escrowed", escrowTxHash: dataValue<string>(event, "tx_hash") ?? current.escrowTxHash, lastEvent: "order.escrow_locked · Stellar testnet" };
      if (event.event === "transit.update") return { ...current, orderId: event.order_id, status: "in_transit", lastTemperatureC: Number(dataValue(event, "temp_c") ?? current.lastTemperatureC), lastEvent: "transit.update · SIMULATED telemetry" };
      if (event.event === "transit.breach") return { ...current, orderId: event.order_id, status: "breached", discountBps: 1500, lastTemperatureC: Number(dataValue(event, "temp_c") ?? 9.2), lastEvent: "transit.breach · discount path armed" };
      if (event.event === "order.settled") return { ...current, orderId: event.order_id, status: "settled", payoutVersion: current.payoutVersion + 1, settleTxHash: dataValue<string>(event, "tx_hash") ?? current.settleTxHash, totalAmount: Number(dataValue(event, "amount") ?? current.totalAmount), discountBps: Number(dataValue(event, "discount_bps") ?? current.discountBps), lastEvent: "order.settled · farmer payout confirmed" };
      return current;
    });
  }), []);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    setScanInput: (produceType, crateCount) => setState((current) => ({ ...current, produceType, crateCount })),
    completeScan: () => setState((current) => ({ ...current, scanComplete: true, lastEvent: "scan.graded · Codex rubric applied" })),
    listForSale: (pricePerKg, listingId = "") => setState((current) => ({ ...current, pricePerKg, selectedListingId: listingId || current.selectedListingId, listingLive: true, status: "open", lastEvent: "listing.created · buyer feed updated" })),
    lockEscrow: async (listing) => {
      const order = await api.createOrder(listing.id, Math.max(1, Math.round(listing.weightKg)));
      setState((current) => ({
        ...current,
        selectedListingId: listing.id,
        activeListing: listing,
        orderId: order.id,
        status: order.escrowStatus === "ESCROWED" ? "escrowed" : current.status,
        escrowTxHash: order.escrowTxHash ?? "",
        totalAmount: order.totalAmount,
        lastEvent: "order.escrow_locked · Stellar testnet",
      }));
    },
    startTransit: async () => {
      if (!state.orderId) throw new Error("No active escrow order");
      await api.startTransit(state.orderId);
    },
    injectBreach: async () => {
      if (!state.orderId) throw new Error("No active escrow order");
      await api.injectBreach(state.orderId);
    },
    settleOrder: async () => {
      if (!state.orderId) throw new Error("No active escrow order");
      const order = await api.deliver(state.orderId);
      setState((current) => ({
        ...current,
        status: "settled",
        payoutVersion: current.payoutVersion + 1,
        settleTxHash: order.settleTxHash ?? current.settleTxHash,
        discountBps: order.discountBps ?? 0,
        totalAmount: order.totalAmount,
        lastEvent: "order.settled · farmer payout confirmed",
      }));
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

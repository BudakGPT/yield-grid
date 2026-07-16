"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { OrderStatus, ProduceType } from "@/lib/demo-data";

export type DemoState = {
  produceType: ProduceType;
  crateCount: number;
  pricePerKg: number;
  scanComplete: boolean;
  listingLive: boolean;
  status: OrderStatus;
  payoutVersion: number;
  selectedListingId: string;
  lastEvent: string;
};

type DemoContextValue = {
  state: DemoState;
  setScanInput: (produceType: ProduceType, crateCount: number) => void;
  completeScan: () => void;
  listForSale: (pricePerKg: number) => void;
  lockEscrow: (listingId?: string) => void;
  startTransit: () => void;
  injectBreach: () => void;
  settleOrder: (discounted?: boolean) => void;
  resetDemo: () => void;
};

const INITIAL_STATE: DemoState = {
  produceType: "tomato",
  crateCount: 3,
  pricePerKg: 18000,
  scanComplete: false,
  listingLive: false,
  status: "open",
  payoutVersion: 0,
  selectedListingId: "YG-LST-1042",
  lastEvent: "Demo siap · menunggu scan Amara",
};

const DemoContext = createContext<DemoContextValue | null>(null);
const STORAGE_KEY = "yieldgrid-prd-v3-demo";

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setState({ ...INITIAL_STATE, ...JSON.parse(saved) });
      } catch {
        // A blocked localStorage should never block the demo.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) setState({ ...INITIAL_STATE, ...JSON.parse(event.newValue) });
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    setScanInput: (produceType, crateCount) => setState((current) => ({ ...current, produceType, crateCount })),
    completeScan: () => setState((current) => ({ ...current, scanComplete: true, lastEvent: "scan.graded · Codex rubric applied" })),
    listForSale: (pricePerKg) => setState((current) => ({ ...current, pricePerKg, listingLive: true, status: "open", lastEvent: "listing.created · buyer feed updated" })),
    lockEscrow: (listingId = "YG-LST-1042") => setState((current) => ({ ...current, selectedListingId: listingId, status: "escrowed", lastEvent: "order.escrow_locked · Stellar testnet demo" })),
    startTransit: () => setState((current) => ({ ...current, status: "in_transit", lastEvent: "transit.update · simulated telemetry" })),
    injectBreach: () => setState((current) => ({ ...current, status: "breached", lastEvent: "transit.breach · discount path armed" })),
    settleOrder: (discounted = false) => setState((current) => ({ ...current, status: "settled", payoutVersion: current.payoutVersion + 1, lastEvent: `order.settled · ${discounted ? "15% discount" : "full payout"}` })),
    resetDemo: () => setState(INITIAL_STATE),
  }), [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}

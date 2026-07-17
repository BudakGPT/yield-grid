"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clock3, LockKeyhole, MapPin, PackageCheck, Phone, RefreshCw, ShieldCheck, ThermometerSnowflake, Truck, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useDemo } from "./demo-provider";

const statusSteps = [
  { label: "Payment protected", icon: LockKeyhole },
  { label: "In transit", icon: Truck },
  { label: "Farmer paid", icon: CheckCircle2 },
];

function orderRank(status: string) {
  if (["COMPLETED"].includes(status)) return 3;
  if (["SHIPPED", "DELIVERED"].includes(status)) return 2;
  if (["PAID", "PROCESSING"].includes(status)) return 1;
  return 0;
}

function orderStatusLabel(status: string, breachDetected: boolean) {
  if (breachDetected) return "Temperature issue";
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Awaiting payment",
    PAID: "Payment protected",
    PROCESSING: "Preparing order",
    SHIPPED: "In transit",
    DELIVERED: "Delivered",
    COMPLETED: "Paid",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };
  return labels[status] ?? status.replaceAll("_", " ").toLowerCase();
}

export function OrderExperience() {
  const { session } = useAuth();
  const { state, refreshOrder, settleOrder, updateOrderStatus } = useDemo();
  const [busyAction, setBusyAction] = useState<"refresh" | "prepare" | "ship" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listing = state.activeListing;
  const order = state.activeOrder;

  const run = async (action: typeof busyAction, callback: () => Promise<void>) => {
    setBusyAction(action);
    setError(null);
    try {
      await callback();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the order");
    } finally {
      setBusyAction(null);
    }
  };

  if (!order) {
    return <div className="panel grid min-h-[520px] place-items-center p-8 text-center"><div><LockKeyhole className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-3xl font-black">No active order.</h2><p className="mt-3 text-sm text-ink-600">Your latest order will appear here after purchase.</p><Link href={session?.user.role === "SELLER" ? "/farmer" : "/marketplace"} className="primary-button mt-6">{session?.user.role === "SELLER" ? "Open farmer workspace" : "Browse marketplace"} <ArrowRight className="size-4" /></Link></div></div>;
  }

  const item = order.items[0];
  const produce = listing?.produce ?? item?.productName ?? "Produce order";
  const farmer = order.farmerName ?? item?.sellerName ?? "Farmer";
  const quantity = item?.quantity ?? 0;
  const subtotal = order.totalAmount;
  const payout = Math.round(subtotal * (1 - (order.discountBps ?? 0) / 10_000));
  const hasBreach = order.breachDetected || state.status === "breached";
  const statusLabel = state.status === "settled" ? "Paid" : state.status === "in_transit" ? "In transit" : orderStatusLabel(order.status, hasBreach);
  const rank = Math.max(orderRank(order.status), state.status === "settled" ? 3 : state.status === "in_transit" || state.status === "breached" ? 2 : 0);
  const destination = [order.district, order.city, order.province, order.postalCode].filter(Boolean).join(", ");
  const isSeller = session?.user.role === "SELLER";
  const canVerify = !isSeller && (["SHIPPED", "DELIVERED"].includes(order.status) || state.status === "in_transit" || state.status === "breached");

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="panel overflow-hidden p-5 md:p-7">
          <div className="flex flex-col gap-5 border-b border-forest-950/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Order {order.orderNumber}</p>
              <h2 className="mt-2 text-3xl font-black">{produce} from {farmer}</h2>
              {(listing?.location || destination) && <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-600"><MapPin className="size-3" />{[listing?.location, destination].filter(Boolean).join(" → ")}</p>}
            </div>
            <div className="flex items-center gap-2"><button onClick={() => run("refresh", refreshOrder)} disabled={busyAction !== null} aria-label="Refresh order" className="grid size-9 place-items-center rounded-xl bg-cream-100 text-ink-600"><RefreshCw className={`size-3.5 ${busyAction === "refresh" ? "animate-spin" : ""}`} /></button><span className={`pill ${hasBreach ? "bg-clay-100 text-clay-500" : order.status === "COMPLETED" ? "bg-leaf-100 text-forest-700" : "bg-forest-950 text-white"}`}>{hasBreach ? <AlertTriangle className="size-3" /> : <Clock3 className="size-3" />}{statusLabel}</span></div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">{statusSteps.map((step, index) => { const active = rank >= index + 1; const Icon = step.icon; return <div key={step.label} className={`rounded-xl p-3 ${active ? "bg-leaf-100 text-forest-700" : "bg-cream-50 text-ink-600"}`}><Icon className="size-4" /><p className="mt-3 text-[8px] font-black uppercase">{step.label}</p></div>; })}</div>
          <div className={`mt-6 grid gap-4 ${listing ? "sm:grid-cols-[140px_1fr]" : ""}`}>
            {listing && <div className="relative h-36 overflow-hidden rounded-2xl"><Image src={listing.image} alt={produce} fill unoptimized className="object-cover" /></div>}
            <div className="grid grid-cols-2 gap-2">{[["Quantity", `${quantity} kg`], ...(listing ? [["Grade A", `${listing.grade.A}%`], ["Shelf life", listing.shelfLife]] : []), ["Order total", `Rp${subtotal.toLocaleString("id-ID")}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-cream-50 p-3"><p className="text-[8px] uppercase text-ink-600">{label}</p><p className="mt-2 text-xs font-black">{value}</p></div>)}</div>
          </div>
        </div>
        <aside className="grid-field rounded-[1.5rem] p-5 text-white"><span className="grid size-11 place-items-center rounded-xl bg-leaf-400 text-forest-950"><ShieldCheck className="size-5" /></span><p className="eyebrow mt-10 !text-leaf-400">Payment status</p><h3 className="mt-2 text-2xl font-black">{order.status === "COMPLETED" ? "Payment complete." : "Payment protected."}</h3><p className="mt-3 text-[10px] leading-5 text-white/45">The farmer receives payment after the buyer verifies delivery.</p><div className="mt-7 rounded-xl border border-white/9 bg-white/6 p-3"><p className="text-[8px] uppercase text-white/35">Last updated</p><p className="mt-2 text-[10px] font-black text-leaf-400">{new Date(order.updatedAt).toLocaleString("id-ID")}</p></div></aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="panel p-5 md:p-7">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Delivery information</p><h3 className="mt-2 text-2xl font-black">{destination || "Address provided at checkout"}</h3></div><Truck className="size-5 text-forest-700" /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-cream-50 p-4"><p className="flex items-center gap-2 text-[9px] font-black"><UserRound className="size-3.5 text-forest-700" />Recipient</p><p className="mt-2 text-[10px] text-ink-600">{order.recipientName}</p></div>
            <div className="rounded-xl bg-cream-50 p-4"><p className="flex items-center gap-2 text-[9px] font-black"><Phone className="size-3.5 text-forest-700" />Phone</p><p className="mt-2 text-[10px] text-ink-600">{order.recipientPhone}</p></div>
            <div className="rounded-xl bg-cream-50 p-4 sm:col-span-2"><p className="flex items-center gap-2 text-[9px] font-black"><MapPin className="size-3.5 text-forest-700" />Full address</p><p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-ink-600">{order.fullAddress}</p></div>
            {order.notes && <div className="rounded-xl bg-cream-50 p-4 sm:col-span-2"><p className="text-[9px] font-black">Delivery notes</p><p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-ink-600">{order.notes}</p></div>}
          </div>
        </div>

        <div className={`rounded-[1.5rem] border p-5 ${hasBreach ? "border-clay-500/25 bg-clay-100" : "border-forest-950/9 bg-white"}`}>
          <div className="flex justify-between"><div><p className="eyebrow">Order progress</p><h3 className="mt-2 text-xl font-black">{statusLabel}</h3></div>{order.lastTemperatureC == null ? <Clock3 className="size-5 text-forest-700" /> : <ThermometerSnowflake className="size-5 text-forest-700" />}</div>
          {order.lastTemperatureC == null
            ? <div className="mt-6 rounded-xl bg-cream-100 p-4"><p className="text-[9px] font-black">No live tracking data</p><p className="mt-2 text-[9px] leading-5 text-ink-600">Carrier location and sensor history are not connected to this order.</p></div>
            : <div className="mt-6 rounded-xl bg-cream-100 p-4"><p className="text-[9px] font-black">Latest recorded temperature</p><p className="mt-2 text-3xl font-black">{order.lastTemperatureC}°C</p></div>}

          {isSeller && order.status === "PAID" && <button onClick={() => run("prepare", () => updateOrderStatus("PROCESSING"))} disabled={busyAction !== null} className="primary-button mt-4 min-h-12 w-full"><PackageCheck className="size-4" />{busyAction === "prepare" ? "Updating..." : "Start preparing order"}</button>}
          {isSeller && order.status === "PROCESSING" && <button onClick={() => run("ship", () => updateOrderStatus("SHIPPED"))} disabled={busyAction !== null} className="primary-button mt-4 min-h-12 w-full"><Truck className="size-4" />{busyAction === "ship" ? "Updating..." : "Mark as shipped"}</button>}
          {canVerify && <div className="mt-4"><div className="rounded-xl bg-leaf-100 p-4"><p className="text-[9px] font-black">{hasBreach ? "Adjusted payment available" : "Delivery confirmation ready"}</p><p className="mt-1 text-[9px] text-ink-600">{hasBreach ? `${(order.discountBps ?? state.discountBps) / 100}% returned to buyer · farmer payout Rp${payout.toLocaleString("id-ID")}` : "Confirm that this order has arrived before releasing payment."}</p></div><button onClick={() => run("verify", settleOrder)} disabled={busyAction !== null} className="primary-button mt-3 min-h-12 w-full"><PackageCheck className="size-4" />{busyAction === "verify" ? "Confirming delivery..." : hasBreach ? "Accept adjustment" : "Verify delivery"}</button></div>}
          {error && <p role="alert" className="mt-3 rounded-xl bg-clay-100 p-3 text-[9px] font-bold text-clay-500">{error}</p>}
          {order.status === "COMPLETED" && <div className="mt-5 rounded-2xl bg-leaf-100 p-5"><Check className="size-5 text-forest-700" /><p className="eyebrow mt-5">Payment complete</p><p className="mt-2 text-3xl font-black">Farmer paid.</p><Link href="/verification" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-950 text-[9px] font-black text-white">View receipt <ArrowRight className="size-3.5" /></Link></div>}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { BadgeCheck, Check, ReceiptText, ShieldCheck, Truck } from "lucide-react";
import { useDemo } from "./demo-provider";

export function SettlementReceipt() {
  const { state } = useDemo();
  const order = state.activeOrder;
  const listing = state.activeListing;

  if (!order || (order.status !== "COMPLETED" && state.status !== "settled")) {
    return <div className="panel grid min-h-[520px] place-items-center p-8 text-center"><div><ReceiptText className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-3xl font-black">Complete delivery first.</h2><p className="mt-3 text-sm text-ink-600">The receipt appears after delivery is verified and the farmer has been paid.</p><Link href="/order" className="primary-button mt-6">Back to active order</Link></div></div>;
  }

  const item = order.items[0];
  const produce = listing?.produce ?? item?.productName ?? "Produce order";
  const farmer = order.farmerName ?? item?.sellerName ?? "Farmer";
  const quantity = item?.quantity ?? 0;
  const discountBps = order.discountBps ?? 0;
  const amount = Math.round(order.totalAmount * (1 - discountBps / 10_000));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <section className="grid-field rounded-[1.6rem] p-6 text-white md:p-8">
        <div className="flex justify-between"><span className="grid size-14 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Check className="size-7" /></span><span className="pill bg-white/7 text-white/55">Payment confirmed</span></div>
        <p className="eyebrow mt-12 !text-leaf-400">Farmer payout</p>
        <h2 className="mt-3 text-5xl font-black">Rp{amount.toLocaleString("id-ID")}</h2>
        <p className="mt-4 text-sm text-white/48">Delivery was verified. {discountBps > 0 ? `${discountBps / 100}% was returned to the buyer and the adjusted amount was paid to the farmer.` : "The farmer received the full payment."}</p>
        <div className="mt-10 grid grid-cols-3 gap-2">{[[ShieldCheck, "Payment", "Protected"], [Truck, "Delivery", "Verified"], [BadgeCheck, "Farmer", "Paid"]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof ShieldCheck; return <div key={String(label)} className="rounded-xl border border-white/9 bg-white/6 p-4"><ItemIcon className="size-4 text-leaf-400" /><p className="mt-4 text-[8px] uppercase text-white/35">{String(label)}</p><p className="mt-1 text-[10px] font-black">{String(value)}</p></div>; })}</div>
      </section>
      <section className="panel p-5">
        <p className="eyebrow">Order receipt</p>
        <h2 className="mt-2 text-xl font-black">Trade complete.</h2>
        <div className="mt-6 space-y-3 text-[10px]">{[
          ["Order", order.orderNumber],
          ["Buyer", order.buyerName],
          ["Farmer", farmer],
          ["Produce", `${produce} · ${quantity} kg`],
          ["Recipient", order.recipientName],
          ["Completed", new Date(order.completedAt ?? order.updatedAt).toLocaleString("id-ID")],
          ["Final payment", `Rp${amount.toLocaleString("id-ID")}`],
        ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-forest-950/7 pb-3"><span className="text-ink-600">{label}</span><strong className="text-right">{value}</strong></div>)}</div>
        <Link href="/marketplace" className="mt-6 flex min-h-11 items-center justify-center rounded-xl bg-forest-950 text-[9px] font-black text-white">Continue shopping</Link>
      </section>
    </div>
  );
}

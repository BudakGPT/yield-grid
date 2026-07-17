"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, BadgeCheck, Box, CircleAlert, LoaderCircle, RefreshCw, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AdminAudit, AdminOverview, AdminUser, GradeRecommendation, OrderSummary, ProductSummary } from "@/lib/types";
import { useAuth } from "./auth-provider";

const orderTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "REFUNDED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

const productStatuses: ProductSummary["status"][] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"];

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Never";
}

function StatusPill({ status }: { status: string }) {
  const good = ["READY", "ACTIVE", "COMPLETED", "PAID"].includes(status);
  const bad = ["DOWN", "DISABLED", "CANCELLED", "REFUNDED", "ARCHIVED"].includes(status);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black ${good ? "bg-leaf-100 text-forest-700" : bad ? "bg-clay-100 text-clay-500" : "bg-cream-100 text-ink-600"}`}>{status.replaceAll("_", " ")}</span>;
}

export function AdminDashboard() {
  const { session, ready } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [audit, setAudit] = useState<AdminAudit[]>([]);
  const [gradeRecommendations, setGradeRecommendations] = useState<GradeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsers, nextOrders, nextProducts, nextAudit, nextGradeRecommendations] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminOrders(),
        api.getAdminProducts(),
        api.getAdminAudit(),
        api.getAdminGradeRecommendations(),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers.content);
      setOrders(nextOrders.content);
      setProducts(nextProducts.content);
      setAudit(nextAudit.content);
      setGradeRecommendations(nextGradeRecommendations);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load central control data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user.role !== "ADMIN") return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, session?.user.role]);

  async function control(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError("");
    try {
      await action();
      await load(false);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Control action failed");
    } finally {
      setBusy("");
    }
  }

  if (!ready || loading) {
    return <div className="panel grid min-h-[460px] place-items-center"><LoaderCircle className="size-7 animate-spin text-forest-700" /></div>;
  }

  if (!session || session.user.role !== "ADMIN") return null;

  const metrics = overview?.metrics;
  const metricCards = [
    { label: "Users", value: metrics?.totalUsers ?? 0, detail: `${metrics?.activeUsers ?? 0} active`, icon: Users },
    { label: "Products", value: metrics?.totalProducts ?? 0, detail: `${metrics?.activeProducts ?? 0} active`, icon: Box },
    { label: "Orders", value: metrics?.totalOrders ?? 0, detail: `${metrics?.activeOrders ?? 0} in progress`, icon: ShoppingCart },
    { label: "Visual gradings", value: metrics?.totalGradings ?? 0, detail: "Recorded scans", icon: BadgeCheck },
  ];

  function editGradeRecommendation(grade: GradeRecommendation["grade"], field: "title" | "description", value: string) {
    setGradeRecommendations((current) => current.map((item) => item.grade === grade ? { ...item, [field]: value } : item));
  }

  return (
    <div className="space-y-5">
      <section className="grid-field rounded-[1.6rem] p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="eyebrow !text-leaf-400">Central control</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">System operations dashboard.</h2><p className="mt-2 text-[10px] text-white/50">Monitor dependencies and control accounts, orders, and marketplace inventory.</p></div>
          <button onClick={() => void load(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/8 px-4 text-[9px] font-black"><RefreshCw className="size-4" />Refresh</button>
        </div>
      </section>

      {error && <p role="alert" className="flex items-center gap-2 rounded-xl bg-clay-100 p-4 text-[10px] font-bold text-clay-500"><CircleAlert className="size-4" />{error}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, detail, icon: Icon }) => <article key={label} className="panel p-5"><Icon className="size-5 text-forest-700" /><p className="mt-5 text-3xl font-black">{value.toLocaleString("id-ID")}</p><p className="mt-1 text-[9px] font-black">{label}</p><p className="mt-1 text-[8px] text-ink-600">{detail}</p></article>)}
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-3"><Activity className="size-5 text-forest-700" /><div><p className="eyebrow">Live monitoring</p><h3 className="mt-1 text-lg font-black">System dependencies</h3></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview?.integrations.map((integration) => <div key={integration.name} className="rounded-xl border border-forest-950/8 bg-cream-50 p-4"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-black">{integration.name}</p><StatusPill status={integration.status} /></div><p className="mt-2 text-[8px] text-ink-600">{integration.detail}</p>{integration.latencyMs !== null && <p className="mt-2 font-mono text-[8px] text-forest-700">{integration.latencyMs} ms</p>}</div>)}
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-3"><BadgeCheck className="size-5 text-forest-700" /><div><p className="eyebrow">Quality routing control</p><h3 className="mt-1 text-lg font-black">Grade recommendations</h3><p className="mt-1 text-[9px] text-ink-600">These suggestions appear on every marketplace listing. Internal IDs remain hidden from buyers.</p></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {gradeRecommendations.map((item) => <article key={item.grade} className="rounded-2xl bg-cream-50 p-4">
            <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-forest-950 text-sm font-black text-white">{item.grade}</span><StatusPill status={`GRADE_${item.grade}`} /></div>
            <label className="mt-4 block text-[8px] font-black uppercase text-ink-600">Recommendation title<input value={item.title} maxLength={120} onChange={(event) => editGradeRecommendation(item.grade, "title", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl bg-white px-3 text-[9px] font-bold text-forest-950 outline-none focus:ring-2 focus:ring-leaf-400" /></label>
            <label className="mt-3 block text-[8px] font-black uppercase text-ink-600">Routing guidance<textarea value={item.description} maxLength={500} rows={4} onChange={(event) => editGradeRecommendation(item.grade, "description", event.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-[9px] leading-5 text-forest-950 outline-none focus:ring-2 focus:ring-leaf-400" /></label>
            <button disabled={busy === `grade-${item.grade}` || !item.title.trim() || !item.description.trim()} onClick={() => void control(`grade-${item.grade}`, () => api.updateAdminGradeRecommendation(item.grade, item.title, item.description))} className="mt-3 min-h-11 w-full rounded-xl bg-forest-950 text-[9px] font-black text-white disabled:opacity-40">{busy === `grade-${item.grade}` ? "Saving..." : `Save Grade ${item.grade}`}</button>
          </article>)}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-forest-950/8 p-5"><Users className="size-5 text-forest-700" /><div><p className="eyebrow">Access control</p><h3 className="mt-1 text-lg font-black">User accounts</h3></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[9px]"><thead className="bg-cream-50 text-ink-600"><tr><th className="p-3">User</th><th>Role</th><th>Verification</th><th>Wallet</th><th>Last login</th><th className="pr-3 text-right">Control</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-forest-950/6"><td className="p-3"><strong className="block text-[10px]">{user.fullName}</strong><span className="text-ink-600">{user.email}</span></td><td><StatusPill status={user.role} /></td><td>{user.emailVerified ? "Verified" : "Pending"}</td><td>{user.walletReady ? "Ready" : "Pending"}</td><td>{dateTime(user.lastLoginAt)}</td><td className="pr-3 text-right"><button disabled={busy === `user-${user.id}` || user.id === session.user.id} onClick={() => void control(`user-${user.id}`, () => api.updateAdminUserStatus(user.id, !user.enabled))} className={`rounded-lg px-3 py-2 font-black disabled:opacity-35 ${user.enabled ? "bg-clay-100 text-clay-500" : "bg-leaf-100 text-forest-700"}`}>{user.enabled ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-2">
        <div className="panel overflow-hidden"><div className="border-b border-forest-950/8 p-5"><p className="eyebrow">Order control</p><h3 className="mt-1 text-lg font-black">Recent orders</h3></div><div className="divide-y divide-forest-950/6">{orders.map((order) => <div key={order.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] text-ink-600">{order.orderNumber}</p><p className="mt-1 text-[10px] font-black">{order.buyerName} · Rp{order.totalAmount.toLocaleString("id-ID")}</p></div><StatusPill status={order.status} /></div><div className="mt-3 flex flex-wrap gap-2">{(orderTransitions[order.status] ?? []).map((status) => <button key={status} disabled={busy === `order-${order.id}`} onClick={() => void control(`order-${order.id}`, () => api.updateAdminOrderStatus(order.id, status))} className="rounded-lg bg-cream-100 px-3 py-2 text-[8px] font-black text-forest-700">Set {status.replaceAll("_", " ")}</button>)}</div></div>)}{orders.length === 0 && <p className="p-5 text-[9px] text-ink-600">No orders recorded.</p>}</div></div>

        <div className="panel overflow-hidden"><div className="border-b border-forest-950/8 p-5"><p className="eyebrow">Marketplace control</p><h3 className="mt-1 text-lg font-black">Products and listings</h3></div><div className="divide-y divide-forest-950/6">{products.map((product) => <div key={product.id} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-black">{product.name}</p><p className="mt-1 text-[8px] text-ink-600">{product.sellerName} · {product.stock} {product.unit}</p></div><select aria-label={`Status for ${product.name}`} value={product.status} disabled={busy === `product-${product.id}`} onChange={(event) => void control(`product-${product.id}`, () => api.updateAdminProductStatus(product.id, event.target.value as ProductSummary["status"]))} className="min-h-9 rounded-lg bg-cream-100 px-2 text-[8px] font-black outline-none">{productStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>)}{products.length === 0 && <p className="p-5 text-[9px] text-ink-600">No products recorded.</p>}</div></div>
      </section>

      <section className="panel p-5"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-forest-700" /><div><p className="eyebrow">Audit trail</p><h3 className="mt-1 text-lg font-black">Administrator activity</h3></div></div><div className="mt-4 space-y-2">{audit.map((event) => <div key={event.id} className="flex flex-col gap-2 rounded-xl bg-cream-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black">{event.action.replaceAll("_", " ")}</p><p className="mt-1 text-[8px] text-ink-600">{event.actorEmail} · {event.targetType.replaceAll("_", " ")}</p></div><time className="text-[8px] text-ink-600">{dateTime(event.createdAt)}</time></div>)}{audit.length === 0 && <p className="text-[9px] text-ink-600">No administrator actions yet.</p>}</div></section>
    </div>
  );
}

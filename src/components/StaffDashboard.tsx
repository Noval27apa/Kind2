import { useState } from "react";
import { ClipboardList, UtensilsCrossed, QrCode as QrIcon, LogOut, Loader2, AlertCircle } from "lucide-react";
import type { CafeTable, MenuItem, Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES, STATUS_COLORS } from "@/lib/types";
import { formatIDR, formatTime } from "@/lib/format";
import { Logo } from "./Logo";
import { StaffMenuManager } from "./StaffMenuManager";
import { StaffTableQR } from "./StaffTableQR";

interface StaffDashboardProps {
  orders: Order[];
  ordersLoading: boolean;
  menu: MenuItem[];
  menuLoading: boolean;
  menuError: string | null;
  tables: CafeTable[];
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  onRemoveMenuItem: (id: string) => void;
  onAddTable: (label: string) => void;
  onRemoveTable: (id: string) => void;
  onSignOut: () => void;
}

type Tab = "orders" | "menu" | "tables";

export function StaffDashboard(props: StaffDashboardProps) {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-espresso-900 text-cream-50">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-sage-300 font-semibold">Dashboard Admin</p>
            <h1 className="font-display text-2xl">Kind Comfy Pleasure</h1>
          </div>
          <div className="flex items-center gap-3">
            <Logo size={32} showText={false} />
            <button
              onClick={props.onSignOut}
              className="flex items-center gap-1.5 text-sm text-cream-200/80 hover:text-cream-50 transition-colors"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1">
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList size={18} />} label="Pesanan" badge={props.orders.filter((o) => o.status === "Menunggu").length} />
          <TabBtn active={tab === "menu"} onClick={() => setTab("menu")} icon={<UtensilsCrossed size={18} />} label="Menu" />
          <TabBtn active={tab === "tables"} onClick={() => setTab("tables")} icon={<QrIcon size={18} />} label="QR Meja" />
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "orders" && (
          <OrdersView orders={props.orders} loading={props.ordersLoading} onUpdateStatus={props.onUpdateOrderStatus} />
        )}
        {tab === "menu" && (
          <>
            {props.menuError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{props.menuError}</span>
              </div>
            )}
            <StaffMenuManager
              menu={props.menu}
              loading={props.menuLoading}
              onAdd={props.onAddMenuItem}
              onUpdate={props.onUpdateMenuItem}
              onRemove={props.onRemoveMenuItem}
            />
          </>
        )}
        {tab === "tables" && (
          <StaffTableQR tables={props.tables} onAdd={props.onAddTable} onRemove={props.onRemoveTable} />
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-sage-400 text-cream-50" : "border-transparent text-cream-200/70 hover:text-cream-50"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-amber-400 text-espresso-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}

function OrdersView({ orders, loading, onUpdateStatus }: { orders: Order[]; loading: boolean; onUpdateStatus: (id: string, status: OrderStatus) => void }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-12 text-center">
        <Loader2 size={32} className="mx-auto text-espresso-300 animate-spin" />
        <p className="text-espresso-500 mt-3">Memuat pesanan...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-12 text-center">
        <ClipboardList size={40} className="mx-auto text-espresso-300 mb-3" />
        <p className="font-display text-lg text-espresso-700">Belum ada pesanan</p>
        <p className="text-sm text-espresso-400 mt-1">Pesanan dari pelanggan akan muncul di sini secara real-time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: OrderStatus) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg text-espresso-900">{order.orderNumber}</span>
            <span className="bg-sage-700 text-cream-50 text-xs font-semibold px-2.5 py-1 rounded-full">Meja {order.tableNumber}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
          </div>
          <p className="text-xs text-espresso-400 mt-1">{formatTime(order.createdAt)} · QRIS Demo (simulasi)</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-espresso-900">{formatIDR(order.total)}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-cream-100">
        <div className="space-y-1">
          {order.lines.map((line, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-espresso-700">{line.quantity}× {line.name}{line.note ? ` — "${line.note}"` : ""}</span>
              <span className="text-espresso-500">{formatIDR(line.price * line.quantity)}</span>
            </div>
          ))}
        </div>
        {order.note && <p className="text-xs text-espresso-400 italic mt-2">Catatan: "{order.note}"</p>}
      </div>

      <div className="mt-4">
        <label className="text-xs text-espresso-500 font-medium">Ubah status</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(order.id, status)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                order.status === status
                  ? "bg-espresso-800 text-cream-50 border-espresso-800"
                  : "bg-white text-espresso-600 border-cream-200 hover:bg-cream-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
